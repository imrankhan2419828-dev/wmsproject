using WMS.Api.DTOs.Subcategory;

namespace WMS.Api.Services.Interfaces
{
    public interface ISubcategoryService
    {
        List<SubcategoryListDto> GetAll(int branchId);
        List<SubcategoryListDto> GetByCategory(int catgId, int branchId);
        Task<int> CreateAsync(SubcategoryCreateDto dto, int userId, int branchId);
        Task<SubcategoryCreateDto?> GetByIdAsync(int id);
        Task<bool> UpdateAsync(int id, SubcategoryCreateDto dto, int userId);
        Task<bool> DeleteAsync(int id);
        List<SubcategoryListDto> GetByCategoryAndCompany(int catgId, int companyId, int branchId);
    }
}