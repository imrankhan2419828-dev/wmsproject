namespace WMS.API.Modules.Reports.Purchase.DTOs
{
    public class PurchaseSummaryDto
    {
        public int PurchaseId { get; set; }
        public string PurchaseNo { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public int? SuppID { get; set; }
        public string SupplierName { get; set; }
        public string BranchName { get; set; }
        public int? BranchID { get; set; }
        public decimal? TotalAmount { get; set; }
    }
}


