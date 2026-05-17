using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WMS.API.Modules.Reports.SupplierBalancing.DTOs;

namespace WMS.API.Modules.Reports.SupplierBalancing.Interfaces
{
    public interface ISupplierBalancingService
    {
        Task<SupplierBalancingResponseDto> GetSupplierBalancingAsync(
            DateTime fromDate,
            DateTime toDate,
            int supplierId,
            int branchId);

        Task<List<SupplierDropdownDto>> GetSuppliersAsync(int branchId);
    }
}