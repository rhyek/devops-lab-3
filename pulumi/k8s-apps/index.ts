import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { defineDeployment, defineDeploymentAndService } from './utils';
import { k8sProvider, servicePort } from './common';

const config = new pulumi.Config();

const nginx = new k8s.helm.v3.Chart(
  'my-nginx',
  {
    chart: 'nginx-ingress',
    fetchOpts: { repo: 'https://kubernetes-charts.storage.googleapis.com' },
  },
  { provider: k8sProvider },
);

const kafkaJob = new k8s.batch.v1.Job(
  'configure-kafka',
  {
    spec: {
      template: {
        spec: {
          containers: [
            {
              name: 'configure-kafka',
              image: `registry:5000/devops-lab-3/configure-kafka`,
              env: [{ name: 'KAFKA_SCHEMA_REGISTRY', value: config.require('kafkaSchemaRegistry') }],
            },
          ],
          restartPolicy: 'Never',
        },
      },
      backoffLimit: 1,
    },
  },
  { provider: k8sProvider },
);

defineDeployment('kafka-to-sql', {
  envs: {
    DB_URL: config.requireSecret('dbUrl'),
    CONNECT_BOOTSTRAP_SERVERS: config.require('kafkaBroker'),
    CONNECT_KEY_CONVERTER_SCHEMA_REGISTRY_URL: `http://${config.require('kafkaSchemaRegistry')}`,
    CONNECT_VALUE_CONVERTER_SCHEMA_REGISTRY_URL: `http://${config.require('kafkaSchemaRegistry')}`,
    CONNECT_CONFIG_STORAGE_REPLICATION_FACTOR: '1',
    CONNECT_OFFSET_STORAGE_REPLICATION_FACTOR: '1',
    CONNECT_STATUS_STORAGE_REPLICATION_FACTOR: '1',
  },
  resources: {
    requests: {
      cpu: '100m',
      memory: '100M',
    },
  },
  ports: [8083],
});

defineDeploymentAndService('auth', {
  envs: {
    FIREBASE_SERVICE_ACCOUNT_JSON: config.requireSecret('firebaseServiceAccountJson'),
  },
  resources: {
    requests: {
      cpu: '100m',
      memory: '100M',
    },
  },
});

const webappService = defineDeploymentAndService('webapp', {
  envs: {
    REACT_APP_FIREBASE_CONFIG: config.require('publicFirebaseJson'),
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
          host: config.require('host'),
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
  defineDeploymentAndService('tasks', {
    envs: {
      KAFKA_BROKER: config.require('kafkaBroker'),
      KAFKA_SCHEMA_REGISTRY: config.require('kafkaSchemaRegistry'),
    },
  }),
  defineDeploymentAndService('users', {
    envs: {
      KAFKA_BROKER: config.require('kafkaBroker'),
      KAFKA_SCHEMA_REGISTRY: config.require('kafkaSchemaRegistry'),
    },
  }),
];

new k8s.networking.v1beta1.Ingress(
  'general-router',
  {
    metadata: {
      annotations: {
        'kubernetes.io/ingress.class': 'nginx',
        'nginx.ingress.kubernetes.io/rewrite-target': '/$2',
        'nginx.ingress.kubernetes.io/auth-url': 'http://auth.default.svc.cluster.local/verify-jwt',
        'nginx.ingress.kubernetes.io/auth-cache-key': '$remote_user$http_authorization',
        'nginx.ingress.kubernetes.io/auth-response-headers': 'x-user-data',
      },
    },
    spec: {
      rules: [
        {
          host: config.require('host'),
          http: {
            paths: exposedServices.map(({ name, service }) => ({
              path: `/api/${name}(/|$)(.*)`,
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
