using System.Collections.Generic;
using System.Threading.Tasks;
using WMS.Api.DTOs.SaleReturns;

namespace WMS.Api.Services.Interfaces
{
    public interface ISaleReturnService
    {
        Task<List<SaleReturnListDto>> GetAllReturnsAsync(int branchId);
        Task<SaleReturnCreateDto?> GetReturnByTranNumbAsync(int returnTranNumb, int branchId);
        Task<SaleReturnCreateDto> GetSaleItemsForReturnAsync(int saleTranNumb, int branchId);
        Task<List<SalesForReturnDto>> GetOpenSalesAsync(int branchId);
        Task<int> CreateReturnAsync(SaleReturnCreateDto dto, int userId, int branchId);
        Task<bool> DeleteReturnAsync(int returnTranNumb, int branchId);
        Task<string> GenerateReturnBillNumberAsync(int branchId);

        
    }
}