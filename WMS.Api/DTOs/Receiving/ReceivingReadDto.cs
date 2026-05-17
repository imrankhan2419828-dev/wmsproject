using System;
using System.Collections.Generic;

namespace WMS.Api.DTOs.Receiving
{
    public class ReceivingReadDto
    {
        public int Id { get; set; }
        public string? VoucherNumb { get; set; }
        public DateTime ReceiveDate { get; set; }
        public int BranchId { get; set; }
        public int UserId { get; set; }
        public int? PartyId { get; set; }
        public string? PartyName { get; set; }
        public string? PartyType { get; set; }
        public string? WalkingCustomer { get; set; }
        public string? ReceiptRefNumb { get; set; }
        public int? CustomerId { get; set; }
        
        public int AccountId { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public string AccountCode { get; set; } = string.Empty;
        public decimal TotalCash { get; set; }
        public decimal TotalCheque { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Remarks { get; set; }
        public List<CashDto> CashList { get; set; } = new();
        public List<ChequeDto> ChequeList { get; set; } = new();
    }
}