//using System.ComponentModel.DataAnnotations;
//using WMS.Api.Enums;

//namespace WMS.Api.DTOs.COA
//{
//    /// <summary>
//    /// DTO for creating a new account
//    /// </summary>
//    public class COACreateDto
//    {
//        [Required(ErrorMessage = "Account Name is required")]
//        [StringLength(100, MinimumLength = 2, ErrorMessage = "Account Name must be between 2 and 100 characters")]
//        public string AcctName { get; set; } = null!;

//        public string? PrntCode { get; set; }   // null = root account


//        [Required(ErrorMessage = "Account Type is required")]
//        public string AcctType { get; set; } = null!;   // String

//        public decimal? OpenAmnt { get; set; }

//        [StringLength(500)]
//        public string? AcctDesc { get; set; }

//        public bool? Active { get; set; } = true;

//        public AccountCategory? CategoryCode { get; set; }

//        public bool? IsControlAccount { get; set; } = false;

//        public int? ControlAccountId { get; set; }
//    }
//}
using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.COA
{
    public class COACreateDto
    {
        [Required(ErrorMessage = "Account Name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Account Name must be between 2 and 100 characters")]
        public string AcctName { get; set; } = null!;

        public string? PrntCode { get; set; }

        // For root accounts - user selects Dr or Cr
        public string? NormalSide { get; set; }  // "Dr" or "Cr"

        // Auto-determined from NormalSide for root accounts
        public string? AcctType { get; set; }

        public decimal? OpenAmnt { get; set; }

        [StringLength(500)]
        public string? AcctDesc { get; set; }

        public bool? Active { get; set; } = true;

        public bool? IsControlAccount { get; set; } = false;

        public int? ControlAccountId { get; set; }

        public string? AccountCategory { get; set; }  // Customer, Supplier, Bank, Expense, Other
    }
}