using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("tblCOALength")]
    public class COALength
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public int BranchID { get; set; }

        public int LevelNo { get; set; }

        public int CodeLength { get; set; }

        public bool IsActive { get; set; } = true;

        [MaxLength(50)]
        public string? AddBy { get; set; }

        public DateTime? AddOn { get; set; }

        [MaxLength(50)]
        public string? EditBy { get; set; }

        public DateTime? EditOn { get; set; }
    }
}
