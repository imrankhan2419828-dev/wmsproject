using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("ItemFile")]
    public class ItemFile
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ItemID { get; set; }

        public string? ModlNumb { get; set; }
        public string? ItemName { get; set; }

        public int? CompID { get; set; }
        public int? CatgID { get; set; }
        public int? SubcatID { get; set; }           // ✅ NEW - Subcategory

        public int? BranchID { get; set; }            // ✅ NEW - Branch specific
        public bool? IsSparePart { get; set; }        // ✅ NEW - Spare parts flag

        public int? GodnID { get; set; }
        public string? ItemSize { get; set; }
        public int? PLstID { get; set; }
        public int? OpenQnty { get; set; }
        //public double? OpenRate { get; set; }
        public decimal? OpenRate { get; set; }
        public string? BarCode { get; set; }
        public bool? InActive { get; set; }
        public bool IsDeleted { get; set; }

        public int? AddBy { get; set; }
        public DateTime? AddOn { get; set; }
        public int? EditBy { get; set; }
        public DateTime? EditOn { get; set; }
        public int? DeleteBy { get; set; }
        public DateTime? DeleteOn { get; set; }

        public string? ItemSeri { get; set; }
        public bool? CashList { get; set; }
        //public double? PurcRate { get; set; }
        public decimal? PurcRate { get; set; }
        public int? ItemLoctID { get; set; }
        public double? ItemCoup { get; set; }
        public bool? AlowRateChng { get; set; }
        public bool? SerlItem { get; set; }
        public bool? EditableDesc { get; set; }
        public int? OrdrLevl { get; set; }
        public int? Max_Levl { get; set; }
        public string? ItemType { get; set; }
        public bool? RawItem { get; set; }
        //public double? SaleRate { get; set; }
        public decimal? SaleRate { get; set; }
        // Navigation properties
        [ForeignKey("SubcatID")]
        public virtual Subcategory? Subcategory { get; set; }

        [ForeignKey("CompID")]
        public virtual CompFile? Company { get; set; }

        [ForeignKey("CatgID")]
        public virtual CatgFile? Category { get; set; }
    }
}