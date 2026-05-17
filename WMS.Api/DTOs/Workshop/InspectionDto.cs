using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.Workshop
{
    // Template DTOs
    public class InspectionTemplateDto
    {
        public int TemplateID { get; set; }
        public string TemplateCode { get; set; } = string.Empty;
        public string TemplateName { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public int BranchID { get; set; }
        public string? BranchName { get; set; }
        public List<InspectionItemDto>? Items { get; set; }
    }

    public class InspectionTemplateCreateDto
    {
        [Required]
        public string TemplateCode { get; set; } = string.Empty;

        [Required]
        public string TemplateName { get; set; } = string.Empty;

        public string? Category { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class InspectionTemplateUpdateDto : InspectionTemplateCreateDto
    {
        [Required]
        public int TemplateID { get; set; }
    }

    // Inspection Item DTOs
    public class InspectionItemDto
    {
        public int ItemID { get; set; }
        public int TemplateID { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ItemType { get; set; } = "CHECKBOX";
        public string? ExpectedValue { get; set; }
        public decimal? MinValue { get; set; }
        public decimal? MaxValue { get; set; }
        public string? Unit { get; set; }
        public bool IsCritical { get; set; }
        public int DisplayOrder { get; set; }
        public bool RequiresPhoto { get; set; }
        public bool RequiresRemarks { get; set; }
        public bool IsActive { get; set; }
    }

    public class InspectionItemCreateDto
    {
        [Required]
        public int TemplateID { get; set; }

        [Required]
        public string ItemCode { get; set; } = string.Empty;

        [Required]
        public string ItemName { get; set; } = string.Empty;

        public string? Description { get; set; }
        public string ItemType { get; set; } = "CHECKBOX";
        public string? ExpectedValue { get; set; }
        public decimal? MinValue { get; set; }
        public decimal? MaxValue { get; set; }
        public string? Unit { get; set; }
        public bool IsCritical { get; set; } = false;
        public int DisplayOrder { get; set; } = 0;
        public bool RequiresPhoto { get; set; } = false;
        public bool RequiresRemarks { get; set; } = false;
        public bool IsActive { get; set; } = true;
    }

    public class InspectionItemUpdateDto : InspectionItemCreateDto
    {
        [Required]
        public int ItemID { get; set; }
    }

    // Job Inspection DTOs
    public class JobInspectionDto
    {
        public int InspectionID { get; set; }
        public int JobCardID { get; set; }
        public string JobCardNo { get; set; } = string.Empty;
        public string VehicleRegNo { get; set; } = string.Empty;
        public int TemplateID { get; set; }
        public string TemplateName { get; set; } = string.Empty;
        public string InspectionNo { get; set; } = string.Empty;
        public DateTime InspectionDate { get; set; }
        public int? InspectedBy { get; set; }
        public string? InspectorName { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? OverallNotes { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? CreatedBy { get; set; }
        public List<InspectionResultDto>? Results { get; set; }
        public int PassCount { get; set; }
        public int FailCount { get; set; }
        public int PendingCount { get; set; }
    }

    public class JobInspectionCreateDto
    {
        [Required]
        public int JobCardID { get; set; }

        [Required]
        public int TemplateID { get; set; }

        public int? InspectedBy { get; set; }
        public string? OverallNotes { get; set; }
    }

    public class JobInspectionUpdateDto
    {
        [Required]
        public int InspectionID { get; set; }

        public int? InspectedBy { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? OverallNotes { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    // Inspection Result DTOs
    public class InspectionResultDto
    {
        public int ResultID { get; set; }
        public int InspectionID { get; set; }
        public int ItemID { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty;
        public string? ExpectedValue { get; set; }
        public string? ObservedValue { get; set; }
        public decimal? NumericValue { get; set; }
        public bool? IsPass { get; set; }
        public string? Remarks { get; set; }
        public string? ImagePath { get; set; }
        public bool IsCritical { get; set; }
        public bool RequiresPhoto { get; set; }
        public bool RequiresRemarks { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class InspectionResultSubmitDto
    {
        [Required]
        public int InspectionID { get; set; }

        [Required]
        public int ItemID { get; set; }

        public string? ObservedValue { get; set; }
        public decimal? NumericValue { get; set; }
        public bool? IsPass { get; set; }
        public string? Remarks { get; set; }
        public string? ImagePath { get; set; }
    }

    public class InspectionCompleteDto
    {
        [Required]
        public int InspectionID { get; set; }

        public string Status { get; set; } = "COMPLETED";
        public string? OverallNotes { get; set; }
        public List<InspectionResultSubmitDto>? Results { get; set; }
    }
}