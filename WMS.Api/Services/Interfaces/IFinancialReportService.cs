using WMS.Api.DTOs.COA;

namespace WMS.Api.Services.Interfaces
{
    /// <summary>
    /// Service for generating financial reports
    /// </summary>
    public interface IFinancialReportService
    {
        // ====================================================================
        // TRIAL BALANCE
        // ====================================================================

        /// <summary>
        /// Get Trial Balance report
        /// </summary>
        Task<TrialBalanceResponseDto> GetTrialBalanceAsync(
            int branchId,
            DateTime? asOnDate = null,
            bool includeZeroBalances = false,
            int? level = null);

        /// <summary>
        /// Get Trial Balance with hierarchy (nested)
        /// </summary>
        Task<TrialBalanceHierarchyDto> GetTrialBalanceHierarchyAsync(
            int branchId,
            DateTime? asOnDate = null);

        // ====================================================================
        // PROFIT & LOSS STATEMENT
        // ====================================================================

        /// <summary>
        /// Get Profit & Loss Statement
        /// </summary>
        Task<ProfitLossDto> GetProfitLossAsync(
            int branchId,
            DateTime startDate,
            DateTime endDate,
            bool includeBudget = false);

        /// <summary>
        /// Get Comparative Profit & Loss (multiple periods)
        /// </summary>
        Task<ComparativeProfitLossDto> GetComparativeProfitLossAsync(
            int branchId,
            DateTime currentStartDate,
            DateTime currentEndDate,
            DateTime? previousStartDate = null,
            DateTime? previousEndDate = null);

        // ====================================================================
        // BALANCE SHEET
        // ====================================================================

        /// <summary>
        /// Get Balance Sheet
        /// </summary>
        Task<BalanceSheetDto> GetBalanceSheetAsync(
            int branchId,
            DateTime asOnDate,
            bool includePreviousYear = false);

        /// <summary>
        /// Get Vertical Balance Sheet (percentage format)
        /// </summary>
        Task<VerticalBalanceSheetDto> GetVerticalBalanceSheetAsync(
            int branchId,
            DateTime asOnDate);

        // ====================================================================
        // CASH FLOW STATEMENT
        // ====================================================================

        /// <summary>
        /// Get Cash Flow Statement
        /// </summary>
        Task<CashFlowDto> GetCashFlowStatementAsync(
            int branchId,
            DateTime startDate,
            DateTime endDate);

        // ====================================================================
        // GENERAL LEDGER
        // ====================================================================

        /// <summary>
        /// Get General Ledger for specific account
        /// </summary>
        Task<GeneralLedgerDto> GetGeneralLedgerAsync(
            int branchId,
            int accountId,
            DateTime fromDate,
            DateTime toDate);

        /// <summary>
        /// Get Account Statement (customer/supplier)
        /// </summary>
        Task<AccountStatementDto> GetAccountStatementAsync(
            int branchId,
            int accountId,
            DateTime fromDate,
            DateTime toDate);

        // ====================================================================
        // HELPER METHODS
        // ====================================================================

        /// <summary>
        /// Get closing balances for all accounts
        /// </summary>
        Task<Dictionary<int, decimal>> GetClosingBalancesAsync(
            int branchId,
            DateTime asOnDate);

        /// <summary>
        /// Get period net profit/loss
        /// </summary>
        Task<decimal> GetNetProfitLossAsync(
            int branchId,
            DateTime startDate,
            DateTime endDate);
    }
}