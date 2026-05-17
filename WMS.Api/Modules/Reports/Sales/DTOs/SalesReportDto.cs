using System;
using System.Collections.Generic;

namespace WMS.API.Modules.Reports.Sales.DTOs
{
    public class SalesReportDto
    {
        public string SaleDate { get; set; }
        public int SaleID { get; set; }
        public string BillNo { get; set; }
        public string CustomerName { get; set; }
        public string ItemName { get; set; }
        public string ModlNumb { get; set; }
        public double? Quantity { get; set; }
        public double? Rate { get; set; }
        public double? Amount { get; set; }
        public double? BillTotal { get; set; }
        public string Description { get; set; }
    }

    public class SalesSummaryDto
    {
        public int TotalBills { get; set; }
        public double TotalQuantity { get; set; }
        public double TotalAmount { get; set; }
        public double AverageBillAmount { get; set; }
    }

    public class DropdownDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }

    public class SalesReportResponseDto
    {
        public List<SalesReportDto> Transactions { get; set; }
        public SalesSummaryDto Summary { get; set; }
    }
}