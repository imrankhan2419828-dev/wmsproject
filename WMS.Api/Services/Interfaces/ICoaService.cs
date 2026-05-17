using WMS.Api.DTOs.COA;

namespace WMS.Api.Services.Interfaces
{
    public interface ICoaService
    {
        // Tree operations
        Task<List<COADto>> GetTreeAsync(int branchId);
        Task<COADto?> GetAccountByIdAsync(int id, int branchId);

        // CRUD operations
        Task<int> CreateAccountAsync(COACreateDto dto, int branchId, string user);
        Task UpdateAccountAsync(COAUpdateDto dto, int branchId, string user);
        Task DeleteAccountAsync(int accountId, int branchId, string user);

        // Step configuration
        Task<COAStepConfigDto> GetStepConfigAsync(int step, string? parentCode, int branchId);
        Task<List<object>> GetParentOptionsAsync(int? level, string? acctType, string? category, int branchId);

        // Category-based queries (for dropdowns)
        Task<List<COADto>> GetCustomersAsync(int branchId);
        Task<List<COADto>> GetSuppliersAsync(int branchId);
        Task<List<COADto>> GetBankAccountsAsync(int branchId);
        Task<List<COADto>> GetExpenseAccountsAsync(int branchId);
        Task<List<COADto>> GetOtherAccountsAsync(int branchId);

        // Validation
        Task<bool> ValidateAccountCodeAsync(string acctCode, int branchId);
        Task<bool> ValidateAccountNameAsync(string parentCode, string acctName, int branchId, int? excludeId = null);

        // Helper methods
        Task<List<COADto>> GetControlAccountsByLevelAsync(int level, int branchId);
    }
}