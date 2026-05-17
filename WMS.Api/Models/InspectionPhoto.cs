using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("InspectionPhotos")]
    public class InspectionPhoto
    {
        [Key]
        public int PhotoID { get; set; }

        [Required]
        public int InspectionID { get; set; }

        public int? ResultID { get; set; }

        [StringLength(20)]
        public string PhotoType { get; set; } = "INSPECTION"; // BEFORE, AFTER, DAMAGE, GENERAL

        [Required]
        [StringLength(500)]
        public string PhotoPath { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        public int? UploadedBy { get; set; }
        public DateTime UploadedDate { get; set; } = DateTime.Now;

        // Navigation Properties
        [ForeignKey("InspectionID")]
        public virtual JobInspection? Inspection { get; set; }

        [ForeignKey("ResultID")]
        public virtual InspectionResult? Result { get; set; }
    }
}