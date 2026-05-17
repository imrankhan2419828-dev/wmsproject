using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("PaymentFile")]
    public class PaymentFile
    {
        [Key]
        public int PaymentID { get; set; }

        [Required]
        public int BranchID { get; set; }

        [Required]
        public DateTime PaymentDate { get; set; }

        [Required, StringLength(50)]
        public string PaymentType { get; set; } = string.Empty;

        [Required]
        public int ReferenceID { get; set; }
        public string? ReferenceName { get; set; }

        // 🔥 NEW: Walking Party
        [StringLength(200)]
        public string? WalkingParty { get; set; }

        // 🔥 NEW: Payment Reference Number
        [StringLength(100)]
        public string? PaymentRefNumb { get; set; }

        // 🔥 NEW: Voucher Number (Auto-generated)
        [StringLength(50)]
        public string? VoucherNumb { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required, StringLength(50)]
        public string PaymentMode { get; set; } = string.Empty;

        public string? ChequeNo { get; set; }
        public string? Description { get; set; }

        [Required]
        public int AddBy { get; set; }

        [Required]
        public DateTime AddOn { get; set; } = DateTime.Now;

        public bool? CancStat { get; set; }

        // Navigation
        public ICollection<PaymentItem>? PaymentItems { get; set; }
        public ICollection<LedgerEntry>? LedgerEntries { get; set; }
    }
}