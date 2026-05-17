using WMS.Api.DTOs.Workshop;

namespace WMS.Api.Services.Interfaces
{
    public interface IServiceCatalogService
    {
        Task<IEnumerable<ServiceCatalogDto>> GetAllAsync();
        Task<ServiceCatalogDto?> GetByIdAsync(int id);
        Task<ServiceCatalogDto> CreateAsync(ServiceCatalogCreateDto dto, int userId);
        Task<ServiceCatalogDto?> UpdateAsync(int id, ServiceCatalogUpdateDto dto, int userId);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<ServiceCatalogDto>> GetByCategoryAsync(string category);
        Task<IEnumerable<ServiceCatalogDto>> SearchAsync(string searchTerm);
        Task<IEnumerable<string>> GetCategoriesAsync();
    }
}
