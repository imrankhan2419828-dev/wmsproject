//using System;
//using System.Collections.Generic;

//namespace WMS.Api.DTOs.Item
//{
//    // Existing DTOs...

//    public class PriceHistoryDto
//    {
//        public int Id { get; set; }
//        public int ItemID { get; set; }
//        public decimal Price { get; set; }
//        public string PriceType { get; set; } = string.Empty;
//        public DateTime EffectiveDate { get; set; }
//        public string FormattedDate { get; set; } = string.Empty;
//        public bool IsActive { get; set; }
//        public string? ChangeReason { get; set; }
//        public int? AddBy { get; set; }
//        public string? AddedByName { get; set; }
//        public DateTime? AddOn { get; set; }
//    }

//    public class AddPriceHistoryDto
//    {
//        public int ItemID { get; set; }
//        public decimal Price { get; set; }
//        public string PriceType { get; set; } = "PURCHASE"; // OPENING, PURCHASE, SALE
//        public DateTime? EffectiveDate { get; set; } // Null = Current Date
//        public string? ChangeReason { get; set; }
//        public bool ActivateImmediately { get; set; } = true;
//    }

//    public class UpdatePriceHistoryDto
//    {
//        public int Id { get; set; }
//        public decimal Price { get; set; }
//        public string? ChangeReason { get; set; }
//    }

//    public class ActivatePriceDto
//    {
//        public int PriceId { get; set; }
//        public string PriceType { get; set; } = string.Empty;
//    }

//    public class ItemPricesResponseDto
//    {
//        public List<PriceHistoryDto> OpeningPrices { get; set; } = new();
//        public List<PriceHistoryDto> PurchasePrices { get; set; } = new();
//        public List<PriceHistoryDto> SalePrices { get; set; } = new();

//        public PriceHistoryDto? ActivePurchasePrice { get; set; }
//        public PriceHistoryDto? ActiveSalePrice { get; set; }
//        public PriceHistoryDto? ActiveOpeningPrice { get; set; }
//    }
//}