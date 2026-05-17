//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using WMS.Api.DTOs.PostdatedCheque;
//using WMS.Api.Helpers;
//using WMS.Api.Services.Interfaces;

//namespace WMS.Api.Controllers
//{
//    [Authorize]
//    [ApiController]
//    [Route("api/[controller]")]
//    public class PostdatedChequeController : ControllerBase
//    {
//        private readonly IPostdatedChequeService _chequeService;

//        public PostdatedChequeController(IPostdatedChequeService chequeService)
//        {
//            _chequeService = chequeService;
//        }

//        // CREATE
//        [HttpPost]
//        public async Task<IActionResult> Create([FromBody] PostdatedChequeCreateDto dto)
//        {
//            try
//            {
//                int branchId = User.GetBranchId();
//                int userId = User.GetUserId();
//                var id = await _chequeService.CreateAsync(dto, userId, branchId);
//                return Ok(new { message = "Cheque saved successfully", id });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }

//        // GET ALL
//        [HttpGet]
//        public async Task<IActionResult> GetAll([FromQuery] string? status)
//        {
//            try
//            {
//                int branchId = User.GetBranchId();
//                var data = await _chequeService.GetAllAsync(branchId, status);
//                return Ok(data);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }

//        // GET BY ID
//        [HttpGet("{id}")]
//        public async Task<IActionResult> GetById(int id)
//        {
//            try
//            {
//                var data = await _chequeService.GetByIdAsync(id);
//                if (data == null)
//                    return NotFound();
//                return Ok(data);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }

//        // UPDATE STATUS
//        [HttpPut("{id}/status")]
//        public async Task<IActionResult> UpdateStatus(int id, [FromBody] ChequeStatusUpdateDto dto)
//        {
//            try
//            {
//                int userId = User.GetUserId();
//                var result = await _chequeService.UpdateStatusAsync(id, dto, userId);
//                if (!result)
//                    return NotFound();
//                return Ok(new { message = "Status updated successfully" });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }

//        // DEPOSIT
//        [HttpPost("{id}/deposit")]
//        public async Task<IActionResult> Deposit(int id, [FromBody] DateTime depositDate)
//        {
//            try
//            {
//                int userId = User.GetUserId();
//                var result = await _chequeService.DepositChequeAsync(id, depositDate, userId);
//                if (!result)
//                    return NotFound();
//                return Ok(new { message = "Cheque marked as deposited" });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }

//        // CLEAR
//        [HttpPost("{id}/clear")]
//        public async Task<IActionResult> Clear(int id)
//        {
//            try
//            {
//                int userId = User.GetUserId();
//                var result = await _chequeService.ClearChequeAsync(id, userId);
//                if (!result)
//                    return NotFound();
//                return Ok(new { message = "Cheque cleared successfully" });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }

//        // BOUNCE
//        [HttpPost("{id}/bounce")]
//        public async Task<IActionResult> Bounce(int id, [FromBody] string reason)
//        {
//            try
//            {
//                int userId = User.GetUserId();
//                var result = await _chequeService.BounceChequeAsync(id, reason, userId);
//                if (!result)
//                    return NotFound();
//                return Ok(new { message = "Cheque marked as bounced" });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }

//        // CANCEL
//        [HttpPost("{id}/cancel")]
//        public async Task<IActionResult> Cancel(int id, [FromBody] string reason)
//        {
//            try
//            {
//                int userId = User.GetUserId();
//                var result = await _chequeService.CancelChequeAsync(id, reason, userId);
//                if (!result)
//                    return NotFound();
//                return Ok(new { message = "Cheque cancelled" });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }

//        // DELETE
//        [HttpDelete("{id}")]
//        public async Task<IActionResult> Delete(int id)
//        {
//            try
//            {
//                var result = await _chequeService.DeleteAsync(id);
//                if (!result)
//                    return NotFound();
//                return Ok(new { message = "Cheque deleted successfully" });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }

//        // PROCESS DUE CHEQUES (Manual trigger)
//        [HttpPost("process-due")]
//        public async Task<IActionResult> ProcessDueCheques()
//        {
//            try
//            {
//                int branchId = User.GetBranchId();
//                var count = await _chequeService.ProcessDueChequesAsync(branchId);
//                return Ok(new { message = $"{count} cheques processed", count });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }

//        // GET SUMMARY
//        [HttpGet("summary")]
//        public async Task<IActionResult> GetSummary()
//        {
//            try
//            {
//                int branchId = User.GetBranchId();
//                var summary = await _chequeService.GetSummaryAsync(branchId);
//                return Ok(summary);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }

//        // GET BY DATE RANGE
//        [HttpGet("by-date-range")]
//        public async Task<IActionResult> GetByDateRange([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
//        {
//            try
//            {
//                int branchId = User.GetBranchId();
//                var data = await _chequeService.GetChequesByDateRangeAsync(branchId, fromDate, toDate);
//                return Ok(data);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }

//        // GET BY SOURCE
//        [HttpGet("by-source/{sourceType}/{sourceId}")]
//        public async Task<IActionResult> GetBySource(string sourceType, int sourceId)
//        {
//            try
//            {
//                int branchId = User.GetBranchId();
//                var data = await _chequeService.GetChequesBySourceAsync(branchId, sourceType, sourceId);
//                return Ok(data);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }

