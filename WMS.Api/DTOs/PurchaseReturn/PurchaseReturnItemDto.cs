namespace WMS.Api.DTOs.PurchaseReturn
{
    public class PurchaseReturnItemDto
    {
        public int ItemID { get; set; }
        public string? ItemName { get; set; }
        public decimal PurchasedQty { get; set; }
        public decimal AvailableQty { get; set; }
        public decimal ReturnQty { get; set; }
        public decimal PurcRate { get; set; }

        // 🔥 NEW: Current stock for display
        public decimal CurrentStock { get; set; }

        public int? GodownID { get; set; }

        // Computed
        public decimal Amount => ReturnQty * PurcRate;
    }
}