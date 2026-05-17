namespace WMS.Api.DTOs.PostdatedCheque
{
    public class PostdatedChequeReadDto
    {
        public int Id { get; set; }
        public string ChequeNumber { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public DateTime ChequeDate { get; set; }
        public decimal Amount { get; set; }
        public string SourceType { get; set; } = string.Empty;
        public int SourceId { get; set; }
        public string SourceName { get; set; } = string.Empty;
        public string? ReferenceType { get; set; }
        public int? ReferenceId { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? DepositDate { get; set; }
        public DateTime? ClearDate { get; set; }
        public DateTime? BounceDate { get; set; }
        public string? BounceReason { get; set; }
        public int BranchId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public List<ChequeLogDto> Logs { get; set; } = new();
    }
}
