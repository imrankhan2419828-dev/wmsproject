using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using WMS.API.Modules.Reports.PurchaseReturn.Interfaces;

namespace WMS.API.Modules.Reports.PurchaseReturn
{
    [Route("api/reports/purchase-return")]
    [ApiController]
    public class PurchaseReturnReportController : ControllerBase
    {
        private readonly IPurchaseReturnReportService _service;

        public PurchaseReturnReportController(IPurchaseReturnReportService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetPurchaseReturnReport(
            DateTime fromDate,
            DateTime toDate,
            int? supplierId,
            int? itemId)
        {
            try
            {
                var data = await _service.GetPurchaseReturnReportAsync(
                    fromDate,
                    toDate,
                    supplierId,
                    itemId);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("suppliers")]
        public async Task<IActionResult> GetSuppliers()
        {
            try
            {
                var data = await _service.GetSuppliersAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("items")]
        public async Task<IActionResult> GetItems()
        {
            try
            {
                var data = await _service.GetItemsAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }


    }
}
