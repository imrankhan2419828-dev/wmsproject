namespace WMS.Api.DTOs.PostdatedCheque
{
    public class PostdatedChequeUpdateDto
    {
        public string? Status { get; set; }
        public DateTime? DepositDate { get; set; }
        public DateTime? ClearDate { get; set; }
        public string? BounceReason { get; set; }
        public string? Remarks { get; set; }
    }
}
