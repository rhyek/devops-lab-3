using System.Data.Common;

namespace OrleansService.Interfaces {
  public interface IDbConnectionFactory {
    DbConnection CreateConnection();
  }
}
