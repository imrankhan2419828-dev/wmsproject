using WMS.Api.Modules.Reports.Purchase.DTOs;
using WMS.API.Modules.Reports.Purchase.DTOs;

namespace WMS.API.Modules.Reports.Purchase.Interfaces
{
    public interface IPurchaseReportService
    {
        Task<List<PurchaseSummaryDto>> GetPurchaseSummaryAsync(
            DateTime fromDate,
            DateTime toDate,
            int? branchId);


        // 🔥 ADD THIS METHOD
        Task<List<PurchaseDetailDto>> GetPurchaseDetailAsync(
            DateTime fromDate,
            DateTime toDate,
            int? supplierId,
            int? itemId);

        Task<List<DropdownDto>> GetSuppliersAsync(int branchId);
        Task<List<DropdownDto>> GetItemsAsync(int branchId);

        

    }
}
