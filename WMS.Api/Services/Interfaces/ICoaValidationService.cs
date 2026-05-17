using WMS.Api.DTOs.COA;
using WMS.Api.Models;

namespace WMS.Api.Services.Interfaces
{
    /// <summary>
    /// Validation service for Chart of Accounts business rules
    /// </summary>
    public interface ICoaValidationService
    {
        // ====================================================================
        // CREATE VALIDATIONS
        // ====================================================================

        /// <summary>
        /// Validate account creation request
        /// </summary>
        Task ValidateCreateAsync(COACreateDto dto, int branchId, List<COA> existingAccounts);

        /// <summary>
        /// Validate parent account exists and is valid
        /// </summary>
        Task ValidateParentExistsAsync(string? parentCode, int branchId, List<COA> existingAccounts);

        /// <summary>
        /// Validate parent is not a leaf account (can have children)
        /// </summary>
        Task ValidateParentNotLeafAsync(string? parentCode, int branchId, List<COA> existingAccounts);

        /// <summary>
        /// Validate parent and child account types are compatible
        /// </summary>
        Task ValidateTypeCompatibilityAsync(string? parentCode, string childType, int branchId, List<COA> existingAccounts);

        /// <summary>
        /// Validate no circular reference in hierarchy
        /// </summary>
        Task ValidateNoCircularReferenceAsync(string? parentCode, string childCode, int branchId, List<COA> existingAccounts);

        /// <summary>
        /// Validate account name is unique under same parent
        /// </summary>
        Task ValidateUniqueNameAsync(string? parentCode, string acctName, int branchId, List<COA> existingAccounts, int? excludeId = null);

        /// <summary>
        /// Validate opening balance sign matches account type
        /// </summary>
        Task ValidateOpeningBalanceSignAsync(decimal? openingBalance, string acctType);

        // ====================================================================
        // UPDATE VALIDATIONS
        // ====================================================================

        /// <summary>
        /// Validate account update request
        /// </summary>
        Task ValidateUpdateAsync(COAUpdateDto dto, COA existingAccount, int branchId, List<COA> allAccounts);

        /// <summary>
        /// Validate account can be locked/unlocked
        /// </summary>
        Task ValidateLockUnlockAsync(int accountId, bool lockAccount, COA account, List<COA> allAccounts);

        // ====================================================================
        // DELETE VALIDATIONS
        // ====================================================================

        /// <summary>
        /// Validate account can be deleted
        /// </summary>
        Task ValidateDeleteAsync(int accountId, COA account, List<COA> allAccounts);

        /// <summary>
        /// Validate account has no transactions
        /// </summary>
        Task ValidateNoTransactionsAsync(int accountId);

        /// <summary>
        /// Validate account has no children
        /// </summary>
        Task ValidateNoChildrenAsync(string acctCode, int branchId, List<COA> allAccounts);

        /// <summary>
        /// Validate account is not a system account
        /// </summary>
        Task ValidateNotSystemAccountAsync(COA account);

        // ====================================================================
        // POSTING VALIDATIONS
        // ====================================================================

        /// <summary>
        /// Validate account can post transactions (must be leaf and active)
        /// </summary>
        Task ValidateCanPostAsync(string acctCode, int branchId, List<COA> allAccounts);

        /// <summary>
        /// Validate account is not locked
        /// </summary>
        Task ValidateNotLockedAsync(COA account);

        // ====================================================================
        // CONTROL ACCOUNT VALIDATIONS
        // ====================================================================

        /// <summary>
        /// Validate control account setup
        /// </summary>
        Task ValidateControlAccountAsync(COA account, List<COA> allAccounts);

        /// <summary>
        /// Validate detail account belongs to correct control account
        /// </summary>
        Task ValidateDetailAccountAsync(int? controlAccountId, int branchId, List<COA> allAccounts);

        // ====================================================================
        // BRANCH VALIDATIONS
        // ====================================================================

        /// <summary>
        /// Validate user has access to branch
        /// </summary>
        Task ValidateBranchAccessAsync(int userBranchId, int accountBranchId);

        /// <summary>
        /// Validate account belongs to branch
        /// </summary>
        Task ValidateAccountBelongsToBranchAsync(int accountId, int branchId, List<COA> allAccounts);

        // ====================================================================
        // CODE GENERATION VALIDATIONS
        // ====================================================================

        /// <summary>
        /// Validate code range is not exhausted
        /// </summary>
        Task ValidateCodeRangeNotExhaustedAsync(string? parentCode, int branchId, List<COA> allAccounts);
    }
}
