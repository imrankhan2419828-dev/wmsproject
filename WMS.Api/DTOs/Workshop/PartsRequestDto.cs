using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.Workshop
{
    public class PartsRequestDto
    {
        public int RequestID { get; set; }
        public string RequestNo { get; set; } = string.Empty;
        public int JobCardID { get; set; }
        public string JobCardNo { get; set; } = string.Empty;
        public string VehicleRegNo { get; set; } = string.Empty;
        public int ItemID { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string ItemCode { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal? ApprovedQuantity { get; set; }
        public DateTime RequestDate { get; set; }
        public DateTime? RequiredDate { get; set; }
        public DateTime? ExpectedDate { get; set; }
        public DateTime? ReceivedDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? SupplierID { get; set; }
        public string? SupplierName { get; set; }
        public int? PurchaseOrderID { get; set; }
        public decimal? EstimatedCost { get; set; }
        public decimal? ActualCost { get; set; }
        public string Urgency { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string? RequestedByName { get; set; }
        public string? ApprovedByName { get; set; }
        public int DaysPending { get; set; }
    }

    public class PartsRequestCreateDto
    {
        [Required]
        public int JobCardID { get; set; }

        [Required]
        public int ItemID { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Quantity { get; set; }

        public DateTime? RequiredDate { get; set; }

        public int? SupplierID { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? EstimatedCost { get; set; }

        public string Urgency { get; set; } = "NORMAL";

        [StringLength(500)]
        public string? Notes { get; set; }
    }

    public class PartsRequestUpdateDto
    {
        [Required]
        public int RequestID { get; set; }

        public decimal? ApprovedQuantity { get; set; }
        public DateTime? ExpectedDate { get; set; }
        public DateTime? ReceivedDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? SupplierID { get; set; }
        public decimal? EstimatedCost { get; set; }
        public decimal? ActualCost { get; set; }
        public string? Notes { get; set; }
        public int? ApprovedBy { get; set; }
    }

    public class PartsRequestApproveDto
    {
        [Required]
        public int RequestID { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal ApprovedQuantity { get; set; }

        public int? SupplierID { get; set; }
        public DateTime? ExpectedDate { get; set; }
        public string? Notes { get; set; }
    }

    public class LowStockAlertDto
    {
        public int ItemID { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string? CompanyName { get; set; }
        public string? CategoryName { get; set; }
        public decimal CurrentStock { get; set; }
        public int PendingRequests { get; set; }
        public DateTime? EarliestRequiredDate { get; set; }
        public string StockStatus { get; set; } = string.Empty;
        public decimal? PurchaseRate { get; set; }
        public decimal? SaleRate { get; set; }
    }
}