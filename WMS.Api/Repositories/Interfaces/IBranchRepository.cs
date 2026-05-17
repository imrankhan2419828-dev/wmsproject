using WMS.Api.Models;

namespace WMS.Api.Repositories.Interfaces
{
    public interface IBranchRepository
    {
        Task<IEnumerable<Branch>> GetAllAsync();
        Task<Branch> GetByIdAsync(int id);
        Task<Branch> CreateAsync(Branch branch);
        Task<Branch> UpdateAsync(Branch branch);
        Task<bool> DeleteAsync(int id);
    }
}

