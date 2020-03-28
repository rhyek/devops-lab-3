using System.Data.Common;

namespace OrleansService.Interfaces {
  public interface IDbConnectionService {
    string GetConnectionString();
    DbConnection GetConnection();
  }
}
