using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WMS.Api.DTOs.SystemUser;
using WMS.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace WMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SystemUserController : ControllerBase
    {
        private readonly ISystemUserService _userService;
        private readonly ILogger<SystemUserController> _logger;
        private readonly WMS.Api.Data.WmsDbContext _context;

        public SystemUserController(
            ISystemUserService userService,
            ILogger<SystemUserController> logger,
            WMS.Api.Data.WmsDbContext context)
        {
            _userService = userService;
            _logger = logger;
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            try
            {
                var branchId = GetCurrentUserBranchId();
                var users = _userService.GetAll(branchId);
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users");
                return StatusCode(500, new
                {
                    message = "An error occurred while fetching users",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message
                });
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            try
            {
                var user = _userService.GetById(id);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                var currentBranchId = GetCurrentUserBranchId();
                if (user.BranchID != currentBranchId)
                    return Forbid();

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user {Id}", id);
                return StatusCode(500, new
                {
                    message = "An error occurred while fetching user",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message
                });
            }
        }

        [HttpGet("roles")]
        public IActionResult GetRoles()
        {
            try
            {
                var roles = _userService.GetRoles();
                return Ok(roles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting roles");
                return StatusCode(500, new
                {
                    message = "An error occurred while fetching roles",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message
                });
            }
        }

        [HttpPost]
        public IActionResult Create([FromBody] SystemUserCreateDto dto)
        {
            var debug = new StringBuilder();
            try
            {
                debug.AppendLine($"=== CREATE USER DEBUG ===");
                debug.AppendLine($"Time: {DateTime.Now}");
                debug.AppendLine($"UserName: {dto?.UserName}");
                debug.AppendLine($"RoleID: {dto?.RoleID}");
                debug.AppendLine($"IsAdmin: {dto?.IsAdmin}");

                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    debug.AppendLine($"ModelState Invalid: {string.Join(", ", errors)}");
                    return BadRequest(new { message = "Validation failed", errors, debug = debug.ToString() });
                }

                var currentUserId = GetCurrentUserId();
                var currentBranchId = GetCurrentUserBranchId();

                debug.AppendLine($"CurrentUserId: {currentUserId}");
                debug.AppendLine($"CurrentBranchId: {currentBranchId}");

                // Direct database check before service call
                try
                {
                    var branchExists = _context.Branches.Any(b => b.BranchID == currentBranchId);
                    debug.AppendLine($"Branch exists: {branchExists}");

                    var roleExists = _context.RoleMasters.Any(r => r.RoleID == dto.RoleID);
                    debug.AppendLine($"Role exists: {roleExists}");

                    var usernameExists = _context.SystemUsers.Any(u => u.UserName == dto.UserName && u.IsDeleted != true);
                    debug.AppendLine($"Username exists: {usernameExists}");
                }
                catch (Exception ex)
                {
                    debug.AppendLine($"Database check error: {ex.Message}");
                }

                var user = _userService.Create(dto, currentUserId, currentBranchId);
                debug.AppendLine($"User created successfully with ID: {user.UserID}");

                return Ok(new
                {
                    message = "User created successfully",
                    user,
                    debug = debug.ToString()
                });
            }
            catch (InvalidOperationException ex)
            {
                debug.AppendLine($"Business logic error: {ex.Message}");
                return BadRequest(new
                {
                    message = ex.Message,
                    debug = debug.ToString()
                });
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error creating user");

                var errorDetails = new StringBuilder();
                errorDetails.AppendLine($"Message: {ex.Message}");
                errorDetails.AppendLine($"Inner: {ex.InnerException?.Message}");
                errorDetails.AppendLine($"InnerInner: {ex.InnerException?.InnerException?.Message}");

                // Try to get SQL error
                if (ex.InnerException != null)
                {
                    var sqlError = ex.InnerException.Message;
                    errorDetails.AppendLine($"SQL Error: {sqlError}");

                    // Check for specific errors
                    if (sqlError.Contains("FK_"))
                    {
                        errorDetails.AppendLine("Foreign key constraint violation");
                    }
                    if (sqlError.Contains("IX_"))
                    {
                        errorDetails.AppendLine("Unique constraint violation");
                    }
                    if (sqlError.Contains("Cannot insert NULL"))
                    {
                        errorDetails.AppendLine("Required field is NULL");
                    }
                    if (sqlError.Contains("String or binary data would be truncated"))
                    {
                        errorDetails.AppendLine("Field value too long");
                    }
                }

                return StatusCode(500, new
                {
                    message = "Database error occurred",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    details = errorDetails.ToString(),
                    debug = debug.ToString() + "\n" + errorDetails.ToString()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");

                var fullError = new StringBuilder();
                fullError.AppendLine($"Exception Type: {ex.GetType().Name}");
                fullError.AppendLine($"Message: {ex.Message}");
                fullError.AppendLine($"Inner: {ex.InnerException?.Message}");
                fullError.AppendLine($"Stack: {ex.StackTrace}");

                return StatusCode(500, new
                {
                    message = "An error occurred while creating user",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    fullError = fullError.ToString(),
                    debug = debug.ToString()
                });
            }
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] SystemUserUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (id == GetCurrentUserId() && dto.InActive)
                    return BadRequest(new { message = "You cannot deactivate your own account" });

                var currentUserId = GetCurrentUserId();
                var updated = _userService.Update(id, dto, currentUserId);

                if (updated == null)
                    return NotFound(new { message = "User not found" });

                return Ok(new { message = "User updated successfully", user = updated });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error updating user");
                return StatusCode(500, new
                {
                    message = "Database error",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {Id}", id);
                return StatusCode(500, new
                {
                    message = "An error occurred while updating user",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message
                });
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                if (id == GetCurrentUserId())
                    return BadRequest(new { message = "You cannot delete your own account" });

                var currentUserId = GetCurrentUserId();
                var deleted = _userService.Delete(id, currentUserId);

                if (!deleted)
                    return NotFound(new { message = "User not found" });

                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {Id}", id);
                return StatusCode(500, new
                {
                    message = "An error occurred while deleting user",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message
                });
            }
        }

        [HttpGet("check-username")]
        public IActionResult CheckUsername([FromQuery] string username, [FromQuery] int? excludeUserId = null)
        {
            try
            {
                var branchId = GetCurrentUserBranchId();
                var exists = _userService.IsUsernameExists(username, branchId, excludeUserId);
                return Ok(new { exists });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking username");
                return StatusCode(500, new
                {
                    message = "An error occurred",
                    error = ex.Message
                });
            }
        }

        #region Helper Methods
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId) ? userId : 1;
        }

        private int GetCurrentUserBranchId()
        {
            var branchIdClaim = User.FindFirst("BranchID") ?? User.FindFirst("branchid");
            if (branchIdClaim != null && int.TryParse(branchIdClaim.Value, out int branchId))
            {
                return branchId;
            }
            return 1; // Default branch
        }
        #endregion
    }
}