namespace WMS.Api.DTOs.PostdatedCheque
{
    public class PostdatedChequeListDto
    {
        public int Id { get; set; }
        public string ChequeNumber { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public DateTime ChequeDate { get; set; }
        public decimal Amount { get; set; }
        public string SourceType { get; set; } = string.Empty;
        public string SourceName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? DepositDate { get; set; }
        public DateTime? ClearDate { get; set; }
        public int DaysRemaining { get; set; }
    }
}
