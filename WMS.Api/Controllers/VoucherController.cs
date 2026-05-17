using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.Voucher;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class VoucherController : BaseController
    {
        private readonly IVoucherService _voucherService;

        public VoucherController(IVoucherService voucherService)
        {
            _voucherService = voucherService;
        }

        [HttpGet]
        public IActionResult GetAll([FromQuery] string? vochType = null, [FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            int branchId = GetCurrentBranchId();
            var data = _voucherService.GetAllVouchers(branchId, vochType, fromDate, toDate);
            return Ok(CreateResponse(data));
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var data = _voucherService.GetVoucherById(id);
            if (data == null)
                return NotFound(CreateErrorResponse("Voucher not found"));
            return Ok(CreateResponse(data));
        }

        [HttpPost("manual-journal")]
        public async Task<IActionResult> CreateManualJournal([FromBody] VoucherCreateDto dto)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                int userId = GetCurrentUserId();
                var id = await _voucherService.CreateManualJournalVoucher(dto, userId, branchId);
                return Ok(CreateResponse(new { AcctTranID = id }, "Journal voucher created successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpPost("{id}/post")]
        public async Task<IActionResult> PostToLedger(int id)
        {
            try
            {
                int userId = GetCurrentUserId();
                var result = await _voucherService.PostVoucherToLedger(id, userId);
                return Ok(CreateResponse(null, "Voucher posted to ledger successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpPost("{id}/reverse")]
        public async Task<IActionResult> ReversePosting(int id)
        {
            try
            {
                int userId = GetCurrentUserId();
                var result = await _voucherService.ReversePosting(id, userId);
                return Ok(CreateResponse(null, "Posting reversed successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpGet("{id}/print")]
        public async Task<IActionResult> PrintVoucher(int id)
        {
            try
            {
                var pdfBytes = await _voucherService.PrintVoucher(id);
                return File(pdfBytes, "text/html", $"voucher_{id}.html");
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        // GET: api/Voucher/accounts
        [HttpGet("accounts")]
        public async Task<IActionResult> GetAccountsForDropdown()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var accounts = await _voucherService.GetAccountsForVoucherDropdown(branchId);
                return Ok(CreateResponse(accounts));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVoucher(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();

                // Check if voucher exists
                var voucher = _voucherService.GetVoucherById(id);
                if (voucher == null)
                    return NotFound(CreateErrorResponse("Voucher not found"));

                // Delete ledger entries first
                await _voucherService.DeleteLedgerEntries(id);

                // Delete voucher details
                await _voucherService.DeleteVoucherDetails(id);

                // Delete voucher header
                await _voucherService.DeleteVoucherHeader(id);

                return Ok(CreateResponse(null, "Voucher deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

    }
}