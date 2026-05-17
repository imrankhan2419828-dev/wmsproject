using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.BackgroundServices
{
    public class ChequeAutoPostService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ChequeAutoPostService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromHours(1); // Check every hour

        public ChequeAutoPostService(
            IServiceProvider serviceProvider,
            ILogger<ChequeAutoPostService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Cheque Auto-Post Service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // Run at midnight (12:05 AM)
                    var now = DateTime.Now;
                    var scheduledTime = new DateTime(now.Year, now.Month, now.Day, 0, 5, 0);

                    if (now >= scheduledTime && now < scheduledTime.AddMinutes(10))
                    {
                        await ProcessAllBranches();
                        await Task.Delay(TimeSpan.FromHours(24), stoppingToken); // Wait 24 hours
                    }
                    else
                    {
                        await Task.Delay(_checkInterval, stoppingToken);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in Cheque Auto-Post Service");
                    await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
                }
            }

            _logger.LogInformation("Cheque Auto-Post Service stopped");
        }

        private async Task ProcessAllBranches()
        {
            using var scope = _serviceProvider.CreateScope();
            var chequeService = scope.ServiceProvider.GetRequiredService<IPostdatedChequeService>();

            // Get all branches (you need to inject branch service)
            var branches = await GetBranches(scope);

            foreach (var branch in branches)
            {
                try
                {
                    var count = await chequeService.ProcessDueChequesAsync(branch.Id);
                    _logger.LogInformation($"Branch {branch.Id}: {count} cheques processed");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error processing branch {branch.Id}");
                }
            }
        }

        private async Task<List<Branch>> GetBranches(IServiceScope scope)
        {
            // Implement this to get all active branches
            // For now, return a default list
            return new List<Branch> { new Branch { Id = 1, Name = "Main Branch" } };
        }
    }

    public class Branch
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
