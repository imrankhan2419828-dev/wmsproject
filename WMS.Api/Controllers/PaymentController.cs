using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.Payments;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : BaseController
    {
        private readonly IPaymentService _service;

        public PaymentController(IPaymentService service)
        {
            _service = service;
        }

        // ================= LIST =================
        [HttpGet("list")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetAllAsync(branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return BadRequest(CreateErrorResponse(ex.Message));
            }
        }

        // ================= GET BY ID =================
        [HttpGet("{paymentId}")]
        public async Task<IActionResult> GetById(int paymentId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetByIdAsync(paymentId, branchId);

                if (data == null)
                    return NotFound(CreateErrorResponse("Payment not found."));

                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return BadRequest(CreateErrorResponse(ex.Message));
            }
        }

        // ================= 🔥 GET PARTIES =================
        [HttpGet("parties")]
        public async Task<IActionResult> GetParties()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetPartiesAsync(branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return BadRequest(CreateErrorResponse(ex.Message));
            }
        }

        // ================= 🔥 GET NEXT VOUCHER =================
        [HttpGet("next-voucher")]
        public async Task<IActionResult> GetNextVoucher()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var nextVoucher = await _service.GenerateVoucherNumberAsync(branchId);
                return Ok(CreateResponse(nextVoucher));
            }
            catch (Exception ex)
            {
                return BadRequest(CreateErrorResponse(ex.Message));
            }
        }

        // ================= CREATE =================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PaymentCreateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                    return BadRequest(CreateErrorResponse(string.Join(", ", errors)));
                }

                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var id = await _service.CreateAsync(dto, userId, branchId);
                return Ok(CreateResponse(new { PaymentID = id }, "Payment created successfully"));
            }
            catch (ApplicationException ex)
            {
                return BadRequest(CreateErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        // ================= 🔥 UPDATE =================
        [HttpPut("{paymentId}")]
        public async Task<IActionResult> Update(int paymentId, [FromBody] PaymentCreateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                    return BadRequest(CreateErrorResponse(string.Join(", ", errors)));
                }

                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.UpdateAsync(paymentId, dto, userId, branchId);
                if (result == null)
                    return NotFound(CreateErrorResponse("Payment not found"));

                return Ok(CreateResponse(result, "Payment updated successfully"));
            }
            catch (ApplicationException ex)
            {
                return BadRequest(CreateErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        // ================= DELETE =================
        [HttpDelete("{paymentId}")]
        public async Task<IActionResult> Delete(int paymentId)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var success = await _service.DeleteAsync(paymentId, userId, branchId);
                return Ok(CreateResponse(null, "Payment deleted successfully."));
            }
            catch (Exception ex)
            {
                return BadRequest(CreateErrorResponse(ex.Message));
            }
        }

        // ================= COA BY PAYMENT TYPE =================
        [HttpGet("accounts/{type}")]
        public async Task<IActionResult> GetAccountsByPaymentType(string type)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetAccountsByPaymentTypeAsync(branchId, type);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return BadRequest(CreateErrorResponse(ex.Message));
            }
        }

        // ================= BANK ACCOUNTS =================
        [HttpGet("bank-accounts")]
        public async Task<IActionResult> GetBankAccounts()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetBankAccountsAsync(branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return BadRequest(CreateErrorResponse(ex.Message));
            }
        }
    }
}