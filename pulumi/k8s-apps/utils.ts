import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { k8sProvider, servicePort, GeneralSecretKey } from './common';

export interface DefineDeploymentOptions {
  replicas?: number;
  envs?: Record<string, pulumi.Output<string> | string | { secret: pulumi.Output<string>; key: GeneralSecretKey }>;
  ports?: number[];
  serviceAccountName?: pulumi.Output<string>;
  resources?: {
    cpu?: string;
    memory?: string;
    // requests?: {
    //   cpu: string;
    //   memory: string;
    // };
  };
  maxUnavailable?: number | string;
}

export function getAppLables(name: string) {
  return { app: name };
}

export function mapEnvs(envs: NonNullable<DefineDeploymentOptions['envs']>) {
  return Object.entries(envs).map(([key, value]) => {
    return {
      name: key,
      ...(typeof value === 'object' && 'secret' in value
        ? {
            valueFrom: {
              secretKeyRef: {
                name: value.secret,
                key: value.key,
              },
            },
          }
        : {
            value,
          }),
    };
  });
}

export function defineDeployment(name: string, options?: DefineDeploymentOptions) {
  const appLabels = getAppLables(name);
  const deployment = new k8s.apps.v1.Deployment(
    name,
    {
      spec: {
        strategy: {
          rollingUpdate: {
            maxUnavailable: options?.maxUnavailable,
          },
        },
        selector: { matchLabels: appLabels },
        replicas: options?.replicas ?? 1,
        template: {
          metadata: { labels: appLabels },
          spec: {
            serviceAccountName: options && options.serviceAccountName,
            containers: [
              {
                name,
                image: `registry:5000/devops-lab-3/${name}:latest`,
                resources: {
                  requests: {
                    cpu: options?.resources?.cpu ?? '1000m',
                    memory: options?.resources?.memory ?? '2G',
                  },
                },
                ports:
                  (options && options.ports && options.ports.map((port) => ({ containerPort: port }))) || undefined,
                env: options && options.envs ? mapEnvs(options.envs) : undefined,
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
