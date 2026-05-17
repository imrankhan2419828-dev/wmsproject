namespace WMS.Api.Modules.Reports.Purchase.DTOs
{
    public class PurchaseDetailDto
    {
        public string BillNumb { get; set; }
        public DateTime? TranDate { get; set; }
        public string SupplierName { get; set; }
        public string ItemName { get; set; }
        public string ModlNumb { get; set; }
        public double? PurcQnty { get; set; }
        public double? PurcRate { get; set; }
        public double? PurcAmnt { get; set; }
    }

}
