using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Orleans;
using Orleans.Clustering.Kubernetes;
using Orleans.Configuration;
using Orleans.Hosting;
using OrleansService;

namespace KubeSiloHost {
  public class Program {
    private static readonly AutoResetEvent Closing = new AutoResetEvent(false);

    public static async Task<int> Main(string[] args) {
      // Console.WriteLine("Silo is redady!");

      // Console.CancelKeyPress += OnExit;
      // Closing.WaitOne();

      // await Task.Delay(0);

      // Console.WriteLine("Shutting down....");
      // return 0;
      try {
        var host = await StartSilo();
        Console.WriteLine("Silo is ready.");

        Console.CancelKeyPress += OnExit;
        Closing.WaitOne();

        Console.WriteLine("Shutting down...");

        await host.StopAsync();

        return 0;
      } catch (Exception ex) {
        Console.WriteLine(ex);
        return 1;
      }
    }

    private static async Task<ISiloHost> StartSilo() {
      var builder = new SiloHostBuilder()
        .Configure<ClusterOptions>(options => {
          options.ClusterId = "main-cluster";
          options.ServiceId = "main-service";
        })
        .ConfigureEndpoints(new Random(1).Next(30001, 30100), new Random(1).Next(20001, 20100), listenOnAnyHostAddress : true)
        .UseKubeMembership(opt => {
          //opt.APIEndpoint = "http://localhost:8001";
          //opt.CertificateData = "test";
          //opt.APIToken = "test";
          opt.CanCreateResources = false;
          opt.DropResourcesOnInit = true;
        })
        .AddMemoryGrainStorageAsDefault()
        .ConfigureApplicationParts(parts => parts.AddApplicationPart(typeof(TodoGrain).Assembly).WithReferences())
        .ConfigureLogging(logging => logging.AddConsole());

      var host = builder.Build();
      await host.StartAsync();
      return host;
    }

    private static void OnExit(object sender, ConsoleCancelEventArgs args) {
      Closing.Set();
    }
  }
}
