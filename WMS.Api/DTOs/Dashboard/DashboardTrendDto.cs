// Location: WMS.Api/DTOs/Dashboard/DashboardTrendDto.cs
namespace WMS.Api.DTOs.Dashboard
{
    public class DashboardTrendDto
    {
        public string Period { get; set; }  // "Jan", "Feb", or "Week1", "Week2"
        public int Month { get; set; }
        public int Week { get; set; }
        public decimal Amount { get; set; }
        public int Count { get; set; }
    }
}
