using System;

namespace WMS.Api.DTOs.Reports
{
    public class ReportFilterDto
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int? AccountId { get; set; }
        public string? VoucherType { get; set; }
    }

    public class GeneralLedgerDto
    {
        public int AccountId { get; set; }
        public string AccountCode { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public decimal OpeningBalance { get; set; }
        public string OpeningBalanceType { get; set; } = "Dr";
        public List<LedgerTransactionDto> Transactions { get; set; } = new();
        public decimal ClosingBalance { get; set; }
        public string ClosingBalanceType { get; set; } = "Dr";
    }

    public class LedgerTransactionDto
    {
        public DateTime TransactionDate { get; set; }
        public string VoucherNo { get; set; } = string.Empty;
        public string VoucherType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
        public decimal Balance { get; set; }
    }

    public class TrialBalanceDto
    {
        public int AccountId { get; set; }
        public string AccountCode { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public decimal OpeningDebit { get; set; }
        public decimal OpeningCredit { get; set; }
        public decimal PeriodDebit { get; set; }
        public decimal PeriodCredit { get; set; }
        public decimal ClosingBalance { get; set; }
        public string ClosingBalanceType { get; set; } = "Dr";
    }
}
