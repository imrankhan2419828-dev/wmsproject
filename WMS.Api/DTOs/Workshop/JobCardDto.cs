using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.Workshop
{
    public class JobCardDto
    {
        public int JobCardID { get; set; }
        public string JobCardNo { get; set; } = string.Empty;
        public int VehicleID { get; set; }
        public string VehicleRegNo { get; set; } = string.Empty;
        public string VehicleMakeModel { get; set; } = string.Empty;
        public int? CustomerID { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? ServiceAdvisorName { get; set; }
        public string? TechnicianName { get; set; }
        public DateTime ReceivedDate { get; set; }
        public DateTime? PromisedDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string? CustomerComplaint { get; set; }
        public string? TechnicianFindings { get; set; }
        public string? Recommendations { get; set; }
        public decimal TotalLabor { get; set; }
        public decimal TotalParts { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal GrandTotal { get; set; }
        public int? InvoiceNumber { get; set; }
        public bool InActive { get; set; }
        public List<JobServiceDto>? Services { get; set; }
        public List<JobPartDto>? Parts { get; set; }
    }

    public class JobServiceDto
    {
        public int JobServiceID { get; set; }
        public int ServiceID { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal DiscountPercent { get; set; }
        public decimal TotalAmount { get; set; }
        public int? TechnicianID { get; set; }
        public string? TechnicianName { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? Status { get; set; }
    }

    public class JobPartDto
    {
        public int JobPartID { get; set; }
        public int ItemID { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal DiscountPercent { get; set; }
        public decimal TotalAmount { get; set; }
        public string? StockSource { get; set; }
        public int? GodownID { get; set; }
    }

    public class JobCardCreateDto
    {
        [Required]
        public int VehicleID { get; set; }

        public string? ServiceAdvisorName { get; set; }  // ✅ Text field
        public int? ServiceAdvisorID { get; set; }
        public int? TechnicianID { get; set; }

        public DateTime ReceivedDate { get; set; } = DateTime.Now;
        public DateTime? PromisedDate { get; set; }

        public string? CustomerComplaint { get; set; }
        public string? TechnicianFindings { get; set; }
        public string? Recommendations { get; set; }

        public List<JobServiceCreateDto>? Services { get; set; }
        public List<JobPartCreateDto>? Parts { get; set; }
    }

    public class JobServiceCreateDto
    {
        [Required]
        public int ServiceID { get; set; }

        public int Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; }
        public decimal DiscountPercent { get; set; }
        public int? TechnicianID { get; set; }
        public string? Notes { get; set; }
    }

    public class JobPartCreateDto
    {
        [Required]
        public int ItemID { get; set; }

        public decimal Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; }
        public decimal DiscountPercent { get; set; }
        public string? StockSource { get; set; } = "STOCK";
        public string? Notes { get; set; }

        public int? GodownID { get; set; }
    }

    public class JobCardUpdateDto : JobCardCreateDto
    {
        [Required]
        public int JobCardID { get; set; }

        public string Status { get; set; } = string.Empty;
    }

    public class JobCardStatusUpdateDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;

        public DateTime? CompletedDate { get; set; }
        public DateTime? DeliveredDate { get; set; }
        public string? CancellationReason { get; set; }
    }
}