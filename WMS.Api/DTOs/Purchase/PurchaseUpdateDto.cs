using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.Purchase
{
    public class PurchaseUpdateDto
    {
        [Required]
        public int TranNumb { get; set; }

        [Required]
        public DateTime TranDate { get; set; }

        public int? SuppID { get; set; }

        // 🔥 NEW: Walking Customer
        public bool IsWalkingCustomer { get; set; }

        // 🔥 NEW: Purchase Reference Number
        [MaxLength(50)]
        public string? RefrNumb { get; set; }

        public int BranchID { get; set; }

        [Required]
        public string TranType { get; set; } = "Credit";

        public string? TranMode { get; set; }

        public string? BillNumb { get; set; }

        [MaxLength(500)]
        public string? TranDesc { get; set; }
        public int? GodownID { get; set; }

        [Required]
        public List<PurchaseItemDto> Items { get; set; } = new();
    }
}