using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Orleans;
using OrleansService.Interfaces;
using OrleansService.Models;

namespace OrleansService.Controllers {
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
    public async Task<TodoRecord> Get(Guid id) {
      var grain = clusterClient.GetGrain<ITodoGrain>(id);
      var todo = await grain.Get();
      return todo;
    }

    [HttpPatch("{id}")]
    public async Task Patch(Guid id, [FromBody] TodoRecord input) {
      this.logger.LogInformation(input.ToString());
      var grain = clusterClient.GetGrain<ITodoGrain>(id);
      await grain.Patch(input);
    }
  }
}
