using WMS.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WMS.Api.Repositories.Interfaces
{
    public interface IPurchaseReturnRepository
    {
        Task<PurchaseReturn> CreateAsync(PurchaseReturn purchaseReturn);
        Task<PurchaseReturn> GetByIdAsync(int returnID);
        Task<IEnumerable<PurchaseReturn>> GetByBranchAsync(int branchID);
        Task<IEnumerable<PurchaseReturn>> GetAllAsync();
        Task<PurchaseReturn> GetLastAsync();

        Task<object> GetPurchaseByBillAsync(string billNumb);
        Task<IEnumerable<object>> GetPurchaseBillsAsync();

        Task DeleteAsync(int returnID);      // ✅ ADD

    }
}
