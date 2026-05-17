using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Services.Interfaces.Workshop;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : BaseController
    {
        private readonly INotificationService _service;

        public NotificationController(INotificationService service)
        {
            _service = service;
        }

        #region Notifications

        [HttpGet]
        public async Task<IActionResult> GetAllNotifications([FromQuery] string? status, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetAllNotificationsAsync(branchId, status, fromDate, toDate);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetNotificationById(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetNotificationByIdAsync(id, branchId);

                if (data == null)
                    return NotFound(CreateErrorResponse("Notification not found"));

                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateNotification(NotificationCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.CreateNotificationAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, "Notification created successfully"));
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

        [HttpPost("{id}/send")]
        public async Task<IActionResult> SendNotification(int id)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.SendNotificationAsync(id, userId, branchId);
                return Ok(CreateResponse(result, "Notification sent successfully"));
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

        [HttpPost("{id}/resend")]
        public async Task<IActionResult> ResendNotification(int id)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.ResendNotificationAsync(id, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Notification not found"));

                return Ok(CreateResponse(result, "Notification resent successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelNotification(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _service.CancelNotificationAsync(id, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Notification not found"));

                return Ok(CreateResponse(null, "Notification cancelled successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetNotificationStatsAsync(branchId, fromDate, toDate);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion

        #region Templates

        [HttpGet("templates")]
        public async Task<IActionResult> GetAllTemplates()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetAllTemplatesAsync(branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("templates/{id}")]
        public async Task<IActionResult> GetTemplateById(int id)
        {
            try
            {
                var data = await _service.GetTemplateByIdAsync(id);

                if (data == null)
                    return NotFound(CreateErrorResponse("Template not found"));

                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("templates")]
        public async Task<IActionResult> CreateTemplate(NotificationTemplateCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                var result = await _service.CreateTemplateAsync(dto, userId);
                return Ok(CreateResponse(result, "Template created successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPut("templates/{id}")]
        public async Task<IActionResult> UpdateTemplate(int id, NotificationTemplateUpdateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                var result = await _service.UpdateTemplateAsync(id, dto, userId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Template not found"));

                return Ok(CreateResponse(result, "Template updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpDelete("templates/{id}")]
        public async Task<IActionResult> DeleteTemplate(int id)
        {
            try
            {
                var result = await _service.DeleteTemplateAsync(id);

                if (!result)
                    return NotFound(CreateErrorResponse("Template not found"));

                return Ok(CreateResponse(null, "Template deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion

        #region Customer Preferences

        [HttpGet("preferences/{customerId}")]
        public async Task<IActionResult> GetCustomerPreferences(int customerId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetCustomerPreferencesAsync(customerId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPut("preferences")]
        public async Task<IActionResult> UpdateCustomerPreferences(CustomerPreferenceUpdateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();
                var result = await _service.UpdateCustomerPreferencesAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, "Preferences updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("preferences/{customerId}/default")]
        public async Task<IActionResult> CreateDefaultPreferences(int customerId)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();
                var result = await _service.CreateDefaultPreferencesAsync(customerId, userId, branchId);
                return Ok(CreateResponse(result, "Default preferences created"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion

        #region Auto Notifications

        [HttpPost("job-created/{jobCardId}")]
        public async Task<IActionResult> SendJobCreatedNotification(int jobCardId)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();
                var result = await _service.SendJobCreatedNotificationAsync(jobCardId, userId, branchId);
                return Ok(CreateResponse(result, "Job created notification sent"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("job-ready/{jobCardId}")]
        public async Task<IActionResult> SendJobReadyNotification(int jobCardId)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();
                var result = await _service.SendJobReadyNotificationAsync(jobCardId, userId, branchId);
                return Ok(CreateResponse(result, "Job ready notification sent"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("job-delivered/{jobCardId}")]
        public async Task<IActionResult> SendJobDeliveredNotification(int jobCardId)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();
                var result = await _service.SendJobDeliveredNotificationAsync(jobCardId, userId, branchId);
                return Ok(CreateResponse(result, "Job delivered notification sent"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion

        #region Bulk Operations

        [HttpPost("bulk")]
        public async Task<IActionResult> SendBulkNotifications(BulkNotificationDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();
                var result = await _service.SendBulkNotificationsAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, $"{result.Count} notifications created"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("process-pending")]
        public async Task<IActionResult> ProcessPendingNotifications()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var count = await _service.ProcessPendingNotificationsAsync(branchId);
                return Ok(CreateResponse(new { processed = count }, $"{count} pending notifications processed"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion
    }
}