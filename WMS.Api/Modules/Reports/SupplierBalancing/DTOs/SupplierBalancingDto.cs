using System;
using System.Collections.Generic;

namespace WMS.API.Modules.Reports.SupplierBalancing.DTOs
{
    public class SupplierBalancingDto
    {
        public string TranDate { get; set; }
        public string TranType { get; set; }
        public string VoucherNo { get; set; }
        public string Reference { get; set; }
        public decimal Quantity { get; set; }  // Make sure this is decimal, not decimal?
        public decimal? Debit { get; set; }
        public decimal? Credit { get; set; }
        public decimal? RunningBalance { get; set; }
    }

    public class SupplierDropdownDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }

    public class SupplierBalancingResponseDto
    {
        public List<SupplierBalancingDto> Transactions { get; set; }
        public decimal OpeningBalance { get; set; }
    }
}