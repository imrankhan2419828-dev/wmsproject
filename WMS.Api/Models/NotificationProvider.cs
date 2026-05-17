using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("NotificationProviders")]
    public class NotificationProvider
    {
        [Key]
        public int ProviderID { get; set; }

        [Required]
        [StringLength(100)]
        public string ProviderName { get; set; } = string.Empty; // TWILIO, INFOBIP, WHATSAPP_BUSINESS, SMTP

        [Required]
        [StringLength(20)]
        public string ProviderType { get; set; } = string.Empty; // SMS, EMAIL, WHATSAPP

        [StringLength(500)]
        public string? ApiKey { get; set; }

        [StringLength(500)]
        public string? ApiSecret { get; set; }

        [StringLength(50)]
        public string? SenderID { get; set; }

        [StringLength(200)]
        public string? SenderEmail { get; set; }

        [StringLength(500)]
        public string? SenderPassword { get; set; }

        [StringLength(200)]
        public string? SMTPServer { get; set; }

        public int? SMTPPort { get; set; }

        public bool UseSSL { get; set; } = true;

        public bool IsActive { get; set; } = true;
        public bool IsDefault { get; set; } = false;

        public int? BranchID { get; set; } // NULL = Global

        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? ModifiedDate { get; set; }
    }
}