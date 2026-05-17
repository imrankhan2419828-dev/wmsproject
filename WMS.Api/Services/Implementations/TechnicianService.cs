using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Models;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class TechnicianService : ITechnicianService
    {
        private readonly WmsDbContext _context;
        private readonly ILogger<TechnicianService> _logger;

        public TechnicianService(WmsDbContext context, ILogger<TechnicianService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<TechnicianDto>> GetAllAsync(int branchId)
        {
            try
            {
                var technicians = await _context.Technicians
                    .Include(t => t.User)
                    .Where(t => !t.IsDeleted)
                    .OrderBy(t => t.TechnicianName ?? (t.User != null ? t.User.UserFullName : ""))
                    .ToListAsync();

                var dtos = new List<TechnicianDto>();

                foreach (var t in technicians)
                {
                    dtos.Add(await MapToDto(t, branchId));
                }

                return dtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting technicians");
                throw;
            }
        }

        public async Task<TechnicianDto?> GetByIdAsync(int id, int branchId)
        {
            try
            {
                var technician = await _context.Technicians
                    .Include(t => t.User)
                    .FirstOrDefaultAsync(t => t.TechnicianID == id && !t.IsDeleted);

                if (technician == null)
                    return null;

                return await MapToDto(technician, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting technician {Id}", id);
                throw;
            }
        }

        public async Task<TechnicianDto> CreateAsync(TechnicianCreateDto dto, int userId, int branchId)
        {
            try
            {
                var technician = new Technician
                {
                    TechnicianName = dto.TechnicianName,
                    EmployeeCode = dto.EmployeeCode,
                    Specialization = dto.Specialization,
                    Certification = dto.Certification,
                    ExperienceYears = dto.ExperienceYears,
                    HourlyRate = dto.HourlyRate,
                    DailyCapacity = dto.DailyCapacity ?? 8,
                    Remarks = dto.Remarks,
                    InActive = dto.InActive,
                    CreatedBy = userId,
                    CreatedDate = DateTime.Now
                };

                _context.Technicians.Add(technician);
                await _context.SaveChangesAsync();

                return await MapToDto(technician, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating technician");
                throw;
            }
        }

        public async Task<TechnicianDto?> UpdateAsync(int id, TechnicianUpdateDto dto, int userId, int branchId)
        {
            try
            {
                var technician = await _context.Technicians
                    .Include(t => t.User)
                    .FirstOrDefaultAsync(t => t.TechnicianID == id && !t.IsDeleted);

                if (technician == null)
                    return null;

                // ✅ FIX: Don't check branch for technicians without User (most technicians won't have User)
                // Only check if technician has an associated User AND that User belongs to a different branch
                if (technician.UserID.HasValue && technician.User != null)
                {
                    if (technician.User.BranchID != branchId)
                    {
                        throw new InvalidOperationException("Technician doesn't belong to this branch");
                    }
                }

                // Update TechnicianName
                if (!string.IsNullOrWhiteSpace(dto.TechnicianName))
                {
                    technician.TechnicianName = dto.TechnicianName;
                }

                // Update other fields
                technician.EmployeeCode = dto.EmployeeCode ?? technician.EmployeeCode;
                technician.Specialization = dto.Specialization ?? technician.Specialization;
                technician.Certification = dto.Certification ?? technician.Certification;

                if (dto.ExperienceYears.HasValue)
                    technician.ExperienceYears = dto.ExperienceYears.Value;

                if (dto.HourlyRate.HasValue)
                    technician.HourlyRate = dto.HourlyRate.Value;

                if (dto.DailyCapacity.HasValue)
                    technician.DailyCapacity = dto.DailyCapacity.Value;

                technician.Remarks = dto.Remarks ?? technician.Remarks;
                technician.InActive = dto.InActive;
                technician.ModifiedBy = userId;
                technician.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return await MapToDto(technician, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating technician {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(int id, int branchId)
        {
            try
            {
                var technician = await _context.Technicians
                    .Include(t => t.User)
                    .FirstOrDefaultAsync(t => t.TechnicianID == id && !t.IsDeleted);

                if (technician == null)
                    return false;

                // Check if technician has any assigned jobs
                var hasJobs = await _context.JobServices
                    .AnyAsync(js => js.TechnicianID == id);

                if (hasJobs)
                    throw new InvalidOperationException("Cannot delete technician with assigned jobs");

                technician.IsDeleted = true;
                technician.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting technician {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<TechnicianDto>> GetAvailableTechniciansAsync(int branchId, DateTime? date = null)
        {
            try
            {
                var targetDate = date ?? DateTime.Today;

                var technicians = await _context.Technicians
                    .Include(t => t.User)
                    .Where(t => !t.IsDeleted && !t.InActive)
                    .ToListAsync();

                var dtos = new List<TechnicianDto>();

                foreach (var t in technicians)
                {
                    var jobsCount = await _context.JobServices
                        .CountAsync(js => js.TechnicianID == t.TechnicianID
                            && js.StartTime != null
                            && js.StartTime.Value.Date == targetDate.Date);

                    var dto = await MapToDto(t, branchId);
                    dto.CurrentWorkload = jobsCount;

                    if (jobsCount < (t.DailyCapacity ?? 8))
                    {
                        dtos.Add(dto);
                    }
                }

                return dtos.OrderBy(t => t.CurrentWorkload);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available technicians");
                throw;
            }
        }

        public async Task<IEnumerable<TechnicianDto>> GetBySpecializationAsync(string specialization, int branchId)
        {
            try
            {
                var technicians = await _context.Technicians
                    .Include(t => t.User)
                    .Where(t => !t.IsDeleted && !t.InActive
                        && (t.Specialization != null && t.Specialization.Contains(specialization)))
                    .ToListAsync();

                var dtos = new List<TechnicianDto>();

                foreach (var t in technicians)
                {
                    dtos.Add(await MapToDto(t, branchId));
                }

                return dtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting technicians by specialization");
                throw;
            }
        }

        public async Task<IEnumerable<TechnicianDto>> SearchAsync(string searchTerm, int branchId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                    return await GetAllAsync(branchId);

                searchTerm = searchTerm.ToLower();

                var technicians = await _context.Technicians
                    .Include(t => t.User)
                    .Where(t => !t.IsDeleted)
                    .ToListAsync();

                var filtered = technicians.Where(t =>
                    (t.TechnicianName != null && t.TechnicianName.ToLower().Contains(searchTerm)) ||
                    (t.EmployeeCode != null && t.EmployeeCode.ToLower().Contains(searchTerm)) ||
                    (t.Specialization != null && t.Specialization.ToLower().Contains(searchTerm)) ||
                    (t.Certification != null && t.Certification.ToLower().Contains(searchTerm)) ||
                    (t.User != null && t.User.UserFullName != null && t.User.UserFullName.ToLower().Contains(searchTerm))
                );

                var dtos = new List<TechnicianDto>();

                foreach (var t in filtered)
                {
                    dtos.Add(await MapToDto(t, branchId));
                }

                return dtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching technicians");
                throw;
            }
        }

        public async Task<IEnumerable<TechnicianDto>> GetTechniciansForJobAsync(int jobId, int branchId)
        {
            try
            {
                var jobServices = await _context.JobServices
                    .Where(js => js.JobCardID == jobId && js.TechnicianID != null)
                    .Select(js => js.TechnicianID)
                    .Distinct()
                    .ToListAsync();

                var technicians = await _context.Technicians
                    .Include(t => t.User)
                    .Where(t => jobServices.Contains(t.TechnicianID) && !t.IsDeleted)
                    .ToListAsync();

                var dtos = new List<TechnicianDto>();

                foreach (var t in technicians)
                {
                    dtos.Add(await MapToDto(t, branchId));
                }

                return dtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting technicians for job {JobId}", jobId);
                throw;
            }
        }

        private async Task<TechnicianDto> MapToDto(Technician technician, int branchId)
        {
            var currentWorkload = await _context.JobServices
                .CountAsync(js => js.TechnicianID == technician.TechnicianID
                    && js.StartTime != null
                    && js.StartTime.Value.Date == DateTime.Today.Date);

            return new TechnicianDto
            {
                TechnicianID = technician.TechnicianID,
                UserID = technician.UserID,
                TechnicianName = technician.TechnicianName,
                UserName = technician.User?.UserName ?? "",
                FullName = technician.TechnicianName ?? (technician.User != null ? technician.User.UserFullName : ""),
                EmployeeCode = technician.EmployeeCode,
                Specialization = technician.Specialization,
                Certification = technician.Certification,
                ExperienceYears = technician.ExperienceYears,
                HourlyRate = technician.HourlyRate,
                DailyCapacity = technician.DailyCapacity ?? 8,
                Remarks = technician.Remarks,
                InActive = technician.InActive,
                CurrentWorkload = currentWorkload
            };
        }
    }
}