using Microsoft.AspNetCore.Mvc;
using WMS.API.Modules.Reports.Purchase.Interfaces;
using WMS.API.Modules.Reports.Purchase.Services;

namespace WMS.API.Modules.Reports.Purchase
{
    [Route("api/reports/purchase")]
    [ApiController]
    public class PurchaseReportController : ControllerBase
    {
        private readonly IPurchaseReportService _service;

        public PurchaseReportController(IPurchaseReportService service)
        {
            _service = service;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary(
            DateTime fromDate,
            DateTime toDate,
            int? branchId)
        {
            var data = await _service.GetPurchaseSummaryAsync(
                fromDate,
                toDate,
                branchId);

            return Ok(data);
        }

        [HttpGet("detail")]
        public async Task<IActionResult> GetPurchaseDetail(
    DateTime fromDate,
    DateTime toDate,
    int? supplierId,
    int? itemId)
        {
            try
            {
                var result = await _service
                    .GetPurchaseDetailAsync(fromDate, toDate, supplierId, itemId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.ToString());   // 🔥 FULL ERROR MESSAGE
            }
        }

        [HttpGet("suppliers")]
        public async Task<IActionResult> GetSuppliers(int branchId)
        {
            var result = await _service.GetSuppliersAsync(branchId);
            return Ok(result);
        }

        [HttpGet("items")]
        public async Task<IActionResult> GetItems(int branchId)
        {
            var result = await _service.GetItemsAsync(branchId);
            return Ok(result);
        }


        

    }
}

