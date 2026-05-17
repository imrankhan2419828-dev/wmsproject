//namespace WMS.Api.DTOs.Item
//{
//    public class ItemDto
//    {
//        public int ItemID { get; set; }
//        public string? ItemName { get; set; }
//        public string? ModlNumb { get; set; }
//        public string? CompanyName { get; set; }
//        public string? CategoryName { get; set; }
//        public string? SubcategoryName { get; set; }     // ✅ NEW
//        public int? SubcatID { get; set; }                // ✅ NEW
//        public bool? IsSparePart { get; set; }            // ✅ NEW

//        public decimal? PurcRate { get; set; }
//        public decimal? SaleRate { get; set; }
//        public int? OpenQnty { get; set; }

//        public decimal? OpenRate { get; set; }
//        public bool? InActive { get; set; }
//    }
//}

using System;
using System.Collections.Generic;

namespace WMS.Api.DTOs.Item
{
    // ========== MAIN ITEM DTO ==========
    public class ItemDto
    {
        public int ItemID { get; set; }
        public string? ItemName { get; set; }
        public string? ModlNumb { get; set; }
        public string? CompanyName { get; set; }
        public int? CompID { get; set; }
        public string? CategoryName { get; set; }
        public int? CatgID { get; set; }
        public string? SubcategoryName { get; set; }
        public int? SubcatID { get; set; }
        public bool? IsSparePart { get; set; }
        public decimal? PurcRate { get; set; }
        public decimal? SaleRate { get; set; }
        public int? OpenQnty { get; set; }
        public decimal? OpenRate { get; set; }
        public bool? InActive { get; set; }
        public string? BarCode { get; set; }
        public int? OrdrLevl { get; set; }
        public int? Max_Levl { get; set; }
        public List<ItemPriceHistoryDto>? PriceHistory { get; set; }
        public List<ItemImagesDto>? Images { get; set; }
        public List<ItemGodownOpeningDto>? GodownOpenings { get; set; }
    }

    // ========== OLD PRICE HISTORY DTO (Backward Compatibility) ==========
    public class ItemPriceHistoryDto
    {
        public int Id { get; set; }
        public int ItemID { get; set; }
        public decimal Price { get; set; }
        public DateTime EffectiveDate { get; set; }
        public string? FormattedDate { get; set; }
        public string? PriceType { get; set; }
        public bool IsActive { get; set; }
        public string? ChangeReason { get; set; }
        public int? AddBy { get; set; }
        public DateTime? AddOn { get; set; }
    }

    public class ItemPriceHistoryCreateDto
    {
        public int ItemID { get; set; }
        public decimal Price { get; set; }
        public DateTime EffectiveDate { get; set; }
        public string? PriceType { get; set; }
        public string? ChangeReason { get; set; }
        public bool ActivateImmediately { get; set; } = true;
    }

    // ========== NEW ENHANCED PRICE DTOs ==========
    public class PriceHistoryDto
    {
        public int Id { get; set; }
        public int ItemID { get; set; }
        public decimal Price { get; set; }
        public string PriceType { get; set; } = string.Empty;
        public DateTime EffectiveDate { get; set; }
        public string FormattedDate { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string? ChangeReason { get; set; }
        public int? AddBy { get; set; }
        public string? AddedByName { get; set; }
        public DateTime? AddOn { get; set; }
    }

    public class AddPriceHistoryDto
    {
        public int ItemID { get; set; }
        public decimal Price { get; set; }
        public string PriceType { get; set; } = "PURCHASE"; // OPENING, PURCHASE, SALE
        public DateTime? EffectiveDate { get; set; } // Null = Current Date
        public string? ChangeReason { get; set; }
        public bool ActivateImmediately { get; set; } = true;
    }

    public class UpdatePriceHistoryDto
    {
        public int Id { get; set; }
        public decimal Price { get; set; }
        public string? ChangeReason { get; set; }
    }

    public class ActivatePriceDto
    {
        public int PriceId { get; set; }
        public string PriceType { get; set; } = string.Empty;
    }

    public class ItemPricesResponseDto
    {
        public List<PriceHistoryDto> OpeningPrices { get; set; } = new();
        public List<PriceHistoryDto> PurchasePrices { get; set; } = new();
        public List<PriceHistoryDto> SalePrices { get; set; } = new();

        public PriceHistoryDto? ActiveOpeningPrice { get; set; }
        public PriceHistoryDto? ActivePurchasePrice { get; set; }
        public PriceHistoryDto? ActiveSalePrice { get; set; }
    }

    // ========== IMAGES DTOs ==========
    public class ItemImagesDto
    {
        public int ImageID { get; set; }
        public int ItemID { get; set; }
        public string? ImageURL { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class ItemImagesCreateDto
    {
        public int ItemID { get; set; }
        public string? ImageURL { get; set; }
        public bool IsPrimary { get; set; }
    }

    // ========== GODOWN OPENING DTOs ==========
    public class ItemGodownOpeningDto
    {
        public int Id { get; set; }
        public int ItemID { get; set; }
        public int GodownID { get; set; }
        public string? GodownName { get; set; }
        public decimal OpeningQty { get; set; }
    }

    public class ItemGodownOpeningCreateDto
    {
        public int ItemID { get; set; }
        public int GodownID { get; set; }
        public decimal OpeningQty { get; set; }
    }

    public class ItemGodownOpeningBulkDto
    {
        public int ItemID { get; set; }
        public List<ItemGodownOpeningCreateDto> Openings { get; set; } = new();
    }
}