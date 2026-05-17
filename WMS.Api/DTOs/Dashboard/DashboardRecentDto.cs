// Location: WMS.Api/DTOs/Dashboard/DashboardRecentDto.cs
namespace WMS.Api.DTOs.Dashboard
{
    public class DashboardRecentDto
    {
        public int Id { get; set; }
        public string VoucherNo { get; set; }
        public string PartyName { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string Type { get; set; }
        public string Status { get; set; }

        // For Job Cards
        public string VehicleRegNo { get; set; }

        // For Payments
        public string PaymentMode { get; set; }
    }
}
