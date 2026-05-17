namespace WMS.Api.DTOs.Reports
{
    public class CustomerStatementDto
    {
        public int CustomerId { get; set; }
        public string CustomerCode { get; set; } = "";
        public string CustomerName { get; set; } = "";
        public decimal OpeningBalance { get; set; }
        public string OpeningBalanceType { get; set; } = "Dr";
        public decimal ClosingBalance { get; set; }
        public string ClosingBalanceType { get; set; } = "Dr";
        public decimal TotalDebit { get; set; }
        public decimal TotalCredit { get; set; }
        public List<CustomerStatementLineDto> Transactions { get; set; } = new();
    }

    public class CustomerStatementLineDto
    {
        public DateTime Date { get; set; }
        public string VoucherNo { get; set; } = "";
        public string Type { get; set; } = ""; // SALE, SALE_RETURN, RECEIVING
        public string ItemName { get; set; } = "";
        public string Model { get; set; } = "";
        public decimal Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
        public decimal Balance { get; set; }
    }
}
