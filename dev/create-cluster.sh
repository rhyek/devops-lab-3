 #!/bin/sh
#
# Adapted from:
# https://github.com/kubernetes-sigs/kind/commits/master/site/static/examples/kind-with-registry.sh
#
# Copyright 2020 The Kubernetes Project
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -o errexit

# desired cluster name; default is "kind"
KIND_CLUSTER_NAME="devops-lab-3"

kind delete cluster --name $KIND_CLUSTER_NAME
# create registry container unless it already exists
reg_name='kind-registry'
reg_port='5000'
running="$(docker inspect -f '{{.State.Running}}' "${reg_name}" 2>/dev/null || true)"
if [ "${running}" != 'true' ]; then
  docker run \
    -d --restart=always -p "${reg_port}:5000" --name "${reg_name}" \
    registry:2
fi

mkdir -p ./data/pv

# create a cluster with the local registry enabled in containerd
cat <<EOF | kind create cluster --name "${KIND_CLUSTER_NAME}" --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraPortMappings:
    - containerPort: 31500
      hostPort: 80
      protocol: TCP
    - containerPort: 32500
      hostPort: 443
      protocol: TCP
  extraMounts:
    - hostPath: ./data/pv
      containerPath: /files
containerdConfigPatches:
- |-
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."registry:${reg_port}"]
    endpoint = ["http://registry:${reg_port}"]
EOF

# add the registry to /etc/hosts on each node
ip_fmt='{{.NetworkSettings.IPAddress}}'
cmd="echo $(docker inspect -f "${ip_fmt}" "${reg_name}") registry >> /etc/hosts"
for node in $(kind get nodes --name "${KIND_CLUSTER_NAME}"); do
  docker exec "${node}" sh -c "${cmd}"
  kubectl annotate node "${node}" \
          tilt.dev/registry=localhost:${reg_port} \
          tilt.dev/registry-from-cluster=registry:${reg_port}
done

rm -rf ./k8s-yamls

export PULUMI_CONFIG_PASSPHRASE="pass"

cd ../pulumi/k8s-general
rm ~/.pulumi/stacks/general.local* || true
pulumi stack init general.local
pulumi config set devHost 172.17.0.1
pulumi up -y

helm repo add stable https://kubernetes-charts.storage.googleapis.com
helm repo update

helm install my-nginx stable/nginx-ingress --version 1.31.0 --set controller.service.nodePorts.http=31500
# helm install my-postgresql stable/postgresql \
#   --set \
# service.type=NodePort,\
# service.nodePort=31600,\
# persistence.existingClaim=$(pulumi stack output pv1ClaimName),\
# volumePermissions.enabled=true,\
# postgresqlPassword=$(pulumi config get pgPassword),\
# postgresqlDatabase=$(pulumi config get pgDatabase)
# postgresqlExtendedConf.logConnections=on,\
# postgresqlExtendedConf.logDisconnections=on,\
# postgresqlExtendedConf.logHostname=on
# postgresqlUsername=$(pulumi config get pgUsername),\

cd ../k8s-apps
rm ~/.pulumi/stacks/apps.local* || true
pulumi stack init apps.local
pulumi up -y
