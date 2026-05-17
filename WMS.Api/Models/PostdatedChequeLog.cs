using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("PostdatedChequeLog")]
    public class PostdatedChequeLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ChequeId { get; set; }

        [StringLength(20)]
        public string? OldStatus { get; set; }

        [Required]
        [StringLength(20)]
        public string NewStatus { get; set; } = string.Empty;

        [Required]
        public int ChangedBy { get; set; }

        [Required]
        public DateTime ChangedOn { get; set; } = DateTime.Now;

        [StringLength(500)]
        public string? Remarks { get; set; }

        // Navigation
        [ForeignKey("ChequeId")]
        public PostdatedCheque? Cheque { get; set; }
    }
}
