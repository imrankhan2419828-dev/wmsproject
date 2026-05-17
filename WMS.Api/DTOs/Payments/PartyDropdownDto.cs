namespace WMS.Api.DTOs.Payments
{
    public class PartyDropdownDto
    {
        public int acctID { get; set; }
        public string AcctCode { get; set; } = string.Empty;
        public string AcctName { get; set; } = string.Empty;
        public string PartyType { get; set; } = string.Empty; // Customer / Supplier
        public string? NTNNo { get; set; }
        public string? STRNo { get; set; }
    }
}
