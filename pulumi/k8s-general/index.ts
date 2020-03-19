import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';

const config = new pulumi.Config();

// const nginx = new k8s.helm.v3.Chart('my-nginx', {
//   chart: 'nginx-ingress',
//   fetchOpts: { repo: 'https://kubernetes-charts.storage.googleapis.com' },
// });

// https://kubernetes.io/docs/tasks/configure-pod-container/configure-persistent-volume-storage/#create-a-persistentvolume
// new k8s.core.v1.PersistentVolume('pv-1', {
//   metadata: {
//     // name: 'pv-1',
//     labels: {
//       type: 'local',
//     },
//   },
//   spec: {
//     storageClassName: 'manual',
//     capacity: {
//       storage: '2Gi',
//     },
//     accessModes: ['ReadWriteOnce'],
//     hostPath: {
//       path: '/files',
//     },
//   },
// });

// const pv1Claim = new k8s.core.v1.PersistentVolumeClaim('pv-1-claim', {
//   spec: {
//     storageClassName: 'manual',
//     accessModes: ['ReadWriteOnce'],
//     resources: {
//       requests: {
//         storage: '1.5Gi',
//       },
//     },
//   },
// });

// export const pv1ClaimName = pv1Claim.metadata.name;

export const isDev = process.env.isProd !== '1';

export const dbHost = isDev ? config.require('devHost') : config.require('pgHost');
export const dbPort = isDev ? 5433 : config.require('dbPort');

export const dbDatabase = 'devopslab3';

export const dbMigrationsUser = isDev ? 'postgres' : config.requireSecret('pgMigrationsUser');
export const dbMigrationsPass = isDev ? 'pass' : config.requireSecret('pgMigrationsPass');

export const dbDebeziumUser = isDev ? 'dbz' : config.requireSecret('pgDbzUser');
export const dbDebeziumPass = isDev ? 'pass' : config.requireSecret('pgDbzPass');

export const dbServicesUser = isDev ? 'services' : config.requireSecret('pgServicesUser');
export const dbServicesPass = isDev ? 'pass' : config.requireSecret('pgServicesPass');
