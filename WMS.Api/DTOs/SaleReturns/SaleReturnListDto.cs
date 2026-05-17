using System;
using System.Collections.Generic;

namespace WMS.Api.DTOs.SaleReturns
{
    public class SaleReturnListDto
    {
        public int ReturnTranNumb { get; set; }
        public int SaleTranNumb { get; set; }
        public string? BillNumb { get; set; }
        public DateTime? TranDate { get; set; }
        public string? CustName { get; set; }
        public string? WalkingCustomer { get; set; }
        public decimal TotlQnty { get; set; }
        public decimal TotlAmnt { get; set; }
        public List<SaleReturnItemDto>? Items { get; set; }
    }

    public class SaleReturnItemDto
    {
        public int ItemID { get; set; }
        public string? ItemName { get; set; }
        public decimal SoldQnty { get; set; }
        public decimal ReturnQnty { get; set; }
        public decimal Rate { get; set; }
        public decimal Amount { get; set; }
        public decimal CurrentStock { get; set; }
    }
}