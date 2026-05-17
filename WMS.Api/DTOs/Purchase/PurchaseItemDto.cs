namespace WMS.Api.DTOs.Purchase
{
    public class PurchaseItemDto
    {
        public int ItemID { get; set; }
        public double PurcQnty { get; set; }
        public double PurcRate { get; set; }
        public int? GodownID { get; set; }
    }
}
