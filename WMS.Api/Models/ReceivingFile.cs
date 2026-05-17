using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("ReceivingFile")]
    public class ReceivingFile
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime ReceiveDate { get; set; }

        [Required]
        public int BranchId { get; set; }

        [Required]
        public int UserId { get; set; }
        // 🔥 NEW: Party ID (Customer/Bank Account ID)
        public int? PartyId { get; set; }

        // 🔥 NEW: Party Name (Customer/Bank Name)
        [StringLength(200)]
        public string? PartyName { get; set; }

        // 🔥 NEW: Party Type (CUSTOMER, BANK, OTHER)
        [StringLength(50)]
        public string? PartyType { get; set; }
        [Required]
        public int AccountId { get; set; }

        // 🔥 NEW PROPERTIES
        [StringLength(50)]
        public string? VoucherNumb { get; set; }

        [StringLength(200)]
        public string? WalkingCustomer { get; set; }

        [StringLength(100)]
        public string? ReceiptRefNumb { get; set; }

        public decimal TotalCash { get; set; }
        public decimal TotalCheque { get; set; }
        public decimal TotalAmount { get; set; }

        public string? Remarks { get; set; }

        [ForeignKey("AccountId")]
        public COA? Account { get; set; }

        // Navigation properties
        public ICollection<ReceivingCash> CashList { get; set; } = new List<ReceivingCash>();
        public ICollection<ReceivingCheque> ChequeList { get; set; } = new List<ReceivingCheque>();
    }
}