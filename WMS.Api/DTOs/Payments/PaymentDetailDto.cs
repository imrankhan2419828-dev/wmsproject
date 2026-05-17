using System;
using System.Collections.Generic;

namespace WMS.Api.DTOs.Payments
{
    public class PaymentDetailDto
    {
        public int PaymentID { get; set; }
        public string? VoucherNumb { get; set; }
        public DateTime PaymentDate { get; set; }
        public string PaymentType { get; set; } = string.Empty;
        public int? ReferenceID { get; set; }
        public string? ReferenceName { get; set; }
        public string? WalkingParty { get; set; }
        public string? PaymentRefNumb { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMode { get; set; } = string.Empty;
        public string? ChequeNo { get; set; }
        public string? BankName { get; set; }
        public DateTime? ChequeDate { get; set; }
        public string? Description { get; set; }

        public List<PaymentDetailDtoItem> Details { get; set; } = new();
    }

    public class PaymentDetailDtoItem
    {
        public int PaymentDetailID { get; set; }
        public string PaymentMode { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int? BankAccountID { get; set; }
        public string? ChequeNo { get; set; }
    }
}