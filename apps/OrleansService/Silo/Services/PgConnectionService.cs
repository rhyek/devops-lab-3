using System;
using System.Data.Common;
using Dapper;
using Npgsql;
using Orleans.Concurrency;
using OrleansService.Interfaces;
using OrleansService.Models;

namespace OrleansService.Services {
  [Reentrant]
  public class PgConnectionService : IDbConnectionService {
    public PgConnectionService() {
      Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;
      SimpleCRUD.SetDialect(SimpleCRUD.Dialect.PostgreSQL);
      var resolver = new CustomResolver();
      SimpleCRUD.SetTableNameResolver(resolver);
      SimpleCRUD.SetColumnNameResolver(resolver);
    }
    public string GetConnectionString() {
      var dbHost = Environment.GetEnvironmentVariable("DB_HOST");
      var dbPort = Environment.GetEnvironmentVariable("DB_PORT");
      var dbUser = Environment.GetEnvironmentVariable("DB_USER");
      var dbPass = Environment.GetEnvironmentVariable("DB_PASS");
      var dbName = Environment.GetEnvironmentVariable("DB_DBNAME");
      var connectionString = $"Host={dbHost}; Port={dbPort}; Database={dbName}; Username={dbUser}; Password={dbPass}";
      return connectionString;
    }
    public DbConnection GetConnection() {
      var connection = new NpgsqlConnection(GetConnectionString());
      return connection;
    }
  }
}
