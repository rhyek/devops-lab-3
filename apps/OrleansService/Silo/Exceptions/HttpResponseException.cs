using System;
using System.Net;

namespace OrleansService.Exceptions {
  public class HttpResponseException : Exception {
    public HttpStatusCode StatusCode { get; set; } = HttpStatusCode.InternalServerError;
    public object Content { get; set; }

    public HttpResponseException(HttpStatusCode statusCode, object value) {
      this.StatusCode = statusCode;
      this.Content = value;
    }
  }
}
