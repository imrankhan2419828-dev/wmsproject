using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WMS.API.Modules.Reports.Sales.DTOs;

namespace WMS.API.Modules.Reports.Sales.Interfaces
{
    public interface ISalesReportService
    {
        Task<SalesReportResponseDto> GetSalesReportAsync(
            DateTime fromDate,
            DateTime toDate,
            int? customerId,
            int? itemId);

        Task<List<DropdownDto>> GetCustomersAsync();
        Task<List<DropdownDto>> GetItemsAsync();
    }
}
