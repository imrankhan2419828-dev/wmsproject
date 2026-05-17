using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.COA;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ControlAccountController : BaseController
    {
        private readonly IControlAccountService _controlAccountService;

        public ControlAccountController(IControlAccountService controlAccountService)
        {
            _controlAccountService = controlAccountService;
        }

        // GET: api/ControlAccount
        [HttpGet]
        public async Task<IActionResult> GetControlAccounts()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var controlAccounts = await _controlAccountService.GetControlAccountsAsync(branchId);
                return Ok(CreateResponse(controlAccounts));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // GET: api/ControlAccount/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetControlAccountById(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var controlAccount = await _controlAccountService.GetControlAccountByIdAsync(id, branchId);

                if (controlAccount == null)
                    return NotFound(CreateErrorResponse("Control account not found"));

                return Ok(CreateResponse(controlAccount));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // GET: api/ControlAccount/code/{code}
        [HttpGet("code/{code}")]
        public async Task<IActionResult> GetControlAccountByCode(string code)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var controlAccount = await _controlAccountService.GetControlAccountByCodeAsync(code, branchId);

                if (controlAccount == null)
                    return NotFound(CreateErrorResponse("Control account not found"));

                return Ok(CreateResponse(controlAccount));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // POST: api/ControlAccount/{id}/convert
        [HttpPost("{id}/convert-to-control")]
        public async Task<IActionResult> ConvertToControlAccount(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                string user = GetCurrentUserName();

                var result = await _controlAccountService.ConvertToControlAccountAsync(id, branchId, user);
                return Ok(CreateResponse(result, "Account converted to control account successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // POST: api/ControlAccount/{id}/convert-to-regular
        [HttpPost("{id}/convert-to-regular")]
        public async Task<IActionResult> ConvertToRegularAccount(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                string user = GetCurrentUserName();

                var result = await _controlAccountService.ConvertToRegularAccountAsync(id, branchId, user);
                return Ok(CreateResponse(result, "Account converted to regular account successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // GET: api/ControlAccount/{id}/details
        [HttpGet("{id}/details")]
        public async Task<IActionResult> GetDetailAccounts(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var details = await _controlAccountService.GetDetailAccountsAsync(id, branchId);
                return Ok(CreateResponse(details));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // POST: api/ControlAccount/{id}/details
        [HttpPost("{id}/details")]
        public async Task<IActionResult> AddDetailAccount(int id, [FromBody] CreateDetailAccountDto dto)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                string user = GetCurrentUserName();

                var result = await _controlAccountService.AddDetailAccountAsync(id, dto, branchId, user);
                return Ok(CreateResponse(result, "Detail account added successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // DELETE: api/ControlAccount/details/{detailId}
        [HttpDelete("details/{detailId}")]
        public async Task<IActionResult> RemoveDetailAccount(int detailId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                string user = GetCurrentUserName();

                await _controlAccountService.RemoveDetailAccountAsync(detailId, branchId, user);
                return Ok(CreateResponse(null, "Detail account removed successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // GET: api/ControlAccount/{id}/balance
        [HttpGet("{id}/balance")]
        public async Task<IActionResult> GetControlAccountBalance(int id, [FromQuery] DateTime? asOnDate = null)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var balance = await _controlAccountService.GetControlAccountBalanceAsync(id, branchId, asOnDate);
                return Ok(CreateResponse(new { Balance = balance, AsOnDate = asOnDate ?? DateTime.Now }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // GET: api/ControlAccount/{id}/detail-balances
        [HttpGet("{id}/detail-balances")]
        public async Task<IActionResult> GetDetailAccountBalances(int id, [FromQuery] DateTime? asOnDate = null)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var balances = await _controlAccountService.GetDetailAccountBalancesAsync(id, branchId, asOnDate);
                return Ok(CreateResponse(balances));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // GET: api/ControlAccount/{id}/aging
        [HttpGet("{id}/aging")]
        public async Task<IActionResult> GetAgingReport(int id, [FromQuery] DateTime? asOnDate = null)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var agingReport = await _controlAccountService.GetAgingReportAsync(id, branchId, asOnDate ?? DateTime.Now);
                return Ok(CreateResponse(agingReport));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // POST: api/ControlAccount/{id}/sync
        [HttpPost("{id}/sync")]
        public async Task<IActionResult> SyncControlAccountBalance(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var balance = await _controlAccountService.SyncControlAccountBalanceAsync(id, branchId);
                return Ok(CreateResponse(new { Balance = balance, SyncedOn = DateTime.Now }, "Control account balance synced successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }
    }
}
