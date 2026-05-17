using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Services.Interfaces.Workshop;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TechnicianTimeLogController : BaseController
    {
        private readonly ITechnicianTimeLogService _service;

        public TechnicianTimeLogController(ITechnicianTimeLogService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] DateTime? date)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetAllAsync(branchId, date);
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
                    return NotFound(CreateErrorResponse("Time log not found"));

                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("clockin")]
        public async Task<IActionResult> ClockIn(TechnicianTimeLogCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.ClockInAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, "Technician clocked in successfully"));
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

        [HttpPost("{id}/clockout")]
        public async Task<IActionResult> ClockOut(int id)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.ClockOutAsync(id, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Time log not found"));

                return Ok(CreateResponse(result, "Technician clocked out successfully"));
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

        [HttpPost("{id}/break/start")]
        public async Task<IActionResult> StartBreak(int id)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.StartBreakAsync(id, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Time log not found"));

                return Ok(CreateResponse(result, "Break started successfully"));
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

        [HttpPost("{id}/break/end")]
        public async Task<IActionResult> EndBreak(int id)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.EndBreakAsync(id, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Time log not found"));

                return Ok(CreateResponse(result, "Break ended successfully"));
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

        [HttpGet("workload")]
        public async Task<IActionResult> GetWorkload([FromQuery] DateTime? date)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetTechnicianWorkloadAsync(branchId, date);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("current/{technicianId}")]
        public async Task<IActionResult> GetCurrentStatus(int technicianId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetCurrentStatusAsync(technicianId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("technician/{technicianId}")]
        public async Task<IActionResult> GetTechnicianLogs(int technicianId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetTechnicianLogsAsync(technicianId, branchId, fromDate, toDate);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, TechnicianTimeLogUpdateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.UpdateAsync(id, dto, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Time log not found"));

                return Ok(CreateResponse(result, "Time log updated successfully"));
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
                    return NotFound(CreateErrorResponse("Time log not found"));

                return Ok(CreateResponse(null, "Time log deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }


        [HttpGet("engagement-status")]
        public async Task<IActionResult> GetEngagementStatus()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetTechnicianEngagementStatusAsync(branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }
    }
}