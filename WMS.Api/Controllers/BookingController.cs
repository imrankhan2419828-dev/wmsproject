using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Services.Interfaces.Workshop;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : BaseController
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpGet("date/{date}")]
        public async Task<IActionResult> GetByDate(DateTime date)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _bookingService.GetBookingsByDateAsync(date, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("range")]
        public async Task<IActionResult> GetByDateRange([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _bookingService.GetBookingsByDateRangeAsync(fromDate, toDate, branchId);
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
                var data = await _bookingService.GetBookingByIdAsync(id, branchId);

                if (data == null)
                    return NotFound(CreateErrorResponse("Booking not found"));

                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create(BookingCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _bookingService.CreateBookingAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, "Booking created successfully"));
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
        public async Task<IActionResult> Update(int id, BookingUpdateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _bookingService.UpdateBookingAsync(id, dto, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Booking not found"));

                return Ok(CreateResponse(result, "Booking updated successfully"));
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

        //[HttpPatch("{id}/status")]
        //public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        //{
        //    try
        //    {
        //        int userId = GetCurrentUserId();
        //        int branchId = GetCurrentBranchId();

        //        var result = await _bookingService.UpdateBookingStatusAsync(id, status, userId, branchId);

        //        if (!result)
        //            return NotFound(CreateErrorResponse("Booking not found"));

        //        return Ok(CreateResponse(null, "Status updated successfully"));
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, CreateErrorResponse(ex.Message, ex));
        //    }
        //}
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatusPut(int id, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                if (string.IsNullOrWhiteSpace(request.Status))
                    return BadRequest(CreateErrorResponse("Status cannot be empty"));

                var result = await _bookingService.UpdateBookingStatusAsync(id, request.Status, userId, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Booking not found"));

                return Ok(CreateResponse(null, "Status updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // Add this class at bottom of file
        public class UpdateStatusRequest
        {
            public string Status { get; set; }
        }

        [HttpPatch("{id}/priority")]
        public async Task<IActionResult> UpdatePriority(int id, [FromBody] UpdatePriorityRequest request)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                if (string.IsNullOrWhiteSpace(request.Priority))
                    return BadRequest(CreateErrorResponse("Priority cannot be empty"));

                // Get booking first
                var booking = await _bookingService.GetBookingByIdAsync(id, branchId);
                if (booking == null)
                    return NotFound(CreateErrorResponse("Booking not found"));

                // Update only priority - Use existing update method with partial update
                var updateDto = new BookingUpdateDto
                {
                    BookingID = id,
                    BookingDate = booking.BookingDate,
                    StartTime = booking.StartTime,
                    EndTime = booking.EndTime,
                    VehicleID = booking.VehicleID,
                    TechnicianID = booking.TechnicianID,
                    Status = booking.Status,
                    Notes = booking.Notes,
                    // Add priority field
                };

                // Since BookingUpdateDto doesn't have Priority, we need to handle it separately
                // Option 1: Update priority using raw SQL or separate method
                // Option 2: Add priority field to Booking entity and update

                // For now, let's use a direct approach
                var result = await _bookingService.UpdateBookingPriorityAsync(id, request.Priority, userId, branchId);

                return Ok(CreateResponse(null, "Priority updated successfully"));
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
                var result = await _bookingService.DeleteBookingAsync(id, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Booking not found"));

                return Ok(CreateResponse(null, "Booking deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("{id}/convert")]
        public async Task<IActionResult> ConvertToJobCard(int id, BookingConvertDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _bookingService.ConvertToJobCardAsync(id, dto, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Booking not found"));

                return Ok(CreateResponse(result, "Booking converted to job card successfully"));
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

        [HttpGet("time-slots/available")]
        public async Task<IActionResult> GetAvailableTimeSlots([FromQuery] DateTime date, [FromQuery] int? technicianId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _bookingService.GetAvailableTimeSlotsAsync(date, technicianId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("time-slots")]
        public async Task<IActionResult> GetAllTimeSlots()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _bookingService.GetAllTimeSlotsAsync(branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("daily-summary/{date}")]
        public async Task<IActionResult> GetDailySummary(DateTime date)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _bookingService.GetDailySummaryAsync(date, branchId);
                return Ok(CreateResponse(data));
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
                var data = await _bookingService.GetBookingsByVehicleAsync(vehicleId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }


        public class UpdatePriorityRequest
        {
            [Required]
            [StringLength(20)]
            public string Priority { get; set; }
        }
    }
}