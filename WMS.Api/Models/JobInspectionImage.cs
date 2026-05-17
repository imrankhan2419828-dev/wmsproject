using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("JobInspectionImages")]
    public class JobInspectionImage
    {
        [Key]
        public int ImageID { get; set; }

        [Required]
        public int JobCardID { get; set; }

        [StringLength(20)]
        public string? ImageType { get; set; }  // BEFORE, AFTER, ISSUE

        [Required]
        [StringLength(500)]
        public string ImagePath { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        public int? UploadedBy { get; set; }
        public DateTime UploadedDate { get; set; } = DateTime.Now;

        // Navigation Properties
        [ForeignKey("JobCardID")]
        public virtual JobCard? JobCard { get; set; }
    }
}