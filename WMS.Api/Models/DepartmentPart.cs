using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("DepartmentParts")]
    public class DepartmentPart
    {
        [Key]
        public int DeptPartID { get; set; }

        [Required]
        public int DepartmentID { get; set; }

        [Required]
        public int ItemID { get; set; }

        public bool IsCommon { get; set; } = false;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? MinStockLevel { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? ModifiedDate { get; set; }

        // Navigation Properties
        [ForeignKey("DepartmentID")]
        public virtual Department? Department { get; set; }

        [ForeignKey("ItemID")]
        public virtual ItemFile? Item { get; set; }
    }
}