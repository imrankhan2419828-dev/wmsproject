using WMS.Api.Models;

namespace WMS.Api.Repositories.Interfaces
{
    public interface ICoaRepository
    {
        // Basic CRUD
        Task<List<COA>> GetByBranchAsync(int branchId);
        Task<COA?> GetByIdAsync(int id);
        Task<COA?> GetByIdAndBranchAsync(int id, int branchId);
        Task<COA?> GetByCodeAsync(string acctCode, int branchId);
        Task AddAsync(COA entity);
        Task UpdateAsync(COA entity);
        Task DeleteAsync(COA entity);
        Task UpdateRangeAsync(List<COA> entities);

        // Hierarchy methods
        Task<List<COA>> GetChildrenAsync(string parentCode, int branchId);
        Task<List<COA>> GetRootAccountsAsync(int branchId);
        Task<List<COA>> GetByLevelAsync(int level, int branchId);
        Task<List<COA>> GetByParentLevelAsync(int parentLevel, int branchId);
        Task<List<COA>> GetControlAccountsByLevelAsync(int level, int branchId);

        // Validation methods
        Task<bool> HasTransactionsAsync(int accountId);
        Task<bool> HasChildrenAsync(int accountId);
        Task<bool> IsDuplicateNameAsync(string parentCode, string acctName, int branchId, int? excludeId = null);
        Task<bool> IsDuplicateCodeAsync(string acctCode, int branchId);

        // Code generation
        Task<string> GenerateNextCodeAsync(string? parentCode, int branchId);
        Task<int> GetNextSortOrderAsync(string? parentCode, int branchId);

        // Parent flag management
        Task UpdateParentLastFlagAsync(string parentCode, int branchId);

        // Category methods
        Task<List<COA>> GetAccountsByCategoryAsync(string category, int branchId);

        // Path update
        Task UpdatePathAsync(int accountId);

        Task<int> GetCodeLengthAsync(int branchId, int levelNo);
    }
}