using WMS.Api.DTOs.Workshop;

namespace WMS.Api.Services.Interfaces.Workshop
{
    public interface ITechnicianTimeLogService
    {
        Task<IEnumerable<TechnicianTimeLogDto>> GetAllAsync(int branchId, DateTime? date = null);
        Task<TechnicianTimeLogDto?> GetByIdAsync(int id, int branchId);
        Task<TechnicianTimeLogDto> ClockInAsync(TechnicianTimeLogCreateDto dto, int userId, int branchId);
        Task<TechnicianTimeLogDto?> ClockOutAsync(int id, int userId, int branchId);
        Task<TechnicianTimeLogDto?> StartBreakAsync(int id, int userId, int branchId);
        Task<TechnicianTimeLogDto?> EndBreakAsync(int id, int userId, int branchId);
        Task<TechnicianTimeLogDto?> UpdateAsync(int id, TechnicianTimeLogUpdateDto dto, int userId, int branchId);
        Task<bool> DeleteAsync(int id, int branchId);
        Task<IEnumerable<TechnicianWorkloadDto>> GetTechnicianWorkloadAsync(int branchId, DateTime? date = null);
        Task<TechnicianTimeLogDto?> GetCurrentStatusAsync(int technicianId, int branchId);
        Task<IEnumerable<TechnicianTimeLogDto>> GetTechnicianLogsAsync(int technicianId, int branchId, DateTime? fromDate = null, DateTime? toDate = null);

        Task<IEnumerable<TechnicianEngagementDto>> GetTechnicianEngagementStatusAsync(int branchId);
    }
}