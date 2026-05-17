//using System;
//using System.ComponentModel.DataAnnotations;
//using System.ComponentModel.DataAnnotations.Schema;

//namespace WMS.Api.Models
//{
//    [Table("ItemPriceHistory")]
//    public class ItemPriceHistory
//    {
//        [Key]
//        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
//        public int Id { get; set; }

//        public int ItemID { get; set; }
//        public decimal Price { get; set; }
//        public DateTime EffectiveDate { get; set; }
//        public int? AddBy { get; set; }
//        public DateTime? AddOn { get; set; }

//        [ForeignKey("ItemID")]
//        public virtual ItemFile? Item { get; set; }
//    }
//}

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("ItemPriceHistory")]
    public class ItemPriceHistory
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int ItemID { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public DateTime EffectiveDate { get; set; }

        public DateTime? EffectiveTo { get; set; }

        [StringLength(20)]
        public string PriceType { get; set; } = "PURCHASE"; // OPENING, PURCHASE, SALE

        public bool IsActive { get; set; }

        [StringLength(200)]
        public string? ChangeReason { get; set; }

        public int? AddBy { get; set; }
        public DateTime? AddOn { get; set; }

        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedOn { get; set; }

        public bool IsDeleted { get; set; }

        [ForeignKey("ItemID")]
        public virtual ItemFile? Item { get; set; }
    }
}