using WMS.Api.DTOs.Branch;

namespace WMS.Api.Services.Interfaces
{
    public interface IBranchService
    {
        Task<IEnumerable<BranchDto>> GetAllAsync();
        Task<BranchDto> GetByIdAsync(int id);
        Task<BranchDto> CreateAsync(BranchDto dto);
        Task<BranchDto> UpdateAsync(int id, BranchDto dto);
        Task<bool> DeleteAsync(int id);
    }
}

