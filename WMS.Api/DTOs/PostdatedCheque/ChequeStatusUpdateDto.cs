using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.PostdatedCheque
{
    public class ChequeStatusUpdateDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;

        public DateTime? DepositDate { get; set; }
        public DateTime? ClearDate { get; set; }
        public string? BounceReason { get; set; }
        public string? Remarks { get; set; }
    }
}
