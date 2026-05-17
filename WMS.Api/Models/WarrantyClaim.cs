using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("WarrantyClaims")]
    public class WarrantyClaim
    {
        [Key]
        public int ClaimID { get; set; }

        [Required]
        [StringLength(50)]
        public string ClaimNo { get; set; } = string.Empty;

        [Required]
        public int JobCardID { get; set; }

        public DateTime ClaimDate { get; set; } = DateTime.Now;

        [Required]
        [StringLength(50)]
        public string ClaimType { get; set; } = string.Empty; // LABOUR, PARTS, BOTH

        public int? JobServiceID { get; set; }
        public int? JobPartID { get; set; }
        public int? ItemID { get; set; }
        public int? SupplierID { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? ClaimAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? ApprovedAmount { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "OPEN"; // OPEN, SUBMITTED, APPROVED, REJECTED, PAID, CLOSED

        public DateTime? SubmittedDate { get; set; }
        public DateTime? ApprovedDate { get; set; }

        [StringLength(500)]
        public string? RejectionReason { get; set; }

        [StringLength(1000)]
        public string? ResolutionNotes { get; set; }

        [StringLength(500)]
        public string? DocumentPath { get; set; }

        [StringLength(20)]
        public string Priority { get; set; } = "NORMAL"; // NORMAL, HIGH, URGENT

        public int? WarrantyPeriod { get; set; } // Days
        public DateTime? WarrantyExpiryDate { get; set; }

        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }

        [Required]
        public int BranchID { get; set; }

        // Navigation Properties
        [ForeignKey("JobCardID")]
        public virtual JobCard? JobCard { get; set; }

        [ForeignKey("JobServiceID")]
        public virtual JobService? JobService { get; set; }

        [ForeignKey("JobPartID")]
        public virtual JobPart? JobPart { get; set; }

        [ForeignKey("ItemID")]
        public virtual ItemFile? Item { get; set; }

        [ForeignKey("SupplierID")]
        public virtual COA? Supplier { get; set; }

        [ForeignKey("BranchID")]
        public virtual Branch? Branch { get; set; }

        public virtual ICollection<WarrantyAttachment>? Attachments { get; set; }
        public virtual ICollection<WarrantyHistory>? History { get; set; }
    }
}