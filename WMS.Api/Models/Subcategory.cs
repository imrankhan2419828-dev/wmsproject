// File: WMS.Api/Models/Subcategory.cs

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("Subcategory")]
    public class Subcategory
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SubcatID { get; set; }

        [Required]
        [MaxLength(150)]
        public string? SubcatName { get; set; }

        [Required]
        public int CatgID { get; set; }

        //[Required]
        //public int CompanyID { get; set; }
        // Add this property in Subcategory class
        public bool IsSparepart { get; set; } = false;
        [Required]
        public int BranchID { get; set; }

        public bool InActive { get; set; } = false;

        public int? AddBy { get; set; }
        public DateTime? AddOn { get; set; }
        public int? EditBy { get; set; }
        public DateTime? EditOn { get; set; }

        // ✅ Navigation Properties - Using correct model names
        [ForeignKey("CatgID")]
        public virtual CatgFile? Category { get; set; }

        //[ForeignKey("CompanyID")]
        //public virtual CompFile? Company { get; set; }
    }
}