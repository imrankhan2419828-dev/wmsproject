using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.Reports;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : BaseController
    {
        private readonly IReportService _reportService;

        public ReportController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("general-ledger")]
        public async Task<IActionResult> GetGeneralLedger([FromQuery] ReportFilterDto filter)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _reportService.GetGeneralLedgerAsync(filter, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("trial-balance")]
        public async Task<IActionResult> GetTrialBalance([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _reportService.GetTrialBalanceAsync(fromDate, toDate, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("customer-statement")]
        public async Task<IActionResult> GetCustomerStatement([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate, [FromQuery] int? customerId = null)
        {
            try { return Ok(CreateResponse(await _reportService.GetCustomerStatementAsync(fromDate, toDate, customerId, GetCurrentBranchId()))); }
            catch (Exception ex) { return StatusCode(500, CreateErrorResponse(ex.Message)); }
        }

        [HttpGet("supplier-statement")]
        public async Task<IActionResult> GetSupplierStatement([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate, [FromQuery] int? supplierId = null)
        {
            try { return Ok(CreateResponse(await _reportService.GetSupplierStatementAsync(fromDate, toDate, supplierId, GetCurrentBranchId()))); }
            catch (Exception ex) { return StatusCode(500, CreateErrorResponse(ex.Message)); }
        }


        [HttpGet("purchase-report")]
        public async Task<IActionResult> GetPurchaseReport(
    [FromQuery] DateTime fromDate, [FromQuery] DateTime toDate,
    [FromQuery] int? supplierId = null, [FromQuery] int? itemId = null)
        {
            try { return Ok(CreateResponse(await _reportService.GetPurchaseReportAsync(fromDate, toDate, supplierId, itemId, GetCurrentBranchId()))); }
            catch (Exception ex) { return StatusCode(500, CreateErrorResponse(ex.Message)); }
        }

        [HttpGet("purchase-return-report")]
        public async Task<IActionResult> GetPurchaseReturnReport(
    [FromQuery] DateTime fromDate, [FromQuery] DateTime toDate,
    [FromQuery] int? supplierId = null, [FromQuery] int? itemId = null)
        {
            try { return Ok(CreateResponse(await _reportService.GetPurchaseReturnReportAsync(fromDate, toDate, supplierId, itemId, GetCurrentBranchId()))); }
            catch (Exception ex) { return StatusCode(500, CreateErrorResponse(ex.Message)); }
        }

        [HttpGet("sale-report")]
        public async Task<IActionResult> GetSaleReport([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate, [FromQuery] int? customerId = null, [FromQuery] int? itemId = null)
        {
            try { return Ok(CreateResponse(await _reportService.GetSaleReportAsync(fromDate, toDate, customerId, itemId, GetCurrentBranchId()))); }
            catch (Exception ex) { return StatusCode(500, CreateErrorResponse(ex.Message)); }
        }

        [HttpGet("sale-return-report")]
        public async Task<IActionResult> GetSaleReturnReport([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate, [FromQuery] int? customerId = null, [FromQuery] int? itemId = null)
        {
            try { return Ok(CreateResponse(await _reportService.GetSaleReturnReportAsync(fromDate, toDate, customerId, itemId, GetCurrentBranchId()))); }
            catch (Exception ex) { return StatusCode(500, CreateErrorResponse(ex.Message)); }
        }

        [HttpGet("stock-report")]
        public async Task<IActionResult> GetStockReport(
    [FromQuery] DateTime fromDate, [FromQuery] DateTime toDate,
    [FromQuery] int? itemId = null, [FromQuery] int? companyId = null,
    [FromQuery] int? categoryId = null, [FromQuery] int? subcategoryId = null,
    [FromQuery] int? godownId = null, [FromQuery] bool showRateValue = true)
        {
            try { return Ok(CreateResponse(await _reportService.GetStockReportAsync(fromDate, toDate, itemId, companyId, categoryId, subcategoryId, godownId, showRateValue, GetCurrentBranchId()))); }
            catch (Exception ex) { return StatusCode(500, CreateErrorResponse(ex.Message)); }
        }

        [HttpGet("profit-loss")]
        public async Task<IActionResult> GetProfitLoss([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
        {
            try { return Ok(CreateResponse(await _reportService.GetProfitLossAsync(fromDate, toDate, GetCurrentBranchId()))); }
            catch (Exception ex) { return StatusCode(500, CreateErrorResponse(ex.Message)); }
        }

        [HttpGet("bank-statement")]
        public async Task<IActionResult> GetBankStatement(
    [FromQuery] DateTime fromDate, [FromQuery] DateTime toDate,
    [FromQuery] int? bankAccountId = null)
        {
            try { return Ok(CreateResponse(await _reportService.GetBankStatementAsync(fromDate, toDate, bankAccountId, GetCurrentBranchId()))); }
            catch (Exception ex) { return StatusCode(500, CreateErrorResponse(ex.Message)); }
        }




    }
}