using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class VehicleController : BaseController
    {
        private readonly IVehicleService _service;

        public VehicleController(IVehicleService service)
        {
            _service = service;
        }

        [HttpGet]
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
                    return NotFound(CreateErrorResponse("Vehicle not found"));

                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create(VehicleCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.CreateAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, "Vehicle created successfully"));
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
        public async Task<IActionResult> Update(int id, VehicleUpdateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.UpdateAsync(id, dto, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Vehicle not found"));

                return Ok(CreateResponse(result, "Vehicle updated successfully"));
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
                    return NotFound(CreateErrorResponse("Vehicle not found"));

                return Ok(CreateResponse(null, "Vehicle deleted successfully"));
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

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string term)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.SearchAsync(term, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }
    }
}