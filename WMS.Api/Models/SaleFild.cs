// File: WMS.Api/Models/SaleFild.cs

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("SaleFild")]
    public class SaleFild
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SaleDtlID { get; set; }

        public int? TranNumb { get; set; }
        public DateTime? TranDate { get; set; }

        public int? ItemID { get; set; }

        public decimal? SaleQnty { get; set; }
        public decimal? SaleRate { get; set; }
        public decimal? SaleAmnt { get; set; }
        public int? GodnID { get; set; }
        public string? ItemRmks { get; set; }

        // Navigation property
        [ForeignKey("TranNumb")]
        public virtual SaleFile? SaleFile { get; set; }

        [ForeignKey("ItemID")]
        public virtual ItemFile? Item { get; set; }
    }
}




