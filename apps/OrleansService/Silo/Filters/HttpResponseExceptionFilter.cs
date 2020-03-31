using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using OrleansService.Exceptions;

namespace OrleansService.Filters {
  public class HttpResponseExceptionFilter : IActionFilter, IOrderedFilter {
    public int Order { get; set; } = int.MaxValue - 10;

    public void OnActionExecuting(ActionExecutingContext context) { }

    public void OnActionExecuted(ActionExecutedContext context) {
      if (context.Exception is HttpResponseException exception) {
        context.Result = new ObjectResult(exception.Content) {
          StatusCode = (int) exception.StatusCode,
        };
        context.ExceptionHandled = true;
      }
    }
  }
}
