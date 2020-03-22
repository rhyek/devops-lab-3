import { k8sProvider } from './common';
import { ClusterRole, ClusterRoleBinding } from '@pulumi/kubernetes/rbac/v1';
import { ServiceAccount } from '@pulumi/kubernetes/core/v1';
import { ConfigGroup } from '@pulumi/kubernetes/yaml';
import { defineDeployment, defineDeploymentAndService } from './utils';

new ConfigGroup('orleansCRDs', { files: './yamls/orleans/*.yaml' }, { provider: k8sProvider });

const siloServiceAccount = new ServiceAccount('orleans-silo', {}, { provider: k8sProvider });
const clientServiceAccount = new ServiceAccount('orleans-client', {}, { provider: k8sProvider });

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
      {
        kind: 'ServiceAccount',
        name: clientServiceAccount.metadata.name,
        namespace: 'default',
      },
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
  ],
  roleRef: {
    apiGroup: 'rbac.authorization.k8s.io',
    kind: 'ClusterRole',
    name: writeRole.metadata.name,
  },
});

defineDeployment('orleans-silo', {
  resources: {
    requests: {
      cpu: '100m',
      memory: '100M',
    },
  },
  serviceAccountName: siloServiceAccount.metadata.name,
});

defineDeploymentAndService('orleans-client', {
  resources: {
    requests: {
      cpu: '100m',
      memory: '100M',
    },
  },
  serviceAccountName: clientServiceAccount.metadata.name,
});
