using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WMS.API.Modules.Reports.SalesReturn.DTOs;

namespace WMS.API.Modules.Reports.SalesReturn.Interfaces
{
    public interface ISalesReturnReportService
    {
        Task<SalesReturnReportResponseDto> GetSalesReturnReportAsync(
            DateTime fromDate,
            DateTime toDate,
            int? customerId,
            int? itemId);

        Task<List<DropdownDto>> GetCustomersAsync();
        Task<List<DropdownDto>> GetItemsAsync();
    }
}