using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WMS.Api.Data;
using WMS.Api.Models;
using WMS.Api.DTOs.SystemUser;
using WMS.Api.Services.Interfaces;
using BCrypt.Net;

namespace WMS.Api.Services.Implementations
{
    public class SystemUserService : ISystemUserService
    {
        private readonly WmsDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<SystemUserService> _logger;

        public SystemUserService(
            WmsDbContext context,
            IMapper mapper,
            ILogger<SystemUserService> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public IEnumerable<SystemUserListDto> GetAll(int? branchId = null)
        {
            try
            {
                var query = _context.SystemUsers
                    .Include(u => u.Role)
                    .Include(u => u.Branch)
                    .Where(u => u.IsDeleted != true);

                if (branchId.HasValue && branchId > 0)
                {
                    query = query.Where(u => u.BranchID == branchId);
                }

                return query.Select(u => new SystemUserListDto
                {
                    UserID = u.UserID,
                    UserFullName = u.UserFullName ?? "",
                    UserName = u.UserName ?? "",
                    RoleName = u.Role != null ? u.Role.RoleName ?? "" : "",
                    BranchName = u.Branch != null ? u.Branch.BranchName ?? "" : "",
                    IsAdmin = u.IsAdmin ?? false,
                    InActive = u.InActive ?? false
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAll");
                throw new Exception($"Error loading users: {ex.Message}", ex);
            }
        }

        public SystemUserDto? GetById(int id)
        {
            try
            {
                var user = _context.SystemUsers
                    .Include(u => u.Role)
                    .Include(u => u.Branch)
                    .FirstOrDefault(u => u.UserID == id && u.IsDeleted != true);

                if (user == null) return null;

                return new SystemUserDto
                {
                    UserID = user.UserID,
                    UserFullName = user.UserFullName,
                    UserName = user.UserName,
                    UserEmail = user.UserEmail,
                    RoleID = user.RoleID,
                    RoleName = user.Role?.RoleName,
                    BranchID = user.BranchID,
                    BranchName = user.Branch?.BranchName,
                    IsAdmin = user.IsAdmin,
                    InActive = user.InActive,
                    IsApproved = user.IsApproved,
                    AddOn = user.AddOn,
                    EditOn = user.EditOn
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetById");
                throw new Exception($"Error loading user: {ex.Message}", ex);
            }
        }

        public SystemUserDto Create(SystemUserCreateDto dto, int createdBy, int branchId)
        {
            try
            {
                _logger.LogInformation($"Starting user creation: {dto.UserName}");

                // Validation
                if (string.IsNullOrWhiteSpace(dto.UserName))
                    throw new InvalidOperationException("Username is required");

                if (string.IsNullOrWhiteSpace(dto.Password))
                    throw new InvalidOperationException("Password is required");

                if (dto.RoleID <= 0)
                    throw new InvalidOperationException("Valid Role is required");

                // Check if username exists
                if (IsUsernameExists(dto.UserName, branchId))
                    throw new InvalidOperationException("Username already exists in this branch");

                // Check if role exists
                var role = _context.RoleMasters.Find(dto.RoleID);
                if (role == null)
                    throw new InvalidOperationException($"Role ID {dto.RoleID} does not exist");

                // Check if branch exists
                var branch = _context.Branches.Find(branchId > 0 ? branchId : 1);
                if (branch == null)
                    throw new InvalidOperationException($"Branch ID {branchId} does not exist");

                // Create user
                var user = new SystemUser
                {
                    UserFullName = dto.UserFullName?.Trim() ?? "",
                    UserName = dto.UserName.Trim(),
                    Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    UserEmail = dto.UserEmail?.Trim(),
                    RoleID = dto.RoleID,
                    BranchID = branchId > 0 ? branchId : 1,
                    IsAdmin = dto.IsAdmin,
                    AddBy = createdBy > 0 ? createdBy : 1,
                    AddOn = DateTime.Now,
                    IsApproved = true,
                    IsDeleted = false,
                    InActive = false,
                    DeptID = 1,
                    IsSupervisor = false,
                    CurrUser = false,
                    GodnID = 1,
                    AllowRateChange = false,
                    AllowChangePrintStatus = false,
                    DashBoardID = 1,
                    AllwDays = 0,
                    Allw_AllGodn = false,
                    AllowCNICSkip = false,
                    IsBoss = false,
                    HidePurcRate = false
                };

                _context.SystemUsers.Add(user);
                var saveResult = _context.SaveChanges();

                if (saveResult <= 0)
                    throw new Exception("No rows were saved to database");

                _context.Entry(user).Reference(u => u.Role).Load();
                _context.Entry(user).Reference(u => u.Branch).Load();

                _logger.LogInformation($"User created successfully with ID: {user.UserID}");

                return new SystemUserDto
                {
                    UserID = user.UserID,
                    UserFullName = user.UserFullName,
                    UserName = user.UserName,
                    UserEmail = user.UserEmail,
                    RoleID = user.RoleID,
                    RoleName = user.Role?.RoleName,
                    BranchID = user.BranchID,
                    BranchName = user.Branch?.BranchName,
                    IsAdmin = user.IsAdmin,
                    InActive = user.InActive,
                    AddOn = user.AddOn
                };
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error creating user");
                throw new Exception($"Database error: {ex.InnerException?.Message ?? ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Create");
                throw new Exception($"Error creating user: {ex.Message}", ex);
            }
        }

        public SystemUserDto? Update(int id, SystemUserUpdateDto dto, int editedBy)
        {
            try
            {
                var user = _context.SystemUsers.Find(id);
                if (user == null) return null;

                if (IsUsernameExists(dto.UserName, user.BranchID, id))
                    throw new InvalidOperationException("Username already exists in this branch");

                user.UserFullName = dto.UserFullName?.Trim() ?? user.UserFullName;
                user.UserName = dto.UserName?.Trim() ?? user.UserName;
                user.UserEmail = dto.UserEmail?.Trim();
                user.RoleID = dto.RoleID;
                user.IsAdmin = dto.IsAdmin;
                user.InActive = dto.InActive;

                if (!string.IsNullOrEmpty(dto.Password))
                {
                    user.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);
                }

                user.EditBy = editedBy;
                user.EditOn = DateTime.Now;

                _context.SaveChanges();

                _context.Entry(user).Reference(u => u.Role).Load();
                _context.Entry(user).Reference(u => u.Branch).Load();

                return new SystemUserDto
                {
                    UserID = user.UserID,
                    UserFullName = user.UserFullName,
                    UserName = user.UserName,
                    UserEmail = user.UserEmail,
                    RoleID = user.RoleID,
                    RoleName = user.Role?.RoleName,
                    BranchID = user.BranchID,
                    BranchName = user.Branch?.BranchName,
                    IsAdmin = user.IsAdmin,
                    InActive = user.InActive,
                    EditOn = user.EditOn
                };
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Update");
                throw new Exception($"Error updating user: {ex.Message}", ex);
            }
        }

        public bool Delete(int id, int deletedBy)
        {
            try
            {
                var user = _context.SystemUsers.Find(id);
                if (user == null) return false;

                user.IsDeleted = true;
                user.EditBy = deletedBy;
                user.EditOn = DateTime.Now;

                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Delete");
                throw new Exception($"Error deleting user: {ex.Message}", ex);
            }
        }

        public IEnumerable<RoleDto> GetRoles()
        {
            try
            {
                return _context.RoleMasters
                    .Where(r => r.InActive == null || r.InActive != true)
                    .Select(r => new RoleDto
                    {
                        RoleID = r.RoleID,
                        RoleName = r.RoleName ?? "",
                        RoleRemarks = r.RoleRemarks
                    })
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetRoles");
                return new List<RoleDto>();
            }
        }

        public bool IsUsernameExists(string username, int? branchId = null, int? excludeUserId = null)
        {
            var query = _context.SystemUsers
                .Where(u => u.UserName == username && u.IsDeleted != true);

            if (branchId.HasValue && branchId > 0)
            {
                query = query.Where(u => u.BranchID == branchId);
            }

            if (excludeUserId.HasValue)
            {
                query = query.Where(u => u.UserID != excludeUserId);
            }

            return query.Any();
        }
    }
}