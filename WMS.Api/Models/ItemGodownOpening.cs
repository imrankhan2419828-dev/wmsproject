using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("ItemGodownOpening")]
    public class ItemGodownOpening
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int ItemID { get; set; }
        public int GodownID { get; set; }
        public decimal OpeningQty { get; set; }
        public DateTime? AddOn { get; set; }

        [ForeignKey("ItemID")]
        public virtual ItemFile? Item { get; set; }

        [ForeignKey("GodownID")]
        public virtual Godown? Godown { get; set; }
    }
}
