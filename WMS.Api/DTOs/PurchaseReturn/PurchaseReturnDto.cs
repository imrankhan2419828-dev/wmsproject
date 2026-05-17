using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.PurchaseReturn
{
    public class PurchaseReturnDto
    {
        public int ReturnID { get; set; }

        [Required]
        public int PurchaseTranNumb { get; set; }

        [Required]
        public DateTime TranDate { get; set; }

        public string? TranDesc { get; set; }

        public string? BillNumb { get; set; }

        // 🔥 NEW: Return Reference Number
        public string? ReturnRefNumb { get; set; }

        // Supplier info
        public string? SupplierName { get; set; }
        public int? SuppID { get; set; }

        // Purchase bill info
        public string? PurchaseBillNumb { get; set; }

        public List<PurchaseReturnItemDto> Items { get; set; } = new();
    }
}