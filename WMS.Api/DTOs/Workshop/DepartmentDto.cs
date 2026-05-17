using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.Workshop
{
    public class DepartmentDto
    {
        public int DepartmentID { get; set; }
        public string DepartmentCode { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int BranchID { get; set; }
        public string? BranchName { get; set; }
        public int? ManagerID { get; set; }
        public string? ManagerName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Location { get; set; }
        public bool IsActive { get; set; }
        public int TechnicianCount { get; set; }
        public int ActiveJobs { get; set; }
        public int CompletedJobs { get; set; }
    }

    public class DepartmentCreateDto
    {
        [Required]
        public string DepartmentCode { get; set; } = string.Empty;

        [Required]
        public string DepartmentName { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int? ManagerID { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Location { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class DepartmentUpdateDto : DepartmentCreateDto
    {
        [Required]
        public int DepartmentID { get; set; }
    }

    public class JobDepartmentDto
    {
        public int JobDepartmentID { get; set; }
        public int JobCardID { get; set; }
        public string JobCardNo { get; set; } = string.Empty;
        public int DepartmentID { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public DateTime AssignedDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class JobDepartmentAssignDto
    {
        [Required]
        public int JobCardID { get; set; }

        [Required]
        public int DepartmentID { get; set; }

        public string? Notes { get; set; }
    }

    public class TechnicianDepartmentDto
    {
        public int TechDeptID { get; set; }
        public int TechnicianID { get; set; }
        public string TechnicianName { get; set; } = string.Empty;
        public int DepartmentID { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public bool IsPrimary { get; set; }
        public DateTime AssignedDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; }
    }

    public class TechnicianDepartmentAssignDto
    {
        [Required]
        public int TechnicianID { get; set; }

        [Required]
        public int DepartmentID { get; set; }

        public bool IsPrimary { get; set; } = false;
    }

    public class DepartmentServiceDto
    {
        public int DeptServiceID { get; set; }
        public int DepartmentID { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int ServiceID { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }
        public int? EstimatedTime { get; set; }
    }

    public class DepartmentServiceAssignDto
    {
        [Required]
        public int DepartmentID { get; set; }

        [Required]
        public int ServiceID { get; set; }

        public bool IsAvailable { get; set; } = true;
        public int? EstimatedTime { get; set; }
    }

    public class DepartmentPartDto
    {
        public int DeptPartID { get; set; }
        public int DepartmentID { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int ItemID { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public bool IsCommon { get; set; }
        public decimal? MinStockLevel { get; set; }
    }

    public class DepartmentPartAssignDto
    {
        [Required]
        public int DepartmentID { get; set; }

        [Required]
        public int ItemID { get; set; }

        public bool IsCommon { get; set; } = false;
        public decimal? MinStockLevel { get; set; }
    }

    public class DepartmentTransferDto
    {
        public int TransferID { get; set; }
        public int JobCardID { get; set; }
        public string JobCardNo { get; set; } = string.Empty;
        public int FromDepartmentID { get; set; }
        public string FromDepartmentName { get; set; } = string.Empty;
        public int ToDepartmentID { get; set; }
        public string ToDepartmentName { get; set; } = string.Empty;
        public DateTime TransferDate { get; set; }
        public string? TransferredByName { get; set; }
        public string? Reason { get; set; }
        public string? ReceivedByName { get; set; }
        public DateTime? ReceivedDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class DepartmentTransferCreateDto
    {
        [Required]
        public int JobCardID { get; set; }
        [Required]
        public int FromDepartmentID { get; set; }

        [Required]
        public int ToDepartmentID { get; set; }

        public string? Reason { get; set; }
    }

    public class DepartmentTransferReceiveDto
    {
        [Required]
        public int TransferID { get; set; }

        public string? Notes { get; set; }
    }

    public class DepartmentDashboardDto
    {
        public int TotalDepartments { get; set; }
        public int ActiveJobs { get; set; }
        public int AvailableTechnicians { get; set; }
        public List<DepartmentSummaryDto> DepartmentSummaries { get; set; } = new();
    }

    public class DepartmentSummaryDto
    {
        public int DepartmentID { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int ActiveJobs { get; set; }
        public int TotalJobs { get; set; }
        public int CompletedJobs { get; set; }
        public int TechnicianCount { get; set; }
        public int AvailableTechnicians { get; set; }
        public int PendingTransfers { get; set; }
    }
}