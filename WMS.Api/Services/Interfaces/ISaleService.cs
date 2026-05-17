// File: WMS.Api/Services/Interfaces/ISaleService.cs

using WMS.Api.DTOs.Sales;

namespace WMS.Api.Services.Interfaces
{
    public interface ISaleService
    {
        List<SaleListDto> GetAll(int branchId);
        Task<int> CreateSaleAsync(SaleCreateDto dto, int userId, int branchId);
        Task<SaleCreateDto?> GetSaleByTranNumb(int tranNumb);
        Task<bool> UpdateSaleAsync(int tranNumb, SaleCreateDto dto);
        Task<bool> DeleteSaleAsync(int tranNumb);

        // Add this method to interface
        Task<int> CreateVoucherForExistingSaleAsync(int tranNumb, int userId, int branchId);
    }
}

