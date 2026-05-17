// File: WMS.Api/DTOs/Sales/SaleItemCreateDto.cs

using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.Sales
{
    public class SaleItemCreateDto
    {
        [Required]
        public int ItemID { get; set; }

        [Required]
        //public double SaleQnty { get; set; }
        public decimal SaleQnty { get; set; }

        [Required]
        //public double SaleRate { get; set; }
        public decimal SaleRate { get; set; }
        public string? ItemRmks { get; set; }
        public int? GodownID { get; set; }
        //public double SaleAmnt => SaleQnty * SaleRate;
        public decimal SaleAmnt => SaleQnty * SaleRate;
    }
}

