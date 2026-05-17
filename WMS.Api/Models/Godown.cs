using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("Godown")]
    public class Godown
    {
        [Key]
        public int GodnID { get; set; }

        [MaxLength(100)]
        public string? GodnName { get; set; }

        public int? BranchID { get; set; }
        public bool? InActive { get; set; }
        public int? AddBy { get; set; }
        public DateTime? AddOn { get; set; }
    }
}
