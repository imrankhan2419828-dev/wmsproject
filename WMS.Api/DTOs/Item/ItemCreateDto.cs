//namespace WMS.Api.DTOs.Item
//{
//    public class ItemCreateDto
//    {
//        public string? ModlNumb { get; set; }
//        public string? ItemName { get; set; }
//        public int? CompID { get; set; }
//        public int? CatgID { get; set; }
//        public int? OpenQnty { get; set; }

//        public double? OpenRate { get; set; }
//        public double? PurcRate { get; set; }
//        public double? SaleRate { get; set; }
//        public bool? InActive { get; set; }
//    }
//}

using System.Collections.Generic;

namespace WMS.Api.DTOs.Item
{
    public class ItemCreateDto
    {
        public string? ModlNumb { get; set; }
        public string? ItemName { get; set; }
        public int? CompID { get; set; }
        public int? CatgID { get; set; }
        public int? SubcatID { get; set; }
        public bool? IsSparePart { get; set; }
        public int? OpenQnty { get; set; }
        public decimal? OpenRate { get; set; }
        public decimal? PurcRate { get; set; }
        public decimal? SaleRate { get; set; }
        public bool? InActive { get; set; }
        public string? BarCode { get; set; }
        public int? OrdrLevl { get; set; }
        public int? Max_Levl { get; set; }
        public List<ItemGodownOpeningCreateDto>? GodownOpenings { get; set; }
    }
}