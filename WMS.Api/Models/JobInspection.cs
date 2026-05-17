using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("JobInspections")]
    public class JobInspection
    {
        [Key]
        public int InspectionID { get; set; }

        [Required]
        public int JobCardID { get; set; }

        [Required]
        public int TemplateID { get; set; }

        [Required]
        [StringLength(50)]
        public string InspectionNo { get; set; } = string.Empty;

        public DateTime InspectionDate { get; set; } = DateTime.Now;

        public int? InspectedBy { get; set; } // TechnicianID

        [StringLength(20)]
        public string Status { get; set; } = "PENDING"; // PENDING, IN_PROGRESS, COMPLETED, PASSED, FAILED

        [StringLength(1000)]
        public string? OverallNotes { get; set; }

        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }

        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }

        [Required]
        public int BranchID { get; set; }

        // Navigation Properties
        [ForeignKey("JobCardID")]
        public virtual JobCard? JobCard { get; set; }

        [ForeignKey("TemplateID")]
        public virtual InspectionTemplate? Template { get; set; }

        [ForeignKey("BranchID")]
        public virtual Branch? Branch { get; set; }

        public virtual ICollection<InspectionResult>? Results { get; set; }
        public virtual ICollection<InspectionPhoto>? Photos { get; set; }
    }
}