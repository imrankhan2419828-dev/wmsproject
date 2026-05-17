using System.ComponentModel.DataAnnotations;

namespace WMS.Api.Enums
{
    /// <summary>
    /// Normal Balance Side for Accounts
    /// Debit = Left side, Credit = Right side
    /// </summary>
    public enum NormalSide
    {
        [Display(Name = "Debit")]
        Debit = 1,

        [Display(Name = "Credit")]
        Credit = 2
    }

    /// <summary>
    /// Extension methods for NormalSide
    /// </summary>
    public static class NormalSideExtensions
    {
        /// <summary>
        /// Get short code (Dr/Cr)
        /// </summary>
        public static string GetShortCode(this NormalSide side)
        {
            return side == NormalSide.Debit ? "Dr" : "Cr";
        }

        /// <summary>
        /// Get opposite side
        /// </summary>
        public static NormalSide GetOpposite(this NormalSide side)
        {
            return side == NormalSide.Debit ? NormalSide.Credit : NormalSide.Debit;
        }

        /// <summary>
        /// Get sign for calculations (+ for Debit, - for Credit)
        /// </summary>
        public static int GetSign(this NormalSide side)
        {
            return side == NormalSide.Debit ? 1 : -1;
        }

        /// <summary>
        /// Parse from string (Dr/Cr)
        /// </summary>
        public static NormalSide FromString(string value)
        {
            return value?.ToUpper() switch
            {
                "DR" => NormalSide.Debit,
                "DEBIT" => NormalSide.Debit,
                "CR" => NormalSide.Credit,
                "CREDIT" => NormalSide.Credit,
                _ => NormalSide.Debit
            };
        }
    }
}
