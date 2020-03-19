import { Kafka, logLevel } from 'kafkajs';
import admin from 'firebase-admin';
import changeCaseObject from 'change-case-object';
import { TaskDocument } from '../../@shared/types/task';

const app = admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON as string)),
});

async function sendKeepalive() {
  await app
    .firestore()
    .collection('keepalive')
    .doc('0')
    .set({
      time: new Date().toISOString(),
    });
  console.log('keepalive sent');
}

function setKeepaliveInterval() {
  keepaliveHandle = setInterval(sendKeepalive, 60_000 * 3);
}
sendKeepalive();
let keepaliveHandle: NodeJS.Timeout | null = null;
setKeepaliveInterval();

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  brokers: (process.env.CONNECT_BOOTSTRAP_SERVERS as string).split(','),
  clientId: 'firestore-tasks-sync',
});

const topic = 'debezium-pg.public.tasks';
const consumer = kafka.consumer({ groupId: 'firestore-tasks-sync' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });
  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      if (keepaliveHandle) {
        clearInterval(keepaliveHandle);
      }
      setKeepaliveInterval();
      console.log('----------');
      console.log('Offset:', message.offset);
      console.log(message.value.toString());
      console.log('----------');

      const document = (changeCaseObject.camel(JSON.parse(message.value.toString()).after) as unknown) as TaskDocument;
      console.log(document);

      await app
        .firestore()
        .collection('tasks')
        .doc(document.id)
        .set(document);

      console.log("Document sync'd to firestore.");

      await consumer.commitOffsets([{ topic, partition, offset: (Number(message.offset) + 1).toString() }]);
    },
  });
};

run().catch(e => console.error(`[firestore-tasks-sync/consumer] ${e.message}`, e));

const errorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

async function cleanUp() {
  if (keepaliveHandle) {
    clearInterval(keepaliveHandle);
  }
  await consumer.disconnect();
  await app.delete();
}

errorTypes.map(type => {
  process.on(type as any, async e => {
    try {
      console.log(`process.on ${type}`);
      console.error(e);
      await cleanUp();
      process.exit(0);
    } catch {
      process.exit(1);
    }
  });
});

signalTraps.map(type => {
  process.once(type as any, async () => {
    try {
      await cleanUp();
    } finally {
      process.kill(process.pid, type);
    }
  });
});
