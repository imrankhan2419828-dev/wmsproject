using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WMS.Api.Models.Workshop;

namespace WMS.Api.Models
{
    [Table("Technicians")]
    public class Technician
    {
        [Key]
        public int TechnicianID { get; set; }

        // Optional UserID - can be null if technician is not a system user
        public int? UserID { get; set; }

        // Technician name - main field for storing technician name
        [StringLength(200)]
        public string? TechnicianName { get; set; }

        [StringLength(50)]
        public string? EmployeeCode { get; set; }

        [StringLength(200)]
        public string? Specialization { get; set; }

        [StringLength(200)]
        public string? Certification { get; set; }

        public int? ExperienceYears { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? HourlyRate { get; set; }

        public int? DailyCapacity { get; set; }

        [StringLength(500)]
        public string? Remarks { get; set; }

        public bool InActive { get; set; } = false;
        public bool IsDeleted { get; set; } = false;

        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }

        // Navigation Properties
        [ForeignKey("UserID")]
        public virtual SystemUser? User { get; set; }

        // ✅ These properties are required for DbContext configuration
        public virtual ICollection<JobService>? JobServices { get; set; }
        public virtual ICollection<JobCard>? AssignedJobs { get; set; }
    }
}