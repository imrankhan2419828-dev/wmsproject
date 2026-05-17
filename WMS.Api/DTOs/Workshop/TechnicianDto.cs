using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.Workshop
{
    public class TechnicianDto
    {
        public int TechnicianID { get; set; }
        public int? UserID { get; set; }
        public string? TechnicianName { get; set; }
        public string? UserName { get; set; }
        public string? FullName { get; set; }
        public string? EmployeeCode { get; set; }
        public string? Specialization { get; set; }
        public string? Certification { get; set; }
        public int? ExperienceYears { get; set; }
        public decimal? HourlyRate { get; set; }
        public int? DailyCapacity { get; set; }
        public string? Remarks { get; set; }
        public bool InActive { get; set; }
        public int? CurrentWorkload { get; set; }
    }

    public class TechnicianCreateDto
    {
        [StringLength(200)]
        public string? TechnicianName { get; set; }  // ✅ New field

        [StringLength(50)]
        public string? EmployeeCode { get; set; }

        [StringLength(200)]
        public string? Specialization { get; set; }

        [StringLength(200)]
        public string? Certification { get; set; }

        [Range(0, 50)]
        public int? ExperienceYears { get; set; }

        [Range(0, 10000)]
        public decimal? HourlyRate { get; set; }

        [Range(1, 20)]
        public int? DailyCapacity { get; set; }

        [StringLength(500)]
        public string? Remarks { get; set; }

        public bool InActive { get; set; }
    }

    public class TechnicianUpdateDto : TechnicianCreateDto
    {
        [Required]
        public int TechnicianID { get; set; }
    }
}