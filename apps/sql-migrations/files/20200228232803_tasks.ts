import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    create table tasks (
      id my_id primary key,
      description varchar(100) not null,
      owner_id my_id not null references users (id),
      assignee_id my_id references users (id),
      completed boolean default false,
      created_at timestamptz default now()
    );
    
    create index tasks_owner_id_idx on tasks (owner_id);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    drop table tasks;
  `);
}
