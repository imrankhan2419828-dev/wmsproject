// File: WMS.Api/DTOs/Subcategory/SubcategoryCreateDto.cs

using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.Subcategory
{
    public class SubcategoryCreateDto
    {
        public int SubcatID { get; set; }

        [Required(ErrorMessage = "Subcategory name is required")]
        public string SubcatName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Category is required")]
        public int CatgID { get; set; }

        //[Required(ErrorMessage = "Company is required")]
        //public int CompanyID { get; set; }
        public bool IsSparepart { get; set; }
        public bool InActive { get; set; }
    }
}