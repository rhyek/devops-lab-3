import { expose } from 'threads/worker';
import pgpLib, { IDatabase } from 'pg-promise';
import { v4 as uuid } from 'uuid';

const pgp = pgpLib();
pgp.pg.types.setTypeParser(20, parseInt);
let db: IDatabase<{}>;

const worker = {
  sayHello() {
    return 'Hello, world!';
  },
  initializeDb(url: string) {
    db = pgp(url);
  },
  async createUser(isolationLevel: pgpLib.isolationLevel) {
    const id = uuid();
    const user = {
      id,
      email: `test-${id}@gmail.com`,
      name: 'tester',
    };
    const mode = new pgpLib.txMode.TransactionMode({
      tiLevel: isolationLevel,
    });
    const result = await db.tx({ mode }, async tx => {
      const { count } = await tx.one<{ count: number }>('select count(*) from users');
      if (count < 4) {
        return await tx.one(`insert into users (id, email, name) values ($1, $2, $3) returning *`, [
          user.id,
          user.email,
          user.name,
        ]);
      } else {
        return null;
      }
    });
    return result;
  },
};

export type SqlConcurrencyWorker = typeof worker;

expose(worker);
