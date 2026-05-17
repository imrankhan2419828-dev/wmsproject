using System;
using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.PostdatedCheque
{
    public class PostdatedChequeCreateDto
    {
        [Required]
        [StringLength(50)]
        public string ChequeNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string BankName { get; set; } = string.Empty;

        [Required]
        public DateTime ChequeDate { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        public string SourceType { get; set; } = string.Empty; // CUSTOMER, SUPPLIER, BANK

        [Required]
        public int SourceId { get; set; }

        public string? ReferenceType { get; set; }
        public int? ReferenceId { get; set; }

        public string? Remarks { get; set; }
    }

}
