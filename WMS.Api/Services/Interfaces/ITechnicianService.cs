using WMS.Api.DTOs.Workshop;

namespace WMS.Api.Services.Interfaces
{
    public interface ITechnicianService
    {
        Task<IEnumerable<TechnicianDto>> GetAllAsync(int branchId);
        Task<TechnicianDto?> GetByIdAsync(int id, int branchId);
        Task<TechnicianDto> CreateAsync(TechnicianCreateDto dto, int userId, int branchId);
        Task<TechnicianDto?> UpdateAsync(int id, TechnicianUpdateDto dto, int userId, int branchId);
        Task<bool> DeleteAsync(int id, int branchId);
        Task<IEnumerable<TechnicianDto>> GetAvailableTechniciansAsync(int branchId, DateTime? date = null);
        Task<IEnumerable<TechnicianDto>> GetBySpecializationAsync(string specialization, int branchId);
        Task<IEnumerable<TechnicianDto>> SearchAsync(string searchTerm, int branchId);
        Task<IEnumerable<TechnicianDto>> GetTechniciansForJobAsync(int jobId, int branchId);
    }
}