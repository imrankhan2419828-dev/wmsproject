using System;

namespace WMS.Api.DTOs.Payments
{
    public class PaymentListDto
    {
        public int PaymentID { get; set; }
        public string? VoucherNumb { get; set; }
        public DateTime PaymentDate { get; set; }
        public string PaymentType { get; set; } = string.Empty;
        public string? ReferenceName { get; set; }
        public string? WalkingParty { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMode { get; set; } = string.Empty;
        public string? ChequeNo { get; set; }
    }
}