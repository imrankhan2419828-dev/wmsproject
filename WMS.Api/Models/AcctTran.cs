using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("AcctTran")]
    public class AcctTran
    {
        [Key]
        public int AcctTranID { get; set; }

        public DateTime? TranDate { get; set; }
        public string? VochType { get; set; }     // OB
        public string? TypeAbbr { get; set; }     // OB
        public int? VochNumb { get; set; }

        public string? ScrnFile { get; set; }
        public int? ScrnTran { get; set; }
        public string? TranDesc { get; set; }

        public int? BranchID { get; set; }
        public bool? IsDeleted { get; set; }

        public DateTime? AddOn { get; set; }
        public int? AddBy { get; set; }
    }
}
