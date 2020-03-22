#! ts-node
import { spawn, ChildProcess } from 'child_process';

let dockerCompose: ChildProcess;
let tilt: ChildProcess;

async function main() {
  try {
    await new Promise((resolve) => {
      dockerCompose = spawn('docker-compose', ['up']);
      let ready = 0;
      dockerCompose.stdout?.on('data', (data) => {
        const str: string = data.toString();
        process.stdout.write(str);
        if (str.includes('database system is ready to accept connections')) {
          console.log('DB is up.');
          ready += 1;
        } else if (str.includes('success: broker entered RUNNING state')) {
          if (ready < 2) {
            console.log('Kafka Broker is up.');
          }
          ready += 1;
        }
        if (ready === 2) {
          setTimeout(resolve, 4_000);
        }
      });
      dockerCompose.stderr?.on('data', (data) => {
        const str: string = data.toString();
        process.stderr.write(str);
      });
    });
    // spawn('python3', ['./scripts/generate-types-from-avro.py']);
    // tilt = spawn('tilt', ['up', '--hud=false', '--no-browser'], { stdio: 'inherit' });
    tilt = spawn('tilt', ['up', '--hud=false'], { stdio: 'inherit' });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await new Promise((resolve) => {
    tilt.on('exit', resolve);
  });
  await Promise.all([
    new Promise((resolve) => {
      dockerCompose.on('exit', resolve);
    }),
    new Promise((resolve) => {
      const cp = spawn('tilt', ['down'], { stdio: 'inherit' });
      cp.on('exit', resolve);
    }),
  ]);
  process.stdout.write('\nBye!\n');
  process.exit(0);
});

main();
