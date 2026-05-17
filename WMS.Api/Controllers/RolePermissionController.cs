//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.Data.SqlClient;
//using Microsoft.EntityFrameworkCore;
//using System.Security.Claims;
//using WMS.Api.DTOs.Permissions;
//using WMS.Api.Services.Interfaces;
//using WMS.Api.Data;

//namespace WMS.Api.Controllers
//{
//    [ApiController]
//    [Route("api/[controller]")]
//    [Authorize]
//    public class RolePermissionController : ControllerBase
//    {
//        private readonly IRolePermissionService _service;
//        private readonly ILogger<RolePermissionController> _logger;
//        private readonly WmsDbContext _context;

//        public RolePermissionController(
//            IRolePermissionService service,
//            ILogger<RolePermissionController> logger,
//            WmsDbContext context)
//        {
//            _service = service;
//            _logger = logger;
//            _context = context;
//        }

//        [HttpGet]
//        public async Task<IActionResult> GetAll()
//        {
//            try
//            {
//                var data = await _service.GetAllAsync();
//                return Ok(data);
//            }
//            catch (Exception ex)
//            {
//                _logger.LogError(ex, "Error getting all permissions");
//                return StatusCode(500, new
//                {
//                    message = "Error loading permissions",
//                    error = ex.Message,
//                    innerError = ex.InnerException?.Message
//                });
//            }
//        }

//        [HttpGet("role/{roleId}")]
//        public async Task<IActionResult> GetByRole(int roleId)
//        {
//            try
//            {
//                _logger.LogInformation($"GetByRole called for RoleID: {roleId}");
//                var branchId = GetCurrentBranchId();
//                _logger.LogInformation($"Using BranchID: {branchId}");

//                var data = await _service.GetByRoleAsync(roleId, branchId);
//                _logger.LogInformation($"Returning {data.Count()} permissions");

//                return Ok(data);
//            }
//            catch (Exception ex)
//            {
//                _logger.LogError(ex, "Error getting permissions for role {RoleId}", roleId);

//                // Detailed error response
//                var errorResponse = new
//                {
//                    message = "Error loading permissions",
//                    error = ex.Message,
//                    innerError = ex.InnerException?.Message,
//                    stackTrace = ex.StackTrace,
//                    source = ex.Source,
//                    data = ex.Data
//                };

//                return StatusCode(500, errorResponse);
//            }
//        }

//        [HttpPost("save-bulk")]
//        public async Task<IActionResult> SaveBulk([FromBody] RolePermissionBulkSaveDto dto)
//        {
//            try
//            {
//                _logger.LogInformation("SaveBulk called for RoleID: {RoleID}", dto?.RoleID);

//                if (dto == null)
//                    return BadRequest(new { message = "Invalid request data" });

//                if (dto.RoleID <= 0)
//                    return BadRequest(new { message = "Invalid Role ID" });

//                dto.BranchID = GetCurrentBranchId();

//                await _service.SavePermissionsAsync(dto);

//                return Ok(new { message = "Permissions saved successfully" });
//            }
//            catch (Exception ex)
//            {
//                _logger.LogError(ex, "Error saving permissions");
//                return StatusCode(500, new
//                {
//                    message = "Error saving permissions",
//                    error = ex.Message,
//                    innerError = ex.InnerException?.Message
//                });
//            }
//        }

//        [HttpPost]
//        public async Task<IActionResult> CreateOrUpdate([FromBody] RolePermissionCreateDto dto)
//        {
//            try
//            {
//                if (dto.RoleID <= 0 || dto.MenuID <= 0)
//                    return BadRequest(new { message = "Invalid Role ID or Menu ID" });

//                dto.BranchID = GetCurrentBranchId();

//                await _service.CreateOrUpdateAsync(dto);
//                return Ok(new { message = "Permission saved successfully" });
//            }
//            catch (Exception ex)
//            {
//                _logger.LogError(ex, "Error saving permission");
//                return StatusCode(500, new
//                {
//                    message = "Error saving permission",
//                    error = ex.Message,
//                    innerError = ex.InnerException?.Message
//                });
//            }
//        }

//        private int GetCurrentBranchId()
//        {
//            var branchIdClaim = User.FindFirst("BranchID");
//            if (branchIdClaim != null && int.TryParse(branchIdClaim.Value, out int branchId))
//            {
//                return branchId;
//            }
//            return 1; // Default branch
//        }


//        [HttpGet("role-debug/{roleId}")]
//        public async Task<IActionResult> GetByRoleDebug(int roleId)
//        {
//            try
//            {
//                var branchId = GetCurrentBranchId();
//                var permissions = new List<object>();

