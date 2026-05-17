using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("DepartmentServices")]
    public class DepartmentService
    {
        [Key]
        public int DeptServiceID { get; set; }

        [Required]
        public int DepartmentID { get; set; }

        [Required]
        public int ServiceID { get; set; }

        public bool IsAvailable { get; set; } = true;
        public int? EstimatedTime { get; set; } // Minutes

        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? ModifiedDate { get; set; }

        // Navigation Properties
        [ForeignKey("DepartmentID")]
        public virtual Department? Department { get; set; }

        [ForeignKey("ServiceID")]
        public virtual ServiceCatalog? Service { get; set; }
    }
}