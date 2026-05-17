namespace WMS.Api.DTOs.Reports
{
    public class ProfitLossDto
    {
        public List<ProfitLossGroupDto> IncomeGroups { get; set; } = new();
        public List<ProfitLossGroupDto> ExpenseGroups { get; set; } = new();
        public decimal TotalIncome { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetProfitLoss { get; set; }
        public string ResultType { get; set; } = "Profit"; // Profit or Loss
    }

    public class ProfitLossGroupDto
    {
        public string AccountCode { get; set; } = "";
        public string AccountName { get; set; } = "";
        public decimal Amount { get; set; }
        public List<ProfitLossDetailDto> Details { get; set; } = new();
    }

    public class ProfitLossDetailDto
    {
        public DateTime Date { get; set; }
        public string VoucherNo { get; set; } = "";
        public string Description { get; set; } = "";
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
    }
}
