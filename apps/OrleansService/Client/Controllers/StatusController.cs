using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Orleans;

namespace OrleansService.Client {
  [ApiController]
  [Route("[controller]")]
  public class StatusController : ControllerBase {
    private readonly ILogger<TodosController> logger;
    public StatusController(ILogger<TodosController> logger) {
      this.logger = logger;
    }

    [HttpGet]
    public Task<string> Get() {
      return Task.FromResult($"Hello :-)\n");
    }
  }
}
