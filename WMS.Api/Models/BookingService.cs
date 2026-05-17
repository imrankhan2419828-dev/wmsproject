using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("BookingServices")]
    public class BookingService
    {
        [Key]
        public int BookingServiceID { get; set; }

        [Required]
        public int BookingID { get; set; }

        [Required]
        public int ServiceID { get; set; }

        [Required]
        [StringLength(200)]
        public string ServiceName { get; set; } = string.Empty;

        [Required]
        public int EstimatedDuration { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? CustomRate { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }

        // Navigation Properties
        [ForeignKey("BookingID")]
        public virtual Booking? Booking { get; set; }

        [ForeignKey("ServiceID")]
        public virtual ServiceCatalog? Service { get; set; }
    }
}