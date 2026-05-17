namespace WMS.Api.DTOs.Reports
{
    public class SupplierStatementDto
    {
        public int SupplierId { get; set; }
        public string SupplierCode { get; set; } = "";
        public string SupplierName { get; set; } = "";
        public decimal OpeningBalance { get; set; }
        public string OpeningBalanceType { get; set; } = "Cr";
        public decimal ClosingBalance { get; set; }
        public string ClosingBalanceType { get; set; } = "Cr";
        public decimal TotalDebit { get; set; }
        public decimal TotalCredit { get; set; }
        public List<SupplierStatementLineDto> Transactions { get; set; } = new();
    }

    public class SupplierStatementLineDto
    {
        public DateTime Date { get; set; }
        public string VoucherNo { get; set; } = "";
        public string Type { get; set; } = ""; // PURCHASE, PURCHASE_RETURN, PAYMENT
        public string ItemName { get; set; } = "";
        public string Model { get; set; } = "";
        public decimal Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
        public decimal Balance { get; set; }
    }
}
