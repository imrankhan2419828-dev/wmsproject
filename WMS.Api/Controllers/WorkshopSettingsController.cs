using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Services.Interfaces.Workshop;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class WorkshopSettingsController : BaseController
    {
        private readonly IWorkshopSettingsService _service;

        public WorkshopSettingsController(IWorkshopSettingsService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetSettingsAsync(branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateSettings(WorkshopSettingsCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                var result = await _service.CreateSettingsAsync(dto, userId);
                return Ok(CreateResponse(result, "Settings created successfully"));
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
        public async Task<IActionResult> UpdateSettings(int id, WorkshopSettingsUpdateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                var result = await _service.UpdateSettingsAsync(id, dto, userId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Settings not found"));

                return Ok(CreateResponse(result, "Settings updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("check-capacity")]
        public async Task<IActionResult> CheckCapacity([FromQuery] DateTime date)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _service.CheckBookingCapacityAsync(date, branchId);
                return Ok(CreateResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("check-technician/{technicianId}")]
        public async Task<IActionResult> CheckTechnicianAvailability(int technicianId, [FromQuery] DateTime date)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _service.IsTechnicianAvailableAsync(technicianId, date, branchId);
                return Ok(CreateResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }
    }
}