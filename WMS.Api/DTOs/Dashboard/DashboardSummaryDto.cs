// Location: WMS.Api/DTOs/Dashboard/DashboardSummaryDto.cs
namespace WMS.Api.DTOs.Dashboard
{
    public class DashboardSummaryDto
    {
        public decimal TotalAmount { get; set; }
        public decimal CashAmount { get; set; }
        public decimal CreditAmount { get; set; }
        public decimal ChequeAmount { get; set; }
        public int TotalCount { get; set; }
        public int CashCount { get; set; }
        public int CreditCount { get; set; }
        public int ChequeCount { get; set; }

        // For Job Cards / Bookings
        public int Pending { get; set; }
        public int InProgress { get; set; }
        public int Completed { get; set; }
        public int Confirmed { get; set; }
        public int Delivered { get; set; }
        public int Cancelled { get; set; }
    }
}
