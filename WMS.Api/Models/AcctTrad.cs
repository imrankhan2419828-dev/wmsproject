using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("AcctTrad")]
    public class AcctTrad
    {
        [Key]
        public int AcctTradID { get; set; }

        public int? AcctTranID { get; set; }
        public DateTime? TranDate { get; set; }

        public string? TranNatr { get; set; }   // DR / CR
        public int? AcctID { get; set; }        // FK → tblCOA.acctID
        public string? AcctCode { get; set; }

        public double? DebtAmnt { get; set; }
        public double? CrdtAmnt { get; set; }

        public bool? IsDeleted { get; set; }
        public string? Remarks { get; set; }
    }
}
