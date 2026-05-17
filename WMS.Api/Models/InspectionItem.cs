using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("InspectionItems")]
    public class InspectionItem
    {
        [Key]
        public int ItemID { get; set; }

        [Required]
        public int TemplateID { get; set; }

        [Required]
        [StringLength(50)]
        public string ItemCode { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string ItemName { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [StringLength(50)]
        public string ItemType { get; set; } = "CHECKBOX"; // CHECKBOX, TEXT, NUMBER, RANGE, YES_NO

        [StringLength(100)]
        public string? ExpectedValue { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? MinValue { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? MaxValue { get; set; }

        [StringLength(20)]
        public string? Unit { get; set; }

        public bool IsCritical { get; set; } = false;
        public int DisplayOrder { get; set; } = 0;
        public bool RequiresPhoto { get; set; } = false;
        public bool RequiresRemarks { get; set; } = false;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        // Navigation Properties
        [ForeignKey("TemplateID")]
        public virtual InspectionTemplate? Template { get; set; }

        public virtual ICollection<InspectionResult>? Results { get; set; }
    }
}