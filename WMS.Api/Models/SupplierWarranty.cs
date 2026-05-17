using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("SupplierWarranties")]
    public class SupplierWarranty
    {
        [Key]
        public int SupplierWarrantyID { get; set; }

        [Required]
        public int SupplierID { get; set; }

        [Required]
        public int ItemID { get; set; }

        [Required]
        public int WarrantyPeriod { get; set; } // Days

        [StringLength(50)]
        public string WarrantyType { get; set; } = "STANDARD"; // STANDARD, EXTENDED, FULL

        public string? Terms { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? ModifiedDate { get; set; }

        // Navigation Properties
        [ForeignKey("SupplierID")]
        public virtual COA? Supplier { get; set; }

        [ForeignKey("ItemID")]
        public virtual ItemFile? Item { get; set; }
    }
}