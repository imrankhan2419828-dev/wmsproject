using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("Bookings")]
    public class Booking
    {
        [Key]
        public int BookingID { get; set; }

        [Required]
        [StringLength(50)]
        public string BookingNo { get; set; } = string.Empty;

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

        [StringLength(20)]
        public string? Priority { get; set; } = "Normal";


        [StringLength(500)]
        public string? Notes { get; set; }

        public int? JobCardID { get; set; }

        [StringLength(10)]
        public string? ColorCode { get; set; }

        // Audit Fields
        [Required]
        public int BranchID { get; set; }

        [Required]
        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }

        public bool IsDeleted { get; set; } = false;

        // Navigation Properties
        [ForeignKey("VehicleID")]
        public virtual Vehicle? Vehicle { get; set; }

        [ForeignKey("TechnicianID")]
        public virtual Technician? Technician { get; set; }

        [ForeignKey("JobCardID")]
        public virtual JobCard? JobCard { get; set; }

        [ForeignKey("BranchID")]
        public virtual Branch? Branch { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual SystemUser? CreatedByUser { get; set; }

        public virtual ICollection<BookingService>? BookingServices { get; set; }
    }
}