//        [HttpGet("accounts/{type}")]
//        public async Task<IActionResult> GetAccountsByType(string type)
//        {
//            try
//            {
//                int branchId = User.GetBranchId();
//                var accounts = await _chequeService.GetAccountsByTypeAsync(branchId, type);
//                return Ok(accounts); // Direct array return
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }

//        // UPDATE entire cheque
//        [HttpPut("{id}")]
//        public async Task<IActionResult> Update(int id, [FromBody] PostdatedChequeCreateDto dto)
//        {
//            try
//            {
//                int userId = User.GetUserId();
//                var result = await _chequeService.UpdateAsync(id, dto, userId);

//                if (!result)
//                    return NotFound(new { error = "Cheque not found" });

//                return Ok(new { message = "Cheque updated successfully" });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }
//    }
//}
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.PostdatedCheque;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PostdatedChequeController : BaseController  // 👈 Inherit from BaseController
    {
        private readonly IPostdatedChequeService _chequeService;

        public PostdatedChequeController(IPostdatedChequeService chequeService)
        {
            _chequeService = chequeService;
        }

        // CREATE
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PostdatedChequeCreateDto dto)
        {
            try
            {
                // ✅ Use BaseController methods
                int branchId = GetCurrentBranchId();
                int userId = GetCurrentUserId();

                var id = await _chequeService.CreateAsync(dto, userId, branchId);
                return Ok(CreateResponse(new { id }, "Cheque saved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // GET ALL
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _chequeService.GetAllAsync(branchId, status);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // GET BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var data = await _chequeService.GetByIdAsync(id);
                if (data == null)
                    return NotFound(CreateErrorResponse("Cheque not found"));

                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // UPDATE STATUS
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] ChequeStatusUpdateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                var result = await _chequeService.UpdateStatusAsync(id, dto, userId);

                if (!result)
                    return NotFound(CreateErrorResponse("Cheque not found"));

                return Ok(CreateResponse(null, "Status updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // DEPOSIT
        [HttpPost("{id}/deposit")]
        public async Task<IActionResult> Deposit(int id, [FromBody] DateTime depositDate)
        {
            try
            {
                int userId = GetCurrentUserId();
                var result = await _chequeService.DepositChequeAsync(id, depositDate, userId);

                if (!result)
                    return NotFound(CreateErrorResponse("Cheque not found"));

                return Ok(CreateResponse(null, "Cheque marked as deposited"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // CLEAR
        [HttpPost("{id}/clear")]
        public async Task<IActionResult> Clear(int id)
        {
            try
            {
                int userId = GetCurrentUserId();
                var result = await _chequeService.ClearChequeAsync(id, userId);

                if (!result)
                    return NotFound(CreateErrorResponse("Cheque not found"));

                return Ok(CreateResponse(null, "Cheque cleared successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // BOUNCE
        [HttpPost("{id}/bounce")]
        public async Task<IActionResult> Bounce(int id, [FromBody] string reason)
        {
            try
            {
                int userId = GetCurrentUserId();
                var result = await _chequeService.BounceChequeAsync(id, reason, userId);

                if (!result)
                    return NotFound(CreateErrorResponse("Cheque not found"));

                return Ok(CreateResponse(null, "Cheque marked as bounced"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // CANCEL
        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> Cancel(int id, [FromBody] string reason)
        {
            try
            {
                int userId = GetCurrentUserId();
                var result = await _chequeService.CancelChequeAsync(id, reason, userId);

                if (!result)
                    return NotFound(CreateErrorResponse("Cheque not found"));

                return Ok(CreateResponse(null, "Cheque cancelled"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _chequeService.DeleteAsync(id);
                if (!result)
                    return NotFound(CreateErrorResponse("Cheque not found"));

                return Ok(CreateResponse(null, "Cheque deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // PROCESS DUE CHEQUES
        [HttpPost("process-due")]
        public async Task<IActionResult> ProcessDueCheques()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var count = await _chequeService.ProcessDueChequesAsync(branchId);
                return Ok(CreateResponse(new { count }, $"{count} cheques processed"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // GET SUMMARY
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var summary = await _chequeService.GetSummaryAsync(branchId);
                return Ok(CreateResponse(summary));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // GET BY DATE RANGE
        [HttpGet("by-date-range")]
        public async Task<IActionResult> GetByDateRange([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _chequeService.GetChequesByDateRangeAsync(branchId, fromDate, toDate);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // GET BY SOURCE
        [HttpGet("by-source/{sourceType}/{sourceId}")]
        public async Task<IActionResult> GetBySource(string sourceType, int sourceId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _chequeService.GetChequesBySourceAsync(branchId, sourceType, sourceId);
                return Ok(CreateResponse(data));
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
                int branchId = GetCurrentBranchId();
                var accounts = await _chequeService.GetAccountsByTypeAsync(branchId, type);
                return Ok(CreateResponse(accounts));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // UPDATE entire cheque
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] PostdatedChequeCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                var result = await _chequeService.UpdateAsync(id, dto, userId);

                if (!result)
                    return NotFound(CreateErrorResponse("Cheque not found"));

                return Ok(CreateResponse(null, "Cheque updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }
    }
}