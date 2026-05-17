using WMS.Api.DTOs.Workshop;

namespace WMS.Api.Services.Interfaces
{
    public interface IVehicleService
    {
        Task<IEnumerable<VehicleDto>> GetAllAsync(int branchId);
        Task<VehicleDto?> GetByIdAsync(int id, int branchId);
        Task<VehicleDto> CreateAsync(VehicleCreateDto dto, int userId, int branchId);
        Task<VehicleDto?> UpdateAsync(int id, VehicleUpdateDto dto, int userId, int branchId);
        Task<bool> DeleteAsync(int id, int branchId);
        Task<IEnumerable<VehicleDto>> GetByCustomerAsync(int customerId, int branchId);
        Task<IEnumerable<VehicleDto>> SearchAsync(string searchTerm, int branchId);
    }
}