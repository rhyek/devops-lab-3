import * as k8s from '@pulumi/kubernetes';

const nginx = new k8s.helm.v3.Chart('my-nginx', {
  chart: 'nginx-ingress',
  fetchOpts: { repo: 'https://kubernetes-charts.storage.googleapis.com' },
});

// const kong = new k8s.helm.v3.Chart('kong', {
//   fetchOpts: {
//     repo: 'https://charts.konghq.com',
//   },
//   chart: 'kong',
//   values: {
//     ingressController: {
//       installCRDs: false,
//     },
//     proxy: {
//       type: 'NodePort',
//       http: {
//         nodePort: 31500,
//       },
//       tls: {
//         nodePort: 32500,
//       },
//     },
//   },
// });
