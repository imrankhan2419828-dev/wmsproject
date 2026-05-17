using WMS.Api.DTOs.COA;
using WMS.Api.Enums;
using WMS.Api.Models;
using WMS.Api.Repositories.Interfaces;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    /// <summary>
    /// Validation service implementation for Chart of Accounts
    /// </summary>
    public class CoaValidationService : ICoaValidationService
    {
        private readonly ICoaRepository _coaRepository;

        public CoaValidationService(ICoaRepository coaRepository)
        {
            _coaRepository = coaRepository;
        }

        // ====================================================================
        // CREATE VALIDATIONS
        // ====================================================================

        /// <summary>
        /// Validate account creation request
        /// </summary>
        public async Task ValidateCreateAsync(COACreateDto dto, int branchId, List<COA> existingAccounts)
        {
            var errors = new List<string>();

            // 1. Validate parent exists
            await ValidateParentExistsAsync(dto.PrntCode, branchId, existingAccounts);

            // 2. Validate parent is not leaf
            await ValidateParentNotLeafAsync(dto.PrntCode, branchId, existingAccounts);

            // 3. Validate type compatibility
            await ValidateTypeCompatibilityAsync(dto.PrntCode, dto.AcctType.ToString(), branchId, existingAccounts);

            // 4. Validate unique name under parent
            await ValidateUniqueNameAsync(dto.PrntCode, dto.AcctName, branchId, existingAccounts);

            // 5. Validate opening balance sign
            await ValidateOpeningBalanceSignAsync(dto.OpenAmnt, dto.AcctType.ToString());

            // 6. Validate control account if specified
            if (dto.IsControlAccount == true)
            {
                // Control account validation will be done separately
            }

            // 7. Validate detail account belongs to control account
            if (dto.ControlAccountId.HasValue)
            {
                await ValidateDetailAccountAsync(dto.ControlAccountId, branchId, existingAccounts);
            }
        }

        /// <summary>
        /// Validate parent account exists and is valid
        /// </summary>
        public async Task ValidateParentExistsAsync(string? parentCode, int branchId, List<COA> existingAccounts)
        {
            if (string.IsNullOrEmpty(parentCode))
                return; // Root account, no parent needed

            var parent = existingAccounts.FirstOrDefault(x => x.AcctCode == parentCode && x.BranchID == branchId);

            if (parent == null)
                throw new Exception($"Parent account '{parentCode}' does not exist in this branch");
        }

        /// <summary>
        /// Validate parent is not a leaf account
        /// </summary>
        public async Task ValidateParentNotLeafAsync(string? parentCode, int branchId, List<COA> existingAccounts)
        {
            if (string.IsNullOrEmpty(parentCode))
                return;

            var parent = existingAccounts.FirstOrDefault(x => x.AcctCode == parentCode && x.BranchID == branchId);

            if (parent != null && parent.AcctLast == true)
                throw new Exception($"Parent account '{parentCode}' is a leaf account and cannot have children");
        }

        /// <summary>
        /// Validate parent and child account types are compatible
        /// </summary>
        public async Task ValidateTypeCompatibilityAsync(string? parentCode, string childType, int branchId, List<COA> existingAccounts)
        {
            if (string.IsNullOrEmpty(parentCode))
                return; // Root accounts can be any type

            var parent = existingAccounts.FirstOrDefault(x => x.AcctCode == parentCode && x.BranchID == branchId);

            if (parent != null && parent.AcctType != childType)
                throw new Exception($"Child account type '{childType}' must match parent type '{parent.AcctType}'");
        }

        /// <summary>
        /// Validate no circular reference in hierarchy
        /// </summary>
        public async Task ValidateNoCircularReferenceAsync(string? parentCode, string childCode, int branchId, List<COA> existingAccounts)
        {
            if (string.IsNullOrEmpty(parentCode))
                return;

            // Check if parent is a descendant of child (circular reference)
            bool IsDescendant(string currentCode, string targetCode)
            {
                var children = existingAccounts.Where(x => x.PrntCode == currentCode && x.BranchID == branchId).ToList();

                foreach (var child in children)
                {
                    if (child.AcctCode == targetCode)
                        return true;

                    if (IsDescendant(child.AcctCode!, targetCode))
                        return true;
                }
                return false;
            }

            if (IsDescendant(childCode, parentCode))
                throw new Exception("Circular reference detected: Cannot add parent as child of its own descendant");
        }

        /// <summary>
        /// Validate account name is unique under same parent
        /// </summary>
        public async Task ValidateUniqueNameAsync(string? parentCode, string acctName, int branchId, List<COA> existingAccounts, int? excludeId = null)
        {
            var duplicate = existingAccounts.FirstOrDefault(x =>
                x.PrntCode == parentCode &&
                x.AcctName == acctName &&
                x.BranchID == branchId &&
                (excludeId == null || x.acctID != excludeId));

            if (duplicate != null)
                throw new Exception($"Account name '{acctName}' already exists under this parent");
        }

        /// <summary>
        /// Validate opening balance sign matches account type
        /// </summary>
        public async Task ValidateOpeningBalanceSignAsync(decimal? openingBalance, string acctType)
        {
            if (!openingBalance.HasValue || openingBalance.Value == 0)
                return;

            var accountType = Enum.Parse<AccountType>(acctType);
            var normalSide = accountType.GetNormalSide();

            if (normalSide == "Dr" && openingBalance < 0)
                throw new Exception($"{accountType} accounts cannot have negative opening balance. Normal side is Debit.");

            if (normalSide == "Cr" && openingBalance > 0)
                throw new Exception($"{accountType} accounts cannot have positive opening balance. Normal side is Credit.");
        }

        // ====================================================================
        // UPDATE VALIDATIONS
        // ====================================================================

        /// <summary>
        /// Validate account update request
        /// </summary>
        public async Task ValidateUpdateAsync(COAUpdateDto dto, COA existingAccount, int branchId, List<COA> allAccounts)
        {
            // 1. Validate unique name (excluding current account)
            await ValidateUniqueNameAsync(existingAccount.PrntCode, dto.AcctName, branchId, allAccounts, dto.acctID);

            // 2. Validate account type change (if trying to change)
            if (!string.IsNullOrEmpty(dto.AcctType) && dto.AcctType != existingAccount.AcctType)
            {
                // Check if account has children
                var hasChildren = allAccounts.Any(x => x.PrntCode == existingAccount.AcctCode);
                if (hasChildren)
                    throw new Exception("Cannot change account type because it has child accounts");

                // Check if account has transactions
                await ValidateNoTransactionsAsync(existingAccount.acctID);
            }

            // 3. Validate control account change
            if (dto.IsControlAccount.HasValue)
            {
                await ValidateControlAccountAsync(existingAccount, allAccounts);
            }
        }

        /// <summary>
        /// Validate account can be locked/unlocked
        /// </summary>
        public async Task ValidateLockUnlockAsync(int accountId, bool lockAccount, COA account, List<COA> allAccounts)
        {
            if (lockAccount && account.LockAcct == true)
                throw new Exception("Account is already locked");

            if (!lockAccount && account.LockAcct == false)
                throw new Exception("Account is already unlocked");

            // Check if account has balance before locking
            if (lockAccount)
            {
                // You can add balance check here if needed
                // var hasBalance = await CheckAccountBalanceAsync(accountId);
                // if (hasBalance) throw new Exception("Cannot lock account with balance");
            }
        }

        // ====================================================================
        // DELETE VALIDATIONS
        // ====================================================================

        /// <summary>
        /// Validate account can be deleted
        /// </summary>
        public async Task ValidateDeleteAsync(int accountId, COA account, List<COA> allAccounts)
        {
            // 1. Check if system account
            await ValidateNotSystemAccountAsync(account);

            // 2. Check if has children
            await ValidateNoChildrenAsync(account.AcctCode!, account.BranchID!.Value, allAccounts);

            // 3. Check if has transactions
            await ValidateNoTransactionsAsync(accountId);
        }

        /// <summary>
        /// Validate account has no transactions
        /// </summary>
        public async Task ValidateNoTransactionsAsync(int accountId)
        {
            var hasTransactions = await _coaRepository.HasTransactionsAsync(accountId);

            if (hasTransactions)
                throw new Exception("Cannot delete account because it has transaction history");
        }

        /// <summary>
        /// Validate account has no children
        /// </summary>
        public async Task ValidateNoChildrenAsync(string acctCode, int branchId, List<COA> allAccounts)
        {
            var hasChildren = allAccounts.Any(x => x.PrntCode == acctCode && x.BranchID == branchId);

            if (hasChildren)
                throw new Exception("Cannot delete account because it has child accounts");
        }

        /// <summary>
        /// Validate account is not a system account
        /// </summary>
        public async Task ValidateNotSystemAccountAsync(COA account)
        {
            // You can add an IsSystem flag to COA model
            // For now, check if it's a critical account
            var criticalCodes = new[] { "1000", "2000", "3000", "4000", "5000" };

            if (criticalCodes.Contains(account.AcctCode))
                throw new Exception("Cannot delete system account");
        }

        // ====================================================================
        // POSTING VALIDATIONS
        // ====================================================================

        /// <summary>
        /// Validate account can post transactions
        /// </summary>
        public async Task ValidateCanPostAsync(string acctCode, int branchId, List<COA> allAccounts)
        {
            var account = allAccounts.FirstOrDefault(x => x.AcctCode == acctCode && x.BranchID == branchId);

            if (account == null)
                throw new Exception($"Account '{acctCode}' not found");

            if (account.AcctLast != true)
                throw new Exception($"Account '{acctCode}' is not a leaf account. Only leaf accounts can post transactions");

            if (account.Active != true)
                throw new Exception($"Account '{acctCode}' is inactive");

            await ValidateNotLockedAsync(account);
        }

        /// <summary>
        /// Validate account is not locked
        /// </summary>
        public async Task ValidateNotLockedAsync(COA account)
        {
            if (account.LockAcct == true)
                throw new Exception($"Account '{account.AcctCode}' is locked and cannot be used for transactions");
        }

        // ====================================================================
        // CONTROL ACCOUNT VALIDATIONS
        // ====================================================================

        /// <summary>
        /// Validate control account setup
        /// </summary>
        public async Task ValidateControlAccountAsync(COA account, List<COA> allAccounts)
        {
            if (account.IsControlAccount == true)
            {
                // Control account cannot be a leaf
                if (account.AcctLast == true)
                    throw new Exception("Control account cannot be a leaf account");

                // Control account must have normal balance type
                var accountType = Enum.Parse<AccountType>(account.AcctType!);
                // Additional control account validations
            }
        }

        /// <summary>
        /// Validate detail account belongs to correct control account
        /// </summary>
        public async Task ValidateDetailAccountAsync(int? controlAccountId, int branchId, List<COA> allAccounts)
        {
            if (!controlAccountId.HasValue)
                return;

            var controlAccount = allAccounts.FirstOrDefault(x => x.acctID == controlAccountId && x.BranchID == branchId);

            if (controlAccount == null)
                throw new Exception($"Control account with ID {controlAccountId} not found");

            if (controlAccount.IsControlAccount != true)
                throw new Exception($"Account '{controlAccount.AcctCode}' is not a control account");
        }

        // ====================================================================
        // BRANCH VALIDATIONS
        // ====================================================================

        /// <summary>
        /// Validate user has access to branch
        /// </summary>
        public async Task ValidateBranchAccessAsync(int userBranchId, int accountBranchId)
        {
            if (userBranchId != accountBranchId)
                throw new Exception("Access denied: Cannot access accounts from another branch");
        }

        /// <summary>
        /// Validate account belongs to branch
        /// </summary>
        public async Task ValidateAccountBelongsToBranchAsync(int accountId, int branchId, List<COA> allAccounts)
        {
            var account = allAccounts.FirstOrDefault(x => x.acctID == accountId);

            if (account == null)
                throw new Exception($"Account with ID {accountId} not found");

            if (account.BranchID != branchId)
                throw new Exception("Access denied: Account belongs to different branch");
        }

        // ====================================================================
        // CODE GENERATION VALIDATIONS
        // ====================================================================

        /// <summary>
        /// Validate code range is not exhausted
        /// </summary>
        public async Task ValidateCodeRangeNotExhaustedAsync(string? parentCode, int branchId, List<COA> allAccounts)
        {
            if (string.IsNullOrEmpty(parentCode))
            {
                // Root level check
                var rootAccounts = allAccounts.Where(x => x.PrntCode == null && x.BranchID == branchId).ToList();
                var maxCode = rootAccounts
                    .Select(x => int.Parse(x.AcctCode!))
                    .DefaultIfEmpty(0)
                    .Max();

                if (maxCode >= 5999) // Max range for root accounts
                    throw new Exception("Root account range exhausted. Please contact administrator to extend range.");
            }
            else
            {
                // Child level check
                var children = allAccounts.Where(x => x.PrntCode == parentCode && x.BranchID == branchId).ToList();

                if (children.Count >= 99) // Max 99 children per parent
                    throw new Exception($"Cannot add more accounts under '{parentCode}'. Maximum limit reached.");
            }
        }
    }
}