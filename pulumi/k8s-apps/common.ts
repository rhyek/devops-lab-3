import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import { Secret } from '@pulumi/kubernetes/core/v1';

export const config = new pulumi.Config();

export const servicePort = 80;

export const k8sProvider = new k8s.Provider('render-yaml', {
  renderYamlToDirectory: '../../dev/k8s-yamls',
});

export const generalStack = new pulumi.StackReference('general.local');

export const dbHost = generalStack.requireOutput('dbHost') as pulumi.Output<string>;
export const dbPort = generalStack.requireOutput('dbPort').apply((port: number) => port.toString());
export const dbDatabase = generalStack.requireOutput('dbDatabase') as pulumi.Output<string>;

const dbMigrationsUser = generalStack.requireOutput('dbMigrationsUser') as pulumi.Output<string>;
const dbMigrationsPass = generalStack.requireOutput('dbMigrationsPass') as pulumi.Output<string>;

const dbDebeziumUser = generalStack.requireOutput('dbDebeziumUser') as pulumi.Output<string>;
const dbDebeziumPass = generalStack.requireOutput('dbDebeziumPass') as pulumi.Output<string>;

const dbServicesUser = generalStack.requireOutput('dbServicesUser') as pulumi.Output<string>;
const dbServicesPass = generalStack.requireOutput('dbServicesPass') as pulumi.Output<string>;

const firebaseServiceAccountJson = config.requireSecret('firebaseServiceAccountJson');

function dbUrl(user: pulumi.Output<any>, pass: pulumi.Output<any>): pulumi.Output<string> {
  return pulumi.interpolate`postgresql://${user}:${pass}@${dbHost}:${dbPort}/${dbDatabase}`;
}

export const generalSecretsMap = {
  dbMigrationsUser,
  dbMigrationsPass,
  dbDebeziumUser,
  dbDebeziumPass,
  dbServicesUser,
  dbServicesPass,
  firebaseServiceAccountJson,

  migrationsDbUrl: dbUrl(dbMigrationsUser, dbMigrationsPass),
  debeziumDbUrl: dbUrl(dbDebeziumUser, dbDebeziumPass),
  servicesDbUrl: dbUrl(dbServicesUser, dbServicesPass),
};

export type GeneralSecretKey = keyof typeof generalSecretsMap;

export const generalSecrets = new Secret(
  'general',
  {
    stringData: generalSecretsMap,
  },
  { provider: k8sProvider },
);
