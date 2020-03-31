import { k8sProvider, dbHost, dbPort, dbDatabase, generalSecrets } from './common';
import { ClusterRole, ClusterRoleBinding } from '@pulumi/kubernetes/rbac/v1';
import { ServiceAccount, Service } from '@pulumi/kubernetes/core/v1';
import { ConfigGroup } from '@pulumi/kubernetes/yaml';
import { defineDeployment, defineDeploymentAndService, mapEnvs } from './utils';
import { StatefulSet } from '@pulumi/kubernetes/apps/v1';

new ConfigGroup('orleansCRDs', { files: './yamls/orleans/*.yaml' }, { provider: k8sProvider });

const siloServiceAccount = new ServiceAccount('orleans-silo', {}, { provider: k8sProvider });
// const clientServiceAccount = new ServiceAccount('orleans-client', {}, { provider: k8sProvider });

const readRole = new ClusterRole(
  'orleans-read',
  {
    rules: [
      {
        apiGroups: ['orleans.dot.net'],
        resources: ['clusterversions', 'silos'],
        verbs: ['list', 'get', 'watch'],
      },
    ],
  },
  { provider: k8sProvider },
);

const writeRole = new ClusterRole(
  'orleans-write',
  {
    rules: [
      {
        apiGroups: ['orleans.dot.net'],
        resources: ['clusterversions', 'silos'],
        verbs: ['create', 'update', 'patch', 'delete', 'deletecollection'],
      },
    ],
  },
  { provider: k8sProvider },
);

new ClusterRoleBinding(
  'orleans-read',
  {
    subjects: [
      {
        kind: 'ServiceAccount',
        name: siloServiceAccount.metadata.name,
        namespace: 'default',
      },
      // {
      //   kind: 'ServiceAccount',
      //   name: clientServiceAccount.metadata.name,
      //   namespace: 'default',
      // },
    ],
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: 'ClusterRole',
      name: readRole.metadata.name,
    },
  },
  { provider: k8sProvider },
);

new ClusterRoleBinding('orleans-write', {
  subjects: [
    {
      kind: 'ServiceAccount',
      name: siloServiceAccount.metadata.name,
      namespace: 'default',
    },
    // {
    //   kind: 'ServiceAccount',
    //   name: clientServiceAccount.metadata.name,
    //   namespace: 'default',
    // },
  ],
  roleRef: {
    apiGroup: 'rbac.authorization.k8s.io',
    kind: 'ClusterRole',
    name: writeRole.metadata.name,
  },
});

export const orleansService = defineDeploymentAndService('orleans-service', {
  resources: {
    cpu: '100m',
    memory: '100M',
  },
  serviceAccountName: siloServiceAccount.metadata.name,
  envs: {
    DB_HOST: dbHost,
    DB_PORT: dbPort,
    DB_DBNAME: dbDatabase,
    DB_USER: { secret: generalSecrets.metadata.name, key: 'dbServicesUser' },
    DB_PASS: { secret: generalSecrets.metadata.name, key: 'dbServicesPass' },
  },
  replicas: 1,
  maxUnavailable: '50%',
});

// defineDeployment('orleans-silo', {
//   resources: {
//     cpu: '100m',
//     memory: '100M',
//   },
//   serviceAccountName: siloServiceAccount.metadata.name,
//   envs: {
//     DB_HOST: dbHost,
//     DB_PORT: dbPort,
//     DB_DBNAME: dbDatabase,
//     DB_USER: { secret: generalSecrets.metadata.name, key: 'dbServicesUser' },
//     DB_PASS: { secret: generalSecrets.metadata.name, key: 'dbServicesPass' },
//   },
//   replicas: 1,
//   maxUnavailable: '50%',
// });

// defineDeploymentAndService('orleans-client', {
//   resources: {
//     cpu: '100m',
//     memory: '100M',
//   },
//   serviceAccountName: clientServiceAccount.metadata.name,
//   // envs: {
//   //   DB_HOST: dbHost,
//   //   DB_PORT: dbPort,
//   //   DB_USER: dbServicesUser,
//   //   DB_PASS: dbServicesPass,
//   //   DB_DBNAME: dbDatabase,
//   // },
// });

// const orleansSiloName = 'orleans-silo';

// const headlessService = new Service(
//   'orleans-silo-service',
//   {
//     metadata: {
//       labels: {
//         app: orleansSiloName,
//       },
//     },
//     spec: {
//       clusterIP: 'None',
//       selector: {
//         app: orleansSiloName,
//       },
//     },
//   },
//   { provider: k8sProvider },
// );

// const silo = new StatefulSet(
//   orleansSiloName,
//   {
//     // metadata: {
//     //   name: orleansSiloName,
//     // },
//     spec: {
//       selector: {
//         matchLabels: {
//           app: orleansSiloName,
//         },
//       },
//       serviceName: headlessService.metadata.name,
//       replicas: 2,
//       template: {
//         metadata: {
//           labels: {
//             app: orleansSiloName,
//           },
//         },
//         spec: {
//           serviceAccountName: siloServiceAccount.metadata.name,
//           terminationGracePeriodSeconds: 10,
//           containers: [
//             {
//               name: orleansSiloName,
//               image: `registry:5000/devops-lab-3/orleans-silo`,
//               resources: {
//                 requests: {
//                   memory: '100M',
//                   cpu: '100m',
//                 },
//               },
//               env: mapEnvs({
//                 DB_HOST: dbHost,
//                 DB_PORT: dbPort,
//                 DB_USER: dbServicesUser,
//                 DB_PASS: dbServicesPass,
//                 DB_DBNAME: dbDatabase,
//               }),
//               readinessProbe: {
//                 exec: {
//                   command: ['cat', '/tmp/healthy'],
//                 },
//                 initialDelaySeconds: 10,
//                 periodSeconds: 3,
//               },
//             },
//           ],
//         },
//       },
//     },
//   },
//   { provider: k8sProvider },
// );
