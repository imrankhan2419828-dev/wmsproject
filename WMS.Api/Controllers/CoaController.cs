//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using WMS.Api.DTOs.COA;
//using WMS.Api.Services.Interfaces;

//namespace WMS.Api.Controllers
//{
//    [Authorize]
//    [ApiController]
//    [Route("api/[controller]")]
//    public class CoaController : BaseController
//    {
//        private readonly ICoaService _service;

//        public CoaController(ICoaService service)
//        {
//            _service = service;
//        }

//        // GET: api/Coa/tree
//        [HttpGet("tree")]
//        public async Task<IActionResult> Tree()
//        {
//            try
//            {
//                int branchId = GetCurrentBranchId();
//                var tree = await _service.GetTree(branchId);
//                return Ok(CreateResponse(tree));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
//            }
//        }

//        // POST: api/Coa
//        [HttpPost]
//        public async Task<IActionResult> Create([FromBody] COACreateDto dto)
//        {
//            try
//            {
//                // Validate model
//                if (!ModelState.IsValid)
//                    return BadRequest(CreateErrorResponse(ModelState.ToString()));

//                int branchId = GetCurrentBranchId();
//                string user = GetCurrentUserName();

//                var id = await _service.AddAccount(dto, branchId, user);
//                return Ok(CreateResponse(new { id }, "Account created successfully"));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
//            }
//        }

//        // PUT: api/Coa
//        [HttpPut]
//        public async Task<IActionResult> Update([FromBody] COAUpdateDto dto)
//        {
//            try
//            {
//                if (!ModelState.IsValid)
//                {
//                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
//                    return BadRequest(CreateErrorResponse(string.Join(", ", errors)));
//                }

//                int branchId = GetCurrentBranchId();
//                string user = GetCurrentUserName();

//                await _service.UpdateAccount(dto, user, branchId);
//                return Ok(CreateResponse(null, "Account updated successfully"));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
//            }
//        }

//        // DELETE: api/Coa/{id}
//        [HttpDelete("{id}")]
//        public async Task<IActionResult> Delete(int id)
//        {
//            try
//            {
//                int branchId = GetCurrentBranchId();
//                string user = GetCurrentUserName();

//                await _service.DeleteAccount(id, branchId, user);
//                return Ok(CreateResponse(null, "Account deleted successfully"));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
//            }
//        }

//        // GET: api/Coa/suppliers
//        [HttpGet("suppliers")]
//        public async Task<IActionResult> GetSuppliers()
//        {
//            try
//            {
//                int branchId = GetCurrentBranchId();
//                var suppliers = await _service.GetSuppliers(branchId);
//                return Ok(CreateResponse(suppliers));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
//            }
//        }

//        // GET: api/Coa/customers
//        [HttpGet("customers")]
//        public async Task<IActionResult> GetCustomers()
//        {
//            try
//            {
//                int branchId = GetCurrentBranchId();
//                var customers = await _service.GetCustomers(branchId);
//                return Ok(CreateResponse(customers));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
//            }
//        }

//        // GET: api/Coa/banks
//        [HttpGet("banks")]
//        public async Task<IActionResult> GetBankAccounts()
//        {
//            try
//            {
//                int branchId = GetCurrentBranchId();
//                var banks = await _service.GetBankAccounts(branchId);
//                return Ok(CreateResponse(banks));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
//            }
//        }

//        // GET: api/Coa/cash
//        [HttpGet("cash")]
//        public async Task<IActionResult> GetCashAccounts()
//        {
//            try
//            {
//                int branchId = GetCurrentBranchId();
//                var cash = await _service.GetCashAccounts(branchId);
//                return Ok(CreateResponse(cash));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
//            }
//        }

//        // GET: api/Coa/validate/code/{acctCode}
//        [HttpGet("validate/code/{acctCode}")]
//        public async Task<IActionResult> ValidateAccountCode(string acctCode)
//        {
//            try
//            {
//                int branchId = GetCurrentBranchId();
//                var isValid = await _service.ValidateAccountCode(acctCode, branchId);
//                return Ok(CreateResponse(new { IsValid = isValid, AccountCode = acctCode }));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
//            }
//        }

//        // GET: api/Coa/validate/name
//        [HttpGet("validate/name")]
//        public async Task<IActionResult> ValidateAccountName(
//            [FromQuery] string parentCode,
//            [FromQuery] string acctName,
//            [FromQuery] int? excludeId = null)
//        {
//            try
//            {
//                int branchId = GetCurrentBranchId();
//                var isValid = await _service.ValidateAccountName(parentCode, acctName, branchId, excludeId);
//                return Ok(CreateResponse(new { IsValid = isValid, AccountName = acctName }));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
//            }
//        }



