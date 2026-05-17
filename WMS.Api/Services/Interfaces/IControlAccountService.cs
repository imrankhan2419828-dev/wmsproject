using WMS.Api.DTOs.COA;

namespace WMS.Api.Services.Interfaces
{
    /// <summary>
    /// Service for managing control accounts and their detail accounts
    /// Control Account = Parent account that aggregates balances of child detail accounts
    /// </summary>
    public interface IControlAccountService
    {
        // ====================================================================
        // CONTROL ACCOUNT MANAGEMENT
        // ====================================================================

        /// <summary>
        /// Get all control accounts for a branch
        /// </summary>
        Task<List<ControlAccountDto>> GetControlAccountsAsync(int branchId);

        /// <summary>
        /// Get control account by ID with details
        /// </summary>
        Task<ControlAccountDetailDto?> GetControlAccountByIdAsync(int controlAccountId, int branchId);

        /// <summary>
        /// Get control account by code
        /// </summary>
        Task<ControlAccountDetailDto?> GetControlAccountByCodeAsync(string acctCode, int branchId);

        /// <summary>
        /// Convert regular account to control account
        /// </summary>
        Task<ControlAccountDto> ConvertToControlAccountAsync(int accountId, int branchId, string user);

        /// <summary>
        /// Convert control account to regular account
        /// </summary>
        Task<ControlAccountDto> ConvertToRegularAccountAsync(int accountId, int branchId, string user);

        // ====================================================================
        // DETAIL ACCOUNT MANAGEMENT
        // ====================================================================

        /// <summary>
        /// Get all detail accounts under a control account
        /// </summary>
        Task<List<DetailAccountDto>> GetDetailAccountsAsync(int controlAccountId, int branchId);

        /// <summary>
        /// Add detail account to control account
        /// </summary>
        Task<DetailAccountDto> AddDetailAccountAsync(int controlAccountId, CreateDetailAccountDto dto, int branchId, string user);

        /// <summary>
        /// Remove detail account from control account (but keep account)
        /// </summary>
        Task RemoveDetailAccountAsync(int detailAccountId, int branchId, string user);

        /// <summary>
        /// Check if account can be added as detail to control account
        /// </summary>
        Task<bool> CanBeDetailAccountAsync(int accountId, int controlAccountId, int branchId);

        // ====================================================================
        // BALANCE AGGREGATION
        // ====================================================================

        /// <summary>
        /// Get control account balance (sum of all detail accounts)
        /// </summary>
        Task<decimal> GetControlAccountBalanceAsync(int controlAccountId, int branchId, DateTime? asOnDate = null);

        /// <summary>
        /// Get all detail account balances
        /// </summary>
        Task<List<DetailAccountBalanceDto>> GetDetailAccountBalancesAsync(int controlAccountId, int branchId, DateTime? asOnDate = null);

        /// <summary>
        /// Get control account aging report (for AR/AP)
        /// </summary>
        Task<AgingReportDto> GetAgingReportAsync(int controlAccountId, int branchId, DateTime asOnDate);

        /// <summary>
        /// Sync control account balance (recalculate from details)
        /// </summary>
        Task<decimal> SyncControlAccountBalanceAsync(int controlAccountId, int branchId);

        // ====================================================================
        // VALIDATION
        // ====================================================================

        /// <summary>
        /// Validate detail account belongs to control account
        /// </summary>
        Task<bool> ValidateDetailAccountBelongsToControlAsync(int detailAccountId, int controlAccountId, int branchId);

        /// <summary>
        /// Validate control account has no direct transactions
        /// </summary>
        Task<bool> ValidateControlAccountNoDirectTransactionsAsync(int controlAccountId, int branchId);

        /// <summary>
        /// Get control account type (AR, AP, etc.)
        /// </summary>
        Task<string> GetControlAccountTypeAsync(int controlAccountId, int branchId);
    }

    // ====================================================================
    // DTOs
    // ====================================================================

    /// <summary>
    /// Control account DTO
    /// </summary>
    public class ControlAccountDto
    {
        public int acctID { get; set; }
        public string AcctCode { get; set; } = null!;
        public string AcctName { get; set; } = null!;
        public string AcctType { get; set; } = null!;
        public string ControlAccountType { get; set; } = null!; // AR, AP, BANK, etc.
        public int DetailAccountsCount { get; set; }
        public decimal TotalBalance { get; set; }
        public bool IsActive { get; set; }
    }

    /// <summary>
    /// Control account detail DTO
    /// </summary>
    public class ControlAccountDetailDto : ControlAccountDto
    {
        public List<DetailAccountDto> DetailAccounts { get; set; } = new();
        public DateTime? LastSyncedOn { get; set; }
        public decimal? LastSyncedBalance { get; set; }
    }

    /// <summary>
    /// Detail account DTO
    /// </summary>
    public class DetailAccountDto
    {
        public int acctID { get; set; }
        public string AcctCode { get; set; } = null!;
        public string AcctName { get; set; } = null!;
        public string? NTNNo { get; set; }
        public string? STRNo { get; set; }
        public decimal? CreditLimit { get; set; }
        public decimal CurrentBalance { get; set; }
        public bool IsActive { get; set; }
        public bool StopSale { get; set; }
        public string? StopReason { get; set; }
        public DateTime? LastTransactionDate { get; set; }
    }

    /// <summary>
    /// Create detail account DTO
    /// </summary>
    public class CreateDetailAccountDto
    {
        public string AcctName { get; set; } = null!;
        public string? AcctDesc { get; set; }
        public decimal? OpenAmnt { get; set; }
        public decimal? CreditLimit { get; set; }
        public string? NTNNo { get; set; }
        public string? STRNo { get; set; }
        public bool? Active { get; set; } = true;
    }

    /// <summary>
    /// Detail account balance DTO
    /// </summary>
    public class DetailAccountBalanceDto
    {
        public int acctID { get; set; }
        public string AcctCode { get; set; } = null!;
        public string AcctName { get; set; } = null!;
        public decimal OpeningBalance { get; set; }
        public decimal TotalDebit { get; set; }
        public decimal TotalCredit { get; set; }
        public decimal ClosingBalance { get; set; }
        public string BalanceSide => ClosingBalance >= 0 ? "Dr" : "Cr";
    }

    /// <summary>
    /// Aging report DTO
    /// </summary>
    public class AgingReportDto
    {
        public int ControlAccountId { get; set; }
        public string ControlAccountName { get; set; } = null!;
        public DateTime AsOnDate { get; set; }
        public List<AgingBucketDto> AgingBuckets { get; set; } = new();
        public decimal TotalOutstanding { get; set; }
    }

    /// <summary>
    /// Aging bucket DTO
    /// </summary>
    public class AgingBucketDto
    {
        public string BucketName { get; set; } = null!; // Current, 1-30 Days, 31-60 Days, etc.
        public int DaysFrom { get; set; }
        public int DaysTo { get; set; }
        public decimal Amount { get; set; }
        public List<AgingDetailDto> Details { get; set; } = new();
    }

    /// <summary>
    /// Aging detail DTO
    /// </summary>
    public class AgingDetailDto
    {
        public int DetailAccountId { get; set; }
        public string AccountCode { get; set; } = null!;
        public string AccountName { get; set; } = null!;
        public decimal Amount { get; set; }
        public DateTime? LastTransactionDate { get; set; }
    }
}
