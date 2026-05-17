//using WMS.Api.Enums;

//namespace WMS.Api.DTOs.COA
//{
//    /// <summary>
//    /// Trial Balance Report DTO
//    /// </summary>
//    public class TrialBalanceDto
//    {
//        public DateTime AsOnDate { get; set; }
//        public int BranchId { get; set; }
//        public string BranchName { get; set; } = null!;
//        public List<TrialBalanceAccountDto> Accounts { get; set; } = new();
//        public TrialBalanceSummaryDto Summary { get; set; } = new();
//    }

//    public class TrialBalanceAccountDto
//    {
//        public int acctID { get; set; }
//        public string AcctCode { get; set; } = null!;
//        public string AcctName { get; set; } = null!;
//        public int Level { get; set; }
//        public AccountType AcctType { get; set; }
//        public string NormalSide { get; set; } = null!;
//        public bool IsControlAccount { get; set; }

//        // Balances
//        public decimal OpeningBalance { get; set; }
//        public decimal OpeningBalanceDr => NormalSide == "Dr" && OpeningBalance > 0 ? OpeningBalance : 0;
//        public decimal OpeningBalanceCr => NormalSide == "Cr" && OpeningBalance > 0 ? OpeningBalance : 0;

//        public decimal TotalDebit { get; set; }
//        public decimal TotalCredit { get; set; }

//        public decimal ClosingBalance { get; set; }
//        public decimal ClosingBalanceDr => NormalSide == "Dr" && ClosingBalance > 0 ? ClosingBalance : 0;
//        public decimal ClosingBalanceCr => NormalSide == "Cr" && ClosingBalance > 0 ? ClosingBalance : 0;

//        // For hierarchy
//        public List<TrialBalanceAccountDto> Children { get; set; } = new();
//    }

//    public class TrialBalanceSummaryDto
//    {
//        public decimal TotalOpeningBalanceDr { get; set; }
//        public decimal TotalOpeningBalanceCr { get; set; }
//        public decimal TotalDebit { get; set; }
//        public decimal TotalCredit { get; set; }
//        public decimal TotalClosingBalanceDr { get; set; }
//        public decimal TotalClosingBalanceCr { get; set; }

//        public bool IsBalanced =>
//            TotalDebit == TotalCredit &&
//            TotalClosingBalanceDr == TotalClosingBalanceCr;

//        public string Difference => $"Dr - Cr = {(TotalDebit - TotalCredit):N2}";
//    }
//}
