using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("Vehicles")]
    public class Vehicle
    {
        [Key]
        public int VehicleID { get; set; }

        // ✅ Make nullable - no longer required
        public int? CustomerID { get; set; }

        // ✅ Add CustomerName field
        [StringLength(200)]
        public string? CustomerName { get; set; }

        [Required]
        [StringLength(50)]
        public string RegistrationNo { get; set; } = string.Empty;

        [StringLength(100)]
        public string? ChassisNo { get; set; }

        [StringLength(100)]
        public string? EngineNo { get; set; }

        [StringLength(100)]
        public string? Make { get; set; }

        [StringLength(100)]
        public string? Model { get; set; }

        public int? Year { get; set; }

        [StringLength(50)]
        public string? Color { get; set; }

        [StringLength(20)]
        public string? FuelType { get; set; }

        public int? OdometerReading { get; set; }

        public DateTime? LastServiceDate { get; set; }
        public DateTime? NextServiceDue { get; set; }

        [StringLength(500)]
        public string? Remarks { get; set; }

        public bool InActive { get; set; } = false;
        public bool IsDeleted { get; set; } = false;

        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }

        // Navigation Properties
        [ForeignKey("CustomerID")]
        public virtual COA? Customer { get; set; }

        public virtual ICollection<JobCard>? JobCards { get; set; }
    }
}