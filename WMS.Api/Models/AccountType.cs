using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("tblAccountTypes")]
    public class AccountTypeModel  // ✅ RENAMED from AccountType to AccountTypeModel
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TypeID { get; set; }

        [Required]
        [MaxLength(20)]
        public string TypeCode { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string TypeName { get; set; } = null!;

        [Required]
        [MaxLength(6)]
        public string NormalSide { get; set; } = null!;

        [Required]
        [MaxLength(20)]
        public string ReportType { get; set; } = null!;

        public int DisplayOrder { get; set; }

        public bool IsActive { get; set; } = true;

        public bool CanHaveChildren { get; set; } = true;

        public int MinLevel { get; set; }

        public int MaxLevel { get; set; } = 5;

        [MaxLength(50)]
        public string? DefaultParentCode { get; set; }

        [MaxLength(50)]
        public string? AddBy { get; set; }

        public DateTime? AddOn { get; set; }

        [MaxLength(50)]
        public string? EditBy { get; set; }

        public DateTime? EditOn { get; set; }
    }
}