using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("PostdatedChequeFile")]
    public class PostdatedCheque
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string ChequeNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string BankName { get; set; } = string.Empty;

        [Required]
        public DateTime ChequeDate { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        // Source Information
        [Required]
        [StringLength(20)]
        public string SourceType { get; set; } = string.Empty; // CUSTOMER, SUPPLIER, BANK

        [Required]
        public int SourceId { get; set; } // CustomerID / SupplierID / AccountID

        // Reference Information (Optional)
        [StringLength(20)]
        public string? ReferenceType { get; set; } // RECEIVING, PAYMENT, MANUAL

        public int? ReferenceId { get; set; } // ReceivingId / PaymentId

        // Status
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "PENDING"; // PENDING, DEPOSITED, CLEARED, BOUNCED, CANCELLED

        // Dates
        public DateTime? DepositDate { get; set; }
        public DateTime? ClearDate { get; set; }
        public DateTime? BounceDate { get; set; }

        [StringLength(500)]
        public string? BounceReason { get; set; }

        // Audit
        [Required]
        public int BranchId { get; set; }

        [Required]
        public int CreatedBy { get; set; }

        [Required]
        public DateTime CreatedOn { get; set; } = DateTime.Now;

        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedOn { get; set; }

        // Ledger Reference
        public int? LedgerEntryId { get; set; }

        // Navigation Properties
        [ForeignKey("BranchId")]
        public Branch? Branch { get; set; }

        public ICollection<PostdatedChequeLog> Logs { get; set; } = new List<PostdatedChequeLog>();
    }
}
