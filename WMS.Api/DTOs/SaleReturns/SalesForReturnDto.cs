namespace WMS.Api.DTOs.SaleReturns
{
    public class SalesForReturnDto
    {
        public int TranNumb { get; set; }
        public int? CustID { get; set; }
        public string? CustName { get; set; }
        public string? BillNumb { get; set; }

        public int TotlQnty { get; set; }
        public decimal TotlAmnt { get; set; }
    }
}

