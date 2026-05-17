using System.ComponentModel.DataAnnotations;

namespace WMS.Api.Enums
{
    /// <summary>
    /// Account Types for Chart of Accounts
    /// Each type has specific behavior for financial reporting
    /// </summary>
    public enum AccountType
    {
        [Display(Name = "Assets")]
        Asset = 1,

        [Display(Name = "Liabilities")]
        Liability = 2,

        [Display(Name = "Equity")]
        Equity = 3,

        [Display(Name = "Revenue/Income")]
        Revenue = 4,

        [Display(Name = "Expenses")]
        Expense = 5
    }

    /// <summary>
    /// Extension methods for AccountType
    /// </summary>
    public static class AccountTypeExtensions
    {
        /// <summary>
        /// Returns Normal Side (Debit or Credit) for account type
        /// </summary>
        public static string GetNormalSide(this AccountType type)
        {
            return type switch
            {
                AccountType.Asset => "Dr",
                AccountType.Expense => "Dr",
                AccountType.Liability => "Cr",
                AccountType.Equity => "Cr",
                AccountType.Revenue => "Cr",
                _ => "Dr"
            };
        }

        /// <summary>
        /// Returns Report Type (Balance Sheet or Profit & Loss)
        /// </summary>
        public static string GetReportType(this AccountType type)
        {
            return type switch
            {
                AccountType.Asset => "BS",
                AccountType.Liability => "BS",
                AccountType.Equity => "BS",
                AccountType.Revenue => "PL",
                AccountType.Expense => "PL",
                _ => "BS"
            };
        }

        /// <summary>
        /// Check if account type appears on Balance Sheet
        /// </summary>
        public static bool IsBalanceSheetAccount(this AccountType type)
        {
            return type == AccountType.Asset ||
                   type == AccountType.Liability ||
                   type == AccountType.Equity;
        }

        /// <summary>
        /// Check if account type appears on Profit & Loss
        /// </summary>
        public static bool IsPLAccount(this AccountType type)
        {
            return type == AccountType.Revenue || type == AccountType.Expense;
        }

        /// <summary>
        /// Get display name
        /// </summary>
        public static string GetDisplayName(this AccountType type)
        {
            return type switch
            {
                AccountType.Asset => "Assets",
                AccountType.Liability => "Liabilities",
                AccountType.Equity => "Equity",
                AccountType.Revenue => "Revenue/Income",
                AccountType.Expense => "Expenses",
                _ => "Unknown"
            };
        }
    }
}
