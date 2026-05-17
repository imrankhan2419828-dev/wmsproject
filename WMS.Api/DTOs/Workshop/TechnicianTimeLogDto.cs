using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.Workshop
{
    public class TechnicianTimeLogDto
    {
        public int TimeLogID { get; set; }
        public int TechnicianID { get; set; }
        public string TechnicianName { get; set; } = string.Empty;
        public int? JobServiceID { get; set; }
        public string? JobServiceName { get; set; }
        public int? JobCardID { get; set; }
        public string? JobCardNo { get; set; }
        public DateTime ClockInTime { get; set; }
        public DateTime? ClockOutTime { get; set; }
        public DateTime? BreakStartTime { get; set; }
        public DateTime? BreakEndTime { get; set; }
        public int TotalBreakMinutes { get; set; }
        public int? TotalWorkMinutes { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class TechnicianTimeLogCreateDto
    {
        [Required]
        public int TechnicianID { get; set; }

        public int? JobServiceID { get; set; }
        public int? JobCardID { get; set; }

        [Required]
        public DateTime ClockInTime { get; set; }

        public DateTime? ClockOutTime { get; set; }
        public DateTime? BreakStartTime { get; set; }
        public DateTime? BreakEndTime { get; set; }

        public int TotalBreakMinutes { get; set; } = 0;

        [StringLength(20)]
        public string Status { get; set; } = "ACTIVE";

        [StringLength(500)]
        public string? Notes { get; set; }
    }

    public class TechnicianTimeLogUpdateDto : TechnicianTimeLogCreateDto
    {
        [Required]
        public int TimeLogID { get; set; }
        public int? TotalWorkMinutes { get; set; }
    }

    public class TechnicianWorkloadDto
    {
        public int TechnicianID { get; set; }
        public string TechnicianName { get; set; } = string.Empty;
        public int AssignedServices { get; set; }
        public int AssignedJobs { get; set; }
        public decimal TotalValue { get; set; }
        public int DailyCapacity { get; set; }
        public string WorkloadStatus { get; set; } = string.Empty; // AVAILABLE, NEAR_CAPACITY, OVERLOADED
        public int TodayMinutes { get; set; }
        public decimal TodayHours { get; set; }
    }

    public class TechnicianEngagementDto
    {
        public int TechnicianID { get; set; }
        public string TechnicianName { get; set; } = string.Empty;
        public string EmployeeCode { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public bool IsEngaged { get; set; }
        public DateTime? EngagedSince { get; set; }
        public string? CurrentJobCardNo { get; set; }
        public string? CurrentStatus { get; set; } // ACTIVE, BREAK
        public int TodayHours { get; set; }
    }
}