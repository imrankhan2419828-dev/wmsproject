using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("Departments")]
    public class Department
    {
        [Key]
        public int DepartmentID { get; set; }

        [Required]
        [StringLength(50)]
        public string DepartmentCode { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string DepartmentName { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        public int BranchID { get; set; }

        public int? ManagerID { get; set; }

        [StringLength(200)]
        public string? Email { get; set; }

        [StringLength(50)]
        public string? Phone { get; set; }

        [StringLength(200)]
        public string? Location { get; set; }

        public bool IsActive { get; set; } = true;

        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }

        // Navigation Properties
        [ForeignKey("BranchID")]
        public virtual Branch? Branch { get; set; }

        [ForeignKey("ManagerID")]
        public virtual SystemUser? Manager { get; set; }

        public virtual ICollection<JobDepartment>? JobDepartments { get; set; }
        public virtual ICollection<TechnicianDepartment>? TechnicianDepartments { get; set; }
        public virtual ICollection<DepartmentService>? DepartmentServices { get; set; }
        public virtual ICollection<DepartmentPart>? DepartmentParts { get; set; }
        [NotMapped]  // Add this attribute
        public virtual ICollection<DepartmentTransfer>? FromTransfers { get; set; }

        [NotMapped]  // Add this attribute
        public virtual ICollection<DepartmentTransfer>? ToTransfers { get; set; }
    }
}