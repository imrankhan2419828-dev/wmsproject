using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Models.Workshop;
using WMS.Api.Services.Interfaces.Workshop;

namespace WMS.Api.Services.Implementations.Workshop
{
    public class TechnicianTimeLogService : ITechnicianTimeLogService
    {
        private readonly WmsDbContext _context;
        private readonly ILogger<TechnicianTimeLogService> _logger;

        public TechnicianTimeLogService(WmsDbContext context, ILogger<TechnicianTimeLogService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<TechnicianTimeLogDto>> GetAllAsync(int branchId, DateTime? date = null)
        {
            try
            {
                var query = _context.TechnicianTimeLog
                    .Include(t => t.Technician)
                        .ThenInclude(t => t!.User)
                    .Include(t => t.JobService)
                    .Include(t => t.JobCard)
                    .Where(t => t.Technician!.User!.BranchID == branchId);

                if (date.HasValue)
                {
                    var startDate = date.Value.Date;
                    var endDate = startDate.AddDays(1);
                    query = query.Where(t => t.ClockInTime >= startDate && t.ClockInTime < endDate);
                }

                var logs = await query
                    .OrderByDescending(t => t.ClockInTime)
                    .ToListAsync();

                return logs.Select(MapToDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting time logs");
                throw;
            }
        }

        public async Task<TechnicianTimeLogDto?> GetByIdAsync(int id, int branchId)
        {
            try
            {
                var log = await _context.TechnicianTimeLog
                    .Include(t => t.Technician)
                        .ThenInclude(t => t!.User)
                    .Include(t => t.JobService)
                    .Include(t => t.JobCard)
                    .FirstOrDefaultAsync(t => t.TimeLogID == id && t.Technician!.User!.BranchID == branchId);

                return log == null ? null : MapToDto(log);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting time log {Id}", id);
                throw;
            }
        }

        public async Task<TechnicianTimeLogDto> ClockInAsync(TechnicianTimeLogCreateDto dto, int userId, int branchId)
        {
            try
            {
                // Check if technician already clocked in
                var existing = await _context.TechnicianTimeLog
                    .FirstOrDefaultAsync(t => t.TechnicianID == dto.TechnicianID
                        && t.ClockOutTime == null);

                if (existing != null)
                    throw new InvalidOperationException("Technician already clocked in");

                var log = new TechnicianTimeLog
                {
                    TechnicianID = dto.TechnicianID,
                    JobServiceID = dto.JobServiceID,
                    JobCardID = dto.JobCardID,
                    ClockInTime = dto.ClockInTime,
                    Status = "ACTIVE",
                    Notes = dto.Notes,
                    CreatedBy = userId,
                    CreatedDate = DateTime.Now
                };

                _context.TechnicianTimeLog.Add(log);
                await _context.SaveChangesAsync();

                return await GetByIdAsync(log.TimeLogID, branchId)
                    ?? throw new Exception("Failed to retrieve created log");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clocking in technician");
                throw;
            }
        }

        public async Task<TechnicianTimeLogDto?> ClockOutAsync(int id, int userId, int branchId)
        {
            try
            {
                var log = await _context.TechnicianTimeLog
                    .FirstOrDefaultAsync(t => t.TimeLogID == id && t.Technician!.User!.BranchID == branchId);

                if (log == null)
                    return null;

                if (log.ClockOutTime != null)
                    throw new InvalidOperationException("Already clocked out");

                log.ClockOutTime = DateTime.Now;

                // Calculate total work minutes
                if (log.ClockInTime != null)
                {
                    var totalMinutes = (int)(log.ClockOutTime.Value - log.ClockInTime).TotalMinutes;
                    log.TotalWorkMinutes = totalMinutes - log.TotalBreakMinutes;
                }

                log.Status = "COMPLETED";
                log.ModifiedBy = userId;
                log.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return await GetByIdAsync(id, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clocking out technician");
                throw;
            }
        }

        public async Task<TechnicianTimeLogDto?> StartBreakAsync(int id, int userId, int branchId)
        {
            try
            {
                var log = await _context.TechnicianTimeLog
                    .FirstOrDefaultAsync(t => t.TimeLogID == id && t.Technician!.User!.BranchID == branchId);

                if (log == null)
                    return null;

                if (log.BreakStartTime != null)
                    throw new InvalidOperationException("Break already started");

                log.BreakStartTime = DateTime.Now;
                log.Status = "BREAK";
                log.ModifiedBy = userId;
                log.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return await GetByIdAsync(id, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting break");
                throw;
            }
        }

        public async Task<TechnicianTimeLogDto?> EndBreakAsync(int id, int userId, int branchId)
        {
            try
            {
                var log = await _context.TechnicianTimeLog
                    .FirstOrDefaultAsync(t => t.TimeLogID == id && t.Technician!.User!.BranchID == branchId);

                if (log == null)
                    return null;

                if (log.BreakStartTime == null)
                    throw new InvalidOperationException("Break not started");

                if (log.BreakEndTime != null)
                    throw new InvalidOperationException("Break already ended");

                log.BreakEndTime = DateTime.Now;

                // Calculate break minutes
                if (log.BreakStartTime != null)
                {
                    var breakMinutes = (int)(log.BreakEndTime.Value - log.BreakStartTime.Value).TotalMinutes;
                    log.TotalBreakMinutes += breakMinutes;
                }

                log.Status = "ACTIVE";
                log.ModifiedBy = userId;
                log.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return await GetByIdAsync(id, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error ending break");
                throw;
            }
        }

        public async Task<TechnicianTimeLogDto?> UpdateAsync(int id, TechnicianTimeLogUpdateDto dto, int userId, int branchId)
        {
            try
            {
                var log = await _context.TechnicianTimeLog
                    .FirstOrDefaultAsync(t => t.TimeLogID == id && t.Technician!.User!.BranchID == branchId);

                if (log == null)
                    return null;

                // Calculate work minutes if clocked out
                if (dto.ClockOutTime.HasValue && log.ClockInTime != null)
                {
                    var totalMinutes = (int)(dto.ClockOutTime.Value - log.ClockInTime).TotalMinutes;
                    dto.TotalWorkMinutes = totalMinutes - dto.TotalBreakMinutes;
                }

                // Update fields
                log.JobServiceID = dto.JobServiceID ?? log.JobServiceID;
                log.JobCardID = dto.JobCardID ?? log.JobCardID;
                log.ClockOutTime = dto.ClockOutTime ?? log.ClockOutTime;
                log.BreakStartTime = dto.BreakStartTime ?? log.BreakStartTime;
                log.BreakEndTime = dto.BreakEndTime ?? log.BreakEndTime;
                log.TotalBreakMinutes = dto.TotalBreakMinutes;
                log.TotalWorkMinutes = dto.TotalWorkMinutes ?? log.TotalWorkMinutes;
                log.Status = dto.Status;
                log.Notes = dto.Notes ?? log.Notes;
                log.ModifiedBy = userId;
                log.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return await GetByIdAsync(id, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating time log {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(int id, int branchId)
        {
            try
            {
                var log = await _context.TechnicianTimeLog
                    .FirstOrDefaultAsync(t => t.TimeLogID == id && t.Technician!.User!.BranchID == branchId);

                if (log == null)
                    return false;

                _context.TechnicianTimeLog.Remove(log);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting time log {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<TechnicianWorkloadDto>> GetTechnicianWorkloadAsync(int branchId, DateTime? date = null)
        {
            try
            {
                var targetDate = date ?? DateTime.Today;

                var technicians = await _context.Technicians
                    .Include(t => t.User)
                    .Where(t => !t.IsDeleted && !t.InActive && t.User != null && t.User.BranchID == branchId)
                    .ToListAsync();

                var workloads = new List<TechnicianWorkloadDto>();

                foreach (var tech in technicians)
                {
                    var services = await _context.JobServices
                        .Where(js => js.TechnicianID == tech.TechnicianID
                            && js.StartTime != null
                            && js.StartTime.Value.Date == targetDate.Date)
                        .ToListAsync();

                    var jobs = services.Select(s => s.JobCardID).Distinct().Count();
                    var totalValue = services.Sum(s => s.TotalAmount);
                    var timeLog = await _context.TechnicianTimeLog
                        .FirstOrDefaultAsync(t => t.TechnicianID == tech.TechnicianID
                            && t.ClockOutTime == null);

                    var todayMinutes = timeLog != null
                        ? (int)(DateTime.Now - timeLog.ClockInTime).TotalMinutes - timeLog.TotalBreakMinutes
                        : 0;

                    var capacity = tech.DailyCapacity ?? 8;
                    var loadPercentage = (services.Count * 100) / capacity;

                    string status;
                    if (loadPercentage >= 100)
                        status = "OVERLOADED";
                    else if (loadPercentage >= 80)
                        status = "NEAR_CAPACITY";
                    else
                        status = "AVAILABLE";

                    workloads.Add(new TechnicianWorkloadDto
                    {
                        TechnicianID = tech.TechnicianID,
                        TechnicianName = tech.User?.UserFullName ?? "",
                        AssignedServices = services.Count,
                        AssignedJobs = jobs,
                        TotalValue = totalValue,
                        DailyCapacity = capacity,
                        WorkloadStatus = status,
                        TodayMinutes = todayMinutes,
                        TodayHours = Math.Round(todayMinutes / 60.0m, 2)
                    });
                }

                return workloads.OrderByDescending(w => w.AssignedServices);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting technician workload");
                throw;
            }
        }

        public async Task<TechnicianTimeLogDto?> GetCurrentStatusAsync(int technicianId, int branchId)
        {
            try
            {
                var log = await _context.TechnicianTimeLog
                    .Include(t => t.Technician)
                        .ThenInclude(t => t!.User)
                    .Include(t => t.JobService)
                    .Include(t => t.JobCard)
                    .FirstOrDefaultAsync(t => t.TechnicianID == technicianId
                        && t.ClockOutTime == null
                        && t.Technician!.User!.BranchID == branchId);

                return log == null ? null : MapToDto(log);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current status for technician {TechnicianId}", technicianId);
                throw;
            }
        }

        public async Task<IEnumerable<TechnicianTimeLogDto>> GetTechnicianLogsAsync(int technicianId, int branchId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                var query = _context.TechnicianTimeLog
                    .Include(t => t.Technician)
                        .ThenInclude(t => t!.User)
                    .Include(t => t.JobService)
                    .Include(t => t.JobCard)
                    .Where(t => t.TechnicianID == technicianId && t.Technician!.User!.BranchID == branchId);

                if (fromDate.HasValue)
                    query = query.Where(t => t.ClockInTime >= fromDate.Value);

                if (toDate.HasValue)
                {
                    var endDate = toDate.Value.AddDays(1);
                    query = query.Where(t => t.ClockInTime < endDate);
                }

                var logs = await query
                    .OrderByDescending(t => t.ClockInTime)
                    .ToListAsync();

                return logs.Select(MapToDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting logs for technician {TechnicianId}", technicianId);
                throw;
            }
        }

        private TechnicianTimeLogDto MapToDto(TechnicianTimeLog log)
        {
            return new TechnicianTimeLogDto
            {
                TimeLogID = log.TimeLogID,
                TechnicianID = log.TechnicianID,
                TechnicianName = log.Technician?.User?.UserFullName ?? "",
                JobServiceID = log.JobServiceID,
                JobServiceName = log.JobService?.ServiceName,
                JobCardID = log.JobCardID,
                JobCardNo = log.JobCard?.JobCardNo,
                ClockInTime = log.ClockInTime,
                ClockOutTime = log.ClockOutTime,
                BreakStartTime = log.BreakStartTime,
                BreakEndTime = log.BreakEndTime,
                TotalBreakMinutes = log.TotalBreakMinutes,
                TotalWorkMinutes = log.TotalWorkMinutes,
                Status = log.Status,
                Notes = log.Notes
            };
        }


        public async Task<IEnumerable<TechnicianEngagementDto>> GetTechnicianEngagementStatusAsync(int branchId)
        {
            try
            {
                var technicians = await _context.Technicians
                    .Include(t => t.User)
                    .Where(t => !t.IsDeleted && !t.InActive)
                    .ToListAsync();

                var activeLogs = await _context.TechnicianTimeLog
                    .Where(t => t.ClockOutTime == null)
                    .ToDictionaryAsync(t => t.TechnicianID, t => t);

                var result = new List<TechnicianEngagementDto>();

                foreach (var tech in technicians)
                {
                    bool isEngaged = activeLogs.ContainsKey(tech.TechnicianID);
                    var activeLog = isEngaged ? activeLogs[tech.TechnicianID] : null;

                    // Calculate today's hours
                    var todayLogs = await _context.TechnicianTimeLog
                        .Where(t => t.TechnicianID == tech.TechnicianID
                            && t.ClockInTime.Date == DateTime.Today.Date)
                        .ToListAsync();

                    int todayMinutes = 0;
                    foreach (var log in todayLogs)
                    {
                        if (log.ClockOutTime.HasValue)
                            todayMinutes += (int)(log.ClockOutTime.Value - log.ClockInTime).TotalMinutes - log.TotalBreakMinutes;
                        else
                            todayMinutes += (int)(DateTime.Now - log.ClockInTime).TotalMinutes - log.TotalBreakMinutes;
                    }

                    result.Add(new TechnicianEngagementDto
                    {
                        TechnicianID = tech.TechnicianID,
                        TechnicianName = tech.TechnicianName ?? tech.User?.UserFullName ?? "",
                        EmployeeCode = tech.EmployeeCode ?? "",
                        Specialization = tech.Specialization ?? "General",
                        IsEngaged = isEngaged,
                        EngagedSince = activeLog?.ClockInTime,
                        CurrentJobCardNo = activeLog?.JobCard?.JobCardNo,
                        CurrentStatus = activeLog?.Status,
                        TodayHours = todayMinutes / 60
                    });
                }

                return result.OrderByDescending(r => r.IsEngaged).ThenBy(r => r.TechnicianName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting technician engagement status");
                throw;
            }
        }

    }
}