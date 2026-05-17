namespace WMS.Api.DTOs.Payments
{
    public class PaymentDetailCreateDto
    {
        public string PaymentMode { get; set; } = null!; // CASH | BANK | CHEQUE
        public decimal Amount { get; set; }

        public int? BankAccountID { get; set; }
        public string? ChequeNo { get; set; }
    }
}

