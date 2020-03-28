using System.Threading.Tasks;
using OrleansService.Models;

namespace OrleansService.Interfaces {
  public interface ITodoGrain : Orleans.IGrainWithGuidKey {
    Task<TodoRecord> Get();
    Task Patch(TodoRecord newValue);
  }
}
