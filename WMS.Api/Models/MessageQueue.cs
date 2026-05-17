using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("MessageQueue")]
    public class MessageQueue
    {
        [Key]
        public int QueueID { get; set; }

        [Required]
        public int NotificationID { get; set; }

        public int Priority { get; set; } = 0; // 0 = Normal, 1 = High

        [StringLength(20)]
        public string Status { get; set; } = "QUEUED"; // QUEUED, PROCESSING, SENT, FAILED

        public int Attempts { get; set; } = 0;

        public DateTime? LastAttempt { get; set; }
        public DateTime? NextAttempt { get; set; }

        [StringLength(500)]
        public string? ErrorMessage { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        // Navigation Property
        [ForeignKey("NotificationID")]
        public virtual CustomerNotification? Notification { get; set; }
    }
}