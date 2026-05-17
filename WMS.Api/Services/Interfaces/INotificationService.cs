using WMS.Api.DTOs.Workshop;

namespace WMS.Api.Services.Interfaces.Workshop
{
    public interface INotificationService
    {
        // Notifications
        Task<IEnumerable<NotificationDto>> GetAllNotificationsAsync(int branchId, string? status = null, DateTime? fromDate = null, DateTime? toDate = null);
        Task<NotificationDto?> GetNotificationByIdAsync(int id, int branchId);
        Task<NotificationDto> CreateNotificationAsync(NotificationCreateDto dto, int userId, int branchId);
        Task<NotificationDto> SendNotificationAsync(int id, int userId, int branchId);
        Task<NotificationDto> ResendNotificationAsync(int id, int userId, int branchId);
        Task<bool> CancelNotificationAsync(int id, int branchId);
        Task<NotificationStatsDto> GetNotificationStatsAsync(int branchId, DateTime? fromDate = null, DateTime? toDate = null);

        // Templates
        Task<IEnumerable<NotificationTemplateDto>> GetAllTemplatesAsync(int? branchId = null);
        Task<NotificationTemplateDto?> GetTemplateByIdAsync(int id);
        Task<NotificationTemplateDto> CreateTemplateAsync(NotificationTemplateCreateDto dto, int userId);
        Task<NotificationTemplateDto?> UpdateTemplateAsync(int id, NotificationTemplateUpdateDto dto, int userId);
        Task<bool> DeleteTemplateAsync(int id);

        // Customer Preferences
        Task<CustomerPreferenceDto?> GetCustomerPreferencesAsync(int customerId, int branchId);
        Task<CustomerPreferenceDto> UpdateCustomerPreferencesAsync(CustomerPreferenceUpdateDto dto, int userId, int branchId);
        Task<CustomerPreferenceDto> CreateDefaultPreferencesAsync(int customerId, int userId, int branchId);

        // Auto notifications based on job status
        Task<NotificationDto> SendJobCreatedNotificationAsync(int jobCardId, int userId, int branchId);
        Task<NotificationDto> SendJobInProgressNotificationAsync(int jobCardId, int userId, int branchId);
        Task<NotificationDto> SendJobReadyNotificationAsync(int jobCardId, int userId, int branchId);
        Task<NotificationDto> SendJobDeliveredNotificationAsync(int jobCardId, int userId, int branchId);
        Task<NotificationDto> SendServiceReminderAsync(int jobCardId, int userId, int branchId);

        // Bulk operations
        Task<List<NotificationDto>> SendBulkNotificationsAsync(BulkNotificationDto dto, int userId, int branchId);
        Task<int> ProcessPendingNotificationsAsync(int branchId);

        // Placeholder replacement
        Task<string> RenderNotificationContentAsync(string templateContent, Dictionary<string, string> placeholders);
    }
}