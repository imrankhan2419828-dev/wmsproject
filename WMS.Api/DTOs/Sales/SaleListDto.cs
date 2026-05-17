using System;
using System.Collections.Generic;

namespace WMS.Api.DTOs.Sales
{
    public class SaleListDto
    {
        public int TranNumb { get; set; }
        public DateTime? TranDate { get; set; }
        public string? BillNumb { get; set; }
        public string? TranMode { get; set; }
        public string? CustName { get; set; }
        public string? WalkingCustomer { get; set; }
        public int? TotlQnty { get; set; }
        public decimal TotlAmnt { get; set; }

        // ✅ ADD THESE PROPERTIES
        public int ItemCount { get; set; }
        public double TotalQuantity { get; set; }
        public List<SaleItemSummaryDto>? Items { get; set; }
    }

    public class SaleItemSummaryDto
    {
        public int ItemID { get; set; }
        public string? ItemName { get; set; }
        public string? ModlNumb { get; set; }
        public double Quantity { get; set; }
        public double Rate { get; set; }
        public double Amount { get; set; }
        public int? GodownID { get; set; }
        public string? GodownName { get; set; }
    }
}