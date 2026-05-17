using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FinancialReportController : BaseController
    {
        private readonly IFinancialReportService _financialReportService;

        public FinancialReportController(IFinancialReportService financialReportService)
        {
            _financialReportService = financialReportService;
        }

        // ====================================================================
        // TRIAL BALANCE ENDPOINTS
        // ====================================================================

        // GET: api/FinancialReport/trialbalance
        [HttpGet("trialbalance")]
        public async Task<IActionResult> GetTrialBalance(
            [FromQuery] DateTime? asOnDate = null,
            [FromQuery] bool includeZeroBalances = false,
            [FromQuery] int? level = null)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _financialReportService.GetTrialBalanceAsync(
                    branchId, asOnDate, includeZeroBalances, level);
                return Ok(CreateResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // GET: api/FinancialReport/trialbalance/hierarchy
        [HttpGet("trialbalance/hierarchy")]
        public async Task<IActionResult> GetTrialBalanceHierarchy([FromQuery] DateTime? asOnDate = null)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _financialReportService.GetTrialBalanceHierarchyAsync(branchId, asOnDate);
                return Ok(CreateResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // ====================================================================
        // PROFIT & LOSS ENDPOINTS
        // ====================================================================

        // GET: api/FinancialReport/profitloss
        [HttpGet("profitloss")]
        public async Task<IActionResult> GetProfitLoss(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate,
            [FromQuery] bool includeBudget = false)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _financialReportService.GetProfitLossAsync(
                    branchId, startDate, endDate, includeBudget);
                return Ok(CreateResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // GET: api/FinancialReport/profitloss/comparative
        [HttpGet("profitloss/comparative")]
        public async Task<IActionResult> GetComparativeProfitLoss(
            [FromQuery] DateTime currentStartDate,
            [FromQuery] DateTime currentEndDate,
            [FromQuery] DateTime? previousStartDate = null,
            [FromQuery] DateTime? previousEndDate = null)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _financialReportService.GetComparativeProfitLossAsync(
                    branchId, currentStartDate, currentEndDate, previousStartDate, previousEndDate);
                return Ok(CreateResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // ====================================================================
        // BALANCE SHEET ENDPOINTS
        // ====================================================================

        // GET: api/FinancialReport/balancesheet
        [HttpGet("balancesheet")]
        public async Task<IActionResult> GetBalanceSheet(
            [FromQuery] DateTime asOnDate,
            [FromQuery] bool includePreviousYear = false)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _financialReportService.GetBalanceSheetAsync(
                    branchId, asOnDate, includePreviousYear);
                return Ok(CreateResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // GET: api/FinancialReport/balancesheet/vertical
        [HttpGet("balancesheet/vertical")]
        public async Task<IActionResult> GetVerticalBalanceSheet([FromQuery] DateTime asOnDate)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _financialReportService.GetVerticalBalanceSheetAsync(branchId, asOnDate);
                return Ok(CreateResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // ====================================================================
        // CASH FLOW ENDPOINTS
        // ====================================================================

        // GET: api/FinancialReport/cashflow
        [HttpGet("cashflow")]
        public async Task<IActionResult> GetCashFlowStatement(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _financialReportService.GetCashFlowStatementAsync(branchId, startDate, endDate);
                return Ok(CreateResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // ====================================================================
        // GENERAL LEDGER ENDPOINTS
        // ====================================================================

        // GET: api/FinancialReport/generalledger/{accountId}
        [HttpGet("generalledger/{accountId}")]
        public async Task<IActionResult> GetGeneralLedger(
            int accountId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _financialReportService.GetGeneralLedgerAsync(
                    branchId, accountId, fromDate, toDate);
                return Ok(CreateResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // GET: api/FinancialReport/accountstatement/{accountId}
        [HttpGet("accountstatement/{accountId}")]
        public async Task<IActionResult> GetAccountStatement(
            int accountId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _financialReportService.GetAccountStatementAsync(
                    branchId, accountId, fromDate, toDate);
                return Ok(CreateResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // ====================================================================
        // SUMMARY ENDPOINTS
        // ====================================================================

        // GET: api/FinancialReport/netprofit
        [HttpGet("netprofit")]
        public async Task<IActionResult> GetNetProfitLoss(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _financialReportService.GetNetProfitLossAsync(branchId, startDate, endDate);
                return Ok(CreateResponse(new { NetProfitLoss = result, StartDate = startDate, EndDate = endDate }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }
    }
}
