using WMS.Api.DTOs.COA;

namespace WMS.Api.Services.Interfaces
{
    /// <summary>
    /// Service for dynamic account group management
    /// No hardcoded paths - everything configurable
    /// </summary>
    public interface IAccountGroupService
    {
        // ====================================================================
        // ACCOUNT RETRIEVAL BY GROUP
        // ====================================================================

        /// <summary>
        /// Get all supplier accounts (Accounts Payable)
        /// </summary>
        Task<List<AccountGroupDto>> GetSupplierAccountsAsync(int branchId);

        /// <summary>
        /// Get all customer accounts (Accounts Receivable)
        /// </summary>
        Task<List<AccountGroupDto>> GetCustomerAccountsAsync(int branchId);

        /// <summary>
        /// Get all bank accounts
        /// </summary>
        Task<List<AccountGroupDto>> GetBankAccountsAsync(int branchId);

        /// <summary>
        /// Get all cash accounts
        /// </summary>
        Task<List<AccountGroupDto>> GetCashAccountsAsync(int branchId);

        /// <summary>
        /// Get accounts by custom group code
        /// </summary>
        Task<List<AccountGroupDto>> GetAccountsByGroupCodeAsync(string groupCode, int branchId);

        /// <summary>
        /// Get accounts by account type (Asset, Liability, etc.)
        /// </summary>
        Task<List<AccountGroupDto>> GetAccountsByTypeAsync(string accountType, int branchId);

        // ====================================================================
        // GROUP CONFIGURATION MANAGEMENT
        // ====================================================================

        /// <summary>
        /// Get all configured account groups
        /// </summary>
        Task<List<AccountGroupConfigDto>> GetAllGroupsAsync(int? branchId = null);

        /// <summary>
        /// Get group configuration by code
        /// </summary>
        Task<AccountGroupConfigDto?> GetGroupByCodeAsync(string groupCode);

        /// <summary>
        /// Create new account group
        /// </summary>
        Task<AccountGroupConfigDto> CreateGroupAsync(CreateAccountGroupDto dto, string user);

        /// <summary>
        /// Update account group
        /// </summary>
        Task UpdateGroupAsync(UpdateAccountGroupDto dto, string user);

        /// <summary>
        /// Delete account group
        /// </summary>
        Task DeleteGroupAsync(string groupCode, string user);

        /// <summary>
        /// Get accounts in a group by range
        /// </summary>
        Task<List<AccountGroupDto>> GetAccountsByRangeAsync(string minCode, string maxCode, int branchId);

        // ====================================================================
        // DYNAMIC PATH RESOLUTION
        // ====================================================================

        /// <summary>
        /// Resolve group code to actual account codes
        /// </summary>
        Task<List<string>> ResolveGroupToAccountCodesAsync(string groupCode, int branchId);

        /// <summary>
        /// Get control account for a group
        /// </summary>
        Task<COADto?> GetControlAccountForGroupAsync(string groupCode, int branchId);

        /// <summary>
        /// Check if account belongs to a group
        /// </summary>
        Task<bool> IsAccountInGroupAsync(string acctCode, string groupCode, int branchId);
    }

    // ====================================================================
    // DTOs
    // ====================================================================

    /// <summary>
    /// Account group DTO
    /// </summary>
    public class AccountGroupDto
    {
        public int acctID { get; set; }
        public string AcctCode { get; set; } = null!;
        public string AcctName { get; set; } = null!;
        public string? AcctType { get; set; }
        public string? GroupCode { get; set; }
        public string? GroupName { get; set; }
        public decimal? Balance { get; set; }
        public bool IsActive { get; set; }
    }

    /// <summary>
    /// Account group configuration DTO
    /// </summary>
    public class AccountGroupConfigDto
    {
        public int GroupID { get; set; }
        public string GroupCode { get; set; } = null!;
        public string GroupName { get; set; } = null!;
        public string ReportType { get; set; } = null!;
        public string GroupType { get; set; } = null!;
        public int DisplayOrder { get; set; }
        public string? MinAccountCode { get; set; }
        public string? MaxAccountCode { get; set; }
        public string? Formula { get; set; }
        public bool IsActive { get; set; }
        public bool IsSystem { get; set; }
        public List<AccountGroupConfigDto>? Children { get; set; }
    }

    /// <summary>
    /// Create account group DTO
    /// </summary>
    public class CreateAccountGroupDto
    {
        public string GroupCode { get; set; } = null!;
        public string GroupName { get; set; } = null!;
        public string ReportType { get; set; } = "BS";
        public string GroupType { get; set; } = "REPORT";
        public int DisplayOrder { get; set; } = 0;
        public string? MinAccountCode { get; set; }
        public string? MaxAccountCode { get; set; }
        public string? ParentGroupCode { get; set; }
        public string? Formula { get; set; }
    }

    /// <summary>
    /// Update account group DTO
    /// </summary>
    public class UpdateAccountGroupDto
    {
        public string GroupCode { get; set; } = null!;
        public string? GroupName { get; set; }
        public int? DisplayOrder { get; set; }
        public string? MinAccountCode { get; set; }
        public string? MaxAccountCode { get; set; }
        public bool? IsActive { get; set; }
    }
}