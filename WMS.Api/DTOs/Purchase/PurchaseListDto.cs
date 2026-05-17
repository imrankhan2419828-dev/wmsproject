// File: WMS.Api/DTOs/Purchase/PurchaseListDto.cs

using System;
using System.Collections.Generic;

namespace WMS.Api.DTOs.Purchase
{
    public class PurchaseListDto
    {
        public int TranNumb { get; set; }
        public string BillNumb { get; set; }
        public DateTime? TranDate { get; set; }
        public double? NetAmnt { get; set; }
        public string SupplierName { get; set; }
        public string BranchName { get; set; }
        public string TranType { get; set; } = "Credit";

        // 🔥 ADD THESE - Items and quantities for display
        public int ItemCount { get; set; }
        public double TotalQuantity { get; set; }
        public List<PurchaseItemSummaryDto> Items { get; set; } = new();
    }

    public class PurchaseItemSummaryDto
    {
        public int ItemID { get; set; }
        public string ItemName { get; set; }
        public double Quantity { get; set; }
        public double Rate { get; set; }
        public double Amount { get; set; }
    }
}