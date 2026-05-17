namespace WMS.Api.DTOs.Subcategory
{
    public class SubcategoryListDto
    {
        public int SubcatID { get; set; }
        public string? SubcatName { get; set; }
        public int CatgID { get; set; }
        public string? CatgName { get; set; }
        public bool IsSparepart { get; set; }
        public bool InActive { get; set; }
    }
}