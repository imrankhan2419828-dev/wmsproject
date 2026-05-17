using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WMS.API.Modules.Reports.PurchaseReturn.DTOs;

namespace WMS.API.Modules.Reports.PurchaseReturn.Interfaces
{
    public interface IPurchaseReturnReportService
    {
        Task<List<PurchaseReturnReportDto>> GetPurchaseReturnReportAsync(
            DateTime fromDate,
            DateTime toDate,
            int? supplierId,
            int? itemId);

        Task<List<DropdownDto>> GetSuppliersAsync();
        Task<List<DropdownDto>> GetItemsAsync();
    }
}
