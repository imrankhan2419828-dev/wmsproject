using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.Workshop
{
    public class ServiceCatalogDto
    {
        public int ServiceID { get; set; }
        public string ServiceCode { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string? Description { get; set; }
        public decimal? DefaultLaborRate { get; set; }
        public int? EstimatedTime { get; set; }
        public int? WarrantyPeriod { get; set; }
        public bool RequiresParts { get; set; }
        public List<int>? SuggestedParts { get; set; }
        public bool InActive { get; set; }
    }

    public class ServiceCatalogCreateDto
    {
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

        [Range(0, double.MaxValue)]
        public decimal? DefaultLaborRate { get; set; }

        [Range(0, int.MaxValue)]
        public int? EstimatedTime { get; set; }

        [Range(0, int.MaxValue)]
        public int? WarrantyPeriod { get; set; }

        public bool RequiresParts { get; set; }

        public List<int>? SuggestedParts { get; set; }

        public bool InActive { get; set; }
    }

    public class ServiceCatalogUpdateDto : ServiceCatalogCreateDto
    {
        [Required]
        public int ServiceID { get; set; }
    }
}