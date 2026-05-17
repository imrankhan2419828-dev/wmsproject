using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WMS.Api.Data;
using WMS.Api.DTOs.SaleReturns;
using WMS.Api.Models;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class SaleReturnService : ISaleReturnService
    {
        private readonly WmsDbContext _context;
        private readonly IStockService _stockService;
        private readonly IVoucherService _voucherService;

        public SaleReturnService(WmsDbContext context, IStockService stockService, IVoucherService voucherService)
        {
            _context = context;
            _stockService = stockService;
            _voucherService = voucherService;
        }

        // 🔥 Generate Return Bill Number (Branch-wise)
        public async Task<string> GenerateReturnBillNumberAsync(int branchId)
        {
            var year = DateTime.Now.Year;
            var month = DateTime.Now.ToString("MM");
            var branchCode = $"BR{branchId:D3}";
            var pattern = $"{branchCode}/SR/{year}{month}/";

            var lastBill = await _context.SaleReturnFiles
                .Where(x => x.BillNumb != null && x.BillNumb.StartsWith(pattern))
                .OrderByDescending(x => x.BillNumb)
                .Select(x => x.BillNumb)
                .FirstOrDefaultAsync();

            int nextSequence = 1;

            if (!string.IsNullOrEmpty(lastBill))
            {
                var parts = lastBill.Split('/');
                var lastPart = parts[parts.Length - 1];
                if (int.TryParse(lastPart, out int lastSeq))
                {
                    nextSequence = lastSeq + 1;
                }
            }

            return $"{branchCode}/SR/{year}{month}/{nextSequence:D5}";
        }

        // 🔥 Get Open Sales (for dropdown)
        public async Task<List<SalesForReturnDto>> GetOpenSalesAsync(int branchId)
        {
            var openSales = await _context.SaleFiles
                .Where(s => s.BranchID == branchId && (s.CancStat == null || s.CancStat == false))
                .OrderByDescending(s => s.TranNumb)
                .Select(s => new SalesForReturnDto
                {
                    TranNumb = s.TranNumb,
                    CustID = s.CustID,
                    CustName = s.CustName ?? "Cash Customer",
                    BillNumb = s.BillNumb ?? $"SA{s.TranNumb:D8}",
                    TotlQnty = s.TotlQnty ?? 0,
                    TotlAmnt = s.TotlAmnt ?? 0
                })
                .ToListAsync();

            return openSales;
        }

        // 🔥 Get Sale Items for Return
        public async Task<SaleReturnCreateDto> GetSaleItemsForReturnAsync(int saleTranNumb, int branchId)
        {
            var sale = await _context.SaleFiles
                .Where(s => s.TranNumb == saleTranNumb && s.BranchID == branchId && (s.CancStat == null || s.CancStat == false))
                .Select(s => new
                {
                    s.TranNumb,
                    s.TranDate,
                    s.CustID,
                    s.CustName,
                    Items = s.SaleFilds.Select(f => new
                    {
                        f.ItemID,
                        f.SaleQnty,
                        f.SaleRate,
                        GodownID = f.GodnID
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (sale == null)
                throw new Exception("Sale not found or cancelled.");

            // Get already returned quantities
            var alreadyReturned = await _context.SaleReturnItems
                .Include(x => x.SaleReturnFile)
                .Where(x => x.SaleTranNumb == saleTranNumb && !x.SaleReturnFile.CancStat)
                .GroupBy(x => x.ItemID)
                .Select(g => new
                {
                    ItemID = g.Key,
                    ReturnedQty = g.Sum(x => x.ReturnQnty)
                })
                .ToListAsync();

            // Get current stock for each item
            var items = new List<SaleReturnItemCreateDto>();

            foreach (var f in sale.Items)
            {
                var returned = alreadyReturned.FirstOrDefault(x => x.ItemID == f.ItemID)?.ReturnedQty ?? 0;
                decimal soldQty = f.SaleQnty.HasValue ? (decimal)f.SaleQnty.Value : 0;
                decimal availableQty = soldQty - returned;

                var currentStock = _stockService.GetCurrentStock(f.ItemID ?? 0, branchId);

                var itemName = await _context.ItemFile
                    .Where(i => i.ItemID == f.ItemID)
                    .Select(i => i.ItemName)
                    .FirstOrDefaultAsync();

                if (availableQty > 0)
                {
                    items.Add(new SaleReturnItemCreateDto
                    {
                        ItemID = f.ItemID ?? 0,
                        ItemName = itemName ?? $"Item {f.ItemID}",
                        SoldQnty = soldQty,
                        ReturnQnty = 0,
                        Rate = f.SaleRate.HasValue ? (decimal)f.SaleRate.Value : 0,
                        CurrentStock = (decimal)currentStock,
                        GodownID = f.GodownID
                    });
                }
            }

            if (!items.Any())
                throw new Exception("This sale bill is already fully returned.");

            return new SaleReturnCreateDto
            {
                SaleTranNumb = sale.TranNumb,
                TranDate = sale.TranDate ?? DateTime.Now,
                CustID = sale.CustID,
                CustName = sale.CustName,
                Items = items
            };
        }

        // 🔥 Get Return by ID
        public async Task<SaleReturnCreateDto?> GetReturnByTranNumbAsync(int returnTranNumb, int branchId)
        {
            var ret = await _context.SaleReturnFiles
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.ReturnTranNumb == returnTranNumb && x.BranchID == branchId && !x.CancStat);

            if (ret == null) return null;

            var items = new List<SaleReturnItemCreateDto>();
            foreach (var item in ret.Items)
            {
                var itemName = await _context.ItemFile
                    .Where(i => i.ItemID == item.ItemID)
                    .Select(i => i.ItemName)
                    .FirstOrDefaultAsync();

                items.Add(new SaleReturnItemCreateDto
                {
                    ItemID = item.ItemID,
                    ItemName = itemName ?? $"Item {item.ItemID}",
                    SoldQnty = item.SoldQnty,
                    ReturnQnty = item.ReturnQnty,
                    Rate = item.Rate,
                    CurrentStock = 0,
                    GodownID = item.GodownID
                });
            }

            return new SaleReturnCreateDto
            {
                ReturnTranNumb = ret.ReturnTranNumb,
                SaleTranNumb = ret.SaleTranNumb,
                TranDate = ret.TranDate ?? DateTime.Now,
                CustID = ret.CustID,
                CustName = ret.CustName,
                WalkingCustomer = ret.WalkingCustomer,
                ReturnRefNumb = ret.ReturnRefNumb,
                BillNumb = ret.BillNumb,
                Items = items
            };
        }

        // 🔥 GET ALL
        public async Task<List<SaleReturnListDto>> GetAllReturnsAsync(int branchId)
        {
            var returns = await _context.SaleReturnFiles
                .Where(x => x.BranchID == branchId && !x.CancStat)
                .OrderByDescending(x => x.ReturnTranNumb)
                .Select(x => new SaleReturnListDto
                {
                    ReturnTranNumb = x.ReturnTranNumb,
                    SaleTranNumb = x.SaleTranNumb,
                    BillNumb = x.BillNumb,
                    TranDate = x.TranDate,
                    CustName = !string.IsNullOrEmpty(x.WalkingCustomer)
                        ? x.WalkingCustomer
                        : (!string.IsNullOrEmpty(x.CustName) ? x.CustName : "Cash Customer"),
                    WalkingCustomer = x.WalkingCustomer,
                    TotlQnty = x.TotlQnty,
                    TotlAmnt = x.TotlAmnt
                }).ToListAsync();

            return returns;
        }

        // 🔥 CREATE
        public async Task<int> CreateReturnAsync(SaleReturnCreateDto dto, int userId, int branchId)
        {
            using var tx = await _context.Database.BeginTransactionAsync();

            try
            {
                // Validate stock before creating
                foreach (var item in dto.Items.Where(i => i.ReturnQnty > 0))
                {
                    var currentStock = _stockService.GetCurrentStock(item.ItemID, branchId);
                    if (currentStock < (double)item.ReturnQnty)
                    {
                        var itemName = await _context.ItemFile
                            .Where(x => x.ItemID == item.ItemID)
                            .Select(x => x.ItemName)
                            .FirstOrDefaultAsync();
                        throw new Exception($"Insufficient stock for {itemName}. Available: {currentStock}, Requested: {item.ReturnQnty}");
                    }
                }

                // Handle edit mode - reverse old return
                if (dto.ReturnTranNumb.HasValue)
                {
                    var oldReturn = await _context.SaleReturnFiles
                        .FirstOrDefaultAsync(x => x.ReturnTranNumb == dto.ReturnTranNumb.Value && !x.CancStat);
                    if (oldReturn != null)
                    {
                        await _stockService.ReverseSaleReturnStockAsync(dto.ReturnTranNumb.Value);
                        oldReturn.CancStat = true;
                    }
                }

                // Calculate totals
                var totlQty = dto.Items.Sum(i => i.ReturnQnty);
                var totlAmnt = dto.Items.Sum(i => i.ReturnQnty * i.Rate);

                // Generate return bill number
                var returnBillNo = await GenerateReturnBillNumberAsync(branchId);

                var ret = new SaleReturnFile
                {
                    SaleTranNumb = dto.SaleTranNumb,
                    TranDate = dto.TranDate,
                    CustID = dto.CustID,
                    CustName = dto.CustName,
                    WalkingCustomer = dto.WalkingCustomer,
                    ReturnRefNumb = dto.ReturnRefNumb,
                    BillNumb = returnBillNo,
                    BranchID = branchId,
                    AddBy = userId,
                    AddOn = DateTime.Now,
                    CancStat = false,
                    TotlQnty = totlQty,
                    TotlAmnt = totlAmnt,
                    Items = dto.Items.Where(i => i.ReturnQnty > 0).Select(item => new SaleReturnItem
                    {
                        SaleTranNumb = dto.SaleTranNumb,
                        ItemID = item.ItemID,
                        SoldQnty = item.SoldQnty,
                        ReturnQnty = item.ReturnQnty,
                        Rate = item.Rate,
                        Amount = item.ReturnQnty * item.Rate,
                        GodownID = item.GodownID
                    }).ToList()
                };

                _context.SaleReturnFiles.Add(ret);
                await _context.SaveChangesAsync();

                // Update stock
                await _stockService.PostSaleReturnStockAsync(ret.ReturnTranNumb);

                // ✅ Create voucher for this sale return
                try
                {
                    int voucherId = await _voucherService.CreateFromSaleReturnAsync(ret.ReturnTranNumb, userId, branchId);
                    Console.WriteLine($"✅ Voucher created for Sale Return #{ret.ReturnTranNumb}. Voucher ID: {voucherId}");
                }
                catch (Exception voucherEx)
                {
                    Console.WriteLine($"⚠️ VOUCHER CREATION FAILED for Sale Return #{ret.ReturnTranNumb}: {voucherEx.Message}");
                }

                await tx.CommitAsync();
                return ret.ReturnTranNumb;
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        // 🔥 DELETE
        public async Task<bool> DeleteReturnAsync(int returnTranNumb, int branchId)
        {
            var ret = await _context.SaleReturnFiles
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.ReturnTranNumb == returnTranNumb && x.BranchID == branchId);

            if (ret == null) return false;

            await _stockService.ReverseSaleReturnStockAsync(returnTranNumb);
            ret.CancStat = true;
            await _context.SaveChangesAsync();

            return true;
        }
    }
}