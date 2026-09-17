using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace EpyxisAgentService
{
    internal class Program
    {
        private static void Main(string[] args)
        {
            Host.CreateDefaultBuilder(args)
                .UseWindowsService(options =>
                {
                    // The service name must match what's registered in the SCM
                    options.ServiceName = "EpyxisAgentService";
                })
                .ConfigureServices(services =>
                {
                    services.AddHostedService<AgentService>();
                })
                .Build()
                .Run();
        }
    }
}


