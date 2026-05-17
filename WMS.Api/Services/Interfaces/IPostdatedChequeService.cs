using System.Collections.Generic;
using System.Threading.Tasks;
using WMS.Api.DTOs.PostdatedCheque;
using WMS.Api.DTOs.Receiving;

namespace WMS.Api.Services.Interfaces
{
    public interface IPostdatedChequeService
    {
        // CRUD Operations
        Task<int> CreateAsync(PostdatedChequeCreateDto dto, int userId, int branchId);
        Task<PostdatedChequeReadDto?> GetByIdAsync(int id);
        Task<List<PostdatedChequeListDto>> GetAllAsync(int branchId, string? status = null);
        Task<bool> UpdateStatusAsync(int id, ChequeStatusUpdateDto dto, int userId);
        Task<bool> DeleteAsync(int id);
        Task<bool> UpdateAsync(int id, PostdatedChequeCreateDto dto, int userId);
        // Special Operations
        Task<bool> DepositChequeAsync(int id, DateTime depositDate, int userId);
        Task<bool> ClearChequeAsync(int id, int userId);
        Task<bool> BounceChequeAsync(int id, string reason, int userId);
        Task<bool> CancelChequeAsync(int id, string reason, int userId);
        Task<List<COAAccountDto>> GetAccountsByTypeAsync(int branchId, string type);
        // Auto-posting
        Task<int> ProcessDueChequesAsync(int branchId);

        // Reports & Summary
        Task<ChequeSummaryDto> GetSummaryAsync(int branchId);
        Task<List<PostdatedChequeListDto>> GetChequesByDateRangeAsync(int branchId, DateTime fromDate, DateTime toDate);
        Task<List<PostdatedChequeListDto>> GetChequesBySourceAsync(int branchId, string sourceType, int sourceId);
    }
}
