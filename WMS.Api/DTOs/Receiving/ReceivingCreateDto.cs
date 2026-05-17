using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.Receiving
{
    public class ReceivingCreateDto
    {
        public int? Id { get; set; }

        [Required]
        public DateTime ReceiveDate { get; set; }

        // 🔥 Receiving Type (CUSTOMER, BANK, OTHER)
        public string? ReceivingType { get; set; }

        public int? PartyId { get; set; }
        public string? PartyName { get; set; }
        public string? PartyType { get; set; }
        public int? CustomerId { get; set; }

        public string? WalkingCustomer { get; set; }
        public string? ReceiptRefNumb { get; set; }

        [Required(ErrorMessage = "Bank/Cash account is required")]
        public int AccountId { get; set; }

        public string? Remarks { get; set; }

        // 🔥 NEW: Entries for cash/cheque (simpler format)
        public List<ReceivingEntryDto>? Entries { get; set; }

        // Old formats (for backward compatibility)
        public List<PartyEntryDto>? PartyEntries { get; set; }
        public List<CashDto>? CashList { get; set; }
        public List<ChequeDto>? ChequeList { get; set; }
    }

    // 🔥 NEW DTO for entries
    public class ReceivingEntryDto
    {
        public string Type { get; set; } = "CASH"; // CASH, CHEQUE
        public decimal Amount { get; set; }
        public string? BankName { get; set; }
        public string? ChequeNumber { get; set; }
        public DateTime? ChequeDate { get; set; }
    }

    public class PartyEntryDto
    {
        public string PartyType { get; set; } = "CUSTOMER";
        public int PartyId { get; set; }
        public string? PartyName { get; set; }
        public decimal CashAmount { get; set; }
        public List<ChequeDto>? ChequeList { get; set; }
    }

    public class CashDto
    {
        public decimal Amount { get; set; }
    }

    public class ChequeDto
    {
        public string BankName { get; set; } = string.Empty;
        public string ChequeNumber { get; set; } = string.Empty;
        public DateTime ChequeDate { get; set; }
        public decimal Amount { get; set; }
    }
}