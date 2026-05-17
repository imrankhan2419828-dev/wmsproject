using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("CatgFile")]
    public class CatgFile
    {
        [Key]
        public int CatgID { get; set; }
        public string? CatgName { get; set; }
        public bool? InActive { get; set; }
        public bool? ExclComm { get; set; }
        public bool IsDeleted { get; set; }
        public int BranchID { get; set; }

        public int? AddBy { get; set; }
        public DateTime? AddOn { get; set; }
        public int? EditBy { get; set; }
        public DateTime? EditOn { get; set; }
        public int? DeleteBy { get; set; }
        public DateTime? DeleteOn { get; set; }
        public float? RetailDiff { get; set; }
        public string? imp_catgcode { get; set; }
        public string? PCTCode { get; set; }
    }
}

