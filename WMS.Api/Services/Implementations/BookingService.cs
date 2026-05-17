using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Models;
using WMS.Api.Models.Workshop;
using WMS.Api.Services.Interfaces;
using WMS.Api.Services.Interfaces.Workshop;

namespace WMS.Api.Services.Implementations.Workshop
{
    public class BookingService : IBookingService
    {
        private readonly WmsDbContext _context;
        private readonly ILogger<BookingService> _logger;
        private readonly IJobCardService _jobCardService; // Add this for conversion

        public BookingService(
            WmsDbContext context,
            ILogger<BookingService> logger,
            IJobCardService jobCardService) // Inject JobCardService
        {
            _context = context;
            _logger = logger;
            _jobCardService = jobCardService;
        }

        public async Task<IEnumerable<BookingDto>> GetBookingsByDateAsync(DateTime date, int branchId)
        {
            try
            {
                var bookings = await _context.Bookings
                    .Include(b => b.Vehicle)
                    .Include(b => b.Technician)
                        .ThenInclude(t => t!.User)
                    .Include(b => b.JobCard)
                    .Include(b => b.BookingServices)
                        .ThenInclude(bs => bs.Service)
                    .Where(b => !b.IsDeleted && b.BranchID == branchId && b.BookingDate.Date == date.Date)
                    .OrderBy(b => b.StartTime)
                    .ToListAsync();

                return bookings.Select(MapToDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bookings for date {Date}", date);
                throw;
            }
        }

        public async Task<IEnumerable<BookingDto>> GetBookingsByDateRangeAsync(DateTime fromDate, DateTime toDate, int branchId)
        {
            try
            {
                var bookings = await _context.Bookings
                    .Include(b => b.Vehicle)
                    .Include(b => b.Technician)
                        .ThenInclude(t => t!.User)
                    .Include(b => b.JobCard)
                    .Include(b => b.BookingServices)
                        .ThenInclude(bs => bs.Service)
                    .Where(b => !b.IsDeleted && b.BranchID == branchId
                        && b.BookingDate.Date >= fromDate.Date
                        && b.BookingDate.Date <= toDate.Date)
                    .OrderBy(b => b.BookingDate)
                    .ThenBy(b => b.StartTime)
                    .ToListAsync();

                return bookings.Select(MapToDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bookings by date range");
                throw;
            }
        }

        public async Task<BookingDto?> GetBookingByIdAsync(int id, int branchId)
        {
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.Vehicle)
                    .Include(b => b.Technician)
                        .ThenInclude(t => t!.User)
                    .Include(b => b.JobCard)
                    .Include(b => b.BookingServices)
                        .ThenInclude(bs => bs.Service)
                    .FirstOrDefaultAsync(b => b.BookingID == id && !b.IsDeleted && b.BranchID == branchId);

                return booking == null ? null : MapToDto(booking);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting booking {Id}", id);
                throw;
            }
        }

        public async Task<BookingDto> CreateBookingAsync(BookingCreateDto dto, int userId, int branchId)
        {
            try
            {
                // Validate vehicle
                var vehicle = await _context.Vehicles
                    .FirstOrDefaultAsync(v => v.VehicleID == dto.VehicleID && !v.IsDeleted);

                if (vehicle == null)
                    throw new InvalidOperationException("Vehicle not found");

                // Check availability if time slot provided
                if (dto.StartTime.HasValue && dto.EndTime.HasValue)
                {
                    var isAvailable = await IsTimeSlotAvailableAsync(
                        dto.BookingDate,
                        dto.StartTime.Value,
                        dto.EndTime.Value,
                        dto.TechnicianID,
                        branchId);

                    if (!isAvailable)
                        throw new InvalidOperationException("Selected time slot is not available");
                }

                // Generate booking number
                var bookingNo = await GenerateBookingNumberAsync(branchId);

                // Set color based on status
                var colorCode = GetColorForStatus("Pending");

                var booking = new Booking
                {
                    BookingNo = bookingNo,
                    BookingDate = dto.BookingDate,
                    StartTime = dto.StartTime,
                    EndTime = dto.EndTime,
                    VehicleID = dto.VehicleID,
                    TechnicianID = dto.TechnicianID,
                    Status = dto.Status,
                    Notes = dto.Notes,
                    ColorCode = colorCode,
                    BranchID = branchId,
                    CreatedBy = userId,
                    CreatedDate = DateTime.Now
                };

                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();

                // Add services if any
                if (dto.Services != null && dto.Services.Any())
                {
                    foreach (var serviceDto in dto.Services)
                    {
                        var service = await _context.ServiceCatalog
                            .FirstOrDefaultAsync(s => s.ServiceID == serviceDto.ServiceID && !s.IsDeleted);

                        if (service == null)
                            continue;

                        // ✅ FIXED: Changed variable name to bookingServiceItem
                        // ✅ FIXED: Use fully qualified name
                        var bookingServiceItem = new Models.Workshop.BookingService
                        {
                            BookingID = booking.BookingID,
                            ServiceID = service.ServiceID,
                            ServiceName = service.ServiceName,
                            EstimatedDuration = service.EstimatedTime ?? 60,
                            CustomRate = serviceDto.CustomRate,
                            Notes = serviceDto.Notes
                        };

                        _context.BookingServices.Add(bookingServiceItem);
                    }

                    await _context.SaveChangesAsync();
                }


                return await GetBookingByIdAsync(booking.BookingID, branchId)
                    ?? throw new Exception("Failed to retrieve created booking");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating booking");
                throw;
            }
        }

