import pgpLib from 'pg-promise';

export function makeConnectionPool() {
  const pgp = pgpLib();
  const db = pgp({
    connectionString: process.env.DB_URL as string,
    idleTimeoutMillis: 0,
  });
  return db;
}
