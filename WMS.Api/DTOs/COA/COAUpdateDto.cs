//using System.ComponentModel.DataAnnotations;
//using WMS.Api.Enums;

//namespace WMS.Api.DTOs.COA
//{
//    /// <summary>
//    /// DTO for updating an existing account
//    /// </summary>
//    public class COAUpdateDto
//    {
//        [Required]
//        public int acctID { get; set; }

//        [Required]
//        [StringLength(100, MinimumLength = 2)]
//        public string AcctName { get; set; } = null!;

//        public bool? Active { get; set; }

//        public bool? LockAcct { get; set; }


//        public string? AcctType { get; set; }  // Changed from enum to string

//        public int? CategoryCode { get; set; }  // Changed from enum to int

//        public bool? IsControlAccount { get; set; }
//    }
//}

using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.COA
{
    public class COAUpdateDto
    {
        [Required]
        public int acctID { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string AcctName { get; set; } = null!;

        public bool? Active { get; set; }

        public bool? LockAcct { get; set; }

        public string? AcctType { get; set; }

        public bool? IsControlAccount { get; set; }

        public string? AccountCategory { get; set; }
    }
}