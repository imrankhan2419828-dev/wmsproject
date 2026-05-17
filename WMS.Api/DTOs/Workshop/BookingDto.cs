using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.Workshop
{
    public class BookingDto
    {
        public int BookingID { get; set; }
        public string BookingNo { get; set; } = string.Empty;
        public DateTime BookingDate { get; set; }
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
        public int VehicleID { get; set; }
        public string? VehicleRegNo { get; set; }
        public string? VehicleMakeModel { get; set; }
        public int? TechnicianID { get; set; }
        public string? TechnicianName { get; set; }
        public string Status { get; set; } = "Pending";

        public string? Priority { get; set; } = "Normal";
        public string? Notes { get; set; }
        public int? JobCardID { get; set; }
        public string? JobCardNo { get; set; }
        public string? ColorCode { get; set; }
        public List<BookingServiceDto>? Services { get; set; }
    }

    public class BookingServiceDto
    {
        public int BookingServiceID { get; set; }
        public int ServiceID { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public int EstimatedDuration { get; set; }
        public decimal? CustomRate { get; set; }
        public string? Notes { get; set; }
    }

    public class TimeSlotDto
    {
        public int TimeSlotID { get; set; }
        public string SlotName { get; set; } = string.Empty;
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public int Duration { get; set; }
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class BookingCreateDto
    {
        [Required]
        public DateTime BookingDate { get; set; }

        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }

        [Required]
        public int VehicleID { get; set; }

        public int? TechnicianID { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Pending";

        [StringLength(500)]
        public string? Notes { get; set; }

        public List<BookingServiceCreateDto>? Services { get; set; }
    }

    public class BookingServiceCreateDto
    {
        [Required]
        public int ServiceID { get; set; }

        public decimal? CustomRate { get; set; }
        public string? Notes { get; set; }
    }

    public class BookingUpdateDto : BookingCreateDto
    {
        //[Required]
        //public int BookingID { get; set; }

        // ✅ FIX: Remove Required from BookingID since it's in URL
        public int BookingID { get; set; }

        // ✅ FIX: Make fields nullable for partial updates
        public DateTime? BookingDate { get; set; }
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }

        // ✅ FIX: Make nullable to avoid FK constraint when not updating vehicle
        public int? VehicleID { get; set; }
        public int? TechnicianID { get; set; }
        public string? Status { get; set; }
        [StringLength(500)]
        public string? Notes { get; set; }
        public List<BookingServiceCreateDto>? Services { get; set; }

        [StringLength(20)]
        public string? Priority { get; set; }
    }

    public class BookingConvertDto
    {
        [Required]
        public int BookingID { get; set; }

        public int? TechnicianID { get; set; }
        public string? Notes { get; set; }
    }

    public class DailyBookingsDto
    {
        public DateTime Date { get; set; }
        public List<BookingDto> Bookings { get; set; } = new();
        public int TotalBookings => Bookings.Count;
        public Dictionary<string, int> StatusCount => Bookings
            .GroupBy(b => b.Status)
            .ToDictionary(g => g.Key, g => g.Count());
    }
}