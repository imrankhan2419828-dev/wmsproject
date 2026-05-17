using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("ItemImages")]
    public class ItemImages
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ImageID { get; set; }

        public int ItemID { get; set; }
        [MaxLength] // Remove length restriction
        public string? ImageURL { get; set; }  // NVARCHAR(MAX) ho jayega
        public bool IsPrimary { get; set; }
        public DateTime? AddOn { get; set; }

        [ForeignKey("ItemID")]
        public virtual ItemFile? Item { get; set; }
    }
}