using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.Purchase
{
    public class PurchaseCreateDto
    {
        [Required]
        public DateTime TranDate { get; set; }

        public int? SuppID { get; set; }

        // 🔥 NEW: Walking Customer
        public bool IsWalkingCustomer { get; set; }

        // 🔥 NEW: Purchase Reference Number
        [MaxLength(100)]
        public string? RefrNumb { get; set; }

        public int BranchID { get; set; }

        [Required]
        [MaxLength(20)]
        public string TranType { get; set; } = "Credit";

        [MaxLength(20)]
        public string? TranMode { get; set; }

        [MaxLength(50)]
        public string? BillNumb { get; set; }

        [MaxLength(1000)]
        public string? TranDesc { get; set; }
        public int? GodownID { get; set; }

        [Required]
        public List<PurchaseItemDto> Items { get; set; } = new();
    }
}