//    }
//}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.COA;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CoaController : BaseController
    {
        private readonly ICoaService _service;

        public CoaController(ICoaService service)
        {
            _service = service;
        }

        // ====================================================================
        // TREE ENDPOINTS
        // ====================================================================

        [HttpGet("tree")]
        public async Task<IActionResult> GetTree()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var tree = await _service.GetTreeAsync(branchId);
                return Ok(CreateResponse(tree));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var account = await _service.GetAccountByIdAsync(id, branchId);
                if (account == null)
                    return NotFound(CreateErrorResponse("Account not found"));
                return Ok(CreateResponse(account));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        // ====================================================================
        // CRUD ENDPOINTS
        // ====================================================================

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] COACreateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(CreateErrorResponse(ModelState.ToString()));

                int branchId = GetCurrentBranchId();
                string user = GetCurrentUserName();

                var id = await _service.CreateAccountAsync(dto, branchId, user);
                return Ok(CreateResponse(new { id }, "Account created successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] COAUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(CreateErrorResponse(ModelState.ToString()));

                int branchId = GetCurrentBranchId();
                string user = GetCurrentUserName();

                await _service.UpdateAccountAsync(dto, branchId, user);
                return Ok(CreateResponse(null, "Account updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                string user = GetCurrentUserName();

                await _service.DeleteAccountAsync(id, branchId, user);
                return Ok(CreateResponse(null, "Account deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        // ====================================================================
        // STEP CONFIGURATION ENDPOINTS
        // ====================================================================

        [HttpGet("step-config")]
        public async Task<IActionResult> GetStepConfig([FromQuery] int step, [FromQuery] string? parentCode)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var config = await _service.GetStepConfigAsync(step, parentCode, branchId);
                return Ok(CreateResponse(config));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpGet("parent-options")]
        public async Task<IActionResult> GetParentOptions(
            [FromQuery] int? level,
            [FromQuery] string? acctType,
            [FromQuery] string? category)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var options = await _service.GetParentOptionsAsync(level, acctType, category, branchId);
                return Ok(CreateResponse(options));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        // ====================================================================
        // CATEGORY ENDPOINTS (For dropdowns)
        // ====================================================================

        [HttpGet("customers")]
        public async Task<IActionResult> GetCustomers()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var customers = await _service.GetCustomersAsync(branchId);
                return Ok(CreateResponse(customers));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpGet("suppliers")]
        public async Task<IActionResult> GetSuppliers()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var suppliers = await _service.GetSuppliersAsync(branchId);
                return Ok(CreateResponse(suppliers));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpGet("banks")]
        public async Task<IActionResult> GetBankAccounts()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var banks = await _service.GetBankAccountsAsync(branchId);
                return Ok(CreateResponse(banks));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpGet("expenses")]
        public async Task<IActionResult> GetExpenseAccounts()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var expenses = await _service.GetExpenseAccountsAsync(branchId);
                return Ok(CreateResponse(expenses));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpGet("other")]
        public async Task<IActionResult> GetOtherAccounts()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var others = await _service.GetOtherAccountsAsync(branchId);
                return Ok(CreateResponse(others));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        // ====================================================================
        // VALIDATION ENDPOINTS
        // ====================================================================

        [HttpGet("validate/code")]
        public async Task<IActionResult> ValidateCode([FromQuery] string acctCode)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var isValid = await _service.ValidateAccountCodeAsync(acctCode, branchId);
                return Ok(CreateResponse(new { isValid, acctCode }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpGet("validate/name")]
        public async Task<IActionResult> ValidateName(
            [FromQuery] string parentCode,
            [FromQuery] string acctName,
            [FromQuery] int? excludeId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var isValid = await _service.ValidateAccountNameAsync(parentCode, acctName, branchId, excludeId);
                return Ok(CreateResponse(new { isValid, acctName }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        // ====================================================================
        // HELPER ENDPOINTS
        // ====================================================================

        [HttpGet("control-accounts/{level}")]
        public async Task<IActionResult> GetControlAccountsByLevel(int level)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var accounts = await _service.GetControlAccountsByLevelAsync(level, branchId);
                return Ok(CreateResponse(accounts));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }
    }
}