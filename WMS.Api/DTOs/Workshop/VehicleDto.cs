using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.Workshop
{
    public class VehicleDto
    {
        public int VehicleID { get; set; }
        public int? CustomerID { get; set; }
        public string? CustomerName { get; set; }
        public string RegistrationNo { get; set; } = string.Empty;
        public string? ChassisNo { get; set; }
        public string? EngineNo { get; set; }
        public string? Make { get; set; }
        public string? Model { get; set; }
        public int? Year { get; set; }
        public string? Color { get; set; }
        public string? FuelType { get; set; }
        public int? OdometerReading { get; set; }
        public DateTime? LastServiceDate { get; set; }
        public DateTime? NextServiceDue { get; set; }
        public string? Remarks { get; set; }
        public bool InActive { get; set; }
    }

    public class VehicleCreateDto
    {
        // ✅ Make optional - can be null
        public int? CustomerID { get; set; }

        // ✅ Add CustomerName - text field
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

        public bool InActive { get; set; }
    }

    public class VehicleUpdateDto : VehicleCreateDto
    {
        [Required]
        public int VehicleID { get; set; }
    }
}