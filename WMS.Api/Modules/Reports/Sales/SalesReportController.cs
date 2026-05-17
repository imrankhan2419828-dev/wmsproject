using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using WMS.API.Modules.Reports.Sales.Interfaces;

namespace WMS.API.Modules.Reports.Sales
{
    [Route("api/reports/sales")]
    [ApiController]
    public class SalesReportController : ControllerBase
    {
        private readonly ISalesReportService _service;

        public SalesReportController(ISalesReportService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetSalesReport(
            DateTime fromDate,
            DateTime toDate,
            int? customerId,
            int? itemId)
        {
            try
            {
                var data = await _service.GetSalesReportAsync(
                    fromDate,
                    toDate,
                    customerId,
                    itemId);

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("customers")]
        public async Task<IActionResult> GetCustomers()
        {
            try
            {
                var data = await _service.GetCustomersAsync();
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
