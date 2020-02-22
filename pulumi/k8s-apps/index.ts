import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';

const ingressObjects: { serviceName: pulumi.Output<string>; path: string }[] = [];

const k8sProvider = new k8s.Provider('render-yaml', {
  renderYamlToDirectory: '../../dev/k8s-yamls',
});

const nginx = new k8s.helm.v3.Chart(
  'my-nginx',
  {
    chart: 'nginx-ingress',
    fetchOpts: { repo: 'https://kubernetes-charts.storage.googleapis.com' },
  },
  { provider: k8sProvider },
);

interface DefineServiceOptions {
  ingressPath?: string;
  envs?: Record<string, pulumi.Output<string> | string>;
}

function defineService(name: string, options?: DefineServiceOptions) {
  const appLabels = { app: name };
  const deployment = new k8s.apps.v1.Deployment(
    name,
    {
      spec: {
        selector: { matchLabels: appLabels },
        replicas: 1,
        template: {
          metadata: { labels: appLabels },
          spec: {
            containers: [
              {
                name,
                image: `registry:5000/devops-lab-3/${name}:latest`,
                resources: {
                  requests: {
                    memory: '2G',
                    cpu: '1000m',
                  },
                  // limits: {
                  //   memory: '128Mi',
                  //   cpu: '500m',
                  // },
                },
                ports: [{ containerPort: 8080 }],
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
  const service = new k8s.core.v1.Service(
    name,
    {
      metadata: { name },
      spec: {
        type: 'ClusterIP',
        selector: appLabels,
        ports: [{ port: 8080, targetPort: 8080 }],
      },
    },
    { provider: k8sProvider },
  );
  return { service };
  // if (options) {
  //   if (options.ingressPath) {
  //     return {
  //       serviceName: service.metadata.name,
  //       path: options.ingressPath,
  //     };
  //   }
  // }
}

const config = new pulumi.Config();

const servicePort = 8080;

defineService('auth');

const webappService = defineService('webapp', {
  envs: {
    REACT_APP_FIREBASE_CONFIG:
      '{"apiKey":"AIzaSyAsLH4S27uyHCcK8_6GrmbjvuTM8ep_ELE","authDomain":"devops-lab-3-dev.firebaseapp.com","databaseURL":"https://devops-lab-3-dev.firebaseio.com","projectId":"devops-lab-3-dev","storageBucket":"devops-lab-3-dev.appspot.com","messagingSenderId":"512556660535","appId":"1:512556660535:web:a2f1487b046348b8a14cb2"}',
  },
});
new k8s.networking.v1beta1.Ingress(
  'home-router',
  {
    metadata: {
      annotations: {
        'kubernetes.io/ingress.class': 'nginx',
        'nginx.ingress.kubernetes.io/rewrite-target': '/$1',
      },
    },
    spec: {
      rules: [
        {
          host: 'devopslab3',
          http: {
            paths: [{ path: '/(.*)', backend: { serviceName: webappService.service.metadata.name, servicePort } }],
          },
        },
      ],
    },
  },
  { provider: k8sProvider },
);

const exposedServices = [
  { name: 'todos', service: defineService('todos') },
  {
    name: 'users',
    service: defineService('users', {
      envs: {
        DB_URL: config.requireSecret('dbUrl'),
      },
    }),
  },
];

new k8s.networking.v1beta1.Ingress(
  'general-router',
  {
    metadata: {
      annotations: {
        'kubernetes.io/ingress.class': 'nginx',
        'nginx.ingress.kubernetes.io/rewrite-target': '/$2',
        'nginx.ingress.kubernetes.io/auth-url': 'http://auth.default.svc.cluster.local:8080/verify-jwt',
      },
    },
    spec: {
      rules: [
        {
          host: 'devopslab3',
          http: {
            paths: exposedServices.map(({ name, service: { service } }) => ({
              path: `/${name}(/|$)(.*)`,
              backend: {
                serviceName: service.metadata.name,
                servicePort,
              },
            })),
          },
        },
      ],
    },
  },
  { provider: k8sProvider },
);
