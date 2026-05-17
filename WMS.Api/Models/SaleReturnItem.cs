using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("SaleReturnItem")]
    public class SaleReturnItem
    {
        [Key]
        public int ReturnDtlID { get; set; }

        public int ReturnTranNumb { get; set; }
        public int SaleTranNumb { get; set; }
        public int ItemID { get; set; }

        public decimal SoldQnty { get; set; }
        public decimal ReturnQnty { get; set; }

        public decimal Rate { get; set; }
        public decimal Amount { get; set; }
        public int? GodownID { get; set; }
        // 🔥 ADD THIS
        [ForeignKey(nameof(ReturnTranNumb))]
        public SaleReturnFile SaleReturnFile { get; set; }

        [ForeignKey(nameof(GodownID))]
        public virtual Godown? Godown { get; set; }
    }
}
