using WMS.Api.DTOs.Workshop;

namespace WMS.Api.Services.Interfaces
{
    public interface IJobCardService
    {
        Task<IEnumerable<JobCardDto>> GetAllAsync(int branchId, string? status = null);
        Task<JobCardDto?> GetByIdAsync(int id, int branchId);
        Task<JobCardDto> CreateAsync(JobCardCreateDto dto, int userId, int branchId);
        Task<JobCardDto?> UpdateAsync(int id, JobCardUpdateDto dto, int userId, int branchId);
        Task<bool> UpdateStatusAsync(int id, JobCardStatusUpdateDto dto, int userId, int branchId);
        Task<bool> DeleteAsync(int id, int branchId);
        Task<IEnumerable<JobCardDto>> GetByVehicleAsync(int vehicleId, int branchId);
        Task<IEnumerable<JobCardDto>> GetByCustomerAsync(int customerId, int branchId);
        Task<IEnumerable<JobCardDto>> GetByDateRangeAsync(DateTime fromDate, DateTime toDate, int branchId);
        Task<JobCardDto?> AddServiceAsync(int jobCardId, JobServiceCreateDto dto, int userId, int branchId);
        Task<bool> RemoveServiceAsync(int jobCardId, int serviceId, int branchId);
        Task<JobCardDto?> AddPartAsync(int jobCardId, JobPartCreateDto dto, int userId, int branchId);
        Task<bool> RemovePartAsync(int jobCardId, int partId, int branchId);
        Task<byte[]> GenerateJobCardPdfAsync(int jobCardId, int branchId);
        Task<string> GenerateJobCardNumberAsync(int branchId);
    }
}