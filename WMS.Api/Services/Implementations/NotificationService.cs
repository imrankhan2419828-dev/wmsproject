using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Models.Workshop;
using WMS.Api.Services.Interfaces.Workshop;
using Microsoft.Data.SqlClient;
using System.Text.RegularExpressions;
using System.Text.Json;
using WMS.Api.Models;

namespace WMS.Api.Services.Implementations.Workshop
{
    public class NotificationService : INotificationService
    {
        private readonly WmsDbContext _context;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(WmsDbContext context, ILogger<NotificationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Notifications

        public async Task<IEnumerable<NotificationDto>> GetAllNotificationsAsync(int branchId, string? status = null, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                var query = _context.CustomerNotifications
                    .Include(n => n.JobCard)
                        .ThenInclude(j => j!.Vehicle)
                    .Include(n => n.Customer)
                    .Where(n => n.BranchID == branchId);

                if (!string.IsNullOrEmpty(status))
                    query = query.Where(n => n.Status == status);

                if (fromDate.HasValue)
                    query = query.Where(n => n.SentDate >= fromDate.Value);

                if (toDate.HasValue)
                {
                    var endDate = toDate.Value.AddDays(1);
                    query = query.Where(n => n.SentDate < endDate);
                }

                var notifications = await query
                    .OrderByDescending(n => n.SentDate)
                    .ToListAsync();

                return notifications.Select(MapToDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notifications");
                throw;
            }
        }

        public async Task<NotificationDto?> GetNotificationByIdAsync(int id, int branchId)
        {
            try
            {
                var notification = await _context.CustomerNotifications
                    .Include(n => n.JobCard)
                        .ThenInclude(j => j!.Vehicle)
                    .Include(n => n.Customer)
                    .FirstOrDefaultAsync(n => n.NotificationID == id && n.BranchID == branchId);

                return notification == null ? null : MapToDto(notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notification {Id}", id);
                throw;
            }
        }

        //public async Task<NotificationDto> CreateNotificationAsync(NotificationCreateDto dto, int userId, int branchId)
        //{
        //    try
        //    {
        //        // Get job card details
        //        var jobCard = await _context.JobCards
        //            .Include(j => j.Vehicle)
        //            .Include(j => j.Customer)
        //            .FirstOrDefaultAsync(j => j.JobCardID == dto.JobCardID && j.BranchID == branchId);

        //        if (jobCard == null)
        //            throw new InvalidOperationException("Job card not found");

        //        // Get customer preferences
        //        var preferences = await _context.CustomerPreferences
        //            .FirstOrDefaultAsync(p => p.CustomerID == jobCard.CustomerID);

        //        // Determine send method
        //        string sentVia = dto.SentVia ?? DetermineSendMethod(preferences);

        //        // Get template
        //        var template = await _context.NotificationTemplates
        //            .FirstOrDefaultAsync(t => t.NotificationType == dto.NotificationType && t.IsActive);

        //        if (template == null)
        //            throw new InvalidOperationException($"No template found for notification type: {dto.NotificationType}");

        //        // Generate notification number
        //        var notificationNo = await GenerateNotificationNumberAsync(branchId);

        //        // Prepare placeholders
        //        var placeholders = new Dictionary<string, string>
        //        {
        //            ["CustomerName"] = jobCard.Customer?.AcctName ?? "Customer",
        //            ["VehicleRegNo"] = jobCard.Vehicle?.RegistrationNo ?? "Unknown",
        //            ["JobCardNo"] = jobCard.JobCardNo,
        //            ["GrandTotal"] = jobCard.GrandTotal.ToString("F2"),
        //            ["EstimatedTime"] = "2 hours" // You can calculate actual estimated time
        //        };

        //        // Render content
        //        var content = await RenderNotificationContentAsync(
        //            dto.CustomMessage ?? template.BodyTemplate,
        //            placeholders
        //        );

        //        var subject = template.SubjectTemplate != null
        //            ? await RenderNotificationContentAsync(template.SubjectTemplate, placeholders)
        //            : null;

        //        // Determine recipient
        //        string recipient = GetRecipient(preferences, sentVia, jobCard.Customer);

        //        var notification = new CustomerNotification
        //        {
        //            NotificationNo = notificationNo,
        //            JobCardID = dto.JobCardID,
        //            CustomerID = jobCard.CustomerID,
        //            NotificationType = dto.NotificationType,
        //            SentVia = sentVia,
        //            RecipientMobile = sentVia == "SMS" || sentVia == "WHATSAPP" ? recipient : null,
        //            RecipientEmail = sentVia == "EMAIL" ? recipient : null,
        //            MessageSubject = subject,
        //            MessageContent = content,
        //            Status = "PENDING",
        //            ScheduledDate = dto.ScheduledDate,
        //            SentBy = userId,
        //            BranchID = branchId,
        //            CreatedDate = DateTime.Now
        //        };

        //        _context.CustomerNotifications.Add(notification);
        //        await _context.SaveChangesAsync();

        //        // Add to queue
        //        await AddToQueue(notification.NotificationID);

        //        return await GetNotificationByIdAsync(notification.NotificationID, branchId)
        //            ?? throw new Exception("Failed to retrieve created notification");
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Error creating notification");
        //        throw;
        //    }
        //}
        public async Task<NotificationDto> CreateNotificationAsync(NotificationCreateDto dto, int userId, int branchId)
        {
            try
            {
                // Get job card details
                var jobCard = await _context.JobCards
                    .Include(j => j.Vehicle)
                    .Include(j => j.Customer)
                    .FirstOrDefaultAsync(j => j.JobCardID == dto.JobCardID && j.BranchID == branchId);

                if (jobCard == null)
                    throw new InvalidOperationException("Job card not found");

                // ✅ FIX: Handle nullable CustomerID
                int customerId = jobCard.CustomerID ?? 0;

                // Get customer preferences
                var preferences = await _context.CustomerPreferences
                    .FirstOrDefaultAsync(p => p.CustomerID == customerId);

                // Determine send method
                string sentVia = dto.SentVia ?? DetermineSendMethod(preferences);

                // Get template
                var template = await _context.NotificationTemplates
                    .FirstOrDefaultAsync(t => t.NotificationType == dto.NotificationType && t.IsActive);

                if (template == null)
                    throw new InvalidOperationException($"No template found for notification type: {dto.NotificationType}");

                // Generate notification number
                var notificationNo = await GenerateNotificationNumberAsync(branchId);

                // Prepare placeholders
                var placeholders = new Dictionary<string, string>
                {
                    ["CustomerName"] = jobCard.Customer?.AcctName ?? "Customer",
                    ["VehicleRegNo"] = jobCard.Vehicle?.RegistrationNo ?? "Unknown",
                    ["JobCardNo"] = jobCard.JobCardNo,
                    ["GrandTotal"] = jobCard.GrandTotal.ToString("F2"),
                    ["EstimatedTime"] = "2 hours"
                };

                // Render content
                var content = await RenderNotificationContentAsync(
                    dto.CustomMessage ?? template.BodyTemplate,
                    placeholders
                );

                var subject = template.SubjectTemplate != null
                    ? await RenderNotificationContentAsync(template.SubjectTemplate, placeholders)
                    : null;

                // Determine recipient
                string recipient = GetRecipient(preferences, sentVia, jobCard.Customer);

                var notification = new CustomerNotification
                {
                    NotificationNo = notificationNo,
                    JobCardID = dto.JobCardID,
                    CustomerID = customerId,  // ✅ Use int value, not nullable
                    NotificationType = dto.NotificationType,
                    SentVia = sentVia,
                    RecipientMobile = sentVia == "SMS" || sentVia == "WHATSAPP" ? recipient : null,
                    RecipientEmail = sentVia == "EMAIL" ? recipient : null,
                    MessageSubject = subject,
                    MessageContent = content,
                    Status = "PENDING",
                    ScheduledDate = dto.ScheduledDate,
                    SentBy = userId,
                    BranchID = branchId,
                    CreatedDate = DateTime.Now
                };

                _context.CustomerNotifications.Add(notification);
                await _context.SaveChangesAsync();

                // Add to queue
                await AddToQueue(notification.NotificationID);

                return await GetNotificationByIdAsync(notification.NotificationID, branchId)
                    ?? throw new Exception("Failed to retrieve created notification");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notification");
                throw;
            }
        }
        public async Task<NotificationDto> SendNotificationAsync(int id, int userId, int branchId)
        {
            try
            {
                var notification = await _context.CustomerNotifications
                    .FirstOrDefaultAsync(n => n.NotificationID == id && n.BranchID == branchId);

                if (notification == null)
                    throw new InvalidOperationException("Notification not found");

                // TODO: Implement actual SMS/Email/WhatsApp sending logic
                // This would integrate with your provider (Twilio, SMTP, etc.)

                // Simulate sending
                bool sentSuccessfully = await SimulateSend(notification);

                if (sentSuccessfully)
                {
                    notification.Status = "SENT";
                    notification.SentDate = DateTime.Now;
                    notification.ErrorMessage = null;
                }
                else
                {
                    notification.Status = "FAILED";
                    notification.ErrorMessage = "Failed to send";
                    notification.RetryCount++;
                }

                await _context.SaveChangesAsync();

                return await GetNotificationByIdAsync(id, branchId)
                    ?? throw new Exception("Failed to retrieve updated notification");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending notification {Id}", id);
                throw;
            }
        }

        #endregion

        #region Templates

        public async Task<IEnumerable<NotificationTemplateDto>> GetAllTemplatesAsync(int? branchId = null)
        {
            try
            {
                var query = _context.NotificationTemplates
                    .Where(t => t.IsActive);

                if (branchId.HasValue)
                    query = query.Where(t => t.BranchID == null || t.BranchID == branchId);

                var templates = await query
                    .OrderBy(t => t.NotificationType)
                    .ToListAsync();

                return templates.Select(MapToTemplateDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notification templates");
                throw;
            }
        }

        public async Task<NotificationTemplateDto?> GetTemplateByIdAsync(int id)
        {
            try
            {
                var template = await _context.NotificationTemplates
                    .FindAsync(id);

                return template == null ? null : MapToTemplateDto(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting template {Id}", id);
                throw;
            }
        }

        public async Task<NotificationTemplateDto> CreateTemplateAsync(NotificationTemplateCreateDto dto, int userId)
        {
            try
            {
                var template = new NotificationTemplate
                {
                    TemplateCode = dto.TemplateCode,
                    TemplateName = dto.TemplateName,
                    NotificationType = dto.NotificationType,
                    SubjectTemplate = dto.SubjectTemplate,
                    BodyTemplate = dto.BodyTemplate,
                    Placeholders = dto.Placeholders,
                    SentVia = dto.SentVia,
                    IsActive = dto.IsActive,
                    CreatedBy = userId,
                    CreatedDate = DateTime.Now
                };

                _context.NotificationTemplates.Add(template);
                await _context.SaveChangesAsync();

                return MapToTemplateDto(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notification template");
                throw;
            }
        }


        #region Templates (Add these methods after CreateTemplateAsync)

        public async Task<NotificationTemplateDto?> UpdateTemplateAsync(int id, NotificationTemplateUpdateDto dto, int userId)
        {
            try
            {
                var template = await _context.NotificationTemplates
                    .FirstOrDefaultAsync(t => t.TemplateID == id);

                if (template == null)
                    return null;

                template.TemplateCode = dto.TemplateCode;
                template.TemplateName = dto.TemplateName;
                template.NotificationType = dto.NotificationType;
                template.SubjectTemplate = dto.SubjectTemplate;
                template.BodyTemplate = dto.BodyTemplate;
                template.Placeholders = dto.Placeholders;
                template.SentVia = dto.SentVia;
                template.IsActive = dto.IsActive;
                template.ModifiedBy = userId;
                template.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return MapToTemplateDto(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating notification template {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteTemplateAsync(int id)
        {
            try
            {
                var template = await _context.NotificationTemplates
                    .FirstOrDefaultAsync(t => t.TemplateID == id);

                if (template == null)
                    return false;

                // Soft delete - just mark as inactive
                template.IsActive = false;
                template.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification template {Id}", id);
                throw;
            }
        }

        #endregion
        #endregion

        #region Customer Preferences

        
        public async Task<CustomerPreferenceDto?> GetCustomerPreferencesAsync(int customerId, int branchId)
        {
            try
            {
                _logger.LogInformation($"Getting preferences for customer {customerId}");

                var preferences = await _context.CustomerPreferences
                    .Include(p => p.Customer)
                    .FirstOrDefaultAsync(p => p.CustomerID == customerId);

                if (preferences == null)
                {
                    _logger.LogInformation($"No preferences found for customer {customerId}, creating default");

                    // Create default preferences
                    var newPreferences = new CustomerPreference
                    {
                        CustomerID = customerId,
                        PreferSMS = true,
                        PreferEmail = true,
                        PreferWhatsApp = false,
                        SMSNumber = "",
                        EmailAddress = "",
                        WhatsAppNumber = "",
                        AllowMarketing = false,
                        AllowServiceReminders = true,
                        AllowJobUpdates = true,
                        Language = "EN",
                        CreatedDate = DateTime.Now
                    };

                    _context.CustomerPreferences.Add(newPreferences);
                    await _context.SaveChangesAsync();

                    preferences = newPreferences;
                }

                return MapToPreferenceDto(preferences);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting preferences for customer {CustomerId}", customerId);
                throw;
            }
        }
        public async Task<CustomerPreferenceDto> UpdateCustomerPreferencesAsync(CustomerPreferenceUpdateDto dto, int userId, int branchId)
        {
            try
            {
                var preferences = await _context.CustomerPreferences
                    .FirstOrDefaultAsync(p => p.CustomerID == dto.CustomerID);

                if (preferences == null)
                {
                    preferences = new CustomerPreference
                    {
                        CustomerID = dto.CustomerID,
                        CreatedDate = DateTime.Now
                    };
                    _context.CustomerPreferences.Add(preferences);
                }

                preferences.PreferSMS = dto.PreferSMS;
                preferences.PreferEmail = dto.PreferEmail;
                preferences.PreferWhatsApp = dto.PreferWhatsApp;
                preferences.SMSNumber = dto.SMSNumber;
                preferences.EmailAddress = dto.EmailAddress;
                preferences.WhatsAppNumber = dto.WhatsAppNumber;
                preferences.AllowMarketing = dto.AllowMarketing;
                preferences.AllowServiceReminders = dto.AllowServiceReminders;
                preferences.AllowJobUpdates = dto.AllowJobUpdates;
                preferences.Language = dto.Language;
                preferences.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return await GetCustomerPreferencesAsync(dto.CustomerID, branchId)
                    ?? throw new Exception("Failed to retrieve updated preferences");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating customer preferences");
                throw;
            }
        }

       
        public async Task<CustomerPreferenceDto> CreateDefaultPreferencesAsync(int customerId, int userId, int branchId)
        {
            try
            {
                _logger.LogInformation($"Creating default preferences for customer {customerId}");

                var customer = await _context.tblCOA.FindAsync(customerId);
                if (customer == null)
                    throw new InvalidOperationException("Customer not found");

                // COA table doesn't have CellNo and Email fields
                // So we'll create preferences with empty values - user can update later
                var preferences = new CustomerPreference
                {
                    CustomerID = customerId,
                    PreferSMS = true,
                    PreferEmail = true,
                    PreferWhatsApp = false,
                    SMSNumber = "",  // Will be filled by user later
                    EmailAddress = "", // Will be filled by user later
                    WhatsAppNumber = "",
                    AllowMarketing = false,
                    AllowServiceReminders = true,
                    AllowJobUpdates = true,
                    Language = "EN",
                    CreatedDate = DateTime.Now
                };

                _context.CustomerPreferences.Add(preferences);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Default preferences created for customer {customerId}");

                return MapToPreferenceDto(preferences);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating default preferences for customer {CustomerId}", customerId);
                throw;
            }
        }
        #endregion

        #region Auto Notifications

        public async Task<NotificationDto> SendJobCreatedNotificationAsync(int jobCardId, int userId, int branchId)
        {
            var dto = new NotificationCreateDto
            {
                JobCardID = jobCardId,
                NotificationType = "JOB_CREATED"
            };
            return await CreateNotificationAsync(dto, userId, branchId);
        }

        public async Task<NotificationDto> SendJobReadyNotificationAsync(int jobCardId, int userId, int branchId)
        {
            var dto = new NotificationCreateDto
            {
                JobCardID = jobCardId,
                NotificationType = "READY"
            };
            return await CreateNotificationAsync(dto, userId, branchId);
        }

        public async Task<NotificationDto> SendJobDeliveredNotificationAsync(int jobCardId, int userId, int branchId)
        {
            var dto = new NotificationCreateDto
            {
                JobCardID = jobCardId,
                NotificationType = "DELIVERED"
            };
            return await CreateNotificationAsync(dto, userId, branchId);
        }

        #endregion

        #region Helper Methods

        private async Task<string> GenerateNotificationNumberAsync(int branchId)
        {
            var notNoParam = new SqlParameter("@NotificationNo", System.Data.SqlDbType.NVarChar, 50)
            {
                Direction = System.Data.ParameterDirection.Output
            };

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GenerateNotificationNo @BranchID = {0}, @NotificationNo = @NotificationNo OUTPUT",
                branchId, notNoParam);

            return notNoParam.Value?.ToString() ?? $"NOT-{branchId}-{DateTime.Now:yyyyMM}-0001";
        }

        private async Task AddToQueue(int notificationId)
        {
            var queueItem = new MessageQueue
            {
                NotificationID = notificationId,
                Status = "QUEUED",
                CreatedDate = DateTime.Now
            };

            _context.MessageQueue.Add(queueItem);
            await _context.SaveChangesAsync();
        }

        private string DetermineSendMethod(CustomerPreference? preferences)
        {
            if (preferences == null)
                return "SMS";

            if (preferences.PreferWhatsApp)
                return "WHATSAPP";
            if (preferences.PreferSMS)
                return "SMS";
            if (preferences.PreferEmail)
                return "EMAIL";

            return "SMS";
        }

        
        private string GetRecipient(CustomerPreference? preferences, string method, COA? customer)
        {
            // First check preferences
            if (preferences != null)
            {
                if (method == "SMS" && !string.IsNullOrEmpty(preferences.SMSNumber))
                    return preferences.SMSNumber;
                if (method == "WHATSAPP" && !string.IsNullOrEmpty(preferences.WhatsAppNumber))
                    return preferences.WhatsAppNumber;
                if (method == "EMAIL" && !string.IsNullOrEmpty(preferences.EmailAddress))
                    return preferences.EmailAddress;
            }

            // Fallback to customer data - but COA doesn't have phone/email
            // So we'll use a default placeholder
            if (customer != null)
            {
                // Since COA doesn't have phone/email fields, we'll use customer name as fallback
                // In a real system, you'd have a separate customer details table
                if (method == "SMS" || method == "WHATSAPP")
                {
                    // You can use customer name as a placeholder, but it's not ideal
                    // Better to get from a proper customer contact table
                    return "03001234567"; // Default phone
                }
                if (method == "EMAIL")
                {
                    return $"{customer.AcctName?.Replace(" ", ".").ToLower()}@example.com";
                }
            }

            // Ultimate fallback
            return method == "EMAIL" ? "customer@example.com" : "03001234567";
        }
        private async Task<bool> SimulateSend(CustomerNotification notification)
        {
            // Simulate network delay
            await Task.Delay(100);

            // 90% success rate for simulation
            return new Random().Next(1, 100) <= 90;
        }

        public async Task<string> RenderNotificationContentAsync(string template, Dictionary<string, string> placeholders)
        {
            return await Task.Run(() =>
            {
                string result = template;
                foreach (var ph in placeholders)
                {
                    result = result.Replace("{" + ph.Key + "}", ph.Value);
                }
                return result;
            });
        }

        private NotificationDto MapToDto(CustomerNotification notification)
        {
            // Get customer contact info safely
            string customerPhone = "";
            string customerEmail = "";

            if (notification.Customer != null)
            {
                // COA doesn't have phone/email, so we'll use preferences or leave empty
                // Try to get from preferences if available
                var preferences = _context.CustomerPreferences
                    .FirstOrDefault(p => p.CustomerID == notification.CustomerID);

                if (preferences != null)
                {
                    customerPhone = preferences.SMSNumber ?? "";
                    customerEmail = preferences.EmailAddress ?? "";
                }
            }

            return new NotificationDto
            {
                NotificationID = notification.NotificationID,
                NotificationNo = notification.NotificationNo,
                JobCardID = notification.JobCardID,
                JobCardNo = notification.JobCard?.JobCardNo ?? "",
                VehicleRegNo = notification.JobCard?.Vehicle?.RegistrationNo ?? "",
                CustomerID = notification.CustomerID,
                CustomerName = notification.Customer?.AcctName ?? "",
                CustomerPhone = customerPhone,
                CustomerEmail = customerEmail,
                NotificationType = notification.NotificationType,
                SentDate = notification.SentDate,
                SentVia = notification.SentVia,
                Recipient = notification.SentVia == "EMAIL" ? notification.RecipientEmail : notification.RecipientMobile,
                MessageSubject = notification.MessageSubject,
                MessageContent = notification.MessageContent,
                Status = notification.Status,
                ErrorMessage = notification.ErrorMessage,
                RetryCount = notification.RetryCount
            };
        }
        private NotificationTemplateDto MapToTemplateDto(NotificationTemplate template)
        {
            return new NotificationTemplateDto
            {
                TemplateID = template.TemplateID,
                TemplateCode = template.TemplateCode,
                TemplateName = template.TemplateName,
                NotificationType = template.NotificationType,
                SubjectTemplate = template.SubjectTemplate,
                BodyTemplate = template.BodyTemplate,
                Placeholders = template.Placeholders,
                SentVia = template.SentVia,
                IsActive = template.IsActive,
                BranchID = template.BranchID
            };
        }

        private CustomerPreferenceDto MapToPreferenceDto(CustomerPreference preference)
        {
            return new CustomerPreferenceDto
            {
                PreferenceID = preference.PreferenceID,
                CustomerID = preference.CustomerID,
                CustomerName = preference.Customer?.AcctName ?? "",
                PreferSMS = preference.PreferSMS,
                PreferEmail = preference.PreferEmail,
                PreferWhatsApp = preference.PreferWhatsApp,
                SMSNumber = preference.SMSNumber,
                EmailAddress = preference.EmailAddress,
                WhatsAppNumber = preference.WhatsAppNumber,
                AllowMarketing = preference.AllowMarketing,
                AllowServiceReminders = preference.AllowServiceReminders,
                AllowJobUpdates = preference.AllowJobUpdates,
                Language = preference.Language
            };
        }

        #endregion

        public async Task<int> ProcessPendingNotificationsAsync(int branchId)
        {
            try
            {
                _logger.LogInformation("Processing pending notifications for branch: {BranchId}", branchId);

                // Get pending notifications from queue
                var pendingQueueItems = await _context.MessageQueue
                    .Include(q => q.Notification)
                    .Where(q => q.Status == "QUEUED" && q.Notification!.BranchID == branchId)
                    .Take(50) // Process 50 at a time
                    .ToListAsync();

                if (!pendingQueueItems.Any())
                {
                    _logger.LogInformation("No pending notifications for branch {BranchId}", branchId);
                    return 0;
                }

                int processedCount = 0;

                foreach (var queueItem in pendingQueueItems)
                {
                    try
                    {
                        var notification = queueItem.Notification;
                        if (notification == null) continue;

                        // Update status to PROCESSING
                        queueItem.Status = "PROCESSING";
                        // ❌ Remove this line - ProcessedDate doesn't exist
                        // queueItem.ProcessedDate = DateTime.Now;
                        await _context.SaveChangesAsync();

                        // Simulate sending (or actual sending logic)
                        bool sentSuccessfully = await SimulateSend(notification);

                        if (sentSuccessfully)
                        {
                            notification.Status = "SENT";
                            notification.SentDate = DateTime.Now;
                            queueItem.Status = "COMPLETED";
                            processedCount++;
                        }
                        else
                        {
                            notification.Status = "FAILED";
                            notification.ErrorMessage = "Failed to send";
                            notification.RetryCount++;
                            queueItem.Status = "FAILED";

                            // If retry count less than 3, requeue
                            if (notification.RetryCount < 3)
                            {
                                queueItem.Status = "QUEUED";
                                // ❌ Remove this line
                                // queueItem.ProcessedDate = null;
                            }
                        }

                        await _context.SaveChangesAsync();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error processing queue item {QueueId}", queueItem.QueueID);
                        queueItem.Status = "FAILED";
                        queueItem.ErrorMessage = ex.Message;
                        await _context.SaveChangesAsync();
                    }
                }

                _logger.LogInformation("Processed {ProcessedCount} notifications for branch {BranchId}", processedCount, branchId);
                return processedCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing pending notifications for branch {BranchId}", branchId);
                throw;
            }
        }





        // Other interface methods implementation (can be added similarly)
        public Task<NotificationDto> ResendNotificationAsync(int id, int userId, int branchId) => throw new NotImplementedException();
        public Task<bool> CancelNotificationAsync(int id, int branchId) => throw new NotImplementedException();
        public Task<NotificationStatsDto> GetNotificationStatsAsync(int branchId, DateTime? fromDate = null, DateTime? toDate = null) => throw new NotImplementedException();
        public Task<NotificationDto> SendJobInProgressNotificationAsync(int jobCardId, int userId, int branchId) => throw new NotImplementedException();
        public Task<NotificationDto> SendServiceReminderAsync(int jobCardId, int userId, int branchId) => throw new NotImplementedException();
        public Task<List<NotificationDto>> SendBulkNotificationsAsync(BulkNotificationDto dto, int userId, int branchId) => throw new NotImplementedException();
        //public Task<int> ProcessPendingNotificationsAsync(int branchId) => throw new NotImplementedException();
    }
}