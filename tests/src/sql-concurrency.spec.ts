import 'mocha';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { spawn, ModuleThread, Worker, Thread } from 'threads';
import pgpMaker from 'pg-promise';
import { v4 as uuid } from 'uuid';
import { SqlConcurrencyWorker } from './sql-concurrency-worker';

chai.use(chaiAsPromised);

const pgp = pgpMaker();
pgp.pg.types.setTypeParser(20, parseInt);
const dbUrl = 'postgresql://user:pass@localhost:5434/test-db';

describe('SQL Concurrency', () => {
  const db = pgp(dbUrl);
  let workers: ModuleThread<SqlConcurrencyWorker>[];

  before(async function() {
    this.timeout(10000);
    await db.query(`
      create table users (
        id varchar(50) primary key,
        email varchar(100) not null unique,
        name varchar(50) not null
      );
    `);
    workers = await Promise.all(new Array(20).fill(null).map(() => spawn(new Worker('./sql-concurrency-worker'))));
  });

  after(async () => {
    await db.query(`
      drop table users;
    `);
    await db.$pool.end();
    await Promise.all(workers.map(worker => Thread.terminate(worker)));
  });

  describe('Threads', () => {
    it("all threads say 'Hello, world!'", async () => {
      expect(await Promise.all(workers.map(worker => worker.sayHello()))).to.eql(
        new Array(workers.length).fill('Hello, world!'),
      );
    });
    it("all threads' db objects were initialized", async () => {
      await expect(Promise.all(workers.map(worker => worker.initializeDb(dbUrl)))).to.eventually.be.fulfilled;
    });
  });

  describe('Read commited', () => {
    it('amount is greater than limit', async () => {
      const result = await Promise.allSettled(
        workers.map(worker => worker.createUser(pgpMaker.txMode.isolationLevel.readCommitted)),
      );
      const { count } = await db.one<{ count: number }>('select count(*) from users');
      expect(count).to.be.greaterThan(3);
    });
    after(async () => {
      await db.query('delete from users');
    });
  });

  describe('Repeatable read', () => {
    before(async () => {
      await Promise.allSettled(workers.map(worker => worker.createUser(pgpMaker.txMode.isolationLevel.repeatableRead)));
    });
    it('amount is greater than limit', async () => {
      const { count } = await db.one<{ count: number }>('select count(*) from users');
      expect(count).to.be.greaterThan(3);
    });
    after(async () => {
      await db.query('delete from users');
    });
  });

  describe('Serializable', () => {
    it('amount is different than limit', async () => {
      const result = await Promise.allSettled(
        workers.map(worker => worker.createUser(pgpMaker.txMode.isolationLevel.serializable)),
      );
      const { count } = await db.one<{ count: number }>('select count(*) from users');
      expect(count).to.not.eq(3);
    });
    after(async () => {
      await db.query('delete from users');
    });
  });
});
