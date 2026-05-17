namespace WMS.Api.DTOs.PostdatedCheque
{
    public class ChequeLogDto
    {
        public int Id { get; set; }
        public string? OldStatus { get; set; }
        public string NewStatus { get; set; } = string.Empty;
        public int ChangedBy { get; set; }
        public DateTime ChangedOn { get; set; }
        public string? Remarks { get; set; }
    }
}
