namespace WMS.Api.DTOs.Reports
{
    public class StockReportDto
    {
        public int ItemID { get; set; }
        public string ItemName { get; set; } = "";
        public string Model { get; set; } = "";
        public string Company { get; set; } = "";
        public string Category { get; set; } = "";
        public string Subcategory { get; set; } = "";
        public decimal OpeningStock { get; set; }
        public decimal PurchaseQty { get; set; }
        public decimal PurchaseReturnQty { get; set; }
        public decimal SaleQty { get; set; }
        public decimal SaleReturnQty { get; set; }
        public decimal CurrentStock { get; set; }
        public decimal? AvgRate { get; set; }
        public decimal? StockValue { get; set; }
    }
}