        //public async Task<BookingDto?> UpdateBookingAsync(int id, BookingUpdateDto dto, int userId, int branchId)
        //{
        //    try
        //    {
        //        var booking = await _context.Bookings
        //            .Include(b => b.BookingServices)
        //            .FirstOrDefaultAsync(b => b.BookingID == id && !b.IsDeleted && b.BranchID == branchId);

        //        if (booking == null)
        //            return null;

        //        // Check availability if time slot changed
        //        if ((dto.StartTime.HasValue && (!booking.StartTime.HasValue || dto.StartTime.Value != booking.StartTime.Value)) ||
        //            (dto.EndTime.HasValue && (!booking.EndTime.HasValue || dto.EndTime.Value != booking.EndTime.Value)))
        //        {
        //            var isAvailable = await IsTimeSlotAvailableAsync(
        //                dto.BookingDate,
        //                dto.StartTime.Value,
        //                dto.EndTime.Value,
        //                dto.TechnicianID,
        //                branchId);

        //            if (!isAvailable)
        //                throw new InvalidOperationException("Selected time slot is not available");
        //        }

        //        // Update fields
        //        booking.BookingDate = dto.BookingDate;
        //        booking.StartTime = dto.StartTime;
        //        booking.EndTime = dto.EndTime;
        //        booking.VehicleID = dto.VehicleID;
        //        booking.TechnicianID = dto.TechnicianID;
        //        booking.Status = dto.Status;
        //        booking.Notes = dto.Notes;
        //        booking.ColorCode = GetColorForStatus(dto.Status);
        //        booking.ModifiedBy = userId;
        //        booking.ModifiedDate = DateTime.Now;

        //        // Update services (delete existing, add new)
        //        if (booking.BookingServices != null && booking.BookingServices.Any())
        //        {
        //            _context.BookingServices.RemoveRange(booking.BookingServices);
        //        }

        //        if (dto.Services != null && dto.Services.Any())
        //        {
        //            foreach (var serviceDto in dto.Services)
        //            {
        //                var service = await _context.ServiceCatalog
        //                    .FirstOrDefaultAsync(s => s.ServiceID == serviceDto.ServiceID && !s.IsDeleted);

        //                if (service == null)
        //                    continue;

        //                // ✅ FIXED: Changed variable name to bookingServiceItem
        //                // ✅ FIXED: Use fully qualified name
        //                var bookingServiceItem = new Models.Workshop.BookingService
        //                {
        //                    BookingID = booking.BookingID,
        //                    ServiceID = service.ServiceID,
        //                    ServiceName = service.ServiceName,
        //                    EstimatedDuration = service.EstimatedTime ?? 60,
        //                    CustomRate = serviceDto.CustomRate,
        //                    Notes = serviceDto.Notes
        //                };

        //                _context.BookingServices.Add(bookingServiceItem);
        //            }
        //        }

        //        await _context.SaveChangesAsync();

        //        return await GetBookingByIdAsync(id, branchId);
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Error updating booking {Id}", id);
        //        throw;
        //    }
        //}
        public async Task<BookingDto?> UpdateBookingAsync(int id, BookingUpdateDto dto, int userId, int branchId)
        {
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.BookingServices)
                    .FirstOrDefaultAsync(b => b.BookingID == id && !b.IsDeleted && b.BranchID == branchId);

