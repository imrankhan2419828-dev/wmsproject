using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("JobCards")]
    public class JobCard
    {
        [Key]
        public int JobCardID { get; set; }

        [Required]
        [StringLength(50)]
        public string JobCardNo { get; set; } = string.Empty;

        [Required]
        public int VehicleID { get; set; }

        // ✅ Make CustomerID nullable - auto from vehicle
        public int? CustomerID { get; set; }

        [Required]
        public int BranchID { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "PENDING";

        // ✅ Add ServiceAdvisorName for text field
        [StringLength(200)]
        public string? ServiceAdvisorName { get; set; }

        public int? ServiceAdvisorID { get; set; }
        public int? TechnicianID { get; set; }

        public DateTime ReceivedDate { get; set; }
        public DateTime? PromisedDate { get; set; }
        public DateTime? StartedDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public DateTime? DeliveredDate { get; set; }
        public DateTime? CancelledDate { get; set; }

        public string? CustomerComplaint { get; set; }
        public string? TechnicianFindings { get; set; }
        public string? Recommendations { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalLabor { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalParts { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal GrandTotal { get; set; } = 0;

        public int? InvoiceNumber { get; set; }

        public bool InActive { get; set; } = false;
        public bool IsDeleted { get; set; } = false;

        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }

        // Navigation Properties
        [ForeignKey("VehicleID")]
        public virtual Vehicle? Vehicle { get; set; }

        [ForeignKey("CustomerID")]
        public virtual COA? Customer { get; set; }

        [ForeignKey("BranchID")]
        public virtual Branch? Branch { get; set; }

        [ForeignKey("ServiceAdvisorID")]
        public virtual SystemUser? ServiceAdvisor { get; set; }

        [ForeignKey("TechnicianID")]
        public virtual Technician? Technician { get; set; }

        public virtual ICollection<JobService>? Services { get; set; }
        public virtual ICollection<JobPart>? Parts { get; set; }
        public virtual ICollection<JobInspectionImage>? InspectionImages { get; set; }
    }
}