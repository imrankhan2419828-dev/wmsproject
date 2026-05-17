using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WMS.Api.Data;
using WMS.Api.DTOs.Auth;
using WMS.Api.DTOs.Menu;
using WMS.Api.Models;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly WmsDbContext _db;
        private readonly IConfiguration _config;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            WmsDbContext db,
            IConfiguration config,
            ILogger<AuthService> logger)
        {
            _db = db;
            _config = config;
            _logger = logger;
        }

        
        private List<MenuDto> BuildMenuTree(List<MenuDto> flatList)
        {
            if (flatList == null || !flatList.Any())
                return new List<MenuDto>();

            _logger.LogInformation($"🔥 Building tree from {flatList.Count} items");

            // Ensure Children list initialized
            foreach (var item in flatList)
            {
                item.Children = new List<MenuDto>();
            }

            var lookup = flatList.ToDictionary(x => x.MenuID);
            var roots = new List<MenuDto>();

            foreach (var item in flatList)
            {
                // ✅ VALID PARENT
                if (item.ParentID != null && item.ParentID != 0 && lookup.ContainsKey(item.ParentID.Value))
                {
                    lookup[item.ParentID.Value].Children.Add(item);
                }
                else
                {
                    // ✅ NO PARENT OR INVALID → ROOT
                    roots.Add(item);
                }
            }

            // 🔥 SORT EVERYTHING
            void SortRecursive(List<MenuDto> list)
            {
                list.Sort((a, b) => (a.MenuOrder ?? 0).CompareTo(b.MenuOrder ?? 0));

                foreach (var item in list)
                {
                    if (item.Children != null && item.Children.Count > 0)
                    {
                        SortRecursive(item.Children);
                    }
                }
            }

            SortRecursive(roots);

            // 🔥 DEBUG (VERY IMPORTANT)
            int totalChildren = flatList.Count - roots.Count;

            _logger.LogInformation("=================================");
            _logger.LogInformation($"✅ TREE BUILT SUCCESSFULLY");
            _logger.LogInformation($"👉 Total Menus: {flatList.Count}");
            _logger.LogInformation($"👉 Root Menus: {roots.Count}");
            _logger.LogInformation($"👉 Child Menus: {totalChildren}");
            _logger.LogInformation("=================================");

            return roots;
        }
        private void SortMenuChildren(MenuDto menu)
        {
            if (menu.Children.Any())
            {
                menu.Children = menu.Children.OrderBy(x => x.MenuOrder).ToList();
                foreach (var child in menu.Children)
                {
                    SortMenuChildren(child);
                }
            }
        }

        private void LogMenuStructure(MenuDto menu, int level)
        {
            var indent = new string(' ', level * 2);
            _logger.LogDebug($"{indent}- {menu.MenuName} (ID: {menu.MenuID}, Children: {menu.Children.Count})");

            foreach (var child in menu.Children)
            {
                LogMenuStructure(child, level + 1);
            }
        }
        // ===================== TREE BUILDER END =====================
        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            try
            {
                _logger.LogInformation("=================================");
                _logger.LogInformation("LOGIN ATTEMPT STARTED");
                _logger.LogInformation($"Username: '{request?.UserName}'");
                _logger.LogInformation($"Password: '{request?.Password}'");
                _logger.LogInformation("=================================");

                // STEP 1: Find user
                var user = await _db.SystemUsers
                    .Include(x => x.Role)
                    .FirstOrDefaultAsync(x =>
                        x.UserName == request.UserName &&
                        x.IsDeleted != true);

                if (user == null)
                {
                    _logger.LogWarning($"USER NOT FOUND: {request.UserName}");
                    throw new Exception("Invalid username or password.");
                }

                _logger.LogInformation($"USER FOUND: ID={user.UserID}, Name={user.UserName}");
                _logger.LogInformation($"User Role: {user.Role?.RoleName}"); // 👈 Debug log

                // STEP 2: Check user active
                if (user.IsDeleted == true || user.InActive == true)
                {
                    _logger.LogWarning($"User inactive/deleted: {request.UserName}");
                    throw new Exception("User is inactive or deleted.");
                }

                // STEP 3: VERIFY PASSWORD
                bool isValidPassword = false;

                if (user.Password != null && user.Password.StartsWith("$2a$"))
                {
                    isValidPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);
                }
                else
                {
                    isValidPassword = (user.Password == request.Password);
                    if (isValidPassword)
                    {
                        user.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);
                        await _db.SaveChangesAsync();
                    }
                }

                if (!isValidPassword)
                {
                    throw new Exception("Invalid username or password.");
                }

                // STEP 4: Create token
                var token = CreateToken(user);
                var menus = await LoadUserMenus(user.RoleID, user.UserID);

                // ✅ FIXED: Return RoleName with response
                return new LoginResponseDto
                {
                    Token = token,
                    UserID = user.UserID,
                    FullName = user.UserFullName ?? "",
                    RoleID = user.RoleID ?? 0,
                    RoleName = user.Role?.RoleName ?? "", // 👈 ADD THIS
                    BranchID = user.BranchID ?? 1,
                    Menus = menus
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Login error for user: {request?.UserName}");
                throw;
            }
        }
        private string CreateToken(SystemUser user)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"])
            );

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim("UserID", user.UserID.ToString()),
                new Claim("RoleID", (user.RoleID ?? 0).ToString()),
                new Claim("BranchID", (user.BranchID ?? 1).ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
                new Claim(ClaimTypes.Name, user.UserName ?? ""),
                new Claim("FullName", user.UserFullName ?? "")
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(12),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // ===================== FIXED MENU LOAD =====================
       
        // ===================== FIXED MENU LOAD =====================
        private async Task<List<MenuDto>> LoadUserMenus(int? roleId, int userId)
        {
            try
            {
                var user = await _db.SystemUsers
                    .Include(x => x.Role)
                    .FirstOrDefaultAsync(x => x.UserID == userId);

                if (user == null)
                    return new List<MenuDto>();

                bool isSuperAdmin =
                    user.IsAdmin == true ||
                    (user.Role != null &&
                     (user.Role.RoleName.ToLower() == "administrator" ||
                      user.Role.RoleName.ToLower() == "superadmin"));

                List<FormDetail> allowedForms;

                if (isSuperAdmin)
                {
                    // Super Admin: GetAll Forms with proper ordering
                    allowedForms = await _db.FormDetail
                        .OrderBy(x => x.MenuCategory)
                        .ThenBy(x => x.MenuOrder)
                        .ThenBy(x => x.FormOrder)
                        .ToListAsync();
                }
                else
                {
                    // Role-based access
                    var roleFormIds = await _db.RolePermissions
                        .Where(rp => rp.RoleID == roleId && rp.CanView == true)
                        .Select(rp => rp.MenuID)
                        .ToListAsync();

                    var roleForms = await _db.FormDetail
                        .Where(f => roleFormIds.Contains(f.FormID))
                        .ToListAsync();

                    // Include parents for hierarchy
                    var parentIds = roleForms
                        .Where(x => x.ParentPage != null)
                        .Select(x => x.ParentPage.Value)
                        .Distinct()
                        .ToList();

                    var parentForms = await _db.FormDetail
                        .Where(f => parentIds.Contains(f.FormID))
                        .ToListAsync();

                    allowedForms = roleForms
                        .Union(parentForms)
                        .OrderBy(x => x.MenuCategory)
                        .ThenBy(x => x.MenuOrder)
                        .ThenBy(x => x.FormOrder)
                        .ToList();
                }

                // Convert to DTO
                var menuList = allowedForms.Select(f => new MenuDto
                {
                    MenuID = f.FormID,
                    MenuName = f.MenuTitle ?? f.FormName ?? "",
                    MenuPath = f.FormName ?? "",
                    Icon = string.IsNullOrEmpty(f.MenuIcon) ? GetDefaultIcon(f.MenuCategory) : f.MenuIcon,
                    MenuCategory = f.MenuCategory ?? "Other",
                    ParentID = f.ParentPage,
                    MenuOrder = f.MenuOrder ?? 999
                }).ToList();

                return BuildMenuTree(menuList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading menus");
                return new List<MenuDto>();
            }
        }

        private string GetDefaultIcon(string category)
        {
            return category?.ToLower() switch
            {
                "main" => "🏠",
                "system section" => "⚙️",
                "coding section" => "💻",
                "entry section" => "📝",
                "reporting section" => "📊",
                "workshop" => "🔧",
                "inventory" => "📦",
                _ => "📌"
            };
        }
    }
}