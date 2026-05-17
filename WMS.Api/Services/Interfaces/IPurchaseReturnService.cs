using System.Collections.Generic;
using System.Threading.Tasks;
using WMS.Api.DTOs.PurchaseReturn;

namespace WMS.Api.Services.Interfaces
{
    public interface IPurchaseReturnService
    {
        Task<List<PurchaseReturnDto>> GetAllAsync(int branchId);
        Task<PurchaseReturnDto> GetByIdAsync(int returnId, int branchId);
        Task<PurchaseReturnDto> CreateAsync(PurchaseReturnDto dto, int userId, int branchId);
        Task<PurchaseReturnDto> UpdateAsync(int returnId, PurchaseReturnDto dto, int userId, int branchId);
        Task<bool> DeleteAsync(int returnId, int branchId);
        Task<List<PurchaseReturnPurchaseDto>> GetOpenPurchases(int branchId);
        Task<PurchaseReturnDto> GetPurchaseItemsForReturn(int tranNumb, int branchId);
        Task<string> GenerateReturnBillNumberAsync(int branchId);
    }
}