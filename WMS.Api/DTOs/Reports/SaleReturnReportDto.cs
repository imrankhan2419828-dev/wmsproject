namespace WMS.Api.DTOs.Reports
{
    public class SaleReturnReportDto
    {
        public int ReturnTranNumb { get; set; }
        public string BillNumb { get; set; } = "";
        public DateTime TranDate { get; set; }
        public string CustomerName { get; set; } = "";
        public decimal TotalAmount { get; set; }
        public decimal TotalQty { get; set; }
        public int ItemCount { get; set; }
        public List<SaleReturnReportItemDto> Items { get; set; } = new();
    }

    public class SaleReturnReportItemDto
    {
        public string ItemName { get; set; } = "";
        public string Model { get; set; } = "";
        public decimal Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Amount { get; set; }
    }
}
