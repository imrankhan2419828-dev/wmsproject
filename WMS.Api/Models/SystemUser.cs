using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("SystemUsers")]
    public class SystemUser
    {
        [Key]
        public int UserID { get; set; }

        public string? UserFullName { get; set; }
        public bool? IsDeleted { get; set; }
        public bool? IsApproved { get; set; }
        public string? UserName { get; set; }
        public string? Password { get; set; }
        public int? DeptID { get; set; }
        public bool? IsSupervisor { get; set; }
        public string? UserEmail { get; set; }
        public bool? IsAdmin { get; set; }
        public int? BranchID { get; set; }
        public int? RoleID { get; set; }
        public int? AddBy { get; set; }
        public DateTime? AddOn { get; set; }
        public int? EditBy { get; set; }
        public DateTime? EditOn { get; set; }
        public bool? InActive { get; set; }
        public bool? CurrUser { get; set; }
        public int? GodnID { get; set; }
        public bool? AllowRateChange { get; set; }
        public int? Emp_FileID { get; set; }
        public bool? AllowChangePrintStatus { get; set; }
        public int? DashBoardID { get; set; }
        public int? AllwDays { get; set; }
        public bool? Allw_AllGodn { get; set; }
        public bool? AllowCNICSkip { get; set; }
        public bool? IsBoss { get; set; }
        public bool? HidePurcRate { get; set; }

        // Navigation Properties
        [ForeignKey("BranchID")]
        public virtual Branch? Branch { get; set; }

        [ForeignKey("RoleID")]
        public virtual RoleMaster? Role { get; set; }

        public virtual ICollection<UserPermission>? UserPermissions { get; set; }
        public virtual ICollection<UserBranch>? UserBranches { get; set; }
    }
}