using System;
using System.Collections.Generic;

namespace WMS.API.Modules.Reports.SalesReturn.DTOs
{
    public class SalesReturnReportDto
    {
        public string ReturnDate { get; set; }
        public int ReturnID { get; set; }
        public string ReturnBillNo { get; set; }
        public string CustomerName { get; set; }
        public string OriginalBillNo { get; set; }
        public string ItemName { get; set; }
        public string ModlNumb { get; set; }
        public decimal? Quantity { get; set; }
        public decimal? Rate { get; set; }
        public decimal? Amount { get; set; }
        public decimal? BillTotal { get; set; }
        public string Description { get; set; }
    }

    public class SalesReturnSummaryDto
    {
        public int TotalReturns { get; set; }
        public decimal TotalQuantity { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal AverageReturnAmount { get; set; }
    }

    public class DropdownDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }

    public class SalesReturnReportResponseDto
    {
        public List<SalesReturnReportDto> Transactions { get; set; }
        public SalesReturnSummaryDto Summary { get; set; }
    }
}
