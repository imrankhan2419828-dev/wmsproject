using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("tblCOAAudit")]
    public class COAAudit
    {
        [Key]
        public long AuditID { get; set; }

        public int? acctID { get; set; }

        public int? BranchID { get; set; }

        [Required]
        [MaxLength(20)]
        public string Action { get; set; } = null!;

        [MaxLength(100)]
        public string? FieldName { get; set; }

        public string? OldValue { get; set; }

        public string? NewValue { get; set; }

        [Required]
        [MaxLength(50)]
        public string ChangedBy { get; set; } = null!;

        [Required]
        public DateTime ChangedOn { get; set; }

        [MaxLength(50)]
        public string? IPAddress { get; set; }

        [MaxLength(500)]
        public string? UserAgent { get; set; }
    }
}
