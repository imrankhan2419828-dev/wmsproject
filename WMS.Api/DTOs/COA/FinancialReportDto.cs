using WMS.Api.Enums;

namespace WMS.Api.DTOs.COA
{
    // ====================================================================
    // TRIAL BALANCE DTOs
    // ====================================================================

    /// <summary>
    /// Trial Balance Report DTO
    /// </summary>
    public class TrialBalanceDto
    {
        public DateTime AsOnDate { get; set; }
        public int BranchId { get; set; }
        public string BranchName { get; set; } = null!;
        public List<TrialBalanceAccountDto> Accounts { get; set; } = new();
        public TrialBalanceSummaryDto Summary { get; set; } = new();
    }

    // Alias for service compatibility
    public class TrialBalanceResponseDto : TrialBalanceDto { }

    public class TrialBalanceAccountDto
    {
        public int acctID { get; set; }
        public string AcctCode { get; set; } = null!;
        public string AcctName { get; set; } = null!;
        public int Level { get; set; }
        public AccountType AcctType { get; set; }
        public string NormalSide { get; set; } = null!;
        public bool IsControlAccount { get; set; }

        public decimal OpeningBalance { get; set; }
        public decimal OpeningBalanceDr { get; set; }
        public decimal OpeningBalanceCr { get; set; }
        public decimal TotalDebit { get; set; }
        public decimal TotalCredit { get; set; }
        public decimal ClosingBalance { get; set; }
        public decimal ClosingBalanceDr { get; set; }
        public decimal ClosingBalanceCr { get; set; }
        public List<TrialBalanceAccountDto> Children { get; set; } = new();
    }

    public class TrialBalanceSummaryDto
    {
        public decimal TotalOpeningBalanceDr { get; set; }
        public decimal TotalOpeningBalanceCr { get; set; }
        public decimal TotalDebit { get; set; }
        public decimal TotalCredit { get; set; }
        public decimal TotalClosingBalanceDr { get; set; }
        public decimal TotalClosingBalanceCr { get; set; }
        public bool IsBalanced => TotalDebit == TotalCredit && TotalClosingBalanceDr == TotalClosingBalanceCr;
        public string Difference => $"Dr - Cr = {(TotalDebit - TotalCredit):N2}";
    }

    /// <summary>
    /// Trial Balance Hierarchy DTO
    /// </summary>
    public class TrialBalanceHierarchyDto
    {
        public int acctID { get; set; }
        public string AcctCode { get; set; } = null!;
        public string AcctName { get; set; } = null!;
        public int Level { get; set; }
        public string AcctType { get; set; } = null!;
        public string NormalSide { get; set; } = null!;
        public bool IsControlAccount { get; set; }
        public decimal ClosingBalance { get; set; }
        public decimal ClosingBalanceDr { get; set; }
        public decimal ClosingBalanceCr { get; set; }
        public decimal TotalDebit { get; set; }
        public decimal TotalCredit { get; set; }
        public List<TrialBalanceHierarchyDto> Children { get; set; } = new();
    }

    // ====================================================================
    // PROFIT & LOSS DTOs
    // ====================================================================

    public class ProfitLossDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int BranchId { get; set; }
        public string? BranchName { get; set; }
        public List<ProfitLossItemDto> Revenue { get; set; } = new();
        public List<ProfitLossItemDto> Expenses { get; set; } = new();
        public List<ProfitLossItemDto> OtherIncome { get; set; } = new();
        public List<ProfitLossItemDto> OtherExpenses { get; set; } = new();
        public decimal TotalRevenue { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal GrossProfit { get; set; }
        public decimal NetProfit { get; set; }
    }

    public class ProfitLossItemDto
    {
        public int acctID { get; set; }
        public string AcctCode { get; set; } = null!;
        public string AcctName { get; set; } = null!;
        public decimal Amount { get; set; }
        public decimal Percentage { get; set; }
    }

    public class ComparativeProfitLossDto
    {
        public ProfitLossDto CurrentPeriod { get; set; } = new();
        public ProfitLossDto PreviousPeriod { get; set; } = new();
        public ProfitLossVarianceDto Variance { get; set; } = new();
    }

    public class ProfitLossVarianceDto
    {
        public decimal RevenueVariance { get; set; }
        public decimal ExpenseVariance { get; set; }
        public decimal NetProfitVariance { get; set; }
        public decimal NetProfitVariancePercentage { get; set; }
    }

    // ====================================================================
    // BALANCE SHEET DTOs
    // ====================================================================

    public class BalanceSheetDto
    {
        public DateTime AsOnDate { get; set; }
        public int BranchId { get; set; }
        public string? BranchName { get; set; }
        public List<BalanceSheetItemDto> Assets { get; set; } = new();
        public List<BalanceSheetItemDto> Liabilities { get; set; } = new();
        public List<BalanceSheetItemDto> Equity { get; set; } = new();
        public decimal TotalAssets { get; set; }
        public decimal TotalLiabilities { get; set; }
        public decimal TotalEquity { get; set; }
        public decimal Difference { get; set; }
        public bool IsBalanced { get; set; }
    }

    public class BalanceSheetItemDto
    {
        public int acctID { get; set; }
        public string AcctCode { get; set; } = null!;
        public string AcctName { get; set; } = null!;
        public decimal Amount { get; set; }
        public decimal Percentage { get; set; }
    }

    public class VerticalBalanceSheetDto
    {
        public DateTime AsOnDate { get; set; }
        public decimal TotalAssets { get; set; }
        public decimal TotalLiabilities { get; set; }
        public decimal TotalEquity { get; set; }
        public decimal AssetsPercentage { get; set; }
        public decimal LiabilitiesPercentage { get; set; }
        public decimal EquityPercentage { get; set; }
    }

    // ====================================================================
    // CASH FLOW DTO
    // ====================================================================

    public class CashFlowDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal OpeningCashBalance { get; set; }
        public decimal ClosingCashBalance { get; set; }
        public decimal NetCashFlow { get; set; }
        public List<CashFlowItemDto> OperatingActivities { get; set; } = new();
        public List<CashFlowItemDto> InvestingActivities { get; set; } = new();
        public List<CashFlowItemDto> FinancingActivities { get; set; } = new();
    }

    public class CashFlowItemDto
    {
        public string Description { get; set; } = null!;
        public decimal Amount { get; set; }
    }

    // ====================================================================
    // GENERAL LEDGER DTOs
    // ====================================================================

    public class GeneralLedgerDto
    {
        public int AccountId { get; set; }
        public string AccountCode { get; set; } = null!;
        public string AccountName { get; set; } = null!;
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public decimal OpeningBalance { get; set; }
        public decimal ClosingBalance { get; set; }
        public List<LedgerTransactionDto> Transactions { get; set; } = new();
    }

    public class LedgerTransactionDto
    {
        public DateTime Date { get; set; }
        public string VoucherNo { get; set; } = null!;
        public string VoucherType { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
        public decimal Balance { get; set; }
    }

    public class AccountStatementDto
    {
        public int AccountId { get; set; }
        public string AccountCode { get; set; } = null!;
        public string AccountName { get; set; } = null!;
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public decimal OpeningBalance { get; set; }
        public decimal ClosingBalance { get; set; }
        public List<LedgerTransactionDto> Transactions { get; set; } = new();
    }
}