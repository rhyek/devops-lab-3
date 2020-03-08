import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';

const config = new pulumi.Config();

// const nginx = new k8s.helm.v3.Chart('my-nginx', {
//   chart: 'nginx-ingress',
//   fetchOpts: { repo: 'https://kubernetes-charts.storage.googleapis.com' },
// });

// https://kubernetes.io/docs/tasks/configure-pod-container/configure-persistent-volume-storage/#create-a-persistentvolume
new k8s.core.v1.PersistentVolume('pv-1', {
  metadata: {
    // name: 'pv-1',
    labels: {
      type: 'local',
    },
  },
  spec: {
    storageClassName: 'manual',
    capacity: {
      storage: '2Gi',
    },
    accessModes: ['ReadWriteOnce'],
    hostPath: {
      path: '/files',
    },
  },
});

const pv1Claim = new k8s.core.v1.PersistentVolumeClaim('pv-1-claim', {
  spec: {
    storageClassName: 'manual',
    accessModes: ['ReadWriteOnce'],
    resources: {
      requests: {
        storage: '1.5Gi',
      },
    },
  },
});

export const pv1ClaimName = pv1Claim.metadata.name;

export const dbUrl = pulumi.interpolate`postgresql://${config.requireSecret('pgUsername')}:${config.requireSecret(
  'pgPassword',
)}@my-postgresql.default.svc.cluster.local/${config.require('pgDatabase')}`;
