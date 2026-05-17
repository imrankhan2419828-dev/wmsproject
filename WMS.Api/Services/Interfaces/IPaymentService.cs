using System.Collections.Generic;
using System.Threading.Tasks;
using WMS.Api.DTOs.Payments;

namespace WMS.Api.Services.Interfaces
{
    public interface IPaymentService
    {
        // Existing methods
        Task<List<PaymentListDto>> GetAllAsync(int branchId);
        Task<PaymentDetailDto?> GetByIdAsync(int paymentId, int branchId);
        Task<int> CreateAsync(PaymentCreateDto dto, int userId, int branchId);
        Task<bool> DeleteAsync(int paymentId, int userId, int branchId);
        Task<List<CoaLookupDto>> GetAccountsByPaymentTypeAsync(int branchId, string type);
        Task<List<CoaLookupDto>> GetBankAccountsAsync(int branchId);

        // 🔥 NEW METHODS
        Task<PaymentDetailDto?> UpdateAsync(int paymentId, PaymentCreateDto dto, int userId, int branchId);
        Task<string> GenerateVoucherNumberAsync(int branchId);
        Task<List<PartyDropdownDto>> GetPartiesAsync(int branchId);
    }
}