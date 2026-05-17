using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.Workshop
{
    public class WarrantyClaimDto
    {
        public int ClaimID { get; set; }
        public string ClaimNo { get; set; } = string.Empty;
        public int JobCardID { get; set; }
        public string JobCardNo { get; set; } = string.Empty;
        public string VehicleRegNo { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public DateTime ClaimDate { get; set; }
        public string ClaimType { get; set; } = string.Empty;
        public int? JobServiceID { get; set; }
        public string? ServiceName { get; set; }
        public int? JobPartID { get; set; }
        public string? PartName { get; set; }
        public int? ItemID { get; set; }
        public string? ItemName { get; set; }
        public int? SupplierID { get; set; }
        public string? SupplierName { get; set; }
        public decimal? ClaimAmount { get; set; }
        public decimal? ApprovedAmount { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? SubmittedDate { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string? RejectionReason { get; set; }
        public string? ResolutionNotes { get; set; }
        public string Priority { get; set; } = string.Empty;
        public int? WarrantyPeriod { get; set; }
        public DateTime? WarrantyExpiryDate { get; set; }
        public int DaysRemaining { get; set; }
        public List<WarrantyAttachmentDto>? Attachments { get; set; }
        public List<WarrantyHistoryDto>? History { get; set; }
    }

    public class WarrantyClaimCreateDto
    {
        [Required]
        public int JobCardID { get; set; }

        [Required]
        public string ClaimType { get; set; } = string.Empty;

        public int? JobServiceID { get; set; }
        public int? JobPartID { get; set; }
        public int? ItemID { get; set; }
        public int? SupplierID { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? ClaimAmount { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }

        public string Priority { get; set; } = "NORMAL";
    }

    public class WarrantyClaimUpdateDto
    {
        [Required]
        public int ClaimID { get; set; }

        public decimal? ApprovedAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? RejectionReason { get; set; }
        public string? ResolutionNotes { get; set; }
        public DateTime? SubmittedDate { get; set; }
        public DateTime? ApprovedDate { get; set; }
    }

    public class WarrantyClaimStatusUpdateDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;

        public decimal? ApprovedAmount { get; set; }
        public string? RejectionReason { get; set; }
        public string? ResolutionNotes { get; set; }
    }

    public class WarrantyAttachmentDto
    {
        public int AttachmentID { get; set; }
        public int ClaimID { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public int? FileSize { get; set; }
        public string? FileType { get; set; }
        public DateTime UploadedDate { get; set; }
        public string? Description { get; set; }
    }

    public class WarrantyAttachmentCreateDto
    {
        [Required]
        public int ClaimID { get; set; }

        [Required]
        public string FileName { get; set; } = string.Empty;

        [Required]
        public string FilePath { get; set; } = string.Empty;

        public int? FileSize { get; set; }
        public string? FileType { get; set; }
        public string? Description { get; set; }
    }

    public class WarrantyHistoryDto
    {
        public int HistoryID { get; set; }
        public int ClaimID { get; set; }
        public string? StatusFrom { get; set; }
        public string StatusTo { get; set; } = string.Empty;
        public string? ChangedByName { get; set; }
        public DateTime ChangedDate { get; set; }
        public string? Notes { get; set; }
    }

    public class SupplierWarrantyDto
    {
        public int SupplierWarrantyID { get; set; }
        public int SupplierID { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public int ItemID { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public int WarrantyPeriod { get; set; }
        public string WarrantyType { get; set; } = string.Empty;
        public string? Terms { get; set; }
        public bool IsActive { get; set; }
    }

    public class SupplierWarrantyCreateDto
    {
        [Required]
        public int SupplierID { get; set; }

        [Required]
        public int ItemID { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int WarrantyPeriod { get; set; }

        public string WarrantyType { get; set; } = "STANDARD";
        public string? Terms { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class SupplierWarrantyUpdateDto : SupplierWarrantyCreateDto
    {
        [Required]
        public int SupplierWarrantyID { get; set; }
    }

    public class WarrantySummaryDto
    {
        public int TotalClaims { get; set; }
        public int OpenClaims { get; set; }
        public int ApprovedClaims { get; set; }
        public int RejectedClaims { get; set; }
        public int PaidClaims { get; set; }
        public decimal TotalClaimAmount { get; set; }
        public decimal TotalApprovedAmount { get; set; }
        public List<WarrantyClaimDto> RecentClaims { get; set; } = new();
    }
}
