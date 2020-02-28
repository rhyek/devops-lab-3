import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    create table users (
      id varchar(50) primary key,
      email varchar(100) not null unique,
      name varchar(100),
      external_id varchar(50) not null unique
    );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    drop table users;
  `);
}