                if (booking == null)
                    return null;

                // ✅ FIX: Check availability only if TimeSlots actually changed
                if ((dto.StartTime.HasValue && (!booking.StartTime.HasValue || dto.StartTime.Value != booking.StartTime.Value)) ||
                    (dto.EndTime.HasValue && (!booking.EndTime.HasValue || dto.EndTime.Value != booking.EndTime.Value)))
                {
                    var isAvailable = await IsTimeSlotAvailableAsync(
                        dto.BookingDate ?? booking.BookingDate,
                        dto.StartTime ?? booking.StartTime.Value,
                        dto.EndTime ?? booking.EndTime.Value,
                        dto.TechnicianID ?? booking.TechnicianID,
                        branchId);

                    if (!isAvailable)
                        throw new InvalidOperationException("Selected time slot is not available");
                }

                // ✅ FIX: Only update fields that are provided in DTO
                if (dto.BookingDate.HasValue)
                    booking.BookingDate = dto.BookingDate.Value;

                if (dto.StartTime.HasValue)
                    booking.StartTime = dto.StartTime;

                if (dto.EndTime.HasValue)
                    booking.EndTime = dto.EndTime;

                // ✅ CRITICAL: Only update VehicleID if provided
                if (dto.VehicleID.HasValue)
                    booking.VehicleID = dto.VehicleID.Value;

                if (dto.TechnicianID.HasValue)
                    booking.TechnicianID = dto.TechnicianID;

                if (!string.IsNullOrEmpty(dto.Status))
                {
                    booking.Status = dto.Status;
                    booking.ColorCode = GetColorForStatus(dto.Status);
                }

                if (!string.IsNullOrEmpty(dto.Notes))
                    booking.Notes = dto.Notes;

                booking.ModifiedBy = userId;
                booking.ModifiedDate = DateTime.Now;

                // Update services only if provided
                if (dto.Services != null)
                {
                    // Delete existing services
                    if (booking.BookingServices != null && booking.BookingServices.Any())
                    {
                        _context.BookingServices.RemoveRange(booking.BookingServices);
                    }

                    // Add new services
                    if (dto.Services.Any())
                    {
                        foreach (var serviceDto in dto.Services)
                        {
                            var service = await _context.ServiceCatalog
                                .FirstOrDefaultAsync(s => s.ServiceID == serviceDto.ServiceID && !s.IsDeleted);

                            if (service == null)
                                continue;

                            var bookingServiceItem = new Models.Workshop.BookingService
                            {
                                BookingID = booking.BookingID,
                                ServiceID = service.ServiceID,
                                ServiceName = service.ServiceName,
                                EstimatedDuration = service.EstimatedTime ?? 60,
                                CustomRate = serviceDto.CustomRate,
                                Notes = serviceDto.Notes
                            };

                            _context.BookingServices.Add(bookingServiceItem);
                        }
                    }
                }

                await _context.SaveChangesAsync();

                return await GetBookingByIdAsync(id, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating booking {Id}", id);
                throw;
            }
        }
        public async Task<bool> UpdateBookingStatusAsync(int id, string status, int userId, int branchId)
        {
            try
            {
                var booking = await _context.Bookings
                    .FirstOrDefaultAsync(b => b.BookingID == id && !b.IsDeleted && b.BranchID == branchId);

                if (booking == null)
                    return false;

                // ✅ FIX: Add validation for valid status values
                var validStatuses = new[] { "Pending", "Confirmed", "InProgress", "Completed", "Cancelled" };
                if (!validStatuses.Contains(status))
                    throw new InvalidOperationException($"Invalid status: {status}. Valid statuses: {string.Join(", ", validStatuses)}");

                booking.Status = status;
                booking.ColorCode = GetColorForStatus(status);
                booking.ModifiedBy = userId;
                booking.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating booking status {Id}", id);
                throw;
            }
        }


