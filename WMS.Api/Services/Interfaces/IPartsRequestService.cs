using WMS.Api.DTOs.Workshop;

namespace WMS.Api.Services.Interfaces.Workshop
{
    public interface IPartsRequestService
    {
        Task<IEnumerable<PartsRequestDto>> GetAllAsync(int branchId, string? status = null);
        Task<PartsRequestDto?> GetByIdAsync(int id, int branchId);
        Task<PartsRequestDto> CreateAsync(PartsRequestCreateDto dto, int userId, int branchId);
        Task<PartsRequestDto?> UpdateAsync(int id, PartsRequestUpdateDto dto, int userId, int branchId);
        Task<PartsRequestDto?> ApproveAsync(int id, PartsRequestApproveDto dto, int userId, int branchId);
        Task<PartsRequestDto?> ReceiveAsync(int id, decimal actualCost, int userId, int branchId);
        Task<PartsRequestDto?> CancelAsync(int id, string reason, int userId, int branchId);
        Task<bool> DeleteAsync(int id, int branchId);
        Task<IEnumerable<LowStockAlertDto>> GetLowStockAlertsAsync(int branchId, string? status = null);
        Task<IEnumerable<PartsRequestDto>> GetByJobCardAsync(int jobCardId, int branchId);
        Task<PartsRequestDto?> LinkToPurchaseOrderAsync(int id, int purchaseOrderId, int userId, int branchId);
    }
}