import { TaskRecord } from '../../@shared/types/todo';
import { makeConnectionPool } from '../../@shared/utils/database';

export const pgDb = makeConnectionPool();

export async function save(data: Omit<TaskRecord, 'created_at'>) {
  const record = await pgDb.one<TaskRecord>(
    `
    insert into todos (id, description, owner_id, assignee_id, completed)
    values ($<id>, $<description>, $<owner_id>, $<assignee_id>, $<completed>)
    on conflict (id)
    do update set
      description = $<description>,
      assignee_id = $<assignee_id>,
      completed = $<completed>
    returning *;
  `,
    data,
  );
  return record;
}

// const kafkaAvro = new KafkaAvro({
//   kafkaBroker: process.env.KAFKA_BROKER as string,
//   schemaRegistry: `http://${process.env.KAFKA_SCHEMA_REGISTRY}`,
//   topics: ['todos'],
// });

// kafkaAvro.init().then(async () => {
//   console.log('Ready to use');
//   // const producer = await kafkaAvro.getProducer();
//   // try {
//   //   const x = '1';
//   //   producer.produce(
//   //     'users',
//   //     -1,
//   //     {
//   //       id: x,
//   //       email: `carlos.rgn${x}@gmail.com`,
//   //       name: 'carlos',
//   //       external_id: x,
//   //     },
//   //     x,
//   //   );
//   // } catch (error) {
//   //   console.error(error);
//   // }
// });

// export async function getUserProducer() {
//   await kafkaAvro.init();
//   const producer = await kafkaAvro.getProducer();
//   return producer;
// }

// export async function saveUser(user: any) {
//   const producer = await getUserProducer();
//   producer.produce('users', -1, user, user.id);
// }

// const client = new KafkaClient({
//   kafkaHost: process.env.KAFKA_BROKER,
// });

// const producer = new Producer(client, {});

// const type = avro.Type.forSchema({
//   name: 'newUser',
//   type: 'record',
//   namespace: 'devopslab3',
//   fields: [
//     { name: 'id', type: 'string' },
//     { name: 'email', type: 'string' },
//     { name: 'name', type: 'string' },
//     { name: 'external_id', type: 'string' },
//   ],
// });

// producer.on('ready', () => {
//   console.log('producer ready');
//   producer.send(
//     [
//       {
//         topic: 'users',
//         key: '1',
//         messages: [
//           type.toBuffer({
//             id: '1',
//             email: 'carlos.rgn1@gmail.com',
//             name: 'carlos',
//             external_id: '1',
//           }),
//         ],
//       },
//     ],
//     (error, data) => {
//       if (error) {
//         console.error(error);
//       } else {
//         console.log('message ssentsss', data);
//       }
//     },
//   );
// });

// producer.on('error', error => {
//   console.error(error);
// });
