import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    create domain my_id as varchar(50);
    create table users (
      id my_id primary key,
      email varchar(100) not null unique,
      name varchar(100),
      external_id my_id not null unique
    );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    drop table users;
    drop domain my_id;
  `);
}
