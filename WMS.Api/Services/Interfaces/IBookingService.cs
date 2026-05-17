using WMS.Api.DTOs.Workshop;

namespace WMS.Api.Services.Interfaces.Workshop
{
    public interface IBookingService
    {
        // Get bookings by date
        Task<IEnumerable<BookingDto>> GetBookingsByDateAsync(DateTime date, int branchId);

        // Get bookings by date range
        Task<IEnumerable<BookingDto>> GetBookingsByDateRangeAsync(DateTime fromDate, DateTime toDate, int branchId);

        // Get booking by ID
        Task<BookingDto?> GetBookingByIdAsync(int id, int branchId);

        // Create new booking
        Task<BookingDto> CreateBookingAsync(BookingCreateDto dto, int userId, int branchId);

        // Update booking
        Task<BookingDto?> UpdateBookingAsync(int id, BookingUpdateDto dto, int userId, int branchId);

        // Update booking status
        Task<bool> UpdateBookingStatusAsync(int id, string status, int userId, int branchId);
        Task<bool> UpdateBookingPriorityAsync(int id, string priority, int userId, int branchId);
        // Delete booking (soft delete)
        Task<bool> DeleteBookingAsync(int id, int branchId);

        // Convert booking to job card
        Task<BookingDto?> ConvertToJobCardAsync(int id, BookingConvertDto dto, int userId, int branchId);

        // Get available time slots for a date
        Task<IEnumerable<TimeSlotDto>> GetAvailableTimeSlotsAsync(DateTime date, int? technicianId, int branchId);

        // Get all time slots
        Task<IEnumerable<TimeSlotDto>> GetAllTimeSlotsAsync(int branchId);

        // Check if time slot is available
        Task<bool> IsTimeSlotAvailableAsync(DateTime date, TimeSpan startTime, TimeSpan endTime, int? technicianId, int branchId);

        // Get daily summary
        Task<DailyBookingsDto> GetDailySummaryAsync(DateTime date, int branchId);

        // Get bookings by vehicle
        Task<IEnumerable<BookingDto>> GetBookingsByVehicleAsync(int vehicleId, int branchId);
    }
}