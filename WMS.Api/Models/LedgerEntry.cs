using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("LedgerEntry")]
    public class LedgerEntry
    {
        [Key]
        public int LedgerID { get; set; }  // Primary Key

        public int BranchID { get; set; }  // Branch reference
        public int? PaymentID { get; set; } // Optional Payment link
        public int? ReceivingID { get; set; }
        [Required]
        public int AccountID { get; set; } // COA Account

        [Required]
        public DateTime EntryDate { get; set; } = DateTime.Now;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Debit { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Credit { get; set; } = 0;

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        public int AddBy { get; set; }

        [Required]
        public DateTime AddOn { get; set; } = DateTime.Now;

        // ===== Navigation Properties =====
        [ForeignKey("PaymentID")]
        public PaymentFile? PaymentFile { get; set; }

        [ForeignKey("BranchID")]
        public Branch? Branch { get; set; }
    }
}
