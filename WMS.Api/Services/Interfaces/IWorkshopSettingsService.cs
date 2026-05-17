using WMS.Api.DTOs.Workshop;

namespace WMS.Api.Services.Interfaces.Workshop
{
    public interface IWorkshopSettingsService
    {
        Task<WorkshopSettingsDto?> GetSettingsAsync(int branchId);
        Task<WorkshopSettingsDto> CreateSettingsAsync(WorkshopSettingsCreateDto dto, int userId);
        Task<WorkshopSettingsDto?> UpdateSettingsAsync(int id, WorkshopSettingsUpdateDto dto, int userId);
        Task<CapacityCheckResultDto> CheckBookingCapacityAsync(DateTime date, int branchId);
        Task<bool> IsTechnicianAvailableAsync(int technicianId, DateTime date, int branchId);
    }
}