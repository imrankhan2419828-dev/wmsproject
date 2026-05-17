using WMS.Api.DTOs.Receiving;

namespace WMS.Api.Services.Interfaces
{
    public interface IReceivingService
    {
        List<ReceivingListDto> GetAll(int branchId);
        Task<ReceivingCreateDto?> GetById(int id);
        Task<int> CreateAsync(ReceivingCreateDto dto, int userId, int branchId);

        // 🔥 FIX: Update signature to match implementation
        Task<bool> UpdateAsync(int id, ReceivingCreateDto dto, int userId, int branchId);

        Task<bool> DeleteAsync(int id);
        Task<List<COAAccountDto>> GetAccountsByType(int branchId, string type);
        Task<List<CustomerDropdownDto>> GetCustomersAsync(int branchId);
        Task<List<COAAccountDto>> GetBankCashAccountsAsync(int branchId);
        Task<string> GenerateVoucherNumberAsync(int branchId);
    }

    public class CustomerDropdownDto
    {
        public int acctID { get; set; }
        public string AcctCode { get; set; } = string.Empty;
        public string AcctName { get; set; } = string.Empty;
        public string? NTNNo { get; set; }
        public string? STRNo { get; set; }
    }
}