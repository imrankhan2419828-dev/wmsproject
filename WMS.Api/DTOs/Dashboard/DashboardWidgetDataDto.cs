// Location: WMS.Api/DTOs/Dashboard/DashboardWidgetDataDto.cs
namespace WMS.Api.DTOs.Dashboard
{
    public class DashboardWidgetDataDto
    {
        // Cards / KPIs ke liye
        public DashboardSummaryDto Summary { get; set; }

        // Today's data ke liye
        public DashboardTodayDto Today { get; set; }

        // Recent list ke liye
        public List<DashboardRecentDto> Recent { get; set; }

        // Charts ke liye
        public List<DashboardTrendDto> MonthlyTrends { get; set; }
        public List<DashboardTrendDto> WeeklyTrends { get; set; }

        // Metadata
        public DateTime LastUpdated { get; set; }
        public string BranchName { get; set; }
    }
}
