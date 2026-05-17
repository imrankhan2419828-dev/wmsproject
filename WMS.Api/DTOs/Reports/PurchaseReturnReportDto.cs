namespace WMS.Api.DTOs.Reports
{
    public class PurchaseReturnReportDto
    {
        public int ReturnID { get; set; }
        public string BillNumb { get; set; } = "";
        public DateTime TranDate { get; set; }
        public string SupplierName { get; set; } = "";
        public decimal TotalAmount { get; set; }
        public decimal TotalQty { get; set; }
        public int ItemCount { get; set; }
        public List<PurchaseReturnReportItemDto> Items { get; set; } = new();
    }

    public class PurchaseReturnReportItemDto
    {
        public string ItemName { get; set; } = "";
        public string Model { get; set; } = "";
        public decimal Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Amount { get; set; }
    }
}
