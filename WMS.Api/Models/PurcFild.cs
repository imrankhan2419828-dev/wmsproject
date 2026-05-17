using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("PurcFild")]
    public class PurcFild
    {
        [Key]
        public int PurcFildID { get; set; }

        public int TranNumb { get; set; }
        public int ItemID { get; set; }

        public double PurcQnty { get; set; } = 0;
        public double PurcRate { get; set; } = 0;
        public double PurcAmnt { get; set; } = 0;
        public int? GodnID { get; set; }

        // Navigation property
        [ForeignKey("ItemID")]
        public virtual ItemFile? Item { get; set; }
    }
}