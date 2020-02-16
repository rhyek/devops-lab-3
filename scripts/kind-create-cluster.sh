#!/bin/sh
set -o errexit

# desired cluster name; default is "kind"
KIND_CLUSTER_NAME="${KIND_CLUSTER_NAME:-kind}"

# create registry container unless it already exists
# reg_name='kind-registry'
# reg_port='5000'
# running="$(docker inspect -f '{{.State.Running}}' "${reg_name}" 2>/dev/null || true)"
# if [ "${running}" != 'true' ]; then
#   docker run \
#     -d --restart=always -p "${reg_port}:5000" --name "${reg_name}" \
#     registry:2
# fi

# create a cluster with the local registry enabled in containerd
cat <<EOF | kind create cluster --name devops-lab-2 --config=-
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
EOF
helm init --wait
kubectl create clusterrolebinding add-on-cluster-admin --clusterrole=cluster-admin --serviceaccount=kube-system:default
helm repo add kong https://charts.konghq.com
helm repo update
helm install kong/kong --set proxy.type=NodePort,proxy.http.nodePort=31500,proxy.tls.nodePort=32500

# add the registry to /etc/hosts on each node
# ip_fmt='{{.NetworkSettings.IPAddress}}'
# cmd="echo $(docker inspect -f "${ip_fmt}" "${reg_name}") registry >> /etc/hosts"
# for node in $(kind get nodes --name "${KIND_CLUSTER_NAME}"); do
#   docker exec "${node}" sh -c "${cmd}"
# done