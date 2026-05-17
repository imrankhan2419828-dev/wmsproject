using System;

namespace WMS.Api.Models
{
    public class PaymentDetail
    {
        public int PaymentDetailID { get; set; }

        public int PaymentID { get; set; }
        public string PaymentMode { get; set; } = null!; // CASH | BANK | CHEQUE

        public decimal Amount { get; set; }

        public int? BankAccountID { get; set; }
        public string? ChequeNo { get; set; }

        public int BranchID { get; set; }

        public int AddBy { get; set; }
        public DateTime AddOn { get; set; }
    }
}

