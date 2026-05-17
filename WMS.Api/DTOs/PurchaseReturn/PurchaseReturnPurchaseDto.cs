using System;

namespace WMS.Api.DTOs.PurchaseReturn
{
    public class PurchaseReturnPurchaseDto
    {
        public int PurchaseTranNumb { get; set; }
        public string BillNumb { get; set; } = string.Empty;
        public DateTime TranDate { get; set; }
        public int SuppID { get; set; }
        public string? SupplierName { get; set; }
    }
}