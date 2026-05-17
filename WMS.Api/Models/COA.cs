//using System.ComponentModel.DataAnnotations;
//using System.ComponentModel.DataAnnotations.Schema;

//namespace WMS.Api.Models
//{
//    [Table("tblCOA")]
//    public class COA
//    {
//        [Key]
//        public int acctID { get; set; }

//        // ====================================================================
//        // EXISTING PROPERTIES (Keep as is)
//        // ====================================================================
//        public string? PrntCode { get; set; }
//        public string? AcctCode { get; set; }
//        public string? AcctName { get; set; }
//        public bool? AcctLast { get; set; }
//        public string? AcctType { get; set; }
//        public DateTime? OpenDate { get; set; }
//        public decimal? OpenAmnt { get; set; }
//        public string? AcctDesc { get; set; }
//        public bool? AcctDebt { get; set; }
//        public bool? Active { get; set; }
//        public float? CrdtLimt { get; set; }
//        public bool? LockAcct { get; set; }
//        public int? BranchID { get; set; }
//        public string? AddBy { get; set; }
//        public DateTime? AddOn { get; set; }
//        public string? EditBy { get; set; }
//        public DateTime? EditOn { get; set; }
//        public int? GodnID { get; set; }
//        public int? PriceGroupID { get; set; }
//        public int? CustTypeID { get; set; }
//        public string? NTNNo { get; set; }
//        public string? STRNo { get; set; }
//        public int? Org_FileID { get; set; }
//        public bool? StopSale { get; set; }
//        public string? StopReas { get; set; }
//        public bool? ParkEntries { get; set; }
//        public bool? IsBranchAC { get; set; }

//        // ====================================================================
//        // NEW PROPERTIES - Phase 0 (Add these)
//        // ====================================================================

//        /// <summary>
//        /// Account Category Code (e.g., 1100 for Current Assets)
//        /// </summary>
//        public int? CategoryCode { get; set; }

//        /// <summary>
//        /// Account Hierarchy Level (0=Root, 1=Major, 2=Sub, 3=Control, 4=Leaf)
//        /// </summary>
//        public int? Level { get; set; }

//        /// <summary>
//        /// Normal Balance Side (Dr = Debit, Cr = Credit)
//        /// </summary>
//        public string? NormalSide { get; set; }

//        /// <summary>
//        /// Is this a Control Account (Parent account that aggregates children)
//        /// </summary>
//        public bool? IsControlAccount { get; set; }

//        /// <summary>
//        /// Link to Control Account (for detail accounts)
//        /// </summary>
//        public int? ControlAccountId { get; set; }

//        /// <summary>
//        /// Report Group (BS, PL, TB, CASHFLOW)
//        /// </summary>
//        public string? ReportGroup { get; set; }

//        /// <summary>
//        /// Minimum Level Allowed (For range control)
//        /// </summary>
//        public int? MinLevel { get; set; }

//        /// <summary>
//        /// Maximum Level Allowed (For range control)
//        /// </summary>
//        public int? MaxLevel { get; set; }

//        /// <summary>
//        /// Is System Account (Cannot be deleted/modified)
//        /// </summary>
//        public bool? IsSystem { get; set; }

//        // ====================================================================
//        // COMPUTED PROPERTIES (Helper)
//        // ====================================================================

//        [NotMapped]
//        public bool CanPost => (AcctLast ?? false) && (Active ?? false) && !(LockAcct ?? false);

//        [NotMapped]
//        public string DisplayName => $"{AcctCode} - {AcctName}";
//    }
//}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("tblCOA")]
    public class COA
    {
        [Key]
        public int acctID { get; set; }

        // Core fields
        public string? PrntCode { get; set; }
        public string? AcctCode { get; set; }
        public string? AcctName { get; set; }
        public bool? AcctLast { get; set; }
        public string? AcctType { get; set; }  // Asset, Liability, Equity, Revenue, Expense
        public string? NormalSide { get; set; }  // Dr, Cr

        // Hierarchy fields
        public int? Level { get; set; }
        public bool? IsControlAccount { get; set; }
        public int? ControlAccountId { get; set; }
        public string? Path { get; set; }
        public int? SortOrder { get; set; }

        // Category for leaf accounts
        public string? AccountCategory { get; set; }  // Customer, Supplier, Bank, Expense, Other

        // Financial fields
        public DateTime? OpenDate { get; set; }
        public decimal? OpenAmnt { get; set; }
        public string? AcctDesc { get; set; }

        // Status fields
        public bool? Active { get; set; }
        public bool? LockAcct { get; set; }
        public bool? IsSystem { get; set; }
        public bool? OriginalSystem { get; set; }  // True for migrated data

        // Report grouping
        public string? ReportGroup { get; set; }  // BS, PL, TB

        // Branch and audit
        public int? BranchID { get; set; }
        public string? AddBy { get; set; }
        public DateTime? AddOn { get; set; }
        public string? EditBy { get; set; }
        public DateTime? EditOn { get; set; }

        // Legacy fields (keep for compatibility)
        public bool? AcctDebt { get; set; }
        public float? CrdtLimt { get; set; }
        public int? GodnID { get; set; }
        public int? PriceGroupID { get; set; }
        public int? CustTypeID { get; set; }
        public string? NTNNo { get; set; }
        public string? STRNo { get; set; }
        public int? Org_FileID { get; set; }
        public bool? StopSale { get; set; }
        public string? StopReas { get; set; }
        public bool? ParkEntries { get; set; }
        public bool? IsBranchAC { get; set; }
        public int? CategoryCode { get; set; }
        public int? MinLevel { get; set; }
        public int? MaxLevel { get; set; }

        // Navigation property
        [ForeignKey("ControlAccountId")]
        public virtual COA? ControlAccount { get; set; }

        [NotMapped]
        public bool CanPost => (AcctLast ?? false) && (Active ?? false) && !(LockAcct ?? false);

        [NotMapped]
        public string DisplayName => $"{AcctCode} - {AcctName}";
    }
}