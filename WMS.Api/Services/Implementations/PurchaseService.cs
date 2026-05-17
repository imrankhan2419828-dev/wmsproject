using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Purchase;
using WMS.Api.Models;
using WMS.Api.Repositories.Interfaces;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class PurchaseService : IPurchaseService
    {
        private readonly IPurchaseRepository _repo;
        private readonly WmsDbContext _context;
        private readonly IStockService _stockService;
        private readonly IVoucherService _voucherService;  // ✅ ADDED
        private readonly IPriceHistoryService _priceService;
        // ✅ UPDATE CONSTRUCTOR
        public PurchaseService(
            IPurchaseRepository repo,
            WmsDbContext context,
            IStockService stockService,
            IVoucherService voucherService,
            IPriceHistoryService priceService)  // ✅ ADDED
        {
            _repo = repo;
            _context = context;
            _stockService = stockService;
            _voucherService = voucherService;  // ✅ ADDED
            _priceService = priceService;
        }

        // 🔥 GET SUPPLIERS - Using Corporate COA structure
        public async Task<List<SupplierDropdownDto>> GetSuppliersAsync(int branchId)
        {
            // ============================================================
            // NEW: Use AccountCategory = 'Supplier' for supplier dropdown
            // ============================================================
            var suppliers = await _context.tblCOA
                .Where(x => x.AccountCategory == "Supplier" &&  // ✅ NEW COA structure
                       x.AcctLast == true &&
                       x.Active == true &&
                       x.BranchID == branchId)
                .Select(x => new SupplierDropdownDto
                {
                    acctID = x.acctID,
                    AcctCode = x.AcctCode ?? string.Empty,
                    AcctName = x.AcctName ?? string.Empty,
                    NTNNo = x.NTNNo,
                    STRNo = x.STRNo
                })
                .OrderBy(x => x.AcctName)
                .ToListAsync();

            Console.WriteLine($"Found {suppliers.Count} suppliers for branch {branchId}");

            // Fallback: If no suppliers found with AccountCategory, try old logic
            if (suppliers.Count == 0)
            {
                suppliers = await _context.tblCOA
                    .Where(x => x.AcctType == "Liability" &&
                           x.AccountCategory == "Supplier" &&  // ✅ Also check this
                           x.AcctLast == true)
                    .Select(x => new SupplierDropdownDto
                    {
                        acctID = x.acctID,
                        AcctCode = x.AcctCode ?? string.Empty,
                        AcctName = x.AcctName ?? string.Empty,
                        NTNNo = x.NTNNo,
                        STRNo = x.STRNo
                    })
                    .OrderBy(x => x.AcctName)
                    .ToListAsync();

                Console.WriteLine($"Fallback: Found {suppliers.Count} suppliers without branch filter");
            }

            return suppliers;
        }

        // 🔥 GET ITEMS - With branch filter
        // 🔥 GET ITEMS - With branch filter AND active price from history
        public async Task<List<ItemDropdownDto>> GetItemsAsync(int branchId)
        {
            var items = await _context.ItemFile
                .Where(x => (x.BranchID == branchId || x.BranchID == null) &&
                       (x.InActive == false || x.InActive == null))
                .Select(x => new ItemDropdownDto
                {
                    ItemID = x.ItemID,
                    ItemName = x.ItemName ?? string.Empty,
                    ModlNumb = x.ModlNumb,
                    // ✅ FIX: Get active purchase price from PriceHistory, fallback to ItemFile
                    PurcRate = _context.ItemPriceHistory
                        .Where(p => p.ItemID == x.ItemID
                               && p.PriceType == "PURCHASE"
                               && p.IsActive
                               && !p.IsDeleted)
                        .Select(p => (decimal?)p.Price)
                        .FirstOrDefault() ?? x.PurcRate ?? 0,
                    // ✅ FIX: Get active sale price from PriceHistory, fallback to ItemFile
                    SaleRate = _context.ItemPriceHistory
                        .Where(p => p.ItemID == x.ItemID
                               && p.PriceType == "SALE"
                               && p.IsActive
                               && !p.IsDeleted)
                        .Select(p => (decimal?)p.Price)
                        .FirstOrDefault() ?? x.SaleRate ?? 0
                })
                .OrderBy(x => x.ItemName)
                .ToListAsync();

            return items;
        }

        // 🔥 CREATE PURCHASE
        public async Task<PurchaseCreateDto> CreateAsync(PurchaseCreateDto dto, int userId)
        {
            Console.WriteLine("=== Purchase Create Started ===");

            // Validate
            if (!dto.IsWalkingCustomer && (!dto.SuppID.HasValue || dto.SuppID.Value <= 0))
                throw new Exception("Please select a supplier or check 'Walking Customer'");

            // Calculate totals
            double totalQty = dto.Items.Sum(x => x.PurcQnty);
            double totalAmt = dto.Items.Sum(x => x.PurcQnty * x.PurcRate);

            var master = new PurcFile
            {
                TranDate = dto.TranDate,
                SuppID = dto.IsWalkingCustomer ? null : dto.SuppID,
                IsWalkingCustomer = dto.IsWalkingCustomer,
                RefrNumb = dto.RefrNumb?.Trim(),
                BranchID = dto.BranchID,
                TranType = dto.TranType?.Trim() ?? "Credit",
                TranMode = dto.TranMode?.Trim(),
                BillNumb = dto.BillNumb?.Trim(),
                TranDesc = dto.TranDesc?.Trim(),
                TotlQnty = totalQty,
                TotlAmnt = totalAmt,
                NetAmnt = totalAmt,
                GodnID = dto.GodownID,
                AddBy = userId,
                AddOn = DateTime.Now
            };

            // ✅ FIXED: Added GodnID
            var details = dto.Items.Select(x => new PurcFild
            {
                ItemID = x.ItemID,
                PurcQnty = x.PurcQnty,
                PurcRate = x.PurcRate,
                PurcAmnt = x.PurcQnty * x.PurcRate,
                GodnID = x.GodownID  // 🔥🔥🔥 ADD THIS LINE
            }).ToList();

            var saved = await _repo.CreateAsync(master, details);
            Console.WriteLine($"Purchase saved with TranNumb: {saved.TranNumb}");

            // Update stock
            await _stockService.PostPurchaseStockAsync(saved.TranNumb);
            Console.WriteLine("Stock updated");

            // Create voucher for this purchase
            Console.WriteLine($"Calling voucher service for Purchase #{saved.TranNumb}...");
            try
            {
                int voucherId = await _voucherService.CreateFromPurchaseAsync(saved.TranNumb, userId, dto.BranchID);
                Console.WriteLine($"✅ Voucher created for Purchase #{saved.TranNumb}. Voucher ID: {voucherId}");
            }
            catch (Exception voucherEx)
            {
                Console.WriteLine($"⚠️ VOUCHER CREATION FAILED for Purchase #{saved.TranNumb}: {voucherEx.Message}");
                Console.WriteLine($"Stack Trace: {voucherEx.StackTrace}");
            }

            return dto;
        }

        // 🔥 UPDATE PURCHASE
        public async Task UpdateAsync(PurchaseUpdateDto dto, int userId)
        {
            if (!dto.IsWalkingCustomer && (!dto.SuppID.HasValue || dto.SuppID.Value <= 0))
                throw new Exception("Please select a supplier");

            await _stockService.ReversePurchaseStockAsync(dto.TranNumb);

            double totalQty = dto.Items.Sum(x => x.PurcQnty);
            double totalAmt = dto.Items.Sum(x => x.PurcQnty * x.PurcRate);

            var master = new PurcFile
            {
                TranNumb = dto.TranNumb,
                TranDate = dto.TranDate,
                SuppID = dto.IsWalkingCustomer ? null : dto.SuppID,
                IsWalkingCustomer = dto.IsWalkingCustomer,
                RefrNumb = dto.RefrNumb,
                BranchID = dto.BranchID,
                TranType = dto.TranType,
                TranMode = dto.TranMode,
                BillNumb = dto.BillNumb,
                TranDesc = dto.TranDesc,
                TotlQnty = totalQty,
                TotlAmnt = totalAmt,
                NetAmnt = totalAmt,
                GodnID = dto.GodownID
            };

            // ✅ FIXED: Added GodnID
            var details = dto.Items.Select(x => new PurcFild
            {
                ItemID = x.ItemID,
                PurcQnty = x.PurcQnty,
                PurcRate = x.PurcRate,
                PurcAmnt = x.PurcQnty * x.PurcRate,
                GodnID = x.GodownID  // 🔥🔥🔥 ADD THIS LINE
            }).ToList();

            await _repo.UpdateAsync(master, details);
            await _stockService.PostPurchaseStockAsync(dto.TranNumb);
        }

        // 🔥 DELETE PURCHASE
        public async Task DeleteAsync(int tranNumb)
        {
            await _stockService.ReversePurchaseStockAsync(tranNumb);
            await _repo.DeleteAsync(tranNumb);
        }

        // 🔥 GET ALL
        public async Task<List<PurchaseListDto>> GetAllAsync(int branchId)
        {
            var purchases = await _repo.GetAllAsync(branchId);
            var result = new List<PurchaseListDto>();

            foreach (var purchase in purchases)
            {
                var items = await _context.PurcFild
                    .Where(x => x.TranNumb == purchase.TranNumb)
                    .Include(x => x.Item)
                    .ToListAsync();

                result.Add(new PurchaseListDto
                {
                    TranNumb = purchase.TranNumb,
                    BillNumb = purchase.BillNumb ?? string.Empty,
                    TranDate = purchase.TranDate,
                    NetAmnt = purchase.NetAmnt,
                    TranType = purchase.TranType ?? "Credit",
                    SupplierName = purchase.IsWalkingCustomer == true ?
                        "Walking Customer" :
                        purchase.Supplier?.AcctName ?? "Unknown",
                    BranchName = await GetBranchNameAsync(purchase.BranchID ?? 0),
                    ItemCount = items.Count,
                    TotalQuantity = items.Sum(x => x.PurcQnty),
                    Items = items.Select(x => new PurchaseItemSummaryDto
                    {
                        ItemID = x.ItemID,
                        ItemName = x.Item?.ItemName ?? $"Item {x.ItemID}",
                        Quantity = x.PurcQnty,
                        Rate = x.PurcRate,
                        Amount = x.PurcAmnt
                    }).ToList()
                });
            }

            return result;
        }

        // 🔥 GET BY ID
        public async Task<PurchaseUpdateDto?> GetByIdAsync(int tranNumb)
        {
            var purchase = await _repo.GetByIdAsync(tranNumb);
            if (purchase == null)
                return null;

            // ✅ FIXED: Added GodownID
            var items = await _context.PurcFild
                .Where(x => x.TranNumb == tranNumb)
                .Select(x => new PurchaseItemDto
                {
                    ItemID = x.ItemID,
                    PurcQnty = x.PurcQnty,
                    PurcRate = x.PurcRate,
                    GodownID = x.GodnID  // 🔥🔥🔥 ADD THIS LINE
                }).ToListAsync();

            return new PurchaseUpdateDto
            {
                TranNumb = purchase.TranNumb,
                TranDate = purchase.TranDate ?? DateTime.Now,
                SuppID = purchase.SuppID,
                IsWalkingCustomer = purchase.IsWalkingCustomer ?? false,
                RefrNumb = purchase.RefrNumb,
                BranchID = purchase.BranchID ?? 0,
                TranType = purchase.TranType ?? "Credit",
                TranMode = purchase.TranMode,
                BillNumb = purchase.BillNumb,
                TranDesc = purchase.TranDesc,
                GodownID = purchase.GodnID,
                Items = items
            };
        }

        public async Task<string> GenerateNextBillAsync(int branchId)
        {
            return await _repo.GenerateBillNumberAsync(branchId);
        }

        private async Task<string> GetBranchNameAsync(int branchId)
        {
            var branch = await _context.Branches
                .Where(x => x.BranchID == branchId)
                .Select(x => x.BranchName)
                .FirstOrDefaultAsync();

            return branch ?? $"Branch {branchId}";
        }

        public decimal GetItemPurchaseRate(int itemId)
        {
            // Try to get active price from history first
            var activePrice = _priceService.GetCurrentPrice(itemId, "PURCHASE");
            return activePrice ?? 0;
        }
    }
}