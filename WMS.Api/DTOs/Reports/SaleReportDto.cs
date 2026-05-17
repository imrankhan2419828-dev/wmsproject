namespace WMS.Api.DTOs.Reports
{
    public class SaleReportDto
    {
        public int TranNumb { get; set; }
        public string BillNumb { get; set; } = "";
        public DateTime TranDate { get; set; }
        public string CustomerName { get; set; } = "";
        public string TranType { get; set; } = "";
        public decimal TotalAmount { get; set; }
        public decimal TotalQty { get; set; }
        public int ItemCount { get; set; }
        public List<SaleReportItemDto> Items { get; set; } = new();
    }

    public class SaleReportItemDto
    {
        public string ItemName { get; set; } = "";
        public string Model { get; set; } = "";
        public decimal Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Amount { get; set; }
    }
}
