using System.Collections.Generic;
using WMS.Api.DTOs.Purchase;

namespace WMS.Api.Services.Interfaces
{
    public interface IPurchaseService
    {
        Task<PurchaseCreateDto> CreateAsync(PurchaseCreateDto dto, int userId);
        Task UpdateAsync(PurchaseUpdateDto dto, int userId);
        Task DeleteAsync(int tranNumb);
        Task<List<PurchaseListDto>> GetAllAsync(int branchId);
        Task<PurchaseUpdateDto?> GetByIdAsync(int tranNumb);
        Task<string> GenerateNextBillAsync(int branchId);

        // 🔥 NEW: Dropdown data methods
        Task<List<SupplierDropdownDto>> GetSuppliersAsync(int branchId);
        Task<List<ItemDropdownDto>> GetItemsAsync(int branchId);
    }

    public class SupplierDropdownDto
    {
        public int acctID { get; set; }
        public string AcctCode { get; set; } = null!;
        public string AcctName { get; set; } = null!;
        public string? NTNNo { get; set; }
        public string? STRNo { get; set; }
    }

    public class ItemDropdownDto
    {
        public int ItemID { get; set; }
        public string ItemName { get; set; } = null!;
        public string? ModlNumb { get; set; }
        public decimal? PurcRate { get; set; }
        public decimal? SaleRate { get; set; }
    }
}