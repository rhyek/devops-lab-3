using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Orleans;
using Orleans.Clustering.Kubernetes;
using Orleans.Configuration;
using Orleans.Hosting;
using OrleansService.Grains;
using OrleansService.Interfaces;
using OrleansService.Services;

namespace OrleansService {
  public class Program {
    public static void Main(string[] args) {
      CreateHostBuilder(args).Build().Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args) {
      var builder = Host.CreateDefaultBuilder(args)
        .UseOrleans(siloBuilder => {
          siloBuilder.Configure<ClusterOptions>(options => {
              options.ClusterId = "main-cluster";
              options.ServiceId = "main-service";
            })
            .UseKubeMembership(opt => {
              opt.CanCreateResources = false;
            })
            .ConfigureEndpoints(new Random(1).Next(30001, 30100), new Random(1).Next(20001, 20100), listenOnAnyHostAddress : true)
            .ConfigureApplicationParts(parts => parts.AddApplicationPart(typeof(TodoGrain).Assembly).WithReferences())
            .ConfigureServices(services => {
              services.AddSingleton<IDbConnectionFactory, PgConnectionFactory>();
            });
        })
        .ConfigureWebHostDefaults(webBuilder => {
          webBuilder.UseStartup<Startup>();
        });
      return builder;
    }
  }
}
