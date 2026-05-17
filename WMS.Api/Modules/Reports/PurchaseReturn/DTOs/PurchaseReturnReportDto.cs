using System;

namespace WMS.API.Modules.Reports.PurchaseReturn.DTOs
{
    public class PurchaseReturnReportDto
    {
        public string ReturnDate { get; set; }
        public string ReturnBillNo { get; set; }
        public string SupplierName { get; set; }
        public string ItemName { get; set; }
        public string ModlNumb { get; set; }
        public decimal Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Amount { get; set; }
        public string OriginalBillNo { get; set; }
        public string Description { get; set; }
    }

    public class PurchaseReturnFilterDto
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public int? SupplierId { get; set; }
        public int? ItemId { get; set; }
    }

    public class DropdownDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }
}
