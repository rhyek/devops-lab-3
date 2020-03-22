import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { k8sProvider, servicePort } from './common';

export interface DefineDeploymentOptions {
  envs?: Record<string, pulumi.Output<any> | string>;
  ports?: number[];
  serviceAccountName?: pulumi.Output<string>;
  resources?: {
    requests?: {
      cpu: string;
      memory: string;
    };
  };
}

export function getAppLables(name: string) {
  return { app: name };
}

export function defineDeployment(name: string, options?: DefineDeploymentOptions) {
  const appLabels = getAppLables(name);
  const deployment = new k8s.apps.v1.Deployment(
    name,
    {
      spec: {
        selector: { matchLabels: appLabels },
        replicas: 1,
        template: {
          metadata: { labels: appLabels },
          spec: {
            serviceAccountName: options && options.serviceAccountName,
            containers: [
              {
                name,
                image: `registry:5000/devops-lab-3/${name}:latest`,
                resources: (options && options.resources) || {
                  requests: {
                    memory: '2G',
                    cpu: '1000m',
                  },
                  // limits: {
                  //   memory: '128Mi',
                  //   cpu: '500m',
                  // },
                },
                ports:
                  (options && options.ports && options.ports.map((port) => ({ containerPort: port }))) || undefined,
                env:
                  options && options.envs
                    ? Object.entries(options.envs).map(([key, value]) => ({
                        name: key,
                        value,
                      }))
                    : undefined,
              },
            ],
          },
        },
      },
    },
    { provider: k8sProvider },
  );
  return deployment;
}

export function defineDeploymentAndService(name: string, options?: DefineDeploymentOptions) {
  const appLabels = getAppLables(name);
  const deployment = defineDeployment(name, { ports: [8080], ...options });
  const service = new k8s.core.v1.Service(
    name,
    {
      metadata: { name },
      spec: {
        type: 'ClusterIP',
        selector: appLabels,
        ports: [{ port: servicePort, targetPort: 8080 }],
      },
    },
    { provider: k8sProvider },
  );
  return { name, deployment, service };
}
