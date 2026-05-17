using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("InspectionTemplates")]
    public class InspectionTemplate
    {
        [Key]
        public int TemplateID { get; set; }

        [Required]
        [StringLength(50)]
        public string TemplateCode { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string TemplateName { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Category { get; set; } // PRE_JOB, POST_JOB, PERIODIC, SAFETY

        [StringLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }

        [Required]
        public int BranchID { get; set; }

        // Navigation Properties
        [ForeignKey("BranchID")]
        public virtual Branch? Branch { get; set; }

        public virtual ICollection<InspectionItem>? Items { get; set; }
        public virtual ICollection<JobInspection>? JobInspections { get; set; }
    }
}
