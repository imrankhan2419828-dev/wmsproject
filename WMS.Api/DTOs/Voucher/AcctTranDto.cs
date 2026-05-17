using System;

namespace WMS.Api.DTOs.Voucher
{
    public class AcctTranDto
    {
        public int AcctTranID { get; set; }
        public DateTime? TranDate { get; set; }
        public string? VochType { get; set; }
        public string? TypeAbbr { get; set; }
        public int? VochNumb { get; set; }
        public string? TranDesc { get; set; }
        public int? BranchID { get; set; }
        public string? BranchName { get; set; }
        public DateTime? AddOn { get; set; }
        public string? AddedBy { get; set; }
        public bool IsPosted { get; set; }
    }

    public class AcctTranDetailDto : AcctTranDto
    {
        public List<AcctTradDto> Details { get; set; } = new();
    }

    public class AcctTradDto
    {
        public int AcctTradID { get; set; }
        public int? AcctTranID { get; set; }
        public DateTime? TranDate { get; set; }
        public string? TranNatr { get; set; }
        public int? AcctID { get; set; }
        public string? AcctCode { get; set; }
        public string? AcctName { get; set; }
        public double? DebtAmnt { get; set; }
        public double? CrdtAmnt { get; set; }
        public string? Remarks { get; set; }
    }

    public class VoucherCreateDto
    {
        public DateTime TranDate { get; set; }
        public string VochType { get; set; } = string.Empty;
        public string TranDesc { get; set; } = string.Empty;
        public List<VoucherDetailDto> Details { get; set; } = new();
    }

    public class VoucherDetailDto
    {
        public int AcctID { get; set; }
        public string TranNatr { get; set; } = string.Empty;
        public double Amount { get; set; }
        public string? Remarks { get; set; }
    }

    public class VoucherListDto
    {
        public int AcctTranID { get; set; }
        public string VoucherNo { get; set; } = string.Empty;
        public DateTime TranDate { get; set; }
        public string VochType { get; set; } = string.Empty;
        public string TypeAbbr { get; set; } = string.Empty;
        public string TranDesc { get; set; } = string.Empty;
        public double TotalDebit { get; set; }
        public double TotalCredit { get; set; }
        public bool IsPosted { get; set; }
    }
}