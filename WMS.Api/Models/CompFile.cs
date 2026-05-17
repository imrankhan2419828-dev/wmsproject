using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("CompFile")]
    public class CompFile
    {
        [Key]
        public int CompID { get; set; }
        public string? CompName { get; set; }
        public string? CompAddr { get; set; }
        public string? ContPrsn { get; set; }
        public string? PhonNumb { get; set; }
        public string? CellNumb { get; set; }
        public string? FaxnNumb { get; set; }
        public string? EmalAddr { get; set; }
        public bool? InActive { get; set; }
        public bool IsDeleted { get; set; }
        public int BranchID { get; set; }
        public int? AddBy { get; set; }
        public DateTime? AddOn { get; set; }
        public int? EditBy { get; set; }
        public DateTime? EditOn { get; set; }
        public int? DeleteBy { get; set; }
        public DateTime? DeleteOn { get; set; }
        public string? imp_makecode { get; set; }
    }
}
