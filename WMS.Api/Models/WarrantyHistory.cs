using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("WarrantyHistory")]
    public class WarrantyHistory
    {
        [Key]
        public int HistoryID { get; set; }

        [Required]
        public int ClaimID { get; set; }

        [StringLength(20)]
        public string? StatusFrom { get; set; }

        [Required]
        [StringLength(20)]
        public string StatusTo { get; set; } = string.Empty;

        public int? ChangedBy { get; set; }
        public DateTime ChangedDate { get; set; } = DateTime.Now;

        [StringLength(500)]
        public string? Notes { get; set; }

        // Navigation Property
        [ForeignKey("ClaimID")]
        public virtual WarrantyClaim? Claim { get; set; }
    }
}
