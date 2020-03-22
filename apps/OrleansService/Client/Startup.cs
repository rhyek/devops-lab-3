using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Orleans;
using Orleans.Clustering.Kubernetes;
using Orleans.Configuration;
using Orleans.Runtime;

namespace OrleansService.Client {
  public class Startup {
    public Startup(IConfiguration configuration) {
      Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services) {
      services.AddSingleton<IClusterClient>(CreateClusterClient);
      services.AddControllers();
    }

    private IClusterClient CreateClusterClient(IServiceProvider serviceProvider) {
      var client = new ClientBuilder()
        .Configure<ClusterOptions>(options => {
          options.ClusterId = "main-cluster";
          options.ServiceId = "main-service";
        })
        .UseKubeGatewayListProvider()
        .ConfigureApplicationParts(parts => parts.AddApplicationPart(typeof(ITodo).Assembly).WithReferences())
        .ConfigureLogging(logging => logging.AddConsole())
        .Build();

      Console.WriteLine("Stardtdidng Client With Retries");
      StartClientWithRetries(client).Wait();
      return client;
    }

    private static async Task StartClientWithRetries(IClusterClient client, int initializeAttemptsBeforeFailing = 5) {
      int attempt = 0;
      while (true) {
        try {
          await client.Connect();
          Console.WriteLine("Client successfully connect to silo host");
          break;
        } catch (SiloUnavailableException) {
          attempt++;
          Console.WriteLine($"Attempt {attempt} of {initializeAttemptsBeforeFailing} failed to initialize the Orleans client.");
          if (attempt > initializeAttemptsBeforeFailing) {
            throw;
          }
          await Task.Delay(TimeSpan.FromSeconds(4));
        }
      }
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env) {
      if (env.IsDevelopment()) {
        app.UseDeveloperExceptionPage();
      }

      app.UseHttpsRedirection();

      app.UseRouting();

      app.UseAuthorization();

      app.UseEndpoints(endpoints => {
        endpoints.MapControllers();
      });
    }
  }
}