//                using (var command = _context.Database.GetDbConnection().CreateCommand())
//                {
//                    command.CommandText = @"
//                SELECT 
//                    rp.RolePermissionID, 
//                    rp.RoleID, 
//                    rp.MenuID, 
//                    rp.BranchID, 
//                    rp.CanView, 
//                    rp.CanAdd, 
//                    rp.CanEdit, 
//                    rp.CanDelete,
//                    ISNULL(rm.RoleName, '') as RoleName,
//                    ISNULL(fd.FormName, '') as FormName,
//                    ISNULL(fd.FormTitle, '') as FormTitle
//                FROM RolePermission rp
//                INNER JOIN RoleMaster rm ON rp.RoleID = rm.RoleID
//                INNER JOIN FormDetail fd ON rp.MenuID = fd.FormID
//                WHERE rp.RoleID = @roleId AND rp.BranchID = @branchId";

//                    command.Parameters.Add(new SqlParameter("@roleId", roleId));
//                    command.Parameters.Add(new SqlParameter("@branchId", branchId));

//                    await _context.Database.OpenConnectionAsync();

//                    using (var reader = await command.ExecuteReaderAsync())
//                    {
//                        while (await reader.ReadAsync())
//                        {
//                            permissions.Add(new
//                            {
//                                RolePermissionID = reader.GetInt32(0),
//                                RoleID = reader.GetInt32(1),
//                                MenuID = reader.GetInt32(2),
//                                BranchID = reader.GetInt32(3),
//                                CanView = reader.GetBoolean(4),
//                                CanAdd = reader.GetBoolean(5),
//                                CanEdit = reader.GetBoolean(6),
//                                CanDelete = reader.GetBoolean(7),
//                                RoleName = reader.GetString(8),
//                                FormName = reader.GetString(9),
//                                FormTitle = reader.GetString(10)
//                            });
//                        }
//                    }

//                    _context.Database.CloseConnection();
//                }

//                return Ok(permissions);
//            }
//            catch (Exception ex)
//            {
//                _logger.LogError(ex, "Debug error");
//                return StatusCode(500, new
//                {
//                    error = ex.Message,
//                    inner = ex.InnerException?.Message,
//                    stack = ex.StackTrace
//                });
//            }
//        }
//    }
//}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WMS.Api.DTOs.Permissions;
using WMS.Api.Services.Interfaces;
using WMS.Api.Data;
using Dapper;

