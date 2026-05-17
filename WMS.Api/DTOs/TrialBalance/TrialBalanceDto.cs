namespace WMS.Api.DTOs.TrialBalance
{
    public class TrialBalanceDto
    {
        public int AcctID { get; set; }
        public string AcctCode { get; set; }
        public string AcctName { get; set; }
        public double Debit { get; set; }
        public double Credit { get; set; }
    }
}

