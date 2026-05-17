using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Models.Workshop;
using WMS.Api.Services.Interfaces.Workshop;

namespace WMS.Api.Services.Implementations.Workshop
{
    public class WorkshopSettingsService : IWorkshopSettingsService
    {
        private readonly WmsDbContext _context;
        private readonly ILogger<WorkshopSettingsService> _logger;

        public WorkshopSettingsService(WmsDbContext context, ILogger<WorkshopSettingsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<WorkshopSettingsDto?> GetSettingsAsync(int branchId)
        {
            try
            {
                var settings = await _context.WorkshopSettings
                    .Include(s => s.Branch)
                    .FirstOrDefaultAsync(s => s.BranchID == branchId);

                if (settings == null)
                {
                    // Create default settings if not exists
                    settings = new WorkshopSettings
                    {
                        BranchID = branchId,
                        DailyBookingCapacity = 50,
                        MaxTechnicianLoad = 8,
                        OverbookingAlertThreshold = 80,
                        SMSEnabled = false,
                        WhatsAppEnabled = false,
                        InspectionRequired = true
                    };

                    _context.WorkshopSettings.Add(settings);
                    await _context.SaveChangesAsync();
                }

                return new WorkshopSettingsDto
                {
                    SettingID = settings.SettingID,
                    BranchID = settings.BranchID,
                    BranchName = settings.Branch?.BranchName,
                    DailyBookingCapacity = settings.DailyBookingCapacity,
                    MaxTechnicianLoad = settings.MaxTechnicianLoad,
                    OverbookingAlertThreshold = settings.OverbookingAlertThreshold,
                    SMSEnabled = settings.SMSEnabled,
                    WhatsAppEnabled = settings.WhatsAppEnabled,
                    InspectionRequired = settings.InspectionRequired
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting workshop settings for branch {BranchId}", branchId);
                throw;
            }
        }

        public async Task<WorkshopSettingsDto> CreateSettingsAsync(WorkshopSettingsCreateDto dto, int userId)
        {
            try
            {
                var existing = await _context.WorkshopSettings
                    .AnyAsync(s => s.BranchID == dto.BranchID);

                if (existing)
                    throw new InvalidOperationException("Settings already exist for this branch");

                var settings = new WorkshopSettings
                {
                    BranchID = dto.BranchID,
                    DailyBookingCapacity = dto.DailyBookingCapacity,
                    MaxTechnicianLoad = dto.MaxTechnicianLoad,
                    OverbookingAlertThreshold = dto.OverbookingAlertThreshold,
                    SMSEnabled = dto.SMSEnabled,
                    WhatsAppEnabled = dto.WhatsAppEnabled,
                    InspectionRequired = dto.InspectionRequired
                };

                _context.WorkshopSettings.Add(settings);
                await _context.SaveChangesAsync();

                return await GetSettingsAsync(dto.BranchID)
                    ?? throw new Exception("Failed to retrieve created settings");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating workshop settings");
                throw;
            }
        }

        public async Task<WorkshopSettingsDto?> UpdateSettingsAsync(int id, WorkshopSettingsUpdateDto dto, int userId)
        {
            try
            {
                var settings = await _context.WorkshopSettings
                    .FindAsync(id);

                if (settings == null)
                    return null;

                settings.DailyBookingCapacity = dto.DailyBookingCapacity;
                settings.MaxTechnicianLoad = dto.MaxTechnicianLoad;
                settings.OverbookingAlertThreshold = dto.OverbookingAlertThreshold;
                settings.SMSEnabled = dto.SMSEnabled;
                settings.WhatsAppEnabled = dto.WhatsAppEnabled;
                settings.InspectionRequired = dto.InspectionRequired;

                await _context.SaveChangesAsync();

                return await GetSettingsAsync(settings.BranchID);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating workshop settings");
                throw;
            }
        }

        public async Task<CapacityCheckResultDto> CheckBookingCapacityAsync(DateTime date, int branchId)
        {
            try
            {
                var settings = await GetSettingsAsync(branchId);

                var currentBookings = await _context.Bookings
                    .CountAsync(b => b.BranchID == branchId
                        && b.BookingDate.Date == date.Date
                        && b.Status != "CANCELLED");

                var capacity = settings?.DailyBookingCapacity ?? 50;
                var percentage = (currentBookings * 100) / capacity;

                string status;
                string message;

                if (currentBookings >= capacity)
                {
                    status = "OVERBOOKED";
                    message = "Booking capacity fully utilized! Consider rescheduling some appointments.";
                }
                else if (percentage >= (settings?.OverbookingAlertThreshold ?? 80))
                {
                    status = "NEAR_CAPACITY";
                    message = $"Booking capacity is at {percentage}%. Only {capacity - currentBookings} slots left.";
                }
                else
                {
                    status = "AVAILABLE";
                    message = $"{capacity - currentBookings} slots available for booking.";
                }

                return new CapacityCheckResultDto
                {
                    Status = status,
                    CurrentBookings = currentBookings,
                    Capacity = capacity,
                    Percentage = percentage,
                    Message = message
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking booking capacity");
                throw;
            }
        }

        public async Task<bool> IsTechnicianAvailableAsync(int technicianId, DateTime date, int branchId)
        {
            try
            {
                var settings = await GetSettingsAsync(branchId);
                var maxLoad = settings?.MaxTechnicianLoad ?? 8;

                var currentLoad = await _context.JobServices
                    .CountAsync(js => js.TechnicianID == technicianId
                        && js.StartTime != null
                        && js.StartTime.Value.Date == date.Date);

                return currentLoad < maxLoad;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking technician availability");
                throw;
            }
        }
    }
}