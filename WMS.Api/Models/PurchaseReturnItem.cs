using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("PurchaseReturnItems")]
    public class PurchaseReturnItem
    {
        [Key]
        public int ReturnItemID { get; set; }

        public int ReturnID { get; set; }

        public int ItemID { get; set; }

       
        public decimal PurcRate { get; set; }
        public decimal PurchasedQty { get; set; }
        public decimal ReturnQty { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public decimal PurcAmnt { get; set; }
        public int? GodownID { get; set; }


        [ForeignKey("ReturnID")]
        public virtual PurchaseReturn PurchaseReturn { get; set; }

        [ForeignKey("GodownID")]
        public virtual Godown? Godown { get; set; }
    }
}
