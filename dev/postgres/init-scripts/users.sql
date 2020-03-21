create user dbz with
  password 'pass'
  replication;
alter default privileges in schema public grant all on tables to dbz;

create user services with password 'pass';
alter default privileges in schema public grant all on tables to services;
alter default privileges in schema public grant all on sequences to services;
alter default privileges in schema public grant all on functions to services;

create publication debezium_todos for all tables;
