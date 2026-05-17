using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AccountGroupController : BaseController
    {
        private readonly IAccountGroupService _accountGroupService;

        public AccountGroupController(IAccountGroupService accountGroupService)
        {
            _accountGroupService = accountGroupService;
        }

        // GET: api/AccountGroup/suppliers
        [HttpGet("suppliers")]
        public async Task<IActionResult> GetSuppliers()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var suppliers = await _accountGroupService.GetSupplierAccountsAsync(branchId);
                return Ok(CreateResponse(suppliers));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // GET: api/AccountGroup/customers
        [HttpGet("customers")]
        public async Task<IActionResult> GetCustomers()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var customers = await _accountGroupService.GetCustomerAccountsAsync(branchId);
                return Ok(CreateResponse(customers));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // GET: api/AccountGroup/banks
        [HttpGet("banks")]
        public async Task<IActionResult> GetBankAccounts()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var banks = await _accountGroupService.GetBankAccountsAsync(branchId);
                return Ok(CreateResponse(banks));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // GET: api/AccountGroup/cash
        [HttpGet("cash")]
        public async Task<IActionResult> GetCashAccounts()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var cash = await _accountGroupService.GetCashAccountsAsync(branchId);
                return Ok(CreateResponse(cash));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // GET: api/AccountGroup/groups
        [HttpGet("groups")]
        public async Task<IActionResult> GetAllGroups()
        {
            try
            {
                var groups = await _accountGroupService.GetAllGroupsAsync();
                return Ok(CreateResponse(groups));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // GET: api/AccountGroup/group/{groupCode}
        [HttpGet("group/{groupCode}")]
        public async Task<IActionResult> GetGroupByCode(string groupCode)
        {
            try
            {
                var group = await _accountGroupService.GetGroupByCodeAsync(groupCode);
                if (group == null)
                    return NotFound(CreateErrorResponse($"Group '{groupCode}' not found"));

                return Ok(CreateResponse(group));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // GET: api/AccountGroup/{groupCode}/accounts
        [HttpGet("{groupCode}/accounts")]
        public async Task<IActionResult> GetAccountsByGroup(string groupCode)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var accounts = await _accountGroupService.GetAccountsByGroupCodeAsync(groupCode, branchId);
                return Ok(CreateResponse(accounts));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }
    }
}