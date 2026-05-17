using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using WMS.Api.Data;
using WMS.Api.Models;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class StockService : IStockService
    {
        private readonly WmsDbContext _context;

        public StockService(WmsDbContext context)
        {
            _context = context;
        }

        // ============================
        // POST STOCK (ON PURCHASE SAVE)
        // ============================
        public void PostPurchaseStock(int tranNumb)
        {
            try
            {
                var purchase = _context.PurcFile
                    .FirstOrDefault(x => x.TranNumb == tranNumb);

                if (purchase == null || purchase.BranchID == null)
                    return;

                var items = _context.PurcFild
                    .Where(x => x.TranNumb == tranNumb)
                    .ToList();

                foreach (var i in items)
                {
                    _context.ItemStock.Add(new ItemStock
                    {
                        TranType = "PURCHASE",
                        TranNumb = tranNumb,
                        ItemID = i.ItemID,
                        BranchID = purchase.BranchID.Value,
                        InQty = i.PurcQnty,
                        OutQty = 0,
                        Rate = i.PurcRate,
                        TranDate = purchase.TranDate ?? DateTime.Now,
                        Remarks = $"Purchase Bill {purchase.BillNumb}"
                    });
                }

                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error posting purchase stock: {ex.Message}", ex);
            }
        }

        // ============================
        // REVERSE STOCK (UPDATE / DELETE)
        // ============================
        public void ReversePurchaseStock(int tranNumb)
        {
            try
            {
                var rows = _context.ItemStock
                    .Where(x => x.TranType == "PURCHASE" && x.TranNumb == tranNumb)
                    .ToList();

                if (!rows.Any())
                    return;

                _context.ItemStock.RemoveRange(rows);
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error reversing purchase stock: {ex.Message}", ex);
            }
        }

        // ============================
        // POST PURCHASE RETURN STOCK
        // ============================
        public void PostPurchaseReturnStock(int returnID)
        {
            try
            {
                var ret = _context.PurchaseReturn
                    .Include(x => x.Items)
                    .FirstOrDefault(x => x.ReturnID == returnID);

                if (ret == null) return;

                foreach (var item in ret.Items)
                {
                    double availableQty = _context.ItemStock
                        .Where(s => s.ItemID == item.ItemID && s.BranchID == ret.BranchID)
                        .Sum(s => s.InQty - s.OutQty);

                    double requestQty = (double)item.ReturnQty;

                    if (availableQty < requestQty)
                        throw new Exception($"Stock insufficient for ItemID {item.ItemID}. Available: {availableQty}, Requested: {requestQty}");

                    _context.ItemStock.Add(new ItemStock
                    {
                        TranType = "PURCHASE_RETURN",
                        TranNumb = ret.ReturnID,
                        ItemID = item.ItemID,
                        BranchID = ret.BranchID,
                        InQty = 0,
                        OutQty = (double)item.ReturnQty,
                        Rate = (double)item.PurcRate,
                        TranDate = DateTime.Now,
                        Remarks = $"Purchase Return {ret.BillNumb}"
                    });
                }

                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error posting purchase return stock: {ex.Message}", ex);
            }
        }

        // ============================
        // REVERSE PURCHASE RETURN STOCK
        // ============================
        public void ReversePurchaseReturnStock(int returnID)
        {
            try
            {
                var rows = _context.ItemStock
                    .Where(x => x.TranType == "PURCHASE_RETURN" && x.TranNumb == returnID)
                    .ToList();

                if (rows.Any())
                {
                    _context.ItemStock.RemoveRange(rows);
                    _context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Error reversing purchase return stock: {ex.Message}", ex);
            }
        }

        // ============================
        // POST SALE STOCK
        // ============================
        public void PostSaleStock(int tranNumb)
        {
            try
            {
                var sale = _context.SaleFiles
                    .FirstOrDefault(x => x.TranNumb == tranNumb && x.CancStat != true);

                if (sale == null)
                    throw new Exception("Sale not found");

                if (sale.BranchID == null)
                    throw new Exception("Branch not found in sale");

                var items = _context.SaleFilds
                    .Where(x => x.TranNumb == tranNumb)
                    .ToList();

                foreach (var i in items)
                {
                    if (i.ItemID == null)
                        throw new Exception("Item missing in sale detail");

                    // Stock check
                    double availableQty = _context.ItemStock
                        .Where(s =>
                            s.ItemID == i.ItemID.Value &&
                            s.BranchID == sale.BranchID.Value
                        )
                        .Sum(s => s.InQty - s.OutQty);

                    if (availableQty < (double)i.SaleQnty)
                        throw new Exception($"Stock insufficient for ItemID {i.ItemID}. Available: {availableQty}, Requested: {i.SaleQnty}");

                    _context.ItemStock.Add(new ItemStock
                    {
                        TranType = "SALE",
                        TranNumb = tranNumb,
                        ItemID = i.ItemID.Value,
                        BranchID = sale.BranchID.Value,
                        InQty = 0,
                        OutQty = (double)i.SaleQnty,
                        Rate = (double)i.SaleRate,
                        TranDate = sale.TranDate ?? DateTime.Now,
                        Remarks = $"Sale Bill {sale.BillNumb}"
                    });
                }

                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error posting sale stock: {ex.Message}", ex);
            }
        }

        // ============================
        // REVERSE SALE STOCK
        // ============================
        public void ReverseSaleStock(int tranNumb)
        {
            try
            {
                var rows = _context.ItemStock
                    .Where(x => x.TranType == "SALE" && x.TranNumb == tranNumb)
                    .ToList();

                if (rows.Any())
                {
                    _context.ItemStock.RemoveRange(rows);
                    _context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Error reversing sale stock: {ex.Message}", ex);
            }
        }

        // ============================
        // POST SALE RETURN STOCK
        // ============================
        public void PostSaleReturnStock(int returnTranNumb)
        {
            try
            {
                var ret = _context.SaleReturnFiles
                    .FirstOrDefault(x => x.ReturnTranNumb == returnTranNumb && x.CancStat != true);

                if (ret == null)
                    throw new Exception("Sale return not found");

                var items = _context.SaleReturnItems
                    .Where(x => x.ReturnTranNumb == returnTranNumb)
                    .ToList();

                foreach (var i in items)
                {
                    _context.ItemStock.Add(new ItemStock
                    {
                        TranType = "SALE_RETURN",
                        TranNumb = returnTranNumb,
                        ItemID = i.ItemID,
                        BranchID = ret.BranchID,
                        InQty = (double)i.ReturnQnty,   // Stock plus
                        OutQty = 0,
                        Rate = (double)i.Rate,
                        TranDate = ret.TranDate ?? DateTime.Now,
                        Remarks = $"Sale Return #{returnTranNumb}"
                    });
                }

                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error posting sale return stock: {ex.Message}", ex);
            }
        }

        // ============================
        // REVERSE SALE RETURN STOCK
        // ============================
        public void ReverseSaleReturnStock(int returnTranNumb)
        {
            try
            {
                var rows = _context.ItemStock
                    .Where(x => x.TranType == "SALE_RETURN" && x.TranNumb == returnTranNumb)
                    .ToList();

                if (rows.Any())
                {
                    _context.ItemStock.RemoveRange(rows);
                    _context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Error reversing sale return stock: {ex.Message}", ex);
            }
        }

        // ============================
        // GET CURRENT STOCK
        // ============================
        public double GetCurrentStock(int itemId, int branchId)
        {
            try
            {
                return _context.ItemStock
                    .Where(x => x.ItemID == itemId && x.BranchID == branchId)
                    .Sum(x => x.InQty - x.OutQty);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting current stock: {ex.Message}", ex);
            }
        }

        // ============================
        // 🔥 ASYNC WRAPPER METHODS (ADD THESE)
        // ============================

        public async Task PostPurchaseStockAsync(int tranNumb)
        {
            await Task.Run(() => PostPurchaseStock(tranNumb));
        }

        public async Task ReversePurchaseStockAsync(int tranNumb)
        {
            await Task.Run(() => ReversePurchaseStock(tranNumb));
        }


        // ============================
        // 🔥 SALE STOCK ASYNC METHODS
        // ============================

        public async Task PostSaleStockAsync(int tranNumb)
        {
            await Task.Run(() => PostSaleStock(tranNumb));
        }

        public async Task ReverseSaleStockAsync(int tranNumb)
        {
            await Task.Run(() => ReverseSaleStock(tranNumb));
        }


        // ============================
        // 🔥 SALE RETURN STOCK ASYNC METHODS
        // ============================

        public async Task PostSaleReturnStockAsync(int returnTranNumb)
        {
            await Task.Run(() => PostSaleReturnStock(returnTranNumb));
        }

        public async Task ReverseSaleReturnStockAsync(int returnTranNumb)
        {
            await Task.Run(() => ReverseSaleReturnStock(returnTranNumb));
        }
    }
}