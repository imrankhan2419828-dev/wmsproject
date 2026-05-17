namespace WMS.Api.DTOs.SaleReturns
{
    public class SaleReturnItemCreateDto
    {
        public int ItemID { get; set; }
        public string? ItemName { get; set; }
        public decimal SoldQnty { get; set; }
        public decimal ReturnQnty { get; set; }

        public decimal Rate { get; set; }

        public decimal CurrentStock { get; set; }
        public int? GodownID { get; set; }
    }
}
