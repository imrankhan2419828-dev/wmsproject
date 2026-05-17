using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("CustomerNotifications")]
    public class CustomerNotification
    {
        [Key]
        public int NotificationID { get; set; }

        [Required]
        [StringLength(50)]
        public string NotificationNo { get; set; } = string.Empty;

        [Required]
        public int JobCardID { get; set; }

        [Required]
        public int CustomerID { get; set; }

        [Required]
        [StringLength(50)]
        public string NotificationType { get; set; } = string.Empty; // JOB_CREATED, IN_PROGRESS, READY, etc.

        public DateTime SentDate { get; set; } = DateTime.Now;

        [Required]
        [StringLength(20)]
        public string SentVia { get; set; } = string.Empty; // SMS, EMAIL, WHATSAPP, PUSH

        [StringLength(50)]
        public string? RecipientMobile { get; set; }

        [StringLength(200)]
        public string? RecipientEmail { get; set; }

        [StringLength(500)]
        public string? RecipientDeviceToken { get; set; }

        [StringLength(200)]
        public string? MessageSubject { get; set; }

        [Required]
        [StringLength(1000)]
        public string MessageContent { get; set; } = string.Empty;

        [StringLength(20)]
        public string Status { get; set; } = "PENDING"; // PENDING, SENT, DELIVERED, READ, FAILED

        [StringLength(500)]
        public string? ErrorMessage { get; set; }

        public string? ProviderResponse { get; set; }

        public int RetryCount { get; set; } = 0;

        public DateTime? ScheduledDate { get; set; }

        public int? SentBy { get; set; }

        [Required]
        public int BranchID { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        // Navigation Properties
        [ForeignKey("JobCardID")]
        public virtual JobCard? JobCard { get; set; }

        [ForeignKey("CustomerID")]
        public virtual COA? Customer { get; set; }

        [ForeignKey("BranchID")]
        public virtual Branch? Branch { get; set; }
    }
}