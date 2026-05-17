using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("TechnicianTimeLog")]
    public class TechnicianTimeLog
    {
        [Key]
        public int TimeLogID { get; set; }

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
        public int? TotalWorkMinutes { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "ACTIVE"; // ACTIVE, BREAK, COMPLETED

        [StringLength(500)]
        public string? Notes { get; set; }

        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }

        // Navigation Properties
        [ForeignKey("TechnicianID")]
        public virtual Technician? Technician { get; set; }

        [ForeignKey("JobServiceID")]
        public virtual JobService? JobService { get; set; }

        [ForeignKey("JobCardID")]
        public virtual JobCard? JobCard { get; set; }
    }
}