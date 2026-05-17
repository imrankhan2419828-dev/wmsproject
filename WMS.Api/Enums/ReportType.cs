using System.ComponentModel.DataAnnotations;

namespace WMS.Api.Enums
{
    /// <summary>
    /// Financial Report Types
    /// </summary>
    public enum ReportType
    {
        [Display(Name = "Trial Balance")]
        TrialBalance = 1,

        [Display(Name = "Profit & Loss Statement")]
        ProfitAndLoss = 2,

        [Display(Name = "Balance Sheet")]
        BalanceSheet = 3,

        [Display(Name = "Cash Flow Statement")]
        CashFlow = 4,

        [Display(Name = "General Ledger")]
        GeneralLedger = 5
    }

    /// <summary>
    /// Report Period Types
    /// </summary>
    public enum ReportPeriodType
    {
        [Display(Name = "Daily")]
        Daily = 1,

        [Display(Name = "Weekly")]
        Weekly = 2,

        [Display(Name = "Monthly")]
        Monthly = 3,

        [Display(Name = "Quarterly")]
        Quarterly = 4,

        [Display(Name = "Yearly")]
        Yearly = 5,

        [Display(Name = "Custom Range")]
        Custom = 6
    }
}
