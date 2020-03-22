using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Orleans;
using Orleans.Clustering.Kubernetes;
using Orleans.Configuration;
using Orleans.Runtime;
using OrleansService;

namespace KubeClient {
  public class Program {
    private static readonly AutoResetEvent Closing = new AutoResetEvent(false);

    static async Task<int> Main(string[] args) {
      try {
        using(var client = await StartClientWithRetries()) {
          await DoClientWork(client);

          Console.CancelKeyPress += OnExit;
          Closing.WaitOne();

          Console.WriteLine("Shutting down...");
        }

        return 0;
      } catch (Exception e) {
        Console.WriteLine(e);
        return 1;
      }
    }

    private static async Task<IClusterClient> StartClientWithRetries(int initializeAttemptsBeforeFailing = 5) {
      int attempt = 0;
      IClusterClient client;
      while (true) {
        try {
          client = new ClientBuilder()
            .Configure<ClusterOptions>(options => {
              options.ClusterId = "main-cluster";
              options.ServiceId = "main-service";
            })
            .UseKubeGatewayListProvider()
            .ConfigureApplicationParts(parts => parts.AddApplicationPart(typeof(ITodo).Assembly).WithReferences())
            .ConfigureLogging(logging => logging.AddConsole())
            .Build();

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

      return client;
    }

    private static async Task DoClientWork(IClusterClient client) {
      var friend = client.GetGrain<ITodo>(Guid.NewGuid());
      for (int i = 0; i < 10; i++) {
        var response = await friend.SayHello("Carlos");
        Console.WriteLine(response);
      }
    }

    private static void OnExit(object sender, ConsoleCancelEventArgs args) {
      Closing.Set();
    }
  }
}
