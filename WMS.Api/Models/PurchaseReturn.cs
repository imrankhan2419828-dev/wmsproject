using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("PurchaseReturn")]
    public class PurchaseReturn
    {
        [Key]
        public int ReturnID { get; set; }

        public int BranchID { get; set; }

        public DateTime TranDate { get; set; } = DateTime.Now;

        public int SuppID { get; set; }

        public int PurchaseTranNumb { get; set; }

        [MaxLength(50)]
        public string? BillNumb { get; set; }

        // 🔥 NEW: Return Reference Number (Supplier Return Ref)
        [MaxLength(100)]
        public string? ReturnRefNumb { get; set; }

        [MaxLength(500)]
        public string? TranDesc { get; set; }

        public int AddBy { get; set; }

        public DateTime AddOn { get; set; } = DateTime.Now;

        // Navigation
        [ForeignKey("SuppID")]
        public virtual COA? Supplier { get; set; }

        public virtual ICollection<PurchaseReturnItem> Items { get; set; } = new List<PurchaseReturnItem>();
    }
}