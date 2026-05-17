using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class JobCardController : BaseController
    {
        private readonly IJobCardService _service;

        public JobCardController(IJobCardService service)
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
                    return NotFound(CreateErrorResponse("Job card not found"));

                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create(JobCardCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.CreateAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, "Job card created successfully"));
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
        public async Task<IActionResult> Update(int id, JobCardUpdateDto dto)
        {
            try
            {
                Console.WriteLine($"Update called - URL id: {id}, DTO JobCardID: {dto.JobCardID}");

                // ✅ Fix: Allow URL id to override DTO
                if (id != dto.JobCardID)
                {
                    Console.WriteLine($"ID mismatch - Using URL id: {id}");
                    dto.JobCardID = id;  // Override with URL id
                }

                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.UpdateAsync(id, dto, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Job card not found"));

                return Ok(CreateResponse(result, "Job card updated successfully"));
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

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, JobCardStatusUpdateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.UpdateStatusAsync(id, dto, userId, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Job card not found"));

                return Ok(CreateResponse(null, "Status updated successfully"));
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
                    return NotFound(CreateErrorResponse("Job card not found"));

                return Ok(CreateResponse(null, "Job card deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("vehicle/{vehicleId}")]
        public async Task<IActionResult> GetByVehicle(int vehicleId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetByVehicleAsync(vehicleId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetByCustomer(int customerId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetByCustomerAsync(customerId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("date-range")]
        public async Task<IActionResult> GetByDateRange([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetByDateRangeAsync(fromDate, toDate, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("{id}/services")]
        public async Task<IActionResult> AddService(int id, JobServiceCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.AddServiceAsync(id, dto, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Job card not found"));

                return Ok(CreateResponse(result, "Service added successfully"));
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

        [HttpDelete("{id}/services/{serviceId}")]
        public async Task<IActionResult> RemoveService(int id, int serviceId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _service.RemoveServiceAsync(id, serviceId, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Service not found"));

                return Ok(CreateResponse(null, "Service removed successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("{id}/parts")]
        public async Task<IActionResult> AddPart(int id, JobPartCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.AddPartAsync(id, dto, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Job card not found"));

                return Ok(CreateResponse(result, "Part added successfully"));
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

        [HttpDelete("{id}/parts/{partId}")]
        public async Task<IActionResult> RemovePart(int id, int partId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _service.RemovePartAsync(id, partId, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Part not found"));

                return Ok(CreateResponse(null, "Part removed successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("{id}/pdf")]
        public async Task<IActionResult> GeneratePdf(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var pdfData = await _service.GenerateJobCardPdfAsync(id, branchId);

                return File(pdfData, "application/pdf", $"JobCard_{id}.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }
    }
}