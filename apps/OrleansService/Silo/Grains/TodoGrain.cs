using System.Net;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Logging;
using Orleans;
using OrleansService.Exceptions;
using OrleansService.Interfaces;
using OrleansService.Models;

namespace OrleansService.Grains {
  public class TodoGrain : Grain, ITodoGrain {
    private readonly ILogger logger;
    private readonly IDbConnectionService dbConnectionService;
    private TodoRecord record;
    public TodoGrain(ILogger<TodoGrain> logger, IDbConnectionService dbConnectionService) {
      this.logger = logger;
      this.dbConnectionService = dbConnectionService;
    }
    public override async Task OnActivateAsync() {
      await using(var connection = dbConnectionService.GetConnection()) {
        await connection.OpenAsync();
        var value = await connection.GetAsync<TodoRecord>(this.GetPrimaryKey().ToString());
        this.record = value;
      }
    }
    public Task<TodoRecord> Get() {
      return Task.FromResult(this.record);
    }
    public async Task Patch(TodoRecord newValue) {
      if (this.record.AssigneeId != null && newValue.AssigneeId != null && this.record.AssigneeId != newValue.AssigneeId) {
        throw new HttpResponseException(HttpStatusCode.BadRequest, "This todo has already been assigned to someone.");
      }
      logger.LogInformation(newValue.Description);
      await using(var connection = dbConnectionService.GetConnection()) {
        await connection.OpenAsync();
        await connection.UpdateAsync<TodoRecord>(newValue);
      }
    }
  }
}
