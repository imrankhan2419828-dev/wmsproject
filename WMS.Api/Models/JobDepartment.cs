using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("JobDepartments")]
    public class JobDepartment
    {
        [Key]
        public int JobDepartmentID { get; set; }

        [Required]
        public int JobCardID { get; set; }

        [Required]
        public int DepartmentID { get; set; }

        public DateTime AssignedDate { get; set; } = DateTime.Now;
        public DateTime? CompletedDate { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "ACTIVE"; // ACTIVE, COMPLETED

        [StringLength(500)]
        public string? Notes { get; set; }

        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }

        // Navigation Properties
        [ForeignKey("JobCardID")]
        public virtual JobCard? JobCard { get; set; }

        [ForeignKey("DepartmentID")]
        public virtual Department? Department { get; set; }
    }
}