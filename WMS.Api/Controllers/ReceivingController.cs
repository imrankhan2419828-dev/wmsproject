using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.Receiving;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ReceivingController : BaseController  // 👈 Inherit from BaseController
    {
        private readonly IReceivingService _receivingService;

        public ReceivingController(IReceivingService receivingService)
        {
            _receivingService = receivingService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ReceivingCreateDto dto)
        {
            try
            {
                // ✅ Use BaseController methods
                int branchId = GetCurrentBranchId();
                int userId = GetCurrentUserId();

                var id = await _receivingService.CreateAsync(dto, userId, branchId);
                return Ok(CreateResponse(new { id }, "Receiving saved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("all")]
        public IActionResult GetAll()
        {
            try
            {
                // ✅ Use BaseController method
                int branchId = GetCurrentBranchId();
                var data = _receivingService.GetAll(branchId);

                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var receiving = await _receivingService.GetById(id);
                if (receiving == null)
                    return NotFound(CreateErrorResponse("Receiving not found"));

                return Ok(CreateResponse(receiving));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var ok = await _receivingService.DeleteAsync(id);
                if (!ok)
                    return NotFound(CreateErrorResponse("Receiving not found"));

                return Ok(CreateResponse(null, "Receiving deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("accounts/{type}")]
        public async Task<IActionResult> GetAccountsByType(string type)
        {
            try
            {
                int branchId = GetCurrentBranchId();  // ✅ Token/header se branch ID
                var data = await _receivingService.GetAccountsByType(branchId, type);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] ReceivingCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();  // 🔥 ADD THIS

                var result = await _receivingService.UpdateAsync(id, dto, userId, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Receiving not found"));

                return Ok(CreateResponse(null, "Receiving updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }


        // Add these endpoints to ReceivingController

        [HttpGet("customers")]
        public async Task<IActionResult> GetCustomers()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _receivingService.GetCustomersAsync(branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpGet("bank-accounts")]
        public async Task<IActionResult> GetBankCashAccounts()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _receivingService.GetBankCashAccountsAsync(branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpGet("next-voucher")]
        public async Task<IActionResult> GetNextVoucher()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var nextVoucher = await _receivingService.GenerateVoucherNumberAsync(branchId);
                return Ok(CreateResponse(nextVoucher));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }


    }
}