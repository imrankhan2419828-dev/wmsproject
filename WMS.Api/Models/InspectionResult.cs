using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("InspectionResults")]
    public class InspectionResult
    {
        [Key]
        public int ResultID { get; set; }

        [Required]
        public int InspectionID { get; set; }

        [Required]
        public int ItemID { get; set; }

        [StringLength(500)]
        public string? ObservedValue { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? NumericValue { get; set; }

        public bool? IsPass { get; set; } // NULL = PENDING, 1 = PASS, 0 = FAIL

        [StringLength(500)]
        public string? Remarks { get; set; }

        [StringLength(500)]
        public string? ImagePath { get; set; }

        public int? CheckedBy { get; set; }
        public DateTime? CheckedDate { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        // Navigation Properties
        [ForeignKey("InspectionID")]
        public virtual JobInspection? Inspection { get; set; }

        [ForeignKey("ItemID")]
        public virtual InspectionItem? Item { get; set; }
    }
}