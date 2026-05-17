using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("SaleReturnFile")]
    public class SaleReturnFile
    {
        [Key]
        public int ReturnTranNumb { get; set; }

        public int SaleTranNumb { get; set; }

        public DateTime? TranDate { get; set; }

        [MaxLength(20)]
        public string? TranType { get; set; } = "SALERETURN";

        public int? CustID { get; set; }

        [MaxLength(200)]
        public string? CustName { get; set; }

        // 🔥 NEW: Walking Customer field
        [MaxLength(200)]
        public string? WalkingCustomer { get; set; }

        // 🔥 NEW: Return Reference Number
        [MaxLength(100)]
        public string? ReturnRefNumb { get; set; }

        // 🔥 NEW: Auto-generated Return Bill Number
        [MaxLength(50)]
        public string? BillNumb { get; set; }

        public decimal TotlQnty { get; set; }
        public decimal TotlAmnt { get; set; }

        public int BranchID { get; set; }
        public int AddBy { get; set; }
        public DateTime AddOn { get; set; }
        public bool CancStat { get; set; }

        // Navigation
        [ForeignKey("CustID")]
        public virtual COA? Customer { get; set; }

        public ICollection<SaleReturnItem> Items { get; set; } = new List<SaleReturnItem>();
    }
}