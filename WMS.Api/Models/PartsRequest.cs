using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("PartsRequest")]
    public class PartsRequest
    {
        [Key]
        public int RequestID { get; set; }

        [Required]
        [StringLength(50)]
        public string RequestNo { get; set; } = string.Empty;

        [Required]
        public int JobCardID { get; set; }

        [Required]
        public int ItemID { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? ApprovedQuantity { get; set; }

        public DateTime RequestDate { get; set; } = DateTime.Now;

        public DateTime? RequiredDate { get; set; }
        public DateTime? ExpectedDate { get; set; }
        public DateTime? ReceivedDate { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "PENDING";

        public int? SupplierID { get; set; }

        [StringLength(200)]
        public string? SupplierName { get; set; }

        public int? PurchaseOrderID { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? EstimatedCost { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? ActualCost { get; set; }

        [StringLength(20)]
        public string Urgency { get; set; } = "NORMAL";

        [StringLength(500)]
        public string? Notes { get; set; }

        public int? RequestedBy { get; set; }
        public int? ApprovedBy { get; set; }

        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }

        public bool IsDeleted { get; set; } = false;
        public int BranchID { get; set; }

        // Navigation Properties
        [ForeignKey("JobCardID")]
        public virtual JobCard? JobCard { get; set; }

        [ForeignKey("ItemID")]
        public virtual ItemFile? Item { get; set; }

        [ForeignKey("SupplierID")]
        public virtual COA? Supplier { get; set; }

        [ForeignKey("BranchID")]
        public virtual Branch? Branch { get; set; }
    }
}