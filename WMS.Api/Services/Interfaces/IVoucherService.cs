using WMS.Api.DTOs.Voucher;

namespace WMS.Api.Services.Interfaces
{
    public interface IVoucherService
    {
        // Voucher Type CRUD
        List<VochTypeDto> GetAllVoucherTypes();
        VochTypeDto? GetVoucherTypeById(int id);
        void CreateVoucherType(VochTypeCreateDto dto);
        void UpdateVoucherType(int id, VochTypeCreateDto dto);
        void DeleteVoucherType(int id);

        // Voucher CRUD
        List<AcctTranDto> GetAllVouchers(int branchId, string? vochType = null, DateTime? fromDate = null, DateTime? toDate = null);
        AcctTranDetailDto? GetVoucherById(int id);
        Task<int> CreateManualJournalVoucher(VoucherCreateDto dto, int userId, int branchId);

        // Auto-create from transactions
        Task<int> CreateFromSaleAsync(int tranNumb, int userId, int branchId);
        Task<int> CreateFromPurchaseAsync(int tranNumb, int userId, int branchId);
        Task<int> CreateFromReceivingAsync(int receivingId, int userId, int branchId);
        Task<int> CreateFromPaymentAsync(int paymentId, int userId, int branchId);
        Task<int> CreateFromSaleReturnAsync(int returnTranNumb, int userId, int branchId);

        Task<int> CreateFromPurchaseReturnAsync(int returnId, int userId, int branchId);
        // Posting
        Task<bool> PostVoucherToLedger(int acctTranId, int userId);
        Task<bool> ReversePosting(int acctTranId, int userId);

        // Printing
        Task<byte[]> PrintVoucher(int acctTranId);

        // Validation
        bool ValidateVoucherEntries(List<VoucherDetailDto> details);

        Task<List<AccountDropdownDto>> GetAccountsForVoucherDropdown(int branchId);

        Task<bool> DeleteLedgerEntries(int acctTranId);
        Task<bool> DeleteVoucherDetails(int acctTranId);
        Task<bool> DeleteVoucherHeader(int acctTranId);
    }
}