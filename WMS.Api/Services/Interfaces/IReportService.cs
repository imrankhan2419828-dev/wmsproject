using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WMS.Api.DTOs.Reports;

namespace WMS.Api.Services.Interfaces
{
    public interface IReportService
    {
        Task<GeneralLedgerDto> GetGeneralLedgerAsync(ReportFilterDto filter, int branchId);
        Task<List<TrialBalanceDto>> GetTrialBalanceAsync(DateTime fromDate, DateTime toDate, int branchId);
        // ADD this method signature
        Task<List<CustomerStatementDto>> GetCustomerStatementAsync(DateTime fromDate, DateTime toDate, int? customerId, int branchId);

        Task<List<SupplierStatementDto>> GetSupplierStatementAsync(DateTime fromDate, DateTime toDate, int? supplierId, int branchId);

        Task<List<PurchaseReportDto>> GetPurchaseReportAsync(DateTime fromDate, DateTime toDate, int? supplierId, int? itemId, int branchId);
        Task<List<PurchaseReturnReportDto>> GetPurchaseReturnReportAsync(DateTime fromDate, DateTime toDate, int? supplierId, int? itemId, int branchId);
        Task<List<SaleReportDto>> GetSaleReportAsync(DateTime fromDate, DateTime toDate, int? customerId, int? itemId, int branchId);
        Task<List<SaleReturnReportDto>> GetSaleReturnReportAsync(DateTime fromDate, DateTime toDate, int? customerId, int? itemId, int branchId);
        Task<List<StockReportDto>> GetStockReportAsync(DateTime fromDate, DateTime toDate, int? itemId, int? companyId, int? categoryId, int? subcategoryId, int? godownId, bool showRateValue, int branchId);
        Task<ProfitLossDto> GetProfitLossAsync(DateTime fromDate, DateTime toDate, int branchId);
        Task<List<BankStatementDto>> GetBankStatementAsync(DateTime fromDate, DateTime toDate, int? bankAccountId, int branchId);
    }
}
