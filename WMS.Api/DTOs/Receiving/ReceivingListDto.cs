using System;

namespace WMS.Api.DTOs.Receiving
{
    public class ReceivingListDto
    {
        public int Id { get; set; }
        public string? VoucherNumb { get; set; }
        public DateTime ReceiveDate { get; set; }
        public decimal TotalCash { get; set; }
        public decimal TotalCheque { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Remarks { get; set; }
        public string? AccountName { get; set; }
        public string? AccountCode { get; set; }
        public int? PartyId { get; set; }
        public string? PartyName { get; set; }
        public string? PartyType { get; set; }
        public string? WalkingCustomer { get; set; }
        public string? CustomerName { get; set; }
        public string DisplayName => !string.IsNullOrEmpty(WalkingCustomer)
            ? $"🚶 {WalkingCustomer}"
            : (PartyName ?? AccountName ?? "N/A");
    }
}