using System;
using System.Collections.Generic;

namespace WMS.Api.DTOs.Payments
{
    public class PaymentCreateDto
    {
        public int? PaymentID { get; set; }

        public DateTime PaymentDate { get; set; }

        // SUPPLIER | BANK | EXPENSE | OTHER | MIXED
        public string PaymentType { get; set; } = string.Empty;

        // tblCOA AccountID
        public int? ReferenceID { get; set; }
        public string? ReferenceName { get; set; }

        // 🔥 NEW: Walking Party (for walk-in customers/suppliers)
        public string? WalkingParty { get; set; }

        // 🔥 NEW: Payment Reference Number (Supplier/Customer reference)
        public string? PaymentRefNumb { get; set; }

        public decimal Amount { get; set; }

        // CASH | BANK | CHEQUE
        public string PaymentMode { get; set; } = string.Empty;
        public string? ChequeNo { get; set; }
        public string? BankName { get; set; }
        public DateTime? ChequeDate { get; set; }

        public string? Description { get; set; }

        public List<PaymentItemCreateDto>? Items { get; set; }
        public List<PaymentDetailCreateDto>? Details { get; set; }
    }
}