import * as k8s from '@pulumi/kubernetes';

export const servicePort = 80;

export const k8sProvider = new k8s.Provider('render-yaml', {
  renderYamlToDirectory: '../../dev/k8s-yamls',
});
