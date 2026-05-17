using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace WMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public abstract class BaseController : ControllerBase
    {
        /// <summary>
        /// Get current branch ID from header (for SuperAdmin) or token (for normal users)
        /// </summary>
        protected int GetCurrentBranchId()
        {
            try
            {
                // STEP 1: Check if user is SuperAdmin
                bool isSuperAdmin = IsSuperAdmin();

                // STEP 2: SuperAdmin ke liye - header check karo (branch switcher)
                if (isSuperAdmin && Request.Headers.TryGetValue("X-Branch-ID", out var branchHeader))
                {
                    if (int.TryParse(branchHeader, out int branchId))
                    {
                        Console.WriteLine($"SuperAdmin using branch from header: {branchId}");
                        return branchId;
                    }
                }

                // STEP 3: Normal user ya SuperAdmin without header - token se lo
                var branchClaim = User.FindFirst("BranchID") ?? User.FindFirst("branchid");
                if (branchClaim != null && int.TryParse(branchClaim.Value, out int tokenBranchId))
                {
                    Console.WriteLine($"User using branch from token: {tokenBranchId}");
                    return tokenBranchId;
                }

                // STEP 4: Default branch
                Console.WriteLine("No branch found, using default 1");
                return 1;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting branch ID: {ex.Message}");
                return 1;
            }
        }

        /// <summary>
        /// Get current user ID from token
        /// </summary>
        protected int GetCurrentUserId()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
                                 User.FindFirst("UserID") ??
                                 User.FindFirst("userid");

                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
                {
                    return userId;
                }
                return 1; // Default
            }
            catch
            {
                return 1;
            }
        }

        /// <summary>
        /// Get current user name from token
        /// </summary>
        protected string GetCurrentUserName()
        {
            return User.Identity?.Name ?? "System";
        }

        /// <summary>
        /// Check if current user is SuperAdmin
        /// </summary>
        protected bool IsSuperAdmin()
        {
            try
            {
                // Check RoleID claim
                var roleClaim = User.FindFirst("RoleID") ?? User.FindFirst("roleid");
                if (roleClaim != null && int.TryParse(roleClaim.Value, out int roleId))
                {
                    // SuperAdmin RoleID = 2
                    return roleId == 2;
                }

                // Check RoleName claim
                var roleNameClaim = User.FindFirst(ClaimTypes.Role) ??
                                   User.FindFirst("RoleName") ??
                                   User.FindFirst("rolename");

                if (roleNameClaim != null)
                {
                    return roleNameClaim.Value?.ToLower() == "superadmin";
                }

                return false;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Check if current user is Admin (Administrator or SuperAdmin)
        /// </summary>
        protected bool IsAdmin()
        {
            try
            {
                // Check IsAdmin flag
                var isAdminClaim = User.FindFirst("IsAdmin") ?? User.FindFirst("isadmin");
                if (isAdminClaim != null && bool.TryParse(isAdminClaim.Value, out bool isAdmin))
                {
                    return isAdmin;
                }

                // Check role
                return IsSuperAdmin();
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Create response with branch info for debugging
        /// </summary>
        protected object CreateResponse(object data, string message = null)
        {
            return new
            {
                success = true,
                message = message,
                data = data,
                branchId = GetCurrentBranchId(),
                userId = GetCurrentUserId(),
                isSuperAdmin = IsSuperAdmin()
            };
        }

        /// <summary>
        /// Create error response with details
        /// </summary>
        protected object CreateErrorResponse(string message, Exception ex = null)
        {
            return new
            {
                success = false,
                message = message,
                error = ex?.Message,
                innerError = ex?.InnerException?.Message,
                branchId = GetCurrentBranchId(),
                userId = GetCurrentUserId()
            };
        }
    }
}