namespace WMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RolePermissionController : ControllerBase
    {
        private readonly IRolePermissionService _service;
        private readonly ILogger<RolePermissionController> _logger;
        private readonly WmsDbContext _context;

        public RolePermissionController(
            IRolePermissionService service,
            ILogger<RolePermissionController> logger,
            WmsDbContext context)
        {
            _service = service;
            _logger = logger;
            _context = context;
        }

        #region Helper Methods
        private bool IsSuperAdmin()
        {
            var roleClaim = User.FindFirst("RoleID") ?? User.FindFirst("roleid");
            if (roleClaim != null && int.TryParse(roleClaim.Value, out int roleId))
            {
                return roleId == 2; // SuperAdmin RoleID = 2
            }

            var roleNameClaim = User.FindFirst(ClaimTypes.Role) ??
                               User.FindFirst("RoleName") ??
                               User.FindFirst("rolename");
            if (roleNameClaim != null)
            {
                return roleNameClaim.Value?.ToLower() == "superadmin";
            }

            return false;
        }

        private int GetCurrentBranchId()
        {
            var branchIdClaim = User.FindFirst("BranchID") ?? User.FindFirst("branchid");
            if (branchIdClaim != null && int.TryParse(branchIdClaim.Value, out int branchId))
            {
                return branchId;
            }
            return 1;
        }

        private IActionResult Forbidden()
        {
            return StatusCode(403, new { message = "Access denied. Only SuperAdmin can access this resource." });
        }
        #endregion

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // ✅ SuperAdmin only
            if (!IsSuperAdmin())
                return Forbidden();

            try
            {
                var data = await _service.GetAllAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all permissions");
                return StatusCode(500, new { message = "Error loading permissions", error = ex.Message });
            }
        }

        [HttpGet("role/{roleId}")]
        public async Task<IActionResult> GetByRole(int roleId)
        {
            // ✅ SuperAdmin only
            if (!IsSuperAdmin())
                return Forbidden();

            try
            {
                _logger.LogInformation($"GetByRole called for RoleID: {roleId}");
                var branchId = GetCurrentBranchId();
                _logger.LogInformation($"Using BranchID: {branchId}");

                var data = await _service.GetByRoleAsync(roleId, branchId);
                _logger.LogInformation($"Returning {data.Count()} permissions");

                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting permissions for role {RoleId}", roleId);
                return StatusCode(500, new { message = "Error loading permissions", error = ex.Message });
            }
        }

        [HttpPost("save-bulk")]
        public async Task<IActionResult> SaveBulk([FromBody] RolePermissionBulkSaveDto dto)
        {
            // ✅ SuperAdmin only
            if (!IsSuperAdmin())
                return Forbidden();

            try
            {
                _logger.LogInformation("SaveBulk called for RoleID: {RoleID}", dto?.RoleID);

                if (dto == null)
                    return BadRequest(new { message = "Invalid request data" });

                if (dto.RoleID <= 0)
                    return BadRequest(new { message = "Invalid Role ID" });

                dto.BranchID = GetCurrentBranchId();

                await _service.SavePermissionsAsync(dto);

                return Ok(new { message = "Permissions saved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving permissions");
                return StatusCode(500, new { message = "Error saving permissions", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrUpdate([FromBody] RolePermissionCreateDto dto)
        {
            // ✅ SuperAdmin only
            if (!IsSuperAdmin())
                return Forbidden();

            try
            {
                if (dto.RoleID <= 0 || dto.MenuID <= 0)
                    return BadRequest(new { message = "Invalid Role ID or Menu ID" });

                dto.BranchID = GetCurrentBranchId();

                await _service.CreateOrUpdateAsync(dto);
                return Ok(new { message = "Permission saved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving permission");
                return StatusCode(500, new { message = "Error saving permission", error = ex.Message });
            }
        }

        [HttpDelete("role/{roleId}/branch/{branchId}")]
        public async Task<IActionResult> DeleteByRoleAndBranch(int roleId, int branchId)
        {
            // ✅ SuperAdmin only
            if (!IsSuperAdmin())
                return Forbidden();

            try
            {
                using (var connection = new SqlConnection(_context.Database.GetConnectionString()))
                {
                    await connection.OpenAsync();
                    var sql = "DELETE FROM RolePermission WHERE RoleID = @RoleID AND BranchID = @BranchID";
                    var count = await connection.ExecuteAsync(sql, new { RoleID = roleId, BranchID = branchId });

                    return Ok(new { message = $"{count} permissions deleted successfully" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting permissions");
                return StatusCode(500, new { message = "Error deleting permissions", error = ex.Message });
            }
        }

        [HttpGet("role-debug/{roleId}")]
        public async Task<IActionResult> GetByRoleDebug(int roleId)
        {
            // ✅ SuperAdmin only
            if (!IsSuperAdmin())
                return Forbidden();

            try
            {
                var branchId = GetCurrentBranchId();
                var permissions = new List<object>();

                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT 
                            rp.RolePermissionID, 
                            rp.RoleID, 
                            rp.MenuID, 
                            rp.BranchID, 
                            rp.CanView, 
                            rp.CanAdd, 
                            rp.CanEdit, 
                            rp.CanDelete,
                            ISNULL(rm.RoleName, '') as RoleName,
                            ISNULL(fd.FormName, '') as FormName,
                            ISNULL(fd.FormTitle, '') as FormTitle
                        FROM RolePermission rp
                        INNER JOIN RoleMaster rm ON rp.RoleID = rm.RoleID
                        INNER JOIN FormDetail fd ON rp.MenuID = fd.FormID
                        WHERE rp.RoleID = @roleId AND rp.BranchID = @branchId";

                    command.Parameters.Add(new SqlParameter("@roleId", roleId));
                    command.Parameters.Add(new SqlParameter("@branchId", branchId));

                    await _context.Database.OpenConnectionAsync();

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            permissions.Add(new
                            {
                                RolePermissionID = reader.GetInt32(0),
                                RoleID = reader.GetInt32(1),
                                MenuID = reader.GetInt32(2),
                                BranchID = reader.GetInt32(3),
                                CanView = reader.GetBoolean(4),
                                CanAdd = reader.GetBoolean(5),
                                CanEdit = reader.GetBoolean(6),
                                CanDelete = reader.GetBoolean(7),
                                RoleName = reader.GetString(8),
                                FormName = reader.GetString(9),
                                FormTitle = reader.GetString(10)
                            });
                        }
                    }

                    _context.Database.CloseConnection();
                }

                return Ok(permissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Debug error");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}