        public async Task<bool> UpdateBookingPriorityAsync(int id, string priority, int userId, int branchId)
        {
            try
            {
                var booking = await _context.Bookings
                    .FirstOrDefaultAsync(b => b.BookingID == id && !b.IsDeleted && b.BranchID == branchId);

                if (booking == null)
                    return false;

                // ✅ Validate priority
                var validPriorities = new[] { "Low", "Normal", "High", "Urgent" };
                if (!validPriorities.Contains(priority))
                    throw new InvalidOperationException($"Invalid priority: {priority}. Valid priorities: {string.Join(", ", validPriorities)}");

                // ✅ FIX: Uncomment this line to actually update the priority
                booking.Priority = priority;  // 🟢 YE LINE UNCOMMENT KARO

                booking.ModifiedBy = userId;
                booking.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating booking priority {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteBookingAsync(int id, int branchId)
        {
            try
            {
                var booking = await _context.Bookings
                    .FirstOrDefaultAsync(b => b.BookingID == id && !b.IsDeleted && b.BranchID == branchId);

                if (booking == null)
                    return false;

                booking.IsDeleted = true;
                booking.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting booking {Id}", id);
                throw;
            }
        }

        public async Task<BookingDto?> ConvertToJobCardAsync(int id, BookingConvertDto dto, int userId, int branchId)
        {
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.BookingServices)
                    .Include(b => b.Vehicle)
                    .FirstOrDefaultAsync(b => b.BookingID == id && !b.IsDeleted && b.BranchID == branchId);

                if (booking == null)
                    return null;

                if (booking.JobCardID.HasValue)
                    throw new InvalidOperationException("Booking already converted to job card");

                // Create job card from booking
                var jobCard = await CreateJobCardFromBooking(booking, dto.TechnicianID ?? booking.TechnicianID, userId, branchId);

                // Update booking with job card ID
                booking.JobCardID = jobCard.JobCardID;
                booking.Status = "InProgress";
                booking.ColorCode = GetColorForStatus("InProgress");
                booking.ModifiedBy = userId;
                booking.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return await GetBookingByIdAsync(id, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error converting booking to job card {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<TimeSlotDto>> GetAvailableTimeSlotsAsync(DateTime date, int? technicianId, int branchId)
        {
            try
            {
                var timeSlots = await _context.TimeSlots
                    .Where(ts => ts.IsActive && (ts.BranchID == null || ts.BranchID == branchId))
                    .OrderBy(ts => ts.DisplayOrder)
                    .ToListAsync();

                var availableSlots = new List<TimeSlotDto>();

                foreach (var slot in timeSlots)
                {
                    var isAvailable = await IsTimeSlotAvailableAsync(date, slot.StartTime, slot.EndTime, technicianId, branchId);

                    if (isAvailable)
                    {
                        availableSlots.Add(new TimeSlotDto
                        {
                            TimeSlotID = slot.TimeSlotID,
                            SlotName = slot.SlotName,
                            StartTime = slot.StartTime,
                            EndTime = slot.EndTime,
                            Duration = slot.Duration,
                            IsActive = slot.IsActive,
                            DisplayOrder = slot.DisplayOrder
                        });
                    }
                }

                return availableSlots;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available time slots");
                throw;
            }
        }

        public async Task<IEnumerable<TimeSlotDto>> GetAllTimeSlotsAsync(int branchId)
        {
            try
            {
                var timeSlots = await _context.TimeSlots
                    .Where(ts => ts.IsActive && (ts.BranchID == null || ts.BranchID == branchId))
                    .OrderBy(ts => ts.DisplayOrder)
                    .ToListAsync();

                return timeSlots.Select(ts => new TimeSlotDto
                {
                    TimeSlotID = ts.TimeSlotID,
                    SlotName = ts.SlotName,
                    StartTime = ts.StartTime,
                    EndTime = ts.EndTime,
                    Duration = ts.Duration,
                    IsActive = ts.IsActive,
                    DisplayOrder = ts.DisplayOrder
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all time slots");
                throw;
            }
        }

        public async Task<bool> IsTimeSlotAvailableAsync(DateTime date, TimeSpan startTime, TimeSpan endTime, int? technicianId, int branchId)
        {
            try
            {
                var conflictingBookings = await _context.Bookings
                    .Where(b => !b.IsDeleted
                        && b.BranchID == branchId
                        && b.BookingDate.Date == date.Date
                        && b.Status != "Cancelled"
                        && ((b.StartTime < endTime && b.StartTime >= startTime)
                            || (b.EndTime > startTime && b.EndTime <= endTime)
                            || (b.StartTime <= startTime && b.EndTime >= endTime)))
                    .ToListAsync();

                if (technicianId.HasValue)
                {
                    conflictingBookings = conflictingBookings
                        .Where(b => b.TechnicianID == technicianId.Value)
                        .ToList();
                }

                return !conflictingBookings.Any();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking time slot availability");
                throw;
            }
        }

        public async Task<DailyBookingsDto> GetDailySummaryAsync(DateTime date, int branchId)
        {
            try
            {
                var bookings = await GetBookingsByDateAsync(date, branchId);

                return new DailyBookingsDto
                {
                    Date = date,
                    Bookings = bookings.ToList()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily summary");
                throw;
            }
        }

        public async Task<IEnumerable<BookingDto>> GetBookingsByVehicleAsync(int vehicleId, int branchId)
        {
            try
            {
                var bookings = await _context.Bookings
                    .Include(b => b.Vehicle)
                    .Include(b => b.Technician)
                    .Include(b => b.JobCard)
                    .Include(b => b.BookingServices)
                    .Where(b => !b.IsDeleted && b.BranchID == branchId && b.VehicleID == vehicleId)
                    .OrderByDescending(b => b.BookingDate)
                    .ToListAsync();

                return bookings.Select(MapToDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bookings for vehicle {VehicleId}", vehicleId);
                throw;
            }
        }

        // Private helper methods
        private async Task<string> GenerateBookingNumberAsync(int branchId)
        {
            var date = DateTime.Now;
            var year = date.Year;
            var month = date.Month.ToString("D2");

            var lastBooking = await _context.Bookings
                .Where(b => b.BranchID == branchId)
                .OrderByDescending(b => b.BookingID)
                .FirstOrDefaultAsync();

            int nextNumber = 1;
            if (lastBooking != null)
            {
                var lastNumber = lastBooking.BookingNo.Split('-').Last();
                int.TryParse(lastNumber, out nextNumber);
                nextNumber++;
            }

            return $"BK-{branchId:D2}-{year}{month}-{nextNumber:D4}";
        }

        private string GetColorForStatus(string status)
        {
            return status switch
            {
                "Pending" => "#FFC107",      // Yellow
                "Confirmed" => "#17A2B8",     // Teal
                "InProgress" => "#007BFF",    // Blue
                "Completed" => "#28A745",     // Green
                "Cancelled" => "#DC3545",      // Red
                _ => "#6C757D"                  // Grey
            };
        }

        private async Task<JobCard> CreateJobCardFromBooking(Booking booking, int? technicianId, int userId, int branchId)
        {
            // Create JobCardCreateDto from booking
            var jobCardDto = new JobCardCreateDto
            {
                VehicleID = booking.VehicleID,
                TechnicianID = technicianId,
                ReceivedDate = DateTime.Now,
                CustomerComplaint = booking.Notes,
                Services = booking.BookingServices?.Select(bs => new JobServiceCreateDto
                {
                    ServiceID = bs.ServiceID,
                    Notes = bs.Notes
                }).ToList()
            };

            // Call JobCardService to create job card
            var jobCard = await _jobCardService.CreateAsync(jobCardDto, userId, branchId);

            // You'll need to get the actual JobCard entity
            return await _context.JobCards
                .FirstOrDefaultAsync(j => j.JobCardID == jobCard.JobCardID)
                ?? throw new Exception("Failed to create job card");
        }

        private BookingDto MapToDto(Booking booking)
        {
            return new BookingDto
            {
                BookingID = booking.BookingID,
                BookingNo = booking.BookingNo,
                BookingDate = booking.BookingDate,
                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                VehicleID = booking.VehicleID,
                VehicleRegNo = booking.Vehicle?.RegistrationNo,
                VehicleMakeModel = $"{booking.Vehicle?.Make} {booking.Vehicle?.Model}".Trim(),
                TechnicianID = booking.TechnicianID,
                TechnicianName = booking.Technician?.User?.UserFullName,
                Status = booking.Status,
                Notes = booking.Notes,
                JobCardID = booking.JobCardID,
                JobCardNo = booking.JobCard?.JobCardNo,
                ColorCode = booking.ColorCode,
                Priority = booking.Priority,
                Services = booking.BookingServices?.Select(bs => new BookingServiceDto
                {
                    BookingServiceID = bs.BookingServiceID,
                    ServiceID = bs.ServiceID,
                    ServiceName = bs.ServiceName,
                    EstimatedDuration = bs.EstimatedDuration,
                    CustomRate = bs.CustomRate,
                    Notes = bs.Notes
                }).ToList()
            };
        }
    }
}