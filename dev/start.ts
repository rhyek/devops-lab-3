#! ts-node
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

const childProcesses: ChildProcess[] = [];

function killChildren() {
  for (const child of childProcesses) {
    child.kill('SIGINT');
  }
}

function handleErrors(cp: ChildProcess) {
  cp.on('error', error => {
    console.error(error);
    killChildren();
    process.exit(1);
  });
  cp.on('exit', code => {
    if (code !== null && code > 0) {
      killChildren();
      process.exit(1);
    }
  });
}

async function main() {
  try {
    // childProcesses.push(spawn('docker-compose', ['up'], { cwd: __dirname }));
    await new Promise(resolve => {
      const cp = spawn('docker-compose', ['up'], { cwd: __dirname });
      childProcesses.push(cp);
      cp.stdout?.on('data', data => {
        const str: string = data.toString();
        process.stdout.write(str);
        if (str.includes('database system is ready to accept connections')) {
          console.log('DB is up.');
          resolve();
        }
      });
      handleErrors(cp);
    });
    // spawn('python3', ['./scripts/generate-types-from-avro.py']);
    const cp = spawn('tilt', ['up', '--hud=false', '--no-browser'], { stdio: 'inherit' });
    childProcesses.push(cp);
    handleErrors(cp);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  killChildren();
  process.stdout.write('\nBye!\n');
  process.exit(0);
});

main();
