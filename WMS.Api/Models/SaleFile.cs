using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("SaleFile")]
    public class SaleFile
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TranNumb { get; set; }

        public DateTime? TranDate { get; set; }

        // SALE Type: CASH / CREDIT
        public string? TranType { get; set; }

        // Mode: CASH / CREDIT
        public string? TranMode { get; set; }

        // Auto-generated Invoice Number
        [MaxLength(50)]
        public string? BillNumb { get; set; }

        // Customer ID (from COA - Accounts Receivable)
        public int? CustID { get; set; }

        // 🔥 NEW: Walking Customer text field (for cash sales without customer)
        [MaxLength(200)]
        public string? WalkingCustomer { get; set; }

        // For backward compatibility
        public string? CustName { get; set; }

        [MaxLength(500)]
        public string? TranDesc { get; set; }

        public int? TotlQnty { get; set; }
        public decimal? TotlAmnt { get; set; }
        public int? GodnID { get; set; }
        public int? BranchID { get; set; }

        public int? AddBy { get; set; }
        public DateTime? AddOn { get; set; }

        public bool? CancStat { get; set; }

        // Navigation
        public virtual ICollection<SaleFild> SaleFilds { get; set; } = new List<SaleFild>();

        // Navigation to Customer
        [ForeignKey("CustID")]
        public virtual COA? Customer { get; set; }
    }
}