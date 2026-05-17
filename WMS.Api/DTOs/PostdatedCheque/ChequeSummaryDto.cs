namespace WMS.Api.DTOs.PostdatedCheque
{
    public class ChequeSummaryDto
    {
        public int TotalPending { get; set; }
        public decimal TotalPendingAmount { get; set; }
        public int TotalDueToday { get; set; }
        public decimal TotalDueTodayAmount { get; set; }
        public int TotalCleared { get; set; }
        public decimal TotalClearedAmount { get; set; }
        public int TotalBounced { get; set; }
        public decimal TotalBouncedAmount { get; set; }
    }
}
