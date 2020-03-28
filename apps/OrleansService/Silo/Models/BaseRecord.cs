using Dapper;

namespace OrleansService.Models {
  public class BaseRecord {
    [ReadOnly(true)]
    public string Id { get; set; }

    [ReadOnly(true)]
    public string CreatedAt { get; set; }
  }
}
