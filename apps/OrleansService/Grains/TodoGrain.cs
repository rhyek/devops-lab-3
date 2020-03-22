using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Orleans;

namespace OrleansService {
  public class TodoGrain : Grain, ITodo {
    private readonly ILogger logger;
    public TodoGrain(ILogger<TodoGrain> logger) {
      this.logger = logger;
    }
    public Task<string> SayHello(string name) {
      logger.LogInformation($"Hi, {name}.");
      return Task.FromResult($"Hi, {name}! I am {this.GetPrimaryKey()}.");
    }
  }
}
