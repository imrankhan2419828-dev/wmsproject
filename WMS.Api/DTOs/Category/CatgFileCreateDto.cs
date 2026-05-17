namespace WMS.Api.DTOs.Category
{
    public class CatgFileCreateDto
    {
        public string? CatgName { get; set; }
        public bool? InActive { get; set; }
        public bool? ExclComm { get; set; }
        public float? RetailDiff { get; set; }
        public string? PCTCode { get; set; }
        public int? AddBy { get; set; }
    }
}
