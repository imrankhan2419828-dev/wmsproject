using WMS.Api.Models;

namespace WMS.Api.Repositories.Interfaces
{
    public interface IPurchaseRepository
    {
        Task<PurcFile> CreateAsync(PurcFile master, List<PurcFild> details);
        Task UpdateAsync(PurcFile master, List<PurcFild> details);
        Task DeleteAsync(int tranNumb);
        Task<PurcFile?> GetByIdAsync(int tranNumb);
        Task<List<PurcFile>> GetAllAsync(int branchId);
        Task<string> GenerateBillNumberAsync(int branchId);
    }
}