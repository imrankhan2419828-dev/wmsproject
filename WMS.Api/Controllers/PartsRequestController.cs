using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Services.Interfaces.Workshop;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PartsRequestController : BaseController
    {
        private readonly IPartsRequestService _service;

        public PartsRequestController(IPartsRequestService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status = null)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetAllAsync(branchId, status);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetByIdAsync(id, branchId);

                if (data == null)
                    return NotFound(CreateErrorResponse("Parts request not found"));

                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create(PartsRequestCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.CreateAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, "Parts request created successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(CreateErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, PartsRequestUpdateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.UpdateAsync(id, dto, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Parts request not found"));

                return Ok(CreateResponse(result, "Parts request updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("{id}/approve")]
        public async Task<IActionResult> Approve(int id, PartsRequestApproveDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.ApproveAsync(id, dto, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Parts request not found"));

                return Ok(CreateResponse(result, "Parts request approved successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(CreateErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("{id}/receive")]
        public async Task<IActionResult> Receive(int id, [FromBody] decimal actualCost)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.ReceiveAsync(id, actualCost, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Parts request not found"));

                return Ok(CreateResponse(result, "Parts received successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(CreateErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> Cancel(int id, [FromBody] string reason)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.CancelAsync(id, reason, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Parts request not found"));

                return Ok(CreateResponse(result, "Parts request cancelled successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(CreateErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _service.DeleteAsync(id, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Parts request not found"));

                return Ok(CreateResponse(null, "Parts request deleted successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(CreateErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("low-stock")]
        public async Task<IActionResult> GetLowStockAlerts([FromQuery] string? status = null)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetLowStockAlertsAsync(branchId, status);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("jobcard/{jobCardId}")]
        public async Task<IActionResult> GetByJobCard(int jobCardId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetByJobCardAsync(jobCardId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("{id}/link-purchase")]
        public async Task<IActionResult> LinkToPurchaseOrder(int id, [FromBody] int purchaseOrderId)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.LinkToPurchaseOrderAsync(id, purchaseOrderId, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Parts request not found"));

                return Ok(CreateResponse(result, "Linked to purchase order successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }
    }
}