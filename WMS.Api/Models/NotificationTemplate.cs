using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("NotificationTemplates")]
    public class NotificationTemplate
    {
        [Key]
        public int TemplateID { get; set; }

        [Required]
        [StringLength(50)]
        public string TemplateCode { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string TemplateName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string NotificationType { get; set; } = string.Empty;

        [StringLength(200)]
        public string? SubjectTemplate { get; set; }

        [Required]
        public string BodyTemplate { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Placeholders { get; set; }

        [StringLength(20)]
        public string SentVia { get; set; } = "BOTH"; // SMS, EMAIL, WHATSAPP, BOTH

        public bool IsActive { get; set; } = true;

        public int? BranchID { get; set; } // NULL = Global template

        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
    }
}