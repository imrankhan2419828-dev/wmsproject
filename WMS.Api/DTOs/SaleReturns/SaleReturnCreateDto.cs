using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.SaleReturns
{
    public class SaleReturnCreateDto
    {
        public int? ReturnTranNumb { get; set; }

        [Required]
        public int SaleTranNumb { get; set; }

        [Required]
        public DateTime TranDate { get; set; }

        public int? CustID { get; set; }
        public string? CustName { get; set; }

        // 🔥 NEW: Walking Customer
        public string? WalkingCustomer { get; set; }

        // 🔥 NEW: Return Reference Number
        public string? ReturnRefNumb { get; set; }
        public string? BillNumb { get; set; }
        public string ReturnType { get; set; } = "PARTIAL";

        [Required]
        public List<SaleReturnItemCreateDto> Items { get; set; } = new();
    }
}