using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("JobServices")]
    public class JobService
    {
        [Key]
        public int JobServiceID { get; set; }

        [Required]
        public int JobCardID { get; set; }

        [Required]
        public int ServiceID { get; set; }

        [Required]
        [StringLength(200)]
        public string ServiceName { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        public int Quantity { get; set; } = 1;

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal DiscountPercent { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        public int? TechnicianID { get; set; }

        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }

        [StringLength(20)]
        public string? Status { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }

        // ✅ FIXED: Navigation Properties
        [ForeignKey("JobCardID")]
        public virtual JobCard? JobCard { get; set; }

        [ForeignKey("ServiceID")]  // ← YEH SAHI HAI - ServiceID se connect karo
        public virtual ServiceCatalog? Service { get; set; }

        [ForeignKey("TechnicianID")]
        public virtual Technician? Technician { get; set; }
    }
}