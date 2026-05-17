using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using WMS.API.Modules.Reports.SupplierBalancing.Interfaces;

namespace WMS.API.Modules.Reports.SupplierBalancing
{
    [Route("api/reports/supplier-balancing")]
    [ApiController]
    public class SupplierBalancingController : ControllerBase
    {
        private readonly ISupplierBalancingService _service;

        public SupplierBalancingController(ISupplierBalancingService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetSupplierBalancing(
            DateTime fromDate,
            DateTime toDate,
            int supplierId,
            int branchId)
        {
            try
            {
                if (supplierId <= 0)
                    return BadRequest(new { error = "Supplier ID is required" });

                if (branchId <= 0)
                    return BadRequest(new { error = "Branch ID is required" });

                var result = await _service
                    .GetSupplierBalancingAsync(fromDate, toDate, supplierId, branchId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("suppliers")]
        public async Task<IActionResult> GetSuppliers(int branchId)
        {
            try
            {
                if (branchId <= 0)
                    return BadRequest(new { error = "Branch ID is required" });

                var result = await _service.GetSuppliersAsync(branchId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}