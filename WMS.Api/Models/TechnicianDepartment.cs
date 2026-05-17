using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("TechnicianDepartments")]
    public class TechnicianDepartment
    {
        [Key]
        public int TechDeptID { get; set; }

        [Required]
        public int TechnicianID { get; set; }

        [Required]
        public int DepartmentID { get; set; }

        public bool IsPrimary { get; set; } = false;
        public DateTime AssignedDate { get; set; } = DateTime.Now;
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; } = true;

        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }

        // Navigation Properties
        [ForeignKey("TechnicianID")]
        public virtual Technician? Technician { get; set; }

        [ForeignKey("DepartmentID")]
        public virtual Department? Department { get; set; }
    }
}