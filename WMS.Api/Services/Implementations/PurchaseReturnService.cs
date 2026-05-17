using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WMS.Api.Data;
using WMS.Api.DTOs.PurchaseReturn;
using WMS.Api.Models;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class PurchaseReturnService : IPurchaseReturnService
    {
        private readonly WmsDbContext _db;
        private readonly IStockService _stockService;
        private readonly IVoucherService _voucherService;  // ✅ ADDED

        // ✅ UPDATE CONSTRUCTOR
        public PurchaseReturnService(WmsDbContext db, IStockService stockService, IVoucherService voucherService)
        {
            _db = db;
            _stockService = stockService;
            _voucherService = voucherService;  // ✅ ADDED
        }

        // 🔥 Generate Return Bill Number (Branch-wise)
        public async Task<string> GenerateReturnBillNumberAsync(int branchId)
        {
            var year = DateTime.Now.Year;
            var month = DateTime.Now.ToString("MM");
            var branchCode = $"BR{branchId:D3}";
            var pattern = $"{branchCode}/PR/{year}{month}/";

            var existingBills = await _db.PurchaseReturn
                .Where(x => x.BillNumb != null && x.BillNumb.StartsWith(pattern))
                .Select(x => x.BillNumb)
                .ToListAsync();

            int maxSequence = 0;

            foreach (var bill in existingBills)
            {
                var parts = bill.Split('/');
                var lastPart = parts[parts.Length - 1];
                if (int.TryParse(lastPart, out int seq))
                {
                    if (seq > maxSequence)
                        maxSequence = seq;
                }
            }

            int nextSequence = maxSequence + 1;
            var nextBillNo = $"{branchCode}/PR/{year}{month}/{nextSequence:D5}";

            Console.WriteLine($"=== BILL NUMBER GENERATION ===");
            Console.WriteLine($"Generated bill number: {nextBillNo}");

            return nextBillNo;
        }

        // 🔥 Get Open Purchases (for dropdown)
        public async Task<List<PurchaseReturnPurchaseDto>> GetOpenPurchases(int branchId)
        {
            var openPurchases = await _db.PurcFile
                .Where(p => p.BranchID == branchId && !p.IsDeleted)
                .OrderByDescending(p => p.TranNumb)
                .Select(p => new PurchaseReturnPurchaseDto
                {
                    PurchaseTranNumb = p.TranNumb,
                    BillNumb = p.BillNumb ?? "",
                    TranDate = p.TranDate ?? DateTime.Now,
                    SuppID = p.SuppID ?? 0
                })
                .ToListAsync();

            foreach (var purchase in openPurchases)
            {
                var supplier = await _db.tblCOA
                    .Where(x => x.acctID == purchase.SuppID)
                    .Select(x => x.AcctName)
                    .FirstOrDefaultAsync();
                purchase.SupplierName = supplier ?? "Unknown";
            }

            return openPurchases;
        }

        // 🔥 Get Purchase Items for Return (with remaining qty and stock)
        // 🔥 Get Purchase Items for Return (with remaining qty and stock)
        public async Task<PurchaseReturnDto> GetPurchaseItemsForReturn(int tranNumb, int branchId)
        {
            var purchase = await _db.PurcFile
                .FirstOrDefaultAsync(p => p.TranNumb == tranNumb && p.BranchID == branchId && !p.IsDeleted);

            if (purchase == null)
                return null;

            // Get purchase items with item details
            var purchaseItems = await _db.PurcFild
                .Where(d => d.TranNumb == tranNumb)
                .Join(_db.ItemFile,
                    d => d.ItemID,
                    i => i.ItemID,
                    (d, i) => new
                    {
                        d.ItemID,
                        i.ItemName,
                        PurcQnty = d.PurcQnty,
                        PurcRate = d.PurcRate,
                        GodnID = d.GodnID
                    })
                .ToListAsync();

            // ============================================================
            // FIX #1: Calculate total Purchase Return quantities
            // ============================================================
            var returnedQty = await _db.PurchaseReturnItems
                .Include(r => r.PurchaseReturn)
                .Where(r => r.PurchaseReturn.PurchaseTranNumb == tranNumb &&
                            r.PurchaseReturn.BranchID == branchId)
                .GroupBy(r => r.ItemID)
                .Select(g => new
                {
                    ItemID = g.Key,
                    ReturnedQty = g.Sum(x => x.ReturnQty)
                })
                .ToListAsync();

            // ============================================================
            // FIX #2: Calculate Sale quantities for this purchase
            // ============================================================
                            var soldQty = await _db.SaleFilds
                     .Include(s => s.SaleFile)
                     .Where(s => s.SaleFile.BranchID == branchId && s.SaleFile.CancStat != true)
                     .GroupBy(s => s.ItemID)
                     .Select(g => new
                     {
                         ItemID = g.Key,
                         SoldQty = g.Sum(x => x.SaleQnty)
                     })
                     .ToListAsync();

            var items = new List<PurchaseReturnItemDto>();

            foreach (var p in purchaseItems)
            {
                var returned = returnedQty
                    .FirstOrDefault(r => r.ItemID == p.ItemID)?.ReturnedQty ?? 0;

                var sold = soldQty
                    .FirstOrDefault(s => s.ItemID == p.ItemID)?.SoldQty ?? 0;

                decimal purchasedQtyDecimal = (decimal)p.PurcQnty;

                // ============================================================
                // FIX #3: Available = Purchased - (Returned + Sold)
                // ============================================================
                //var availableQty = purchasedQtyDecimal - ((decimal)returned + (decimal)sold);
                var availableQty = purchasedQtyDecimal - (decimal)returned;
                // Purchased qty always stays same (original purchase qty)
                var displayPurchasedQty = purchasedQtyDecimal;

                var currentStock = _stockService.GetCurrentStock(p.ItemID, branchId);
                decimal currentStockDecimal = (decimal)currentStock;

                // Only show items that still have available quantity
                if (availableQty > 0)
                {
                    items.Add(new PurchaseReturnItemDto
                    {
                        ItemID = p.ItemID,
                        ItemName = p.ItemName ?? $"Item {p.ItemID}",
                        PurchasedQty = displayPurchasedQty,  // ✅ Always original purchase qty
                        PurcRate = (decimal)p.PurcRate,
                        ReturnQty = 0,
                        AvailableQty = availableQty,         // ✅ Dynamic: decreases with each return/sale
                        CurrentStock = currentStockDecimal,
                        GodownID = p.GodnID
                    });
                }
            }

            // Get supplier from COA (NOT hardcoded)
            var supplier = await _db.tblCOA
                .Where(x => x.acctID == purchase.SuppID)
                .Select(x => x.AcctName)
                .FirstOrDefaultAsync();

            return new PurchaseReturnDto
            {
                PurchaseTranNumb = purchase.TranNumb,
                PurchaseBillNumb = purchase.BillNumb,
                SuppID = purchase.SuppID,
                SupplierName = supplier ?? "Unknown",
                TranDate = purchase.TranDate ?? DateTime.Now,
                TranDesc = purchase.TranDesc,
                Items = items
            };
        }

        // 🔥 CREATE
        // 🔥 CREATE
        public async Task<PurchaseReturnDto> CreateAsync(PurchaseReturnDto dto, int userId, int branchId)
        {
            using var transaction = await _db.Database.BeginTransactionAsync();

            try
            {
                // Validate stock
                foreach (var item in dto.Items.Where(i => i.ReturnQty > 0))
                {
                    var currentStock = _stockService.GetCurrentStock(item.ItemID, branchId);
                    if (currentStock < (double)item.ReturnQty)
                    {
                        var itemName = await _db.ItemFile
                            .Where(x => x.ItemID == item.ItemID)
                            .Select(x => x.ItemName)
                            .FirstOrDefaultAsync();
                        throw new Exception($"Insufficient stock for {itemName}. Available: {currentStock}");
                    }
                }

                var returnBillNo = await GenerateReturnBillNumberAsync(branchId);
                Console.WriteLine($"Creating new return with bill number: {returnBillNo}");

                var entity = new PurchaseReturn
                {
                    BranchID = branchId,
                    TranDate = dto.TranDate,
                    SuppID = dto.SuppID ?? 0,
                    PurchaseTranNumb = dto.PurchaseTranNumb,
                    TranDesc = dto.TranDesc,
                    BillNumb = returnBillNo,
                    ReturnRefNumb = dto.ReturnRefNumb,
                    AddBy = userId,
                    AddOn = DateTime.Now,
                    Items = dto.Items.Where(i => i.ReturnQty > 0).Select(x => new PurchaseReturnItem
                    {
                        ItemID = x.ItemID,
                        PurchasedQty = x.PurchasedQty,
                        ReturnQty = x.ReturnQty,
                        PurcRate = x.PurcRate,
                        GodownID = x.GodownID
                    }).ToList()
                };

                _db.PurchaseReturn.Add(entity);
                await _db.SaveChangesAsync();

                // ✅ POST STOCK (YEH LINE MISSING THI!)
                _stockService.PostPurchaseReturnStock(entity.ReturnID);
                Console.WriteLine($"✅ Stock updated for Purchase Return #{entity.ReturnID}");

                await transaction.CommitAsync();

                // ✅ Create voucher for this purchase return
                try
                {
                    int voucherId = await _voucherService.CreateFromPurchaseReturnAsync(entity.ReturnID, userId, branchId);
                    Console.WriteLine($"✅ Voucher created for Purchase Return #{entity.ReturnID}. Voucher ID: {voucherId}");
                }
                catch (Exception voucherEx)
                {
                    Console.WriteLine($"⚠️ VOUCHER CREATION FAILED for Purchase Return #{entity.ReturnID}: {voucherEx.Message}");
                }

                return await GetByIdAsync(entity.ReturnID, branchId);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception($"Creation failed: {ex.Message}");
            }
        }

        // 🔥 GET ALL
        public async Task<List<PurchaseReturnDto>> GetAllAsync(int branchId)
        {
            var data = await _db.PurchaseReturn
                .Where(x => x.BranchID == branchId)
                .Include(x => x.Items)
                .Include(x => x.Supplier)
                .OrderByDescending(x => x.ReturnID)
                .ToListAsync();

            var result = new List<PurchaseReturnDto>();
            foreach (var entity in data)
            {
                result.Add(await MapToDto(entity));
            }
            return result;
        }

        // 🔥 GET BY ID
        public async Task<PurchaseReturnDto> GetByIdAsync(int returnId, int branchId)
        {
            var entity = await _db.PurchaseReturn
                .Include(x => x.Items)
                .Include(x => x.Supplier)
                .FirstOrDefaultAsync(x => x.ReturnID == returnId && x.BranchID == branchId);

            return entity == null ? null : await MapToDto(entity);
        }

        // 🔥 UPDATE
        public async Task<PurchaseReturnDto> UpdateAsync(int returnId, PurchaseReturnDto dto, int userId, int branchId)
        {
            using var transaction = await _db.Database.BeginTransactionAsync();

            try
            {
                var entity = await _db.PurchaseReturn
                    .Include(x => x.Items)
                    .FirstOrDefaultAsync(x => x.ReturnID == returnId && x.BranchID == branchId);

                if (entity == null) return null;

                // Reverse old stock
                foreach (var old in entity.Items)
                {
                    _stockService.ReversePurchaseReturnStock(returnId);
                }

                // Update entity
                entity.TranDate = dto.TranDate;
                entity.TranDesc = dto.TranDesc;
                entity.ReturnRefNumb = dto.ReturnRefNumb;

                // Remove old items
                _db.PurchaseReturnItems.RemoveRange(entity.Items);
                await _db.SaveChangesAsync();

                // Add new items
                var newItems = dto.Items.Where(i => i.ReturnQty > 0).Select(x => new PurchaseReturnItem
                {
                    ReturnID = returnId,
                    ItemID = x.ItemID,
                    PurchasedQty = x.PurchasedQty,
                    ReturnQty = x.ReturnQty,
                    PurcRate = x.PurcRate,
                    GodownID = x.GodownID

                }).ToList();

                await _db.PurchaseReturnItems.AddRangeAsync(newItems);
                await _db.SaveChangesAsync();

                // Post new stock
                foreach (var item in newItems)
                {
                    _stockService.PostPurchaseReturnStock(returnId);
                }

                await transaction.CommitAsync();
                return await GetByIdAsync(returnId, branchId);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception($"Update failed: {ex.Message}");
            }
        }

        // 🔥 DELETE
        public async Task<bool> DeleteAsync(int returnId, int branchId)
        {
            using var transaction = await _db.Database.BeginTransactionAsync();

            try
            {
                var entity = await _db.PurchaseReturn
                    .Include(x => x.Items)
                    .FirstOrDefaultAsync(x => x.ReturnID == returnId && x.BranchID == branchId);

                if (entity == null) return false;

                // Reverse stock
                foreach (var item in entity.Items)
                {
                    _stockService.ReversePurchaseReturnStock(returnId);
                }

                _db.PurchaseReturnItems.RemoveRange(entity.Items);
                _db.PurchaseReturn.Remove(entity);
                await _db.SaveChangesAsync();

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception($"Delete failed: {ex.Message}");
            }
        }

        // 🔥 Helper: Map to DTO
        private async Task<PurchaseReturnDto> MapToDto(PurchaseReturn entity)
        {
            var items = new List<PurchaseReturnItemDto>();
            foreach (var item in entity.Items)
            {
                var itemName = await _db.ItemFile
                    .Where(x => x.ItemID == item.ItemID)
                    .Select(x => x.ItemName)
                    .FirstOrDefaultAsync();

                items.Add(new PurchaseReturnItemDto
                {
                    ItemID = item.ItemID,
                    ItemName = itemName ?? "Unknown",
                    PurchasedQty = item.PurchasedQty,
                    ReturnQty = item.ReturnQty,
                    PurcRate = item.PurcRate,
                    CurrentStock = 0,
                    GodownID = item.GodownID
                });
            }

            return new PurchaseReturnDto
            {
                ReturnID = entity.ReturnID,
                PurchaseTranNumb = entity.PurchaseTranNumb,
                TranDate = entity.TranDate,
                TranDesc = entity.TranDesc,
                BillNumb = entity.BillNumb,
                ReturnRefNumb = entity.ReturnRefNumb,
                SuppID = entity.SuppID,
                SupplierName = entity.Supplier?.AcctName ?? "Unknown",
                Items = items
            };
        }
    }
}