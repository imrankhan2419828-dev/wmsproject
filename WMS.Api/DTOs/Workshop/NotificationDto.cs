using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.Workshop
{
    public class NotificationDto
    {
        public int NotificationID { get; set; }
        public string NotificationNo { get; set; } = string.Empty;
        public int JobCardID { get; set; }
        public string JobCardNo { get; set; } = string.Empty;
        public string VehicleRegNo { get; set; } = string.Empty;
        public int CustomerID { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string NotificationType { get; set; } = string.Empty;
        public DateTime SentDate { get; set; }
        public string SentVia { get; set; } = string.Empty;
        public string? Recipient { get; set; }
        public string? MessageSubject { get; set; }
        public string MessageContent { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? ErrorMessage { get; set; }
        public int RetryCount { get; set; }
    }

    public class NotificationCreateDto
    {
        [Required]
        public int JobCardID { get; set; }

        [Required]
        public string NotificationType { get; set; } = string.Empty;

        public string? SentVia { get; set; } // If null, use customer preferences

        public DateTime? ScheduledDate { get; set; }

        public string? CustomMessage { get; set; }
    }

    public class NotificationTemplateDto
    {
        public int TemplateID { get; set; }
        public string TemplateCode { get; set; } = string.Empty;
        public string TemplateName { get; set; } = string.Empty;
        public string NotificationType { get; set; } = string.Empty;
        public string? SubjectTemplate { get; set; }
        public string BodyTemplate { get; set; } = string.Empty;
        public string? Placeholders { get; set; }
        public string SentVia { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int? BranchID { get; set; }
    }

    public class NotificationTemplateCreateDto
    {
        [Required]
        public string TemplateCode { get; set; } = string.Empty;

        [Required]
        public string TemplateName { get; set; } = string.Empty;

        [Required]
        public string NotificationType { get; set; } = string.Empty;

        public string? SubjectTemplate { get; set; }

        [Required]
        public string BodyTemplate { get; set; } = string.Empty;

        public string? Placeholders { get; set; }

        public string SentVia { get; set; } = "BOTH";

        public bool IsActive { get; set; } = true;
    }

    public class NotificationTemplateUpdateDto : NotificationTemplateCreateDto
    {
        [Required]
        public int TemplateID { get; set; }
    }

    public class CustomerPreferenceDto
    {
        public int PreferenceID { get; set; }
        public int CustomerID { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public bool PreferSMS { get; set; }
        public bool PreferEmail { get; set; }
        public bool PreferWhatsApp { get; set; }
        public string? SMSNumber { get; set; }
        public string? EmailAddress { get; set; }
        public string? WhatsAppNumber { get; set; }
        public bool AllowMarketing { get; set; }
        public bool AllowServiceReminders { get; set; }
        public bool AllowJobUpdates { get; set; }
        public string Language { get; set; } = "EN";
    }

    public class CustomerPreferenceUpdateDto
    {
        [Required]
        public int CustomerID { get; set; }

        public bool PreferSMS { get; set; } = true;
        public bool PreferEmail { get; set; } = true;
        public bool PreferWhatsApp { get; set; } = false;

        public string? SMSNumber { get; set; }
        public string? EmailAddress { get; set; }
        public string? WhatsAppNumber { get; set; }

        public bool AllowMarketing { get; set; } = false;
        public bool AllowServiceReminders { get; set; } = true;
        public bool AllowJobUpdates { get; set; } = true;

        public string Language { get; set; } = "EN";
    }

    public class BulkNotificationDto
    {
        [Required]
        public List<int> JobCardIDs { get; set; } = new();

        [Required]
        public string NotificationType { get; set; } = string.Empty;

        public string? SentVia { get; set; }

        public DateTime? ScheduledDate { get; set; }
    }

    public class NotificationStatsDto
    {
        public int TotalSent { get; set; }
        public int Pending { get; set; }
        public int Failed { get; set; }
        public int Delivered { get; set; }
        public int Read { get; set; }
        public Dictionary<string, int> ByType { get; set; } = new();
        public Dictionary<string, int> ByChannel { get; set; } = new();
    }
}