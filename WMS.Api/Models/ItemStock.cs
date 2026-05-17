using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("ItemStock")]
    public class ItemStock
    {
        [Key]
        public int StockID { get; set; }

        public string TranType { get; set; }   // PURCHASE
        public int TranNumb { get; set; }
        public int ItemID { get; set; }
        public int BranchID { get; set; }

        public double InQty { get; set; }
        public double OutQty { get; set; }
        public double Rate { get; set; }

        public DateTime TranDate { get; set; }
        public string Remarks { get; set; }

        //public DateTime? ModifiedDate { get; set; }
    }
}

