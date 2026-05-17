using WMS.Api.Services.Interfaces.Workshop;

namespace WMS.Api.Services.BackgroundServices
{
    public class NotificationBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<NotificationBackgroundService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(5); // Check every 5 minutes

        public NotificationBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<NotificationBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Notification Background Service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessPendingNotifications();
                    await Task.Delay(_checkInterval, stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in Notification Background Service");
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                }
            }

            _logger.LogInformation("Notification Background Service stopped");
        }

        private async Task ProcessPendingNotifications()
        {
            using var scope = _serviceProvider.CreateScope();
            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

            try
            {
                // Process for all branches (you might want to get active branches)
                var branches = await GetActiveBranches(scope);

                foreach (var branch in branches)
                {
                    var processed = await notificationService.ProcessPendingNotificationsAsync(branch.Id);
                    if (processed > 0)
                    {
                        _logger.LogInformation($"Processed {processed} notifications for branch {branch.Id}");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing pending notifications");
            }
        }

        private async Task<List<BranchInfo>> GetActiveBranches(IServiceScope scope)
        {
            // You can implement this to get active branches from database
            // For now, return a default branch
            return new List<BranchInfo> { new BranchInfo { Id = 1, Name = "Main Branch" } };
        }
    }

    public class BranchInfo
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}