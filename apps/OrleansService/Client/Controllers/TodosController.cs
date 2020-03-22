using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Orleans;

namespace OrleansService.Client {
  [ApiController]
  [Route("[controller]")]
  public class TodosController : ControllerBase {
    private readonly ILogger<TodosController> logger;
    private readonly IClusterClient clusterClient;
    public TodosController(ILogger<TodosController> logger, IClusterClient clusterClient) {
      this.logger = logger;
      this.clusterClient = clusterClient;
    }

    [HttpGet("{id}")]
    public Task<string> Get(Guid id) {
      var task = clusterClient.GetGrain<ITodo>(id);
      return task.SayHello("Carlos");
    }
  }
}
