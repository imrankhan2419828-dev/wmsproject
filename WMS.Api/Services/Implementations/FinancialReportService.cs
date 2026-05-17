using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Asn1.Ocsp;
using WMS.Api.Data;
using WMS.Api.DTOs.COA;
using WMS.Api.Enums;
using WMS.Api.Models;
using WMS.Api.Repositories.Interfaces;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    /// <summary>
    /// Financial report service implementation
    /// </summary>
    public class FinancialReportService : IFinancialReportService
    {
        private readonly WmsDbContext _context;
        private readonly ICoaRepository _coaRepository;
        private readonly IAccountGroupService _accountGroupService;

        public FinancialReportService(
            WmsDbContext context,
            ICoaRepository coaRepository,
            IAccountGroupService accountGroupService)
        {
            _context = context;
            _coaRepository = coaRepository;
            _accountGroupService = accountGroupService;
        }

        // ====================================================================
        // TRIAL BALANCE
        // ====================================================================

        /// <summary>
        /// Get Trial Balance report
        /// </summary>
        public async Task<TrialBalanceResponseDto> GetTrialBalanceAsync(
            int branchId,
            DateTime? asOnDate = null,
            bool includeZeroBalances = false,
            int? level = null)
        {
            var asOn = asOnDate ?? DateTime.Now.Date;
            var allAccounts = await _coaRepository.GetByBranchAsync(branchId);

            // Filter leaf accounts only (for trial balance)
            var accounts = allAccounts
                .Where(x => x.AcctLast == true && x.BranchID == branchId)
                .ToList();

            if (level.HasValue)
                accounts = accounts.Where(x => x.Level == level.Value).ToList();

            var result = new TrialBalanceResponseDto
            {
                AsOnDate = asOn,
                BranchId = branchId,
                Accounts = new List<TrialBalanceAccountDto>()
            };

            decimal totalDebit = 0;
            decimal totalCredit = 0;

            foreach (var account in accounts)
            {
                // Get account balance
                var balance = await GetAccountBalanceAsync(account.acctID, branchId, asOn);
                var normalSide = account.NormalSide ?? "Dr";

                var accountDto = new TrialBalanceAccountDto
                {
                    acctID = account.acctID,
                    AcctCode = account.AcctCode!,
                    AcctName = account.AcctName!,
                    Level = account.Level ?? 0,
                    AcctType = Enum.Parse<AccountType>(account.AcctType ?? "Asset"),
                    NormalSide = normalSide,
                    IsControlAccount = account.IsControlAccount ?? false,
                    OpeningBalance = account.OpenAmnt ?? 0,
                    TotalDebit = balance > 0 && normalSide == "Dr" ? balance : 0,
                    TotalCredit = balance > 0 && normalSide == "Cr" ? balance : 0,
                    ClosingBalance = balance
                };

                // For trial balance, we show debit/credit based on normal side
                if (normalSide == "Dr")
                {
                    accountDto.OpeningBalanceDr = account.OpenAmnt ?? 0;
                    accountDto.ClosingBalanceDr = balance > 0 ? balance : 0;
                    totalDebit += balance > 0 ? balance : 0;
                }
                else
                {
                    accountDto.OpeningBalanceCr = account.OpenAmnt ?? 0;
                    accountDto.ClosingBalanceCr = balance > 0 ? balance : 0;
                    totalCredit += balance > 0 ? balance : 0;
                }

                if (includeZeroBalances || balance != 0)
                {
                    result.Accounts.Add(accountDto);
                }
            }

            result.Summary = new TrialBalanceSummaryDto
            {
                TotalOpeningBalanceDr = result.Accounts.Sum(x => x.OpeningBalanceDr),
                TotalOpeningBalanceCr = result.Accounts.Sum(x => x.OpeningBalanceCr),
                TotalDebit = totalDebit,
                TotalCredit = totalCredit,
                TotalClosingBalanceDr = result.Accounts.Sum(x => x.ClosingBalanceDr),
                TotalClosingBalanceCr = result.Accounts.Sum(x => x.ClosingBalanceCr)
            };

            return result;
        }

        /// <summary>
        /// Get Trial Balance with hierarchy (nested)
        /// </summary>
        public async Task<TrialBalanceHierarchyDto> GetTrialBalanceHierarchyAsync(int branchId, DateTime? asOnDate = null)
        {
            var asOn = asOnDate ?? DateTime.Now.Date;
            var allAccounts = await _coaRepository.GetByBranchAsync(branchId);

            // Build hierarchical tree - MAKE IT ASYNC
            async Task<TrialBalanceHierarchyDto> BuildTreeAsync(string? parentCode)
            {
                var children = allAccounts
                    .Where(x => x.PrntCode == parentCode && x.BranchID == branchId)
                    .OrderBy(x => x.AcctCode)
                    .ToList();

                var node = new TrialBalanceHierarchyDto();

                foreach (var child in children)
                {
                    var childNode = await BuildTreeAsync(child.AcctCode);  // ✅ await here
                    childNode.acctID = child.acctID;
                    childNode.AcctCode = child.AcctCode!;
                    childNode.AcctName = child.AcctName!;
                    childNode.Level = child.Level ?? 0;
                    childNode.AcctType = child.AcctType!;
                    childNode.NormalSide = child.NormalSide ?? "Dr";
                    childNode.IsControlAccount = child.IsControlAccount ?? false;

                    // Calculate balance for this node (including children)
                    var balance = await GetAccountBalanceAsync(child.acctID, branchId, asOn);  // ✅ await here
                    childNode.ClosingBalance = balance;

                    if (childNode.NormalSide == "Dr")
                        childNode.ClosingBalanceDr = balance > 0 ? balance : 0;
                    else
                        childNode.ClosingBalanceCr = balance > 0 ? balance : 0;

                    // Aggregate children balances
                    childNode.TotalDebit = childNode.Children.Sum(x => x.TotalDebit) + childNode.ClosingBalanceDr;
                    childNode.TotalCredit = childNode.Children.Sum(x => x.TotalCredit) + childNode.ClosingBalanceCr;

                    node.Children.Add(childNode);
                }

                return node;
            }

            var result = await BuildTreeAsync(null);  // ✅ await here

            // Calculate totals
            result.TotalDebit = result.Children.Sum(x => x.TotalDebit);
            result.TotalCredit = result.Children.Sum(x => x.TotalCredit);

            return result;
        }

        // ====================================================================
        // PROFIT & LOSS STATEMENT
        // ====================================================================

        /// <summary>
        /// Get Profit & Loss Statement
        /// </summary>
        public async Task<ProfitLossDto> GetProfitLossAsync(
            int branchId,
            DateTime startDate,
            DateTime endDate,
            bool includeBudget = false)
        {
            var allAccounts = await _coaRepository.GetByBranchAsync(branchId);

            // Get Revenue accounts (AcctType = Revenue)
            var revenueAccounts = allAccounts
                .Where(x => x.AcctType == "Revenue" && x.AcctLast == true && x.BranchID == branchId)
                .ToList();

            // Get Expense accounts (AcctType = Expense)
            var expenseAccounts = allAccounts
                .Where(x => x.AcctType == "Expense" && x.AcctLast == true && x.BranchID == branchId)
                .ToList();

            var result = new ProfitLossDto
            {
                StartDate = startDate,
                EndDate = endDate,
                BranchId = branchId,
                Revenue = new List<ProfitLossItemDto>(),
                Expenses = new List<ProfitLossItemDto>(),
                OtherIncome = new List<ProfitLossItemDto>(),
                OtherExpenses = new List<ProfitLossItemDto>()
            };

            decimal totalRevenue = 0;
            decimal totalExpenses = 0;
            decimal totalOtherIncome = 0;
            decimal totalOtherExpenses = 0;

            // Calculate revenue
            foreach (var account in revenueAccounts)
            {
                var periodBalance = await GetPeriodBalanceAsync(account.acctID, branchId, startDate, endDate);
                // For revenue, credit balance is positive
                var amount = periodBalance;

                var item = new ProfitLossItemDto
                {
                    acctID = account.acctID,
                    AcctCode = account.AcctCode!,
                    AcctName = account.AcctName!,
                    Amount = amount,
                    Percentage = 0 // Calculate after total
                };

                // Categorize revenue
                if (account.AcctCode!.StartsWith("41"))
                    result.Revenue.Add(item);
                else if (account.AcctCode!.StartsWith("42"))
                    result.OtherIncome.Add(item);
                else
                    result.Revenue.Add(item);

                totalRevenue += amount;
            }

            // Calculate expenses
            foreach (var account in expenseAccounts)
            {
                var periodBalance = await GetPeriodBalanceAsync(account.acctID, branchId, startDate, endDate);
                // For expenses, debit balance is positive
                var amount = periodBalance;

                var item = new ProfitLossItemDto
                {
                    acctID = account.acctID,
                    AcctCode = account.AcctCode!,
                    AcctName = account.AcctName!,
                    Amount = amount,
                    Percentage = 0
                };

                // Categorize expenses
                if (account.AcctCode!.StartsWith("51"))
                    result.Expenses.Add(item);
                else if (account.AcctCode!.StartsWith("54"))
                    result.OtherExpenses.Add(item);
                else
                    result.Expenses.Add(item);

                totalExpenses += amount;
            }

            // Calculate percentages
            foreach (var item in result.Revenue)
                item.Percentage = totalRevenue > 0 ? (item.Amount / totalRevenue) * 100 : 0;
            foreach (var item in result.OtherIncome)
                item.Percentage = totalRevenue > 0 ? (item.Amount / totalRevenue) * 100 : 0;
            foreach (var item in result.Expenses)
                item.Percentage = totalRevenue > 0 ? (item.Amount / totalRevenue) * 100 : 0;
            foreach (var item in result.OtherExpenses)
                item.Percentage = totalRevenue > 0 ? (item.Amount / totalRevenue) * 100 : 0;

            result.TotalRevenue = totalRevenue + totalOtherIncome;
            result.TotalExpenses = totalExpenses + totalOtherExpenses;
            result.GrossProfit = totalRevenue - totalExpenses;
            result.NetProfit = result.TotalRevenue - result.TotalExpenses;

            return result;
        }

        /// <summary>
        /// Get Comparative Profit & Loss (multiple periods)
        /// </summary>
        public async Task<ComparativeProfitLossDto> GetComparativeProfitLossAsync(
            int branchId,
            DateTime currentStartDate,
            DateTime currentEndDate,
            DateTime? previousStartDate = null,
            DateTime? previousEndDate = null)
        {
            // Set previous period as same duration before current period
            var duration = currentEndDate - currentStartDate;
            previousStartDate ??= currentStartDate.AddDays(-duration.TotalDays);
            previousEndDate ??= currentEndDate.AddDays(-duration.TotalDays);

            var currentPL = await GetProfitLossAsync(branchId, currentStartDate, currentEndDate);
            var previousPL = await GetProfitLossAsync(branchId, previousStartDate.Value, previousEndDate.Value);

            var result = new ComparativeProfitLossDto
            {
                CurrentPeriod = currentPL,
                PreviousPeriod = previousPL,
                Variance = new ProfitLossVarianceDto()
            };

            // Calculate variances
            result.Variance.NetProfitVariance = currentPL.NetProfit - previousPL.NetProfit;
            result.Variance.NetProfitVariancePercentage = previousPL.NetProfit != 0
                ? (result.Variance.NetProfitVariance / previousPL.NetProfit) * 100
                : 0;

            result.Variance.RevenueVariance = currentPL.TotalRevenue - previousPL.TotalRevenue;
            result.Variance.ExpenseVariance = currentPL.TotalExpenses - previousPL.TotalExpenses;

            return result;
        }

        // ====================================================================
        // BALANCE SHEET
        // ====================================================================

        /// <summary>
        /// Get Balance Sheet
        /// </summary>
        public async Task<BalanceSheetDto> GetBalanceSheetAsync(
            int branchId,
            DateTime asOnDate,
            bool includePreviousYear = false)
        {
            var allAccounts = await _coaRepository.GetByBranchAsync(branchId);

            // Get Asset accounts
            var assetAccounts = allAccounts
                .Where(x => x.AcctType == "Asset" && x.AcctLast == true && x.BranchID == branchId)
                .ToList();

            // Get Liability accounts
            var liabilityAccounts = allAccounts
                .Where(x => x.AcctType == "Liability" && x.AcctLast == true && x.BranchID == branchId)
                .ToList();

            // Get Equity accounts
            var equityAccounts = allAccounts
                .Where(x => x.AcctType == "Equity" && x.AcctLast == true && x.BranchID == branchId)
                .ToList();

            var result = new BalanceSheetDto
            {
                AsOnDate = asOnDate,
                BranchId = branchId,
                Assets = new List<BalanceSheetItemDto>(),
                Liabilities = new List<BalanceSheetItemDto>(),
                Equity = new List<BalanceSheetItemDto>()
            };

            decimal totalAssets = 0;
            decimal totalLiabilities = 0;
            decimal totalEquity = 0;

            // Calculate assets
            foreach (var account in assetAccounts)
            {
                var balance = await GetAccountBalanceAsync(account.acctID, branchId, asOnDate);
                var amount = balance > 0 ? balance : 0;

                result.Assets.Add(new BalanceSheetItemDto
                {
                    acctID = account.acctID,
                    AcctCode = account.AcctCode!,
                    AcctName = account.AcctName!,
                    Amount = amount,
                    Percentage = 0
                });

                totalAssets += amount;
            }

            // Calculate liabilities
            foreach (var account in liabilityAccounts)
            {
                var balance = await GetAccountBalanceAsync(account.acctID, branchId, asOnDate);
                var amount = balance > 0 ? balance : 0;

                result.Liabilities.Add(new BalanceSheetItemDto
                {
                    acctID = account.acctID,
                    AcctCode = account.AcctCode!,
                    AcctName = account.AcctName!,
                    Amount = amount,
                    Percentage = 0
                });

                totalLiabilities += amount;
            }

            // Calculate equity
            foreach (var account in equityAccounts)
            {
                var balance = await GetAccountBalanceAsync(account.acctID, branchId, asOnDate);
                var amount = balance;

                result.Equity.Add(new BalanceSheetItemDto
                {
                    acctID = account.acctID,
                    AcctCode = account.AcctCode!,
                    AcctName = account.AcctName!,
                    Amount = amount,
                    Percentage = 0
                });

                totalEquity += amount;
            }

            // Calculate percentages
            foreach (var item in result.Assets)
                item.Percentage = totalAssets > 0 ? (item.Amount / totalAssets) * 100 : 0;
            foreach (var item in result.Liabilities)
                item.Percentage = totalLiabilities > 0 ? (item.Amount / totalLiabilities) * 100 : 0;
            foreach (var item in result.Equity)
                item.Percentage = totalEquity > 0 ? (item.Amount / totalEquity) * 100 : 0;

            result.TotalAssets = totalAssets;
            result.TotalLiabilities = totalLiabilities;
            result.TotalEquity = totalEquity;

            // Accounting equation: Assets = Liabilities + Equity
            result.Difference = totalAssets - (totalLiabilities + totalEquity);
            result.IsBalanced = Math.Abs(result.Difference) < 0.01m;

            return result;
        }

        /// <summary>
        /// Get Vertical Balance Sheet (percentage format)
        /// </summary>
        public async Task<VerticalBalanceSheetDto> GetVerticalBalanceSheetAsync(int branchId, DateTime asOnDate)
        {
            var balanceSheet = await GetBalanceSheetAsync(branchId, asOnDate);

            return new VerticalBalanceSheetDto
            {
                AsOnDate = asOnDate,
                TotalAssets = balanceSheet.TotalAssets,
                TotalLiabilities = balanceSheet.TotalLiabilities,
                TotalEquity = balanceSheet.TotalEquity,
                AssetsPercentage = 100,
                LiabilitiesPercentage = balanceSheet.TotalAssets > 0
                    ? (balanceSheet.TotalLiabilities / balanceSheet.TotalAssets) * 100
                    : 0,
                EquityPercentage = balanceSheet.TotalAssets > 0
                    ? (balanceSheet.TotalEquity / balanceSheet.TotalAssets) * 100
                    : 0
            };
        }

        // ====================================================================
        // CASH FLOW STATEMENT
        // ====================================================================

        /// <summary>
        /// Get Cash Flow Statement
        /// </summary>
        public async Task<CashFlowDto> GetCashFlowStatementAsync(int branchId, DateTime startDate, DateTime endDate)
        {
            // Get bank and cash accounts
            var bankAccounts = await _accountGroupService.GetBankAccountsAsync(branchId);
            var cashAccounts = await _accountGroupService.GetCashAccountsAsync(branchId);
            var allCashAccounts = bankAccounts.Concat(cashAccounts).ToList();

            var result = new CashFlowDto
            {
                StartDate = startDate,
                EndDate = endDate,
                OperatingActivities = new List<CashFlowItemDto>(),
                InvestingActivities = new List<CashFlowItemDto>(),
                FinancingActivities = new List<CashFlowItemDto>()
            };

            decimal openingBalance = 0;
            decimal closingBalance = 0;

            // Calculate opening and closing balances
            foreach (var account in allCashAccounts)
            {
                openingBalance += await GetAccountBalanceAsync(account.acctID, branchId, startDate.AddDays(-1));
                closingBalance += await GetAccountBalanceAsync(account.acctID, branchId, endDate);
            }

            result.OpeningCashBalance = openingBalance;
            result.ClosingCashBalance = closingBalance;

            // Net cash flow
            result.NetCashFlow = closingBalance - openingBalance;

            // You would populate operating, investing, financing activities here
            // Based on transaction categorization

            return result;
        }

        // ====================================================================
        // GENERAL LEDGER
        // ====================================================================

        /// <summary>
        /// Get General Ledger for specific account
        /// </summary>
        public async Task<GeneralLedgerDto> GetGeneralLedgerAsync(
            int branchId,
            int accountId,
            DateTime fromDate,
            DateTime toDate)
        {
            var account = await _coaRepository.GetByIdAndBranchAsync(accountId, branchId);
            if (account == null)
                throw new Exception("Account not found");

            var result = new GeneralLedgerDto
            {
                AccountId = accountId,
                AccountCode = account.AcctCode!,
                AccountName = account.AcctName!,
                FromDate = fromDate,
                ToDate = toDate,
                Transactions = new List<LedgerTransactionDto>()
            };

            // Get transactions for this account
            // This would query from journal entries table
            // For now, return empty
            result.OpeningBalance = account.OpenAmnt ?? 0;
            result.ClosingBalance = result.OpeningBalance;

            return result;
        }

        /// <summary>
        /// Get Account Statement (customer/supplier)
        /// </summary>
        public async Task<AccountStatementDto> GetAccountStatementAsync(
            int branchId,
            int accountId,
            DateTime fromDate,
            DateTime toDate)
        {
            var ledger = await GetGeneralLedgerAsync(branchId, accountId, fromDate, toDate);

            return new AccountStatementDto
            {
                AccountId = accountId,
                AccountCode = ledger.AccountCode,
                AccountName = ledger.AccountName,
                FromDate = fromDate,
                ToDate = toDate,
                OpeningBalance = ledger.OpeningBalance,
                ClosingBalance = ledger.ClosingBalance,
                Transactions = ledger.Transactions
            };
        }

        // ====================================================================
        // HELPER METHODS
        // ====================================================================

        /// <summary>
        /// Get closing balances for all accounts
        /// </summary>
        public async Task<Dictionary<int, decimal>> GetClosingBalancesAsync(int branchId, DateTime asOnDate)
        {
            var allAccounts = await _coaRepository.GetByBranchAsync(branchId);
            var result = new Dictionary<int, decimal>();

            foreach (var account in allAccounts)
            {
                var balance = await GetAccountBalanceAsync(account.acctID, branchId, asOnDate);
                result[account.acctID] = balance;
            }

            return result;
        }

        /// <summary>
        /// Get period net profit/loss
        /// </summary>
        public async Task<decimal> GetNetProfitLossAsync(int branchId, DateTime startDate, DateTime endDate)
        {
            var pl = await GetProfitLossAsync(branchId, startDate, endDate);
            return pl.NetProfit;
        }

        // ====================================================================
        // PRIVATE HELPER METHODS
        // ====================================================================

        private async Task<decimal> GetAccountBalanceAsync(int accountId, int branchId, DateTime asOnDate)
        {
            // This would calculate balance from all transactions up to asOnDate
            // For now, return opening balance as placeholder
            var account = await _coaRepository.GetByIdAndBranchAsync(accountId, branchId);
            return account?.OpenAmnt ?? 0;
        }

        private async Task<decimal> GetPeriodBalanceAsync(int accountId, int branchId, DateTime startDate, DateTime endDate)
        {
            // This would calculate balance for the period only
            // For now, return opening balance as placeholder
            var account = await _coaRepository.GetByIdAndBranchAsync(accountId, branchId);
            return account?.OpenAmnt ?? 0;
        }


    }
}
