using System.ComponentModel.DataAnnotations;

namespace WMS.Api.Enums
{
    /// <summary>
    /// Account Categories for detailed financial reporting
    /// Based on standard accounting code ranges
    /// </summary>
    public enum AccountCategory
    {
        // Assets (1000-1999)
        [Display(Name = "Current Assets")]
        CurrentAssets = 1100,

        [Display(Name = "Fixed Assets")]
        FixedAssets = 1200,

        [Display(Name = "Intangible Assets")]
        IntangibleAssets = 1300,

        [Display(Name = "Other Assets")]
        OtherAssets = 1400,

        // Liabilities (2000-2999)
        [Display(Name = "Current Liabilities")]
        CurrentLiabilities = 2100,

        [Display(Name = "Long Term Liabilities")]
        LongTermLiabilities = 2200,

        [Display(Name = "Other Liabilities")]
        OtherLiabilities = 2300,

        // Equity (3000-3999)
        [Display(Name = "Share Capital")]
        ShareCapital = 3100,

        [Display(Name = "Reserves & Surplus")]
        ReservesAndSurplus = 3200,

        [Display(Name = "Retained Earnings")]
        RetainedEarnings = 3300,

        // Revenue/Income (4000-4999)
        [Display(Name = "Sales Revenue")]
        SalesRevenue = 4100,

        [Display(Name = "Other Income")]
        OtherIncome = 4200,

        [Display(Name = "Discounts & Returns")]
        DiscountsAndReturns = 4300,

        // Expenses (5000-5999)
        [Display(Name = "Cost of Sales")]
        CostOfSales = 5100,

        [Display(Name = "Operating Expenses")]
        OperatingExpenses = 5200,

        [Display(Name = "Administrative Expenses")]
        AdministrativeExpenses = 5300,

        [Display(Name = "Other Expenses")]
        OtherExpenses = 5400,

        [Display(Name = "Depreciation")]
        Depreciation = 5500
    }

    /// <summary>
    /// Extension methods for AccountCategory
    /// </summary>
    public static class AccountCategoryExtensions
    {
        /// <summary>
        /// Get category code range start
        /// </summary>
        public static int GetRangeStart(this AccountCategory category)
        {
            return (int)category;
        }

        /// <summary>
        /// Get category code range end
        /// </summary>
        public static int GetRangeEnd(this AccountCategory category)
        {
            return category switch
            {
                AccountCategory.CurrentAssets => 1199,
                AccountCategory.FixedAssets => 1299,
                AccountCategory.IntangibleAssets => 1399,
                AccountCategory.OtherAssets => 1499,
                AccountCategory.CurrentLiabilities => 2199,
                AccountCategory.LongTermLiabilities => 2299,
                AccountCategory.OtherLiabilities => 2399,
                AccountCategory.ShareCapital => 3199,
                AccountCategory.ReservesAndSurplus => 3299,
                AccountCategory.RetainedEarnings => 3399,
                AccountCategory.SalesRevenue => 4199,
                AccountCategory.OtherIncome => 4299,
                AccountCategory.DiscountsAndReturns => 4399,
                AccountCategory.CostOfSales => 5199,
                AccountCategory.OperatingExpenses => 5299,
                AccountCategory.AdministrativeExpenses => 5399,
                AccountCategory.OtherExpenses => 5499,
                AccountCategory.Depreciation => 5599,
                _ => (int)category + 99
            };
        }

        /// <summary>
        /// Get parent account type for this category
        /// </summary>
        public static AccountType GetParentAccountType(this AccountCategory category)
        {
            int code = (int)category;

            if (code >= 1000 && code < 2000) return AccountType.Asset;
            if (code >= 2000 && code < 3000) return AccountType.Liability;
            if (code >= 3000 && code < 4000) return AccountType.Equity;
            if (code >= 4000 && code < 5000) return AccountType.Revenue;
            if (code >= 5000 && code < 6000) return AccountType.Expense;

            return AccountType.Asset;
        }
    }
}
