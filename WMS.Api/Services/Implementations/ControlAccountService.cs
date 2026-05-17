using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.COA;
using WMS.Api.Models;
using WMS.Api.Repositories.Interfaces;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    /// <summary>
    /// Control account service implementation
    /// </summary>
    public class ControlAccountService : IControlAccountService
    {
        private readonly WmsDbContext _context;
        private readonly ICoaRepository _coaRepository;
        private readonly IAccountGroupService _accountGroupService;
        private readonly ICoaValidationService _validationService;

        public ControlAccountService(
            WmsDbContext context,
            ICoaRepository coaRepository,
            IAccountGroupService accountGroupService,
            ICoaValidationService validationService)
        {
            _context = context;
            _coaRepository = coaRepository;
            _accountGroupService = accountGroupService;
            _validationService = validationService;
        }

        // ====================================================================
        // CONTROL ACCOUNT MANAGEMENT
        // ====================================================================

        /// <summary>
        /// Get all control accounts for a branch
        /// </summary>
        public async Task<List<ControlAccountDto>> GetControlAccountsAsync(int branchId)
        {
            var allAccounts = await _coaRepository.GetByBranchAsync(branchId);

            var controlAccounts = allAccounts
                .Where(x => x.IsControlAccount == true && x.BranchID == branchId)
                .ToList();

            var result = new List<ControlAccountDto>();

            foreach (var account in controlAccounts)
            {
                var detailAccounts = await GetDetailAccountsInternal(account.acctID, branchId, allAccounts);
                var balance = await CalculateControlAccountBalance(account.acctID, branchId, allAccounts);

                result.Add(new ControlAccountDto
                {
                    acctID = account.acctID,
                    AcctCode = account.AcctCode!,
                    AcctName = account.AcctName!,
                    AcctType = account.AcctType!,
                    ControlAccountType = GetControlAccountTypeFromCode(account.AcctCode!),
                    DetailAccountsCount = detailAccounts.Count,
                    TotalBalance = balance,
                    IsActive = account.Active ?? true
                });
            }

            return result;
        }

        /// <summary>
        /// Get control account by ID with details
        /// </summary>
        public async Task<ControlAccountDetailDto?> GetControlAccountByIdAsync(int controlAccountId, int branchId)
        {
            var account = await _coaRepository.GetByIdAndBranchAsync(controlAccountId, branchId);

            if (account == null || account.IsControlAccount != true)
                return null;

            var allAccounts = await _coaRepository.GetByBranchAsync(branchId);
            var detailAccounts = await GetDetailAccountsInternal(controlAccountId, branchId, allAccounts);
            var balance = await CalculateControlAccountBalance(controlAccountId, branchId, allAccounts);

            var detailDtos = new List<DetailAccountDto>();

            foreach (var detail in detailAccounts)
            {
                var detailBalance = await CalculateDetailAccountBalance(detail.acctID, branchId);

                detailDtos.Add(new DetailAccountDto
                {
                    acctID = detail.acctID,
                    AcctCode = detail.AcctCode!,
                    AcctName = detail.AcctName!,
                    NTNNo = detail.NTNNo,
                    STRNo = detail.STRNo,
                    CreditLimit = detail.CrdtLimt.HasValue ? (decimal)detail.CrdtLimt.Value : null,
                    CurrentBalance = detailBalance,
                    IsActive = detail.Active ?? true,
                    StopSale = detail.StopSale ?? false,
                    StopReason = detail.StopReas
                });
            }

            return new ControlAccountDetailDto
            {
                acctID = account.acctID,
                AcctCode = account.AcctCode!,
                AcctName = account.AcctName!,
                AcctType = account.AcctType!,
                ControlAccountType = GetControlAccountTypeFromCode(account.AcctCode!),
                DetailAccountsCount = detailAccounts.Count,
                TotalBalance = balance,
                IsActive = account.Active ?? true,
                DetailAccounts = detailDtos,
                LastSyncedOn = DateTime.Now,
                LastSyncedBalance = balance
            };
        }

        /// <summary>
        /// Get control account by code
        /// </summary>
        public async Task<ControlAccountDetailDto?> GetControlAccountByCodeAsync(string acctCode, int branchId)
        {
            var allAccounts = await _coaRepository.GetByBranchAsync(branchId);
            var account = allAccounts.FirstOrDefault(x => x.AcctCode == acctCode && x.BranchID == branchId);

            if (account == null || account.IsControlAccount != true)
                return null;

            return await GetControlAccountByIdAsync(account.acctID, branchId);
        }

        /// <summary>
        /// Convert regular account to control account
        /// </summary>
        public async Task<ControlAccountDto> ConvertToControlAccountAsync(int accountId, int branchId, string user)
        {
            var account = await _coaRepository.GetByIdAndBranchAsync(accountId, branchId);

            if (account == null)
                throw new Exception("Account not found");

            if (account.IsControlAccount == true)
                throw new Exception("Account is already a control account");

            // Validate no transactions on this account
            var hasTransactions = await _coaRepository.HasTransactionsAsync(accountId);
            if (hasTransactions)
                throw new Exception("Cannot convert account with transactions to control account");

            // Validate no children
            var allAccounts = await _coaRepository.GetByBranchAsync(branchId);
            var hasChildren = allAccounts.Any(x => x.PrntCode == account.AcctCode);
            if (!hasChildren)
                throw new Exception("Control account must have at least one child account");

            // Convert to control account
            account.IsControlAccount = true;
            account.AcctLast = false; // Control accounts cannot be leaf
            account.EditBy = user;
            account.EditOn = DateTime.Now;

            await _coaRepository.UpdateAsync(account);

            return new ControlAccountDto
            {
                acctID = account.acctID,
                AcctCode = account.AcctCode!,
                AcctName = account.AcctName!,
                AcctType = account.AcctType!,
                ControlAccountType = GetControlAccountTypeFromCode(account.AcctCode!),
                DetailAccountsCount = allAccounts.Count(x => x.PrntCode == account.AcctCode),
                TotalBalance = 0,
                IsActive = account.Active ?? true
            };
        }

        /// <summary>
        /// Convert control account to regular account
        /// </summary>
        public async Task<ControlAccountDto> ConvertToRegularAccountAsync(int accountId, int branchId, string user)
        {
            var account = await _coaRepository.GetByIdAndBranchAsync(accountId, branchId);

            if (account == null)
                throw new Exception("Account not found");

            if (account.IsControlAccount != true)
                throw new Exception("Account is not a control account");

            // Validate no detail accounts
            var allAccounts = await _coaRepository.GetByBranchAsync(branchId);
            var hasDetails = allAccounts.Any(x => x.ControlAccountId == accountId);
            if (hasDetails)
                throw new Exception("Cannot convert control account with detail accounts");

            // Convert to regular account
            account.IsControlAccount = false;
            account.EditBy = user;
            account.EditOn = DateTime.Now;

            await _coaRepository.UpdateAsync(account);

            return new ControlAccountDto
            {
                acctID = account.acctID,
                AcctCode = account.AcctCode!,
                AcctName = account.AcctName!,
                AcctType = account.AcctType!,
                ControlAccountType = GetControlAccountTypeFromCode(account.AcctCode!),
                DetailAccountsCount = 0,
                TotalBalance = 0,
                IsActive = account.Active ?? true
            };
        }

        // ====================================================================
        // DETAIL ACCOUNT MANAGEMENT
        // ====================================================================

        /// <summary>
        /// Get all detail accounts under a control account
        /// </summary>
        public async Task<List<DetailAccountDto>> GetDetailAccountsAsync(int controlAccountId, int branchId)
        {
            var allAccounts = await _coaRepository.GetByBranchAsync(branchId);
            var detailAccounts = allAccounts
                .Where(x => x.ControlAccountId == controlAccountId && x.BranchID == branchId)
                .ToList();

            var result = new List<DetailAccountDto>();

            foreach (var detail in detailAccounts)
            {
                var balance = await CalculateDetailAccountBalance(detail.acctID, branchId);

                result.Add(new DetailAccountDto
                {
                    acctID = detail.acctID,
                    AcctCode = detail.AcctCode!,
                    AcctName = detail.AcctName!,
                    NTNNo = detail.NTNNo,
                    STRNo = detail.STRNo,
                    CreditLimit = detail.CrdtLimt.HasValue ? (decimal)detail.CrdtLimt.Value : null,
                    CurrentBalance = balance,
                    IsActive = detail.Active ?? true,
                    StopSale = detail.StopSale ?? false,
                    StopReason = detail.StopReas
                });
            }

            return result;
        }

        /// <summary>
        /// Add detail account to control account
        /// </summary>
        public async Task<DetailAccountDto> AddDetailAccountAsync(int controlAccountId, CreateDetailAccountDto dto, int branchId, string user)
        {
            // Get control account
            var controlAccount = await _coaRepository.GetByIdAndBranchAsync(controlAccountId, branchId);
            if (controlAccount == null)
                throw new Exception("Control account not found");

            if (controlAccount.IsControlAccount != true)
                throw new Exception("Account is not a control account");

            // Generate account code under control account
            var allAccounts = await _coaRepository.GetByBranchAsync(branchId);
            var childCode = await GenerateDetailAccountCode(controlAccount.AcctCode!, branchId, allAccounts);

            // Create detail account
            var detailAccount = new COA
            {
                AcctCode = childCode,
                AcctName = dto.AcctName,
                PrntCode = controlAccount.AcctCode,
                AcctType = controlAccount.AcctType,
                AcctLast = true,
                Level = (controlAccount.Level ?? 0) + 1,
                NormalSide = controlAccount.NormalSide,
                OpenAmnt = dto.OpenAmnt ?? 0,
                AcctDesc = dto.AcctDesc,
                Active = dto.Active ?? true,
                BranchID = branchId,
                AddBy = user,
                AddOn = DateTime.Now,
                ControlAccountId = controlAccountId,
                CrdtLimt = (float?)dto.CreditLimit,
                NTNNo = dto.NTNNo,
                STRNo = dto.STRNo
            };

            await _coaRepository.AddAsync(detailAccount);

            // Update parent's AcctLast flag
            await _coaRepository.UpdateParentLastFlagAsync(controlAccount.AcctCode!, branchId);

            return new DetailAccountDto
            {
                acctID = detailAccount.acctID,
                AcctCode = detailAccount.AcctCode!,
                AcctName = detailAccount.AcctName!,
                NTNNo = detailAccount.NTNNo,
                STRNo = detailAccount.STRNo,
                CreditLimit = detailAccount.CrdtLimt.HasValue ? (decimal)detailAccount.CrdtLimt.Value : null,
                CurrentBalance = 0,
                IsActive = detailAccount.Active ?? true
            };
        }

        /// <summary>
        /// Remove detail account from control account
        /// </summary>
        public async Task RemoveDetailAccountAsync(int detailAccountId, int branchId, string user)
        {
            var detailAccount = await _coaRepository.GetByIdAndBranchAsync(detailAccountId, branchId);

            if (detailAccount == null)
                throw new Exception("Detail account not found");

            if (!detailAccount.ControlAccountId.HasValue)
                throw new Exception("Account is not linked to any control account");

            // Check if account has transactions
            var hasTransactions = await _coaRepository.HasTransactionsAsync(detailAccountId);
            if (hasTransactions)
                throw new Exception("Cannot remove detail account with transactions");

            // Remove control account link
            detailAccount.ControlAccountId = null;
            detailAccount.EditBy = user;
            detailAccount.EditOn = DateTime.Now;

            await _coaRepository.UpdateAsync(detailAccount);
        }

        /// <summary>
        /// Check if account can be added as detail to control account
        /// </summary>
        public async Task<bool> CanBeDetailAccountAsync(int accountId, int controlAccountId, int branchId)
        {
            var account = await _coaRepository.GetByIdAndBranchAsync(accountId, branchId);
            var controlAccount = await _coaRepository.GetByIdAndBranchAsync(controlAccountId, branchId);

            if (account == null || controlAccount == null)
                return false;

            if (controlAccount.IsControlAccount != true)
                return false;

            if (account.ControlAccountId.HasValue)
                return false;

            if (account.AcctType != controlAccount.AcctType)
                return false;

            return true;
        }

        // ====================================================================
        // BALANCE AGGREGATION
        // ====================================================================

        /// <summary>
        /// Get control account balance (sum of all detail accounts)
        /// </summary>
        public async Task<decimal> GetControlAccountBalanceAsync(int controlAccountId, int branchId, DateTime? asOnDate = null)
        {
            var allAccounts = await _coaRepository.GetByBranchAsync(branchId);
            return await CalculateControlAccountBalance(controlAccountId, branchId, allAccounts, asOnDate);
        }

        /// <summary>
        /// Get all detail account balances
        /// </summary>
        public async Task<List<DetailAccountBalanceDto>> GetDetailAccountBalancesAsync(int controlAccountId, int branchId, DateTime? asOnDate = null)
        {
            var allAccounts = await _coaRepository.GetByBranchAsync(branchId);
            var detailAccounts = allAccounts
                .Where(x => x.ControlAccountId == controlAccountId && x.BranchID == branchId)
                .ToList();

            var result = new List<DetailAccountBalanceDto>();

            foreach (var detail in detailAccounts)
            {
                var balance = await CalculateDetailAccountBalance(detail.acctID, branchId, asOnDate);

                result.Add(new DetailAccountBalanceDto
                {
                    acctID = detail.acctID,
                    AcctCode = detail.AcctCode!,
                    AcctName = detail.AcctName!,
                    OpeningBalance = 0, // Would need to calculate from transactions
                    TotalDebit = 0,
                    TotalCredit = 0,
                    ClosingBalance = balance
                });
            }

            return result;
        }

        /// <summary>
        /// Get control account aging report (for AR/AP)
        /// </summary>
        public async Task<AgingReportDto> GetAgingReportAsync(int controlAccountId, int branchId, DateTime asOnDate)
        {
            var controlAccount = await _coaRepository.GetByIdAndBranchAsync(controlAccountId, branchId);
            if (controlAccount == null)
                throw new Exception("Control account not found");

            var detailAccounts = await GetDetailAccountsAsync(controlAccountId, branchId);

            var agingReport = new AgingReportDto
            {
                ControlAccountId = controlAccountId,
                ControlAccountName = controlAccount.AcctName!,
                AsOnDate = asOnDate,
                AgingBuckets = new List<AgingBucketDto>
                {
                    new AgingBucketDto { BucketName = "Current", DaysFrom = 0, DaysTo = 0, Amount = 0, Details = new List<AgingDetailDto>() },
                    new AgingBucketDto { BucketName = "1-30 Days", DaysFrom = 1, DaysTo = 30, Amount = 0, Details = new List<AgingDetailDto>() },
                    new AgingBucketDto { BucketName = "31-60 Days", DaysFrom = 31, DaysTo = 60, Amount = 0, Details = new List<AgingDetailDto>() },
                    new AgingBucketDto { BucketName = "61-90 Days", DaysFrom = 61, DaysTo = 90, Amount = 0, Details = new List<AgingDetailDto>() },
                    new AgingBucketDto { BucketName = "90+ Days", DaysFrom = 91, DaysTo = int.MaxValue, Amount = 0, Details = new List<AgingDetailDto>() }
                }
            };

            foreach (var detail in detailAccounts)
            {
                // Calculate aging for each detail account
                // This would involve looking at unpaid invoices/transactions
                // For now, just add balance to current bucket
                agingReport.AgingBuckets[0].Amount += detail.CurrentBalance;
                agingReport.AgingBuckets[0].Details.Add(new AgingDetailDto
                {
                    DetailAccountId = detail.acctID,
                    AccountCode = detail.AcctCode,
                    AccountName = detail.AcctName,
                    Amount = detail.CurrentBalance,
                    LastTransactionDate = detail.LastTransactionDate
                });
            }

            agingReport.TotalOutstanding = agingReport.AgingBuckets.Sum(x => x.Amount);

            return agingReport;
        }

        /// <summary>
        /// Sync control account balance (recalculate from details)
        /// </summary>
        public async Task<decimal> SyncControlAccountBalanceAsync(int controlAccountId, int branchId)
        {
            var balance = await GetControlAccountBalanceAsync(controlAccountId, branchId);

            // Update control account opening balance if needed
            var controlAccount = await _coaRepository.GetByIdAndBranchAsync(controlAccountId, branchId);
            if (controlAccount != null)
            {
                // You might want to store synced balance somewhere
                // For now, just return the balance
            }

            return balance;
        }

        // ====================================================================
        // VALIDATION
        // ====================================================================

        /// <summary>
        /// Validate detail account belongs to control account
        /// </summary>
        public async Task<bool> ValidateDetailAccountBelongsToControlAsync(int detailAccountId, int controlAccountId, int branchId)
        {
            var detailAccount = await _coaRepository.GetByIdAndBranchAsync(detailAccountId, branchId);
            return detailAccount != null && detailAccount.ControlAccountId == controlAccountId;
        }

        /// <summary>
        /// Validate control account has no direct transactions
        /// </summary>
        public async Task<bool> ValidateControlAccountNoDirectTransactionsAsync(int controlAccountId, int branchId)
        {
            return !await _coaRepository.HasTransactionsAsync(controlAccountId);
        }

        /// <summary>
        /// Get control account type (AR, AP, etc.)
        /// </summary>
        public async Task<string> GetControlAccountTypeAsync(int controlAccountId, int branchId)
        {
            var account = await _coaRepository.GetByIdAndBranchAsync(controlAccountId, branchId);
            if (account == null) return "UNKNOWN";

            return GetControlAccountTypeFromCode(account.AcctCode!);
        }

        // ====================================================================
        // PRIVATE HELPER METHODS
        // ====================================================================

        private async Task<List<COA>> GetDetailAccountsInternal(int controlAccountId, int branchId, List<COA> allAccounts)
        {
            return allAccounts
                .Where(x => x.ControlAccountId == controlAccountId && x.BranchID == branchId)
                .ToList();
        }

        private async Task<decimal> CalculateControlAccountBalance(int controlAccountId, int branchId, List<COA>? allAccounts = null, DateTime? asOnDate = null)
        {
            if (allAccounts == null)
                allAccounts = await _coaRepository.GetByBranchAsync(branchId);

            var detailAccounts = allAccounts
                .Where(x => x.ControlAccountId == controlAccountId && x.BranchID == branchId)
                .ToList();

            decimal totalBalance = 0;

            foreach (var detail in detailAccounts)
            {
                totalBalance += await CalculateDetailAccountBalance(detail.acctID, branchId, asOnDate);
            }

            return totalBalance;
        }

        private async Task<decimal> CalculateDetailAccountBalance(int detailAccountId, int branchId, DateTime? asOnDate = null)
        {
            // This would calculate balance from transaction tables
            // For now, return opening balance as placeholder
            var account = await _coaRepository.GetByIdAndBranchAsync(detailAccountId, branchId);
            return account?.OpenAmnt ?? 0;
        }

        private async Task<string> GenerateDetailAccountCode(string parentCode, int branchId, List<COA> allAccounts)
        {
            var existingChildren = allAccounts
                .Where(x => x.PrntCode == parentCode && x.BranchID == branchId)
                .ToList();

            int nextNumber = existingChildren.Count + 1;
            return $"{parentCode}-{nextNumber:D2}";
        }

        private string GetControlAccountTypeFromCode(string acctCode)
        {
            if (acctCode.StartsWith("11")) return "AR"; // Accounts Receivable
            if (acctCode.StartsWith("21")) return "AP"; // Accounts Payable
            if (acctCode.StartsWith("111")) return "BANK"; // Bank Accounts
            if (acctCode.StartsWith("110")) return "CASH"; // Cash Accounts
            return "GENERAL";
        }
    }
}
