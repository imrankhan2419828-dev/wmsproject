//using WMS.Api.Enums;

//namespace WMS.Api.DTOs.COA
//{
//    /// <summary>
//    /// DTO for returning account data
//    /// </summary>
//    public class COADto
//    {
//        public int acctID { get; set; }
//        public string AcctCode { get; set; } = null!;
//        public string AcctName { get; set; } = null!;
//        public string? PrntCode { get; set; }
//        public AccountType AcctType { get; set; }
//        public AccountCategory? CategoryCode { get; set; }
//        public int Level { get; set; }
//        public string? NormalSide { get; set; }
//        public bool AcctLast { get; set; }
//        public bool IsControlAccount { get; set; }
//        public int? ControlAccountId { get; set; }
//        public decimal? OpenAmnt { get; set; }
//        public bool? Active { get; set; }
//        public bool? LockAcct { get; set; }
//        public string? ReportGroup { get; set; }

//        // For tree structure
//        public List<COADto> Children { get; set; } = new();

//        // Additional properties for display
//        public string DisplayName => $"{AcctCode} - {AcctName}";
//        public string AccountTypeDisplay => AcctType.GetDisplayName();
//        public bool CanPost => AcctLast && (Active ?? false) && !(LockAcct ?? false);
//    }
//}

namespace WMS.Api.DTOs.COA
{
    public class COADto
    {
        public int acctID { get; set; }
        public string AcctCode { get; set; } = null!;
        public string AcctName { get; set; } = null!;
        public string? PrntCode { get; set; }
        public string AcctType { get; set; } = null!;
        public string? NormalSide { get; set; }
        public int Level { get; set; }
        public bool AcctLast { get; set; }
        public bool IsControlAccount { get; set; }
        public int? ControlAccountId { get; set; }
        public decimal? OpenAmnt { get; set; }
        public bool? Active { get; set; }
        public bool? LockAcct { get; set; }
        public string? ReportGroup { get; set; }
        public string? AccountCategory { get; set; }
        public string? Path { get; set; }

        // For tree structure
        public List<COADto> Children { get; set; } = new();

        // Computed properties
        public string DisplayName => $"{AcctCode} - {AcctName}";
        public string Icon => GetIcon();
        public string ColorClass => GetColorClass();
        public bool CanPost => AcctLast && (Active ?? false) && !(LockAcct ?? false);

        private string GetIcon()
        {
            if (!IsControlAccount && AcctLast) return "📄";
            if (AccountCategory == "Customer") return "👤";
            if (AccountCategory == "Supplier") return "🏭";
            if (AccountCategory == "Bank") return "🏦";
            if (AccountCategory == "Expense") return "💰";
            return "📁";
        }

        private string GetColorClass()
        {
            return AcctType switch
            {
                "Asset" => "coa-asset",
                "Liability" => "coa-liability",
                "Equity" => "coa-equity",
                "Revenue" => "coa-revenue",
                "Expense" => "coa-expense",
                _ => "coa-default"
            };
        }
    }
}