using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("WarrantyAttachments")]
    public class WarrantyAttachment
    {
        [Key]
        public int AttachmentID { get; set; }

        [Required]
        public int ClaimID { get; set; }

        [Required]
        [StringLength(200)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string FilePath { get; set; } = string.Empty;

        public int? FileSize { get; set; }

        [StringLength(50)]
        public string? FileType { get; set; }

        public int? UploadedBy { get; set; }
        public DateTime UploadedDate { get; set; } = DateTime.Now;

        [StringLength(500)]
        public string? Description { get; set; }

        // Navigation Property
        [ForeignKey("ClaimID")]
        public virtual WarrantyClaim? Claim { get; set; }
    }
}