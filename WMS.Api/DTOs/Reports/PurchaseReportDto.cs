namespace WMS.Api.DTOs.Reports
{
    public class PurchaseReportDto
    {
        public int TranNumb { get; set; }
        public string BillNumb { get; set; } = "";
        public DateTime TranDate { get; set; }
        public string SupplierName { get; set; } = "";
        public string TranType { get; set; } = "";
        public decimal TotalAmount { get; set; }
        public decimal TotalQty { get; set; }
        public int ItemCount { get; set; }
        public List<PurchaseReportItemDto> Items { get; set; } = new();
    }

    public class PurchaseReportItemDto
    {
        public string ItemName { get; set; } = "";
        public string Model { get; set; } = "";
        public decimal Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Amount { get; set; }
    }
}
