using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Models.Workshop;
using WMS.Api.Services.Interfaces.Workshop;
using Microsoft.Data.SqlClient;
using iTextSharp.text;
using iTextSharp.text.pdf;

namespace WMS.Api.Services.Implementations.Workshop
{
    public class DepartmentService : IDepartmentService
    {
        private readonly WmsDbContext _context;
        private readonly ILogger<DepartmentService> _logger;

        public DepartmentService(WmsDbContext context, ILogger<DepartmentService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Department CRUD

        public async Task<IEnumerable<DepartmentDto>> GetAllDepartmentsAsync(int branchId, bool? isActive = null)
        {
            try
            {
                var query = _context.Departments
                    .Include(d => d.Manager)
                    .Where(d => d.BranchID == branchId);

                if (isActive.HasValue)
                    query = query.Where(d => d.IsActive == isActive.Value);

                var departments = await query
                    .OrderBy(d => d.DepartmentCode)
                    .ToListAsync();

                var dtos = new List<DepartmentDto>();

                foreach (var dept in departments)
                {
                    dtos.Add(await MapToDto(dept));
                }

                return dtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting departments");
                throw;
            }
        }

        public async Task<DepartmentDto?> GetDepartmentByIdAsync(int id, int branchId)
        {
            try
            {
                var department = await _context.Departments
                    .Include(d => d.Manager)
                    .FirstOrDefaultAsync(d => d.DepartmentID == id && d.BranchID == branchId);

                return department == null ? null : await MapToDto(department);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting department {Id}", id);
                throw;
            }
        }

        public async Task<DepartmentDto> CreateDepartmentAsync(DepartmentCreateDto dto, int userId, int branchId)
        {
            try
            {
                // Check if department code already exists
                var exists = await _context.Departments
                    .AnyAsync(d => d.DepartmentCode == dto.DepartmentCode && d.BranchID == branchId);

                if (exists)
                    throw new InvalidOperationException($"Department code {dto.DepartmentCode} already exists");

                var department = new Department
                {
                    DepartmentCode = dto.DepartmentCode,
                    DepartmentName = dto.DepartmentName,
                    Description = dto.Description,
                    BranchID = branchId,
                    ManagerID = dto.ManagerID,
                    Email = dto.Email,
                    Phone = dto.Phone,
                    Location = dto.Location,
                    IsActive = dto.IsActive,
                    CreatedBy = userId,
                    CreatedDate = DateTime.Now
                };

                _context.Departments.Add(department);
                await _context.SaveChangesAsync();

                return await GetDepartmentByIdAsync(department.DepartmentID, branchId)
                    ?? throw new Exception("Failed to retrieve created department");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating department");
                throw;
            }
        }

        public async Task<DepartmentDto?> UpdateDepartmentAsync(int id, DepartmentUpdateDto dto, int userId, int branchId)
        {
            try
            {
                var department = await _context.Departments
                    .FirstOrDefaultAsync(d => d.DepartmentID == id && d.BranchID == branchId);

                if (department == null)
                    return null;

                // Check if department code already exists (excluding current)
                var exists = await _context.Departments
                    .AnyAsync(d => d.DepartmentCode == dto.DepartmentCode
                        && d.DepartmentID != id
                        && d.BranchID == branchId);

                if (exists)
                    throw new InvalidOperationException($"Department code {dto.DepartmentCode} already exists");

                // Update fields
                department.DepartmentCode = dto.DepartmentCode;
                department.DepartmentName = dto.DepartmentName;
                department.Description = dto.Description;
                department.ManagerID = dto.ManagerID;
                department.Email = dto.Email;
                department.Phone = dto.Phone;
                department.Location = dto.Location;
                department.IsActive = dto.IsActive;
                department.ModifiedBy = userId;
                department.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return await GetDepartmentByIdAsync(id, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating department {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteDepartmentAsync(int id, int branchId)
        {
            try
            {
                var department = await _context.Departments
                    .FirstOrDefaultAsync(d => d.DepartmentID == id && d.BranchID == branchId);

                if (department == null)
                    return false;

                // Check if department has any active jobs
                var hasActiveJobs = await _context.JobDepartments
                    .AnyAsync(jd => jd.DepartmentID == id && jd.Status == "ACTIVE");

                if (hasActiveJobs)
                    throw new InvalidOperationException("Cannot delete department with active jobs");

                // Check if department has any technicians
                var hasTechnicians = await _context.TechnicianDepartments
                    .AnyAsync(td => td.DepartmentID == id && td.IsActive);

                if (hasTechnicians)
                    throw new InvalidOperationException("Cannot delete department with assigned technicians");

                _context.Departments.Remove(department);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting department {Id}", id);
                throw;
            }
        }

        public async Task<bool> ToggleDepartmentStatusAsync(int id, bool isActive, int userId, int branchId)
        {
            try
            {
                var department = await _context.Departments
                    .FirstOrDefaultAsync(d => d.DepartmentID == id && d.BranchID == branchId);

                if (department == null)
                    return false;

                department.IsActive = isActive;
                department.ModifiedBy = userId;
                department.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling department status {Id}", id);
                throw;
            }
        }

        #endregion

        #region Job Department Assignment

        public async Task<IEnumerable<JobDepartmentDto>> GetJobDepartmentsAsync(int jobCardId, int branchId)
        {
            try
            {
                var jobDepartments = await _context.JobDepartments
                    .Include(jd => jd.JobCard)
                    .Include(jd => jd.Department)
                    .Where(jd => jd.JobCardID == jobCardId && jd.JobCard!.BranchID == branchId)
                    .OrderByDescending(jd => jd.AssignedDate)
                    .ToListAsync();

                return jobDepartments.Select(MapToJobDepartmentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting job departments for job {JobCardId}", jobCardId);
                throw;
            }
        }

        public async Task<JobDepartmentDto> AssignJobToDepartmentAsync(JobDepartmentAssignDto dto, int userId, int branchId)
        {
            try
            {
                // Check if job exists
                var job = await _context.JobCards
                    .FirstOrDefaultAsync(j => j.JobCardID == dto.JobCardID && j.BranchID == branchId);

                if (job == null)
                    throw new InvalidOperationException("Job card not found");

                // Check if department exists and is active
                var department = await _context.Departments
                    .FirstOrDefaultAsync(d => d.DepartmentID == dto.DepartmentID
                        && d.BranchID == branchId
                        && d.IsActive);

                if (department == null)
                    throw new InvalidOperationException("Department not found or inactive");

                // Check if already assigned
                var existing = await _context.JobDepartments
                    .FirstOrDefaultAsync(jd => jd.JobCardID == dto.JobCardID
                        && jd.DepartmentID == dto.DepartmentID
                        && jd.Status == "ACTIVE");

                if (existing != null)
                    throw new InvalidOperationException("Job already assigned to this department");

                var jobDepartment = new JobDepartment
                {
                    JobCardID = dto.JobCardID,
                    DepartmentID = dto.DepartmentID,
                    Status = "ACTIVE",
                    Notes = dto.Notes,
                    CreatedBy = userId,
                    CreatedDate = DateTime.Now
                };

                _context.JobDepartments.Add(jobDepartment);
                await _context.SaveChangesAsync();

                return MapToJobDepartmentDto(jobDepartment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning job to department");
                throw;
            }
        }

        public async Task<bool> CompleteJobDepartmentAsync(int jobCardId, int departmentId, int userId, int branchId)
        {
            try
            {
                var jobDepartment = await _context.JobDepartments
                    .FirstOrDefaultAsync(jd => jd.JobCardID == jobCardId
                        && jd.DepartmentID == departmentId
                        && jd.Status == "ACTIVE");

                if (jobDepartment == null)
                    return false;

                jobDepartment.Status = "COMPLETED";
                jobDepartment.CompletedDate = DateTime.Now;
                jobDepartment.ModifiedBy = userId;
                jobDepartment.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing job department");
                throw;
            }
        }

        public async Task<IEnumerable<JobDepartmentDto>> GetJobsByDepartmentAsync(int departmentId, int branchId, string? status = null)
        {
            try
            {
                var query = _context.JobDepartments
                    .Include(jd => jd.JobCard)
                        .ThenInclude(j => j!.Vehicle)
                    .Include(jd => jd.Department)
                    .Where(jd => jd.DepartmentID == departmentId && jd.JobCard!.BranchID == branchId);

                if (!string.IsNullOrEmpty(status))
                    query = query.Where(jd => jd.Status == status);

                var jobDepartments = await query
                    .OrderByDescending(jd => jd.AssignedDate)
                    .ToListAsync();

                return jobDepartments.Select(MapToJobDepartmentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting jobs for department {DepartmentId}", departmentId);
                throw;
            }
        }

        #endregion

        #region Technician Department Assignment

        public async Task<IEnumerable<TechnicianDepartmentDto>> GetTechnicianDepartmentsAsync(int technicianId, int branchId)
        {
            try
            {
                var techDepartments = await _context.TechnicianDepartments
                    .Include(td => td.Technician)
                        .ThenInclude(t => t!.User)
                    .Include(td => td.Department)
                    .Where(td => td.TechnicianID == technicianId
                        && td.Technician!.User!.BranchID == branchId
                        && td.IsActive)
                    .OrderByDescending(td => td.IsPrimary)
                    .ThenBy(td => td.AssignedDate)
                    .ToListAsync();

                return techDepartments.Select(MapToTechnicianDepartmentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting departments for technician {TechnicianId}", technicianId);
                throw;
            }
        }

        public async Task<IEnumerable<TechnicianDepartmentDto>> GetDepartmentTechniciansAsync(int departmentId, int branchId)
        {
            try
            {
                var techDepartments = await _context.TechnicianDepartments
                    .Include(td => td.Technician)
                        .ThenInclude(t => t!.User)
                    .Include(td => td.Department)
                    .Where(td => td.DepartmentID == departmentId
                        && td.IsActive
                        && td.Technician!.User!.BranchID == branchId)
                    .OrderByDescending(td => td.IsPrimary)
                    .ThenBy(td => td.AssignedDate)
                    .ToListAsync();

                return techDepartments.Select(MapToTechnicianDepartmentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting technicians for department {DepartmentId}", departmentId);
                throw;
            }
        }

        public async Task<TechnicianDepartmentDto> AssignTechnicianToDepartmentAsync(TechnicianDepartmentAssignDto dto, int userId, int branchId)
        {
            try
            {
                // Check if technician exists
                var technician = await _context.Technicians
                    .Include(t => t.User)
                    .FirstOrDefaultAsync(t => t.TechnicianID == dto.TechnicianID
                        && t.User!.BranchID == branchId);

                if (technician == null)
                    throw new InvalidOperationException("Technician not found");

                // Check if department exists
                var department = await _context.Departments
                    .FirstOrDefaultAsync(d => d.DepartmentID == dto.DepartmentID && d.BranchID == branchId);

                if (department == null)
                    throw new InvalidOperationException("Department not found");

                // Check if already assigned
                var existing = await _context.TechnicianDepartments
                    .FirstOrDefaultAsync(td => td.TechnicianID == dto.TechnicianID
                        && td.DepartmentID == dto.DepartmentID
                        && td.IsActive);

                if (existing != null)
                    throw new InvalidOperationException("Technician already assigned to this department");

                // If setting as primary, unset any existing primary
                if (dto.IsPrimary)
                {
                    var currentPrimary = await _context.TechnicianDepartments
                        .FirstOrDefaultAsync(td => td.TechnicianID == dto.TechnicianID
                            && td.IsPrimary
                            && td.IsActive);

                    if (currentPrimary != null)
                    {
                        currentPrimary.IsPrimary = false;
                        currentPrimary.ModifiedBy = userId;
                        currentPrimary.ModifiedDate = DateTime.Now;
                    }
                }

                var techDepartment = new TechnicianDepartment
                {
                    TechnicianID = dto.TechnicianID,
                    DepartmentID = dto.DepartmentID,
                    IsPrimary = dto.IsPrimary,
                    IsActive = true,
                    AssignedDate = DateTime.Now,
                    CreatedBy = userId,
                    CreatedDate = DateTime.Now
                };

                _context.TechnicianDepartments.Add(techDepartment);
                await _context.SaveChangesAsync();

                return MapToTechnicianDepartmentDto(techDepartment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning technician to department");
                throw;
            }
        }

        public async Task<bool> RemoveTechnicianFromDepartmentAsync(int technicianId, int departmentId, int userId, int branchId)
        {
            try
            {
                var techDepartment = await _context.TechnicianDepartments
                    .FirstOrDefaultAsync(td => td.TechnicianID == technicianId
                        && td.DepartmentID == departmentId
                        && td.IsActive);

                if (techDepartment == null)
                    return false;

                techDepartment.IsActive = false;
                techDepartment.EndDate = DateTime.Now;
                techDepartment.ModifiedBy = userId;
                techDepartment.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing technician from department");
                throw;
            }
        }

        public async Task<bool> SetPrimaryDepartmentAsync(int technicianId, int departmentId, int userId, int branchId)
        {
            try
            {
                // Unset current primary
                var currentPrimary = await _context.TechnicianDepartments
                    .FirstOrDefaultAsync(td => td.TechnicianID == technicianId
                        && td.IsPrimary
                        && td.IsActive);

                if (currentPrimary != null)
                {
                    currentPrimary.IsPrimary = false;
                    currentPrimary.ModifiedBy = userId;
                    currentPrimary.ModifiedDate = DateTime.Now;
                }

                // Set new primary
                var newPrimary = await _context.TechnicianDepartments
                    .FirstOrDefaultAsync(td => td.TechnicianID == technicianId
                        && td.DepartmentID == departmentId
                        && td.IsActive);

                if (newPrimary == null)
                    return false;

                newPrimary.IsPrimary = true;
                newPrimary.ModifiedBy = userId;
                newPrimary.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting primary department");
                throw;
            }
        }

        #endregion

        #region Department Services

        public async Task<IEnumerable<DepartmentServiceDto>> GetDepartmentServicesAsync(int departmentId, int branchId)
        {
            try
            {
                var deptServices = await _context.DepartmentServices
                    .Include(ds => ds.Service)
                    .Include(ds => ds.Department)
                    .Where(ds => ds.DepartmentID == departmentId && ds.Department!.BranchID == branchId)
                    .OrderBy(ds => ds.Service!.ServiceName)
                    .ToListAsync();

                return deptServices.Select(MapToDepartmentServiceDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting services for department {DepartmentId}", departmentId);
                throw;
            }
        }

        public async Task<DepartmentServiceDto> AssignServiceToDepartmentAsync(DepartmentServiceAssignDto dto, int userId, int branchId)
        {
            try
            {
                // Check if service exists
                var service = await _context.ServiceCatalog
                    .FirstOrDefaultAsync(s => s.ServiceID == dto.ServiceID && !s.IsDeleted);

                if (service == null)
                    throw new InvalidOperationException("Service not found");

                // Check if department exists
                var department = await _context.Departments
                    .FirstOrDefaultAsync(d => d.DepartmentID == dto.DepartmentID && d.BranchID == branchId);

                if (department == null)
                    throw new InvalidOperationException("Department not found");

                // Check if already assigned
                var existing = await _context.DepartmentServices
                    .FirstOrDefaultAsync(ds => ds.DepartmentID == dto.DepartmentID
                        && ds.ServiceID == dto.ServiceID);

                // FIX: Use the correct model type
                if (existing != null)
                {
                    existing.IsAvailable = dto.IsAvailable;
                    existing.EstimatedTime = dto.EstimatedTime;
                    existing.ModifiedDate = DateTime.Now;
                }
                else
                {
                    var deptService = new WMS.Api.Models.Workshop.DepartmentService  // Fully qualify to avoid confusion
                    {
                        DepartmentID = dto.DepartmentID,
                        ServiceID = dto.ServiceID,
                        IsAvailable = dto.IsAvailable,
                        EstimatedTime = dto.EstimatedTime,
                        CreatedDate = DateTime.Now
                    };

                    _context.DepartmentServices.Add(deptService);
                }

                await _context.SaveChangesAsync();

                return (await GetDepartmentServicesAsync(dto.DepartmentID, branchId))
                    .FirstOrDefault(ds => ds.ServiceID == dto.ServiceID)!;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning service to department");
                throw;
            }
        }

        public async Task<bool> RemoveServiceFromDepartmentAsync(int departmentId, int serviceId, int branchId)
        {
            try
            {
                var deptService = await _context.DepartmentServices
                    .FirstOrDefaultAsync(ds => ds.DepartmentID == departmentId && ds.ServiceID == serviceId);

                if (deptService == null)
                    return false;

                _context.DepartmentServices.Remove(deptService);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing service from department");
                throw;
            }
        }

        public async Task<bool> UpdateServiceAvailabilityAsync(int departmentId, int serviceId, bool isAvailable, int userId, int branchId)
        {
            try
            {
                var deptService = await _context.DepartmentServices
                    .FirstOrDefaultAsync(ds => ds.DepartmentID == departmentId && ds.ServiceID == serviceId);

                if (deptService == null)
                    return false;

                deptService.IsAvailable = isAvailable;
                deptService.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating service availability");
                throw;
            }
        }

        #endregion

        #region Department Parts

        public async Task<IEnumerable<DepartmentPartDto>> GetDepartmentPartsAsync(int departmentId, int branchId)
        {
            try
            {
                var deptParts = await _context.DepartmentParts
                    .Include(dp => dp.Item)
                    .Include(dp => dp.Department)
                    .Where(dp => dp.DepartmentID == departmentId && dp.Department!.BranchID == branchId)
                    .OrderBy(dp => dp.Item!.ItemName)
                    .ToListAsync();

                return deptParts.Select(MapToDepartmentPartDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting parts for department {DepartmentId}", departmentId);
                throw;
            }
        }

        public async Task<DepartmentPartDto> AssignPartToDepartmentAsync(DepartmentPartAssignDto dto, int userId, int branchId)
        {
            try
            {
                // Check if item exists
                var item = await _context.ItemFile
                    .FirstOrDefaultAsync(i => i.ItemID == dto.ItemID && !i.IsDeleted);

                if (item == null)
                    throw new InvalidOperationException("Item not found");

                // Check if department exists
                var department = await _context.Departments
                    .FirstOrDefaultAsync(d => d.DepartmentID == dto.DepartmentID && d.BranchID == branchId);

                if (department == null)
                    throw new InvalidOperationException("Department not found");

                // Check if already assigned
                var existing = await _context.DepartmentParts
                    .FirstOrDefaultAsync(dp => dp.DepartmentID == dto.DepartmentID
                        && dp.ItemID == dto.ItemID);

                if (existing != null)
                {
                    existing.IsCommon = dto.IsCommon;
                    existing.MinStockLevel = dto.MinStockLevel;
                    existing.ModifiedDate = DateTime.Now;
                }
                else
                {
                    var deptPart = new DepartmentPart
                    {
                        DepartmentID = dto.DepartmentID,
                        ItemID = dto.ItemID,
                        IsCommon = dto.IsCommon,
                        MinStockLevel = dto.MinStockLevel,
                        CreatedDate = DateTime.Now
                    };

                    _context.DepartmentParts.Add(deptPart);
                }

                await _context.SaveChangesAsync();

                return (await GetDepartmentPartsAsync(dto.DepartmentID, branchId))
                    .FirstOrDefault(dp => dp.ItemID == dto.ItemID)!;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning part to department");
                throw;
            }
        }

        public async Task<bool> RemovePartFromDepartmentAsync(int departmentId, int itemId, int branchId)
        {
            try
            {
                var deptPart = await _context.DepartmentParts
                    .FirstOrDefaultAsync(dp => dp.DepartmentID == departmentId && dp.ItemID == itemId);

                if (deptPart == null)
                    return false;

                _context.DepartmentParts.Remove(deptPart);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing part from department");
                throw;
            }
        }

        public async Task<bool> UpdatePartMinStockAsync(int departmentId, int itemId, decimal minStock, int userId, int branchId)
        {
            try
            {
                var deptPart = await _context.DepartmentParts
                    .FirstOrDefaultAsync(dp => dp.DepartmentID == departmentId && dp.ItemID == itemId);

                if (deptPart == null)
                    return false;

                deptPart.MinStockLevel = minStock;
                deptPart.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating part minimum stock");
                throw;
            }
        }

        #endregion

        #region Department Transfers

        public async Task<IEnumerable<DepartmentTransferDto>> GetDepartmentTransfersAsync(int branchId, string? status = null)
        {
            try
            {
                var query = _context.DepartmentTransfers
                    .Include(dt => dt.JobCard)
                    .Include(dt => dt.FromDepartment)
                    .Include(dt => dt.ToDepartment)
                    .Where(dt => dt.JobCard!.BranchID == branchId);

                if (!string.IsNullOrEmpty(status))
                    query = query.Where(dt => dt.Status == status);

                var transfers = await query
                    .OrderByDescending(dt => dt.TransferDate)
                    .ToListAsync();

                return transfers.Select(MapToDepartmentTransferDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting department transfers");
                throw;
            }
        }

        public async Task<DepartmentTransferDto> TransferJobDepartmentAsync(DepartmentTransferCreateDto dto, int userId, int branchId)
        {
            try
            {
                // Execute stored procedure
                var transferIdParam = new SqlParameter("@TransferID", System.Data.SqlDbType.Int)
                {
                    Direction = System.Data.ParameterDirection.Output
                };

                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_TransferJobDepartment @JobCardID = {0}, @FromDepartmentID = {1}, @ToDepartmentID = {2}, @TransferredBy = {3}, @Reason = {4}, @TransferID = @TransferID OUTPUT",
                    dto.JobCardID,
                    dto.FromDepartmentID,
                    dto.ToDepartmentID,
                    userId,
                    dto.Reason ?? "",
                    transferIdParam);

                var transferId = (int)transferIdParam.Value;

                return (await GetDepartmentTransfersAsync(branchId))
                    .FirstOrDefault(t => t.TransferID == transferId)!;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error transferring job department");
                throw;
            }
        }

        public async Task<DepartmentTransferDto?> ReceiveDepartmentTransferAsync(int transferId, DepartmentTransferReceiveDto dto, int userId, int branchId)
        {
            try
            {
                var transfer = await _context.DepartmentTransfers
                    .FirstOrDefaultAsync(t => t.TransferID == transferId && t.JobCard!.BranchID == branchId);

                if (transfer == null)
                    return null;

                transfer.Status = "RECEIVED";
                transfer.ReceivedBy = userId;
                transfer.ReceivedDate = DateTime.Now;
                transfer.Notes = dto.Notes ?? transfer.Notes;

                await _context.SaveChangesAsync();

                return (await GetDepartmentTransfersAsync(branchId))
                    .FirstOrDefault(t => t.TransferID == transferId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error receiving department transfer");
                throw;
            }
        }

        public async Task<bool> CancelDepartmentTransferAsync(int transferId, int userId, int branchId)
        {
            try
            {
                var transfer = await _context.DepartmentTransfers
                    .FirstOrDefaultAsync(t => t.TransferID == transferId && t.JobCard!.BranchID == branchId);

                if (transfer == null)
                    return false;

                transfer.Status = "CANCELLED";
                transfer.Notes = (transfer.Notes + " | Cancelled by user").Trim();

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling department transfer");
                throw;
            }
        }

        #endregion

        #region Dashboard & Reports

        public async Task<DepartmentDashboardDto> GetDepartmentDashboardAsync(int branchId)
        {
            try
            {
                var dashboard = new DepartmentDashboardDto();

                // Get all departments
                var departments = await _context.Departments
                    .Where(d => d.BranchID == branchId)
                    .ToListAsync();

                dashboard.TotalDepartments = departments.Count;

                // Get active jobs across all departments
                dashboard.ActiveJobs = await _context.JobDepartments
                    .CountAsync(jd => jd.Status == "ACTIVE" && jd.JobCard!.BranchID == branchId);

                // Get available technicians (technicians not at max load)
                var technicians = await _context.Technicians
                    .Include(t => t.User)
                    .Where(t => t.User!.BranchID == branchId && !t.InActive)
                    .ToListAsync();

                var availableCount = 0;
                foreach (var tech in technicians)
                {
                    var currentLoad = await _context.JobServices
                        .CountAsync(js => js.TechnicianID == tech.TechnicianID
                            && js.StartTime != null
                            && js.StartTime.Value.Date == DateTime.Today.Date);

                    if (currentLoad < (tech.DailyCapacity ?? 8))
                        availableCount++;
                }
                dashboard.AvailableTechnicians = availableCount;

                // Get department summaries
                var summaries = new List<DepartmentSummaryDto>();

                foreach (var dept in departments)
                {
                    var summary = await GetDepartmentSummary(dept.DepartmentID, branchId);
                    summaries.Add(summary);
                }

                dashboard.DepartmentSummaries = summaries;

                return dashboard;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting department dashboard");
                throw;
            }
        }

        public async Task<IEnumerable<DepartmentSummaryDto>> GetDepartmentSummaryAsync(int branchId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                var departments = await _context.Departments
                    .Where(d => d.BranchID == branchId)
                    .ToListAsync();

                var summaries = new List<DepartmentSummaryDto>();

                foreach (var dept in departments)
                {
                    var summary = await GetDepartmentSummary(dept.DepartmentID, branchId, fromDate, toDate);
                    summaries.Add(summary);
                }

                return summaries;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting department summary");
                throw;
            }
        }

        public async Task<byte[]> GenerateDepartmentReportAsync(int departmentId, int branchId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                var department = await _context.Departments
                    .FirstOrDefaultAsync(d => d.DepartmentID == departmentId && d.BranchID == branchId);

                if (department == null)
                    throw new InvalidOperationException("Department not found");

                var summary = await GetDepartmentSummary(departmentId, branchId, fromDate, toDate);
                var jobs = await GetJobsByDepartmentAsync(departmentId, branchId, null);
                var technicians = await GetDepartmentTechniciansAsync(departmentId, branchId);

                using (var ms = new MemoryStream())
                {
                    // Create PDF document
                    var document = new Document(PageSize.A4, 50, 50, 50, 50);
                    var writer = PdfWriter.GetInstance(document, ms);
                    document.Open();

                    // Title
                    var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18);
                    var title = new Paragraph($"Department Report: {department.DepartmentName}", titleFont);
                    title.Alignment = Element.ALIGN_CENTER;
                    title.SpacingAfter = 20;
                    document.Add(title);

                    // Date Range
                    var dateRange = fromDate.HasValue || toDate.HasValue
                        ? $"Period: {fromDate:dd/MM/yyyy} - {toDate:dd/MM/yyyy}"
                        : "Period: All Time";
                    var datePara = new Paragraph(dateRange);
                    datePara.SpacingAfter = 20;
                    document.Add(datePara);

                    // Summary Statistics
                    var table = new PdfPTable(2);
                    table.WidthPercentage = 100;
                    table.SetWidths(new float[] { 50f, 50f });

                    // FIX: Change these calls to use 2 arguments only
                    // Instead of AddTableCell(table, "Label:", value) use two separate calls
                    AddTableCell(table, "Total Jobs:");
                    AddTableCell(table, (summary.ActiveJobs + summary.CompletedJobs).ToString());

                    AddTableCell(table, "Active Jobs:");
                    AddTableCell(table, summary.ActiveJobs.ToString());

                    AddTableCell(table, "Completed Jobs:");
                    AddTableCell(table, summary.CompletedJobs.ToString());

                    AddTableCell(table, "Technicians:");
                    AddTableCell(table, summary.TechnicianCount.ToString());

                    AddTableCell(table, "Available Technicians:");
                    AddTableCell(table, summary.AvailableTechnicians.ToString());

                    AddTableCell(table, "Pending Transfers:");
                    AddTableCell(table, summary.PendingTransfers.ToString());

                    document.Add(table);

                    // Jobs List
                    if (jobs.Any())
                    {
                        document.Add(new Paragraph("Recent Jobs", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 14)) { SpacingBefore = 20 });

                        var jobTable = new PdfPTable(4);
                        jobTable.WidthPercentage = 100;
                        jobTable.SetWidths(new float[] { 30f, 25f, 25f, 20f });

                        AddTableHeader(jobTable, "Job No", "Status", "Assigned Date", "Completed Date");

                        foreach (var job in jobs.Take(10))
                        {
                            AddTableCell(jobTable, job.JobCardNo);
                            AddTableCell(jobTable, job.Status);
                            AddTableCell(jobTable, job.AssignedDate.ToString("dd/MM/yyyy"));
                            AddTableCell(jobTable, job.CompletedDate?.ToString("dd/MM/yyyy") ?? "-");
                        }

                        document.Add(jobTable);
                    }

                    document.Close();
                    return ms.ToArray();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating department report");
                throw;
            }
        }

        #endregion

        #region Helper Methods

        private async Task<DepartmentDto> MapToDto(Department department)
        {
            var activeJobs = await _context.JobDepartments
                .CountAsync(jd => jd.DepartmentID == department.DepartmentID && jd.Status == "ACTIVE");

            var completedJobs = await _context.JobDepartments
                .CountAsync(jd => jd.DepartmentID == department.DepartmentID && jd.Status == "COMPLETED");

            var technicianCount = await _context.TechnicianDepartments
                .CountAsync(td => td.DepartmentID == department.DepartmentID && td.IsActive);

            return new DepartmentDto
            {
                DepartmentID = department.DepartmentID,
                DepartmentCode = department.DepartmentCode,
                DepartmentName = department.DepartmentName,
                Description = department.Description,
                BranchID = department.BranchID,
                BranchName = department.Branch?.BranchName,
                ManagerID = department.ManagerID,
                ManagerName = department.Manager?.UserFullName,
                Email = department.Email,
                Phone = department.Phone,
                Location = department.Location,
                IsActive = department.IsActive,
                ActiveJobs = activeJobs,
                CompletedJobs = completedJobs,
                TechnicianCount = technicianCount
            };
        }

        private async Task<DepartmentSummaryDto> GetDepartmentSummary(int departmentId, int branchId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var jobsQuery = _context.JobDepartments
                .Where(jd => jd.DepartmentID == departmentId && jd.JobCard!.BranchID == branchId);

            if (fromDate.HasValue)
                jobsQuery = jobsQuery.Where(jd => jd.AssignedDate >= fromDate.Value);

            if (toDate.HasValue)
            {
                var endDate = toDate.Value.AddDays(1);
                jobsQuery = jobsQuery.Where(jd => jd.AssignedDate < endDate);
            }

            var activeJobs = await jobsQuery
                .Where(jd => jd.Status == "ACTIVE")
                .CountAsync();

            var completedJobs = await jobsQuery
                .Where(jd => jd.Status == "COMPLETED")
                .CountAsync();

            var technicianCount = await _context.TechnicianDepartments
                .CountAsync(td => td.DepartmentID == departmentId && td.IsActive);

            var availableTechnicians = 0;
            var technicians = await _context.TechnicianDepartments
                .Include(td => td.Technician)
                .Where(td => td.DepartmentID == departmentId && td.IsActive)
                .ToListAsync();

            foreach (var td in technicians)
            {
                var currentLoad = await _context.JobServices
                    .CountAsync(js => js.TechnicianID == td.TechnicianID
                        && js.StartTime != null
                        && js.StartTime.Value.Date == DateTime.Today.Date);

                if (currentLoad < (td.Technician?.DailyCapacity ?? 8))
                    availableTechnicians++;
            }

            var pendingTransfers = await _context.DepartmentTransfers
                .CountAsync(dt => (dt.ToDepartmentID == departmentId || dt.FromDepartmentID == departmentId)
                    && dt.Status == "PENDING");

            return new DepartmentSummaryDto
            {
                DepartmentID = departmentId,
                DepartmentName = (await _context.Departments.FindAsync(departmentId))?.DepartmentName ?? "",
                ActiveJobs = activeJobs,
                CompletedJobs = completedJobs,
                TechnicianCount = technicianCount,
                AvailableTechnicians = availableTechnicians,
                PendingTransfers = pendingTransfers
            };
        }

        private JobDepartmentDto MapToJobDepartmentDto(JobDepartment jobDepartment)
        {
            return new JobDepartmentDto
            {
                JobDepartmentID = jobDepartment.JobDepartmentID,
                JobCardID = jobDepartment.JobCardID,
                JobCardNo = jobDepartment.JobCard?.JobCardNo ?? "",
                DepartmentID = jobDepartment.DepartmentID,
                DepartmentName = jobDepartment.Department?.DepartmentName ?? "",
                AssignedDate = jobDepartment.AssignedDate,
                CompletedDate = jobDepartment.CompletedDate,
                Status = jobDepartment.Status,
                Notes = jobDepartment.Notes
            };
        }

        private TechnicianDepartmentDto MapToTechnicianDepartmentDto(TechnicianDepartment techDepartment)
        {
            return new TechnicianDepartmentDto
            {
                TechDeptID = techDepartment.TechDeptID,
                TechnicianID = techDepartment.TechnicianID,
                TechnicianName = techDepartment.Technician?.User?.UserFullName ?? "",
                DepartmentID = techDepartment.DepartmentID,
                DepartmentName = techDepartment.Department?.DepartmentName ?? "",
                IsPrimary = techDepartment.IsPrimary,
                AssignedDate = techDepartment.AssignedDate,
                EndDate = techDepartment.EndDate,
                IsActive = techDepartment.IsActive
            };
        }

        private DepartmentServiceDto MapToDepartmentServiceDto(WMS.Api.Models.Workshop.DepartmentService deptService)
        {
            return new DepartmentServiceDto
            {
                DeptServiceID = deptService.DeptServiceID,
                DepartmentID = deptService.DepartmentID,
                DepartmentName = deptService.Department?.DepartmentName ?? "",
                ServiceID = deptService.ServiceID,
                ServiceName = deptService.Service?.ServiceName ?? "",
                IsAvailable = deptService.IsAvailable,
                EstimatedTime = deptService.EstimatedTime
            };
        }

        private DepartmentPartDto MapToDepartmentPartDto(DepartmentPart deptPart)
        {
            return new DepartmentPartDto
            {
                DeptPartID = deptPart.DeptPartID,
                DepartmentID = deptPart.DepartmentID,
                DepartmentName = deptPart.Department?.DepartmentName ?? "",
                ItemID = deptPart.ItemID,
                ItemName = deptPart.Item?.ItemName ?? "",
                IsCommon = deptPart.IsCommon,
                MinStockLevel = deptPart.MinStockLevel
            };
        }

        private DepartmentTransferDto MapToDepartmentTransferDto(DepartmentTransfer transfer)
        {
            return new DepartmentTransferDto
            {
                TransferID = transfer.TransferID,
                JobCardID = transfer.JobCardID,
                JobCardNo = transfer.JobCard?.JobCardNo ?? "",
                FromDepartmentID = transfer.FromDepartmentID,
                FromDepartmentName = transfer.FromDepartment?.DepartmentName ?? "",
                ToDepartmentID = transfer.ToDepartmentID,
                ToDepartmentName = transfer.ToDepartment?.DepartmentName ?? "",
                TransferDate = transfer.TransferDate,
                TransferredByName = transfer.TransferredBy?.ToString() ?? "",
                Reason = transfer.Reason,
                ReceivedByName = transfer.ReceivedBy?.ToString() ?? "",
                ReceivedDate = transfer.ReceivedDate,
                Status = transfer.Status,
                Notes = transfer.Notes
            };
        }

        private void AddTableCell(PdfPTable table, string text)
        {
            var cell = new PdfPCell(new Phrase(text));
            cell.Border = PdfPCell.NO_BORDER;
            cell.Padding = 5;
            table.AddCell(cell);
        }

        private void AddTableHeader(PdfPTable table, params string[] headers)
        {
            foreach (var header in headers)
            {
                var cell = new PdfPCell(new Phrase(header, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12)));
                cell.BackgroundColor = GrayColor.GRAY; // or GrayColor.LIGHT_GRAY if available
                cell.Padding = 5;
                table.AddCell(cell);
            }
        }

        #endregion
    }
}
