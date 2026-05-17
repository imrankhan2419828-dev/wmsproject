using System;

namespace WMS.Api.DTOs.SystemUser
{
    public class SystemUserDto
    {
        public int UserID { get; set; }
        public string? UserFullName { get; set; }
        public string? UserName { get; set; }
        public string? UserEmail { get; set; }
        public int? RoleID { get; set; }
        public string? RoleName { get; set; }
        public int? BranchID { get; set; }
        public string? BranchName { get; set; }
        public bool? IsAdmin { get; set; }
        public bool? InActive { get; set; }
        public bool? IsApproved { get; set; }
        public DateTime? AddOn { get; set; }
        public DateTime? EditOn { get; set; }
    }

    public class SystemUserListDto
    {
        public int UserID { get; set; }
        public string UserFullName { get; set; } = "";
        public string UserName { get; set; } = "";
        public string RoleName { get; set; } = "";
        public string BranchName { get; set; } = "";
        public bool IsAdmin { get; set; }
        public bool InActive { get; set; }
    }
}