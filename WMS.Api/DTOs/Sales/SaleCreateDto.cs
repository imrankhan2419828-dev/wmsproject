using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.Sales
{
    public class SaleCreateDto
    {
        [Required]
        public DateTime TranDate { get; set; }

        [Required]
        public string TranMode { get; set; } = "CASH";

        public int? CustID { get; set; }

        // 🔥 NEW: Walking Customer text field
        [MaxLength(200)]
        public string? WalkingCustomer { get; set; }

        // For backward compatibility
        public string? CustName { get; set; }

        [MaxLength(500)]
        public string? TranDesc { get; set; }
        public int? GodownID { get; set; }
        [Required]
        public List<SaleItemCreateDto> Items { get; set; } = new();
    }
}