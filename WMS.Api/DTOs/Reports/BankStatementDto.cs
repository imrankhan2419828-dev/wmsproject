namespace WMS.Api.DTOs.Reports
{
    public class BankStatementDto
    {
        public int AccountId { get; set; }
        public string AccountCode { get; set; } = "";
        public string AccountName { get; set; } = "";
        public decimal OpeningBalance { get; set; }
        public string OpeningBalanceType { get; set; } = "Dr";
        public decimal ClosingBalance { get; set; }
        public string ClosingBalanceType { get; set; } = "Dr";
        public List<BankStatementLineDto> Transactions { get; set; } = new();
    }

    public class BankStatementLineDto
    {
        public DateTime Date { get; set; }
        public string VoucherNo { get; set; } = "";
        public string Description { get; set; } = "";
        public string Type { get; set; } = ""; // RECEIVING, PAYMENT
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
        public decimal Balance { get; set; }
    }
}
