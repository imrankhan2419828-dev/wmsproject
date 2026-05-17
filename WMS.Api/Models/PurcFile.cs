using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("PurcFile")]
    public class PurcFile
    {
        [Key]
        public int TranNumb { get; set; }

        public DateTime? TranDate { get; set; }

        // Purchase Type: Cash, Credit, Cheque
        [MaxLength(20)]
        public string? TranType { get; set; }

        // Purchase Mode: Walk-in, Order, etc.
        [MaxLength(20)]
        public string? TranMode { get; set; }

        // Supplier ID (from COA)
        public int? SuppID { get; set; }

        // 🔥 NEW: Purchase Reference Number (Supplier Bill No)
        [MaxLength(100)]
        public string? RefrNumb { get; set; }

        // 🔥 NEW: Is Walking Customer (No supplier)
        public bool? IsWalkingCustomer { get; set; }

        // Bill Number (Auto-generated)
        [MaxLength(50)]
        public string? BillNumb { get; set; }

        // Description
        [MaxLength(1000)]
        public string? TranDesc { get; set; }

        // Branch
        public int? BranchID { get; set; }

        // Soft delete
        public bool IsDeleted { get; set; } = false;

        // Quantities and Amounts
        public double? TotlQnty { get; set; }
        public double? TotlAmnt { get; set; }
        public double? NetAmnt { get; set; }
        public int? GodnID { get; set; }

        // Audit fields
        public DateTime? AddOn { get; set; }
        public int? AddBy { get; set; }
        public DateTime? EditOn { get; set; }
        public int? EditBy { get; set; }
        public DateTime? DeletedOn { get; set; }
        public int? DeletedBy { get; set; }

        // Navigation property
        [ForeignKey("SuppID")]
        public virtual COA? Supplier { get; set; }
    }
}