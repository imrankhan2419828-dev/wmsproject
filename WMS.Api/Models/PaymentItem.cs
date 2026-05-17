using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("PaymentItem")]
    public class PaymentItem
    {
        [Key]
        public int PaymentItemID { get; set; }  // Primary Key

        [Required]
        public int PaymentID { get; set; }

        public int? BillID { get; set; }  // PurchaseTranNumb / ExpenseID / NULL
        public int? ItemID { get; set; }  // Optional

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public string? Description { get; set; }

        // ===== Navigation =====
        [ForeignKey("PaymentID")]
        public PaymentFile? PaymentFile { get; set; }
    }
}
