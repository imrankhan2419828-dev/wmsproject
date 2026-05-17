using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("JobParts")]
    public class JobPart
    {
        [Key]
        public int JobPartID { get; set; }

        [Required]
        public int JobCardID { get; set; }

        [Required]
        public int ItemID { get; set; }

        [Required]
        [StringLength(200)]
        public string ItemName { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal DiscountPercent { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [StringLength(20)]
        public string? StockSource { get; set; }  // STOCK, PURCHASE

        public int? PurchaseRequestID { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }

        public int? GodownID { get; set; }

        // Navigation Properties
        [ForeignKey("JobCardID")]
        public virtual JobCard? JobCard { get; set; }

        [ForeignKey("ItemID")]
        public virtual ItemFile? Item { get; set; }
    }
}