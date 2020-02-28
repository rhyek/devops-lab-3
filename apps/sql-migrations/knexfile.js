require('ts-node/register');

const settings = {
  ext: 'ts',
  client: 'pg',
  connection: process.env.DB_URL,
  migrations: {
    directory: './files',
    tableName: 'migrations',
  },
};

module.exports = settings;
