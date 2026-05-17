using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WMS.Api.Services.Implementations;

namespace WMS.Api.Models
{
    [Table("ServiceCatalog")]
    public class ServiceCatalog
    {
        [Key]
        public int ServiceID { get; set; }

        [Required]
        [StringLength(50)]
        public string ServiceCode { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string ServiceName { get; set; } = string.Empty;

        [StringLength(50)]
        public string? Category { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [Column(TypeName = "decimal(18,2")]
        public decimal? DefaultLaborRate { get; set; }

        public int? EstimatedTime { get; set; }  // Minutes

        public int? WarrantyPeriod { get; set; } // Days

        public bool RequiresParts { get; set; } = false;

        public string? PartsList { get; set; }   // JSON of suggested part IDs

        public bool InActive { get; set; } = false;
        public bool IsDeleted { get; set; } = false;

        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }

        // Navigation Properties
        public virtual ICollection<JobService>? JobServices { get; set; }
    }
}