using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Sales;
using WMS.Api.Models;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class SaleService : ISaleService
    {
        private readonly WmsDbContext _context;
        private readonly IStockService _stockService;
        private readonly IVoucherService _voucherService;  // ✅ ADDED
        private readonly IPriceHistoryService _priceService;
        // ✅ UPDATE CONSTRUCTOR
        public SaleService(WmsDbContext context, IStockService stockService, IVoucherService voucherService, IPriceHistoryService priceService)
        {
            _context = context;
            _stockService = stockService;
            _voucherService = voucherService;  // ✅ ADDED
            _priceService = priceService;
        }

        // 🔥 Generate Branch-wise Invoice Number
        private async Task<string> GenerateInvoiceNumberAsync(int branchId)
        {
            var year = DateTime.Now.Year;
            var month = DateTime.Now.ToString("MM");
            var branchCode = $"BR{branchId:D3}";

            var lastInvoice = await _context.SaleFiles
                .Where(x => x.BillNumb != null && x.BillNumb.Contains($"{branchCode}/SALE/{year}{month}"))
                .OrderByDescending(x => x.TranNumb)
                .FirstOrDefaultAsync();

            int sequence = 1;
            if (lastInvoice?.BillNumb != null)
            {
                var parts = lastInvoice.BillNumb.Split('/');
                if (parts.Length >= 4 && int.TryParse(parts[3], out int lastSeq))
                {
                    sequence = lastSeq + 1;
                }
            }

            return $"{branchCode}/SALE/{year}{month}/{sequence:D5}";
        }

        public List<SaleListDto> GetAll(int branchId)
        {
            try
            {
                var sales = _context.SaleFiles
                    .Where(x => x.BranchID == branchId && (x.CancStat == null || x.CancStat == false))
                    .OrderByDescending(x => x.TranNumb)
                    .ToList();

                var result = new List<SaleListDto>();

                foreach (var sale in sales)
                {
                    // Load items for this sale
                    var items = _context.SaleFilds
                        .Where(x => x.TranNumb == sale.TranNumb)
                        .Include(x => x.Item)  // ✅ Now Item navigation property exists
                        .ToList();

                    var itemSummaries = items.Select(x => new SaleItemSummaryDto
                    {
                        ItemID = x.ItemID ?? 0,
                        ItemName = x.Item?.ItemName ?? $"Item {x.ItemID}",
                        ModlNumb = x.Item?.ModlNumb ?? "",
                        Quantity = (double)(x.SaleQnty ?? 0),
                        Rate = (double)(x.SaleRate ?? 0),
                        Amount = (double)((x.SaleQnty ?? 0) * (x.SaleRate ?? 0)),
                        GodownID = x.GodnID,
                        //GodownID = null,  
                        GodownName = null
                    }).ToList();

                    // ✅ FIX: Use Sum() instead of Count() for quantity
                    var totalQuantity = items.Sum(x => x.SaleQnty ?? 0);

                    result.Add(new SaleListDto
                    {
                        TranNumb = sale.TranNumb,
                        TranDate = sale.TranDate,
                        BillNumb = sale.BillNumb ?? $"SA{sale.TranNumb:D8}",
                        TranMode = sale.TranMode,
                        CustName = !string.IsNullOrEmpty(sale.WalkingCustomer)
                            ? sale.WalkingCustomer
                            : (!string.IsNullOrEmpty(sale.CustName) ? sale.CustName : "Cash Customer"),
                        WalkingCustomer = sale.WalkingCustomer,
                        TotlQnty = sale.TotlQnty,
                        TotlAmnt = sale.TotlAmnt ?? 0,
                        ItemCount = items.Count,  // ✅ This is fine - Count of items
                        TotalQuantity = (double)totalQuantity,  // ✅ Sum of quantities
                        Items = itemSummaries
                    });
                }

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetAll Error: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                return new List<SaleListDto>();
            }
        }

        public async Task<int> CreateSaleAsync(SaleCreateDto dto, int userId, int branchId)
        {
            try
            {
                // Validate stock before creating
                foreach (var item in dto.Items)
                {
                    var currentStock = _stockService.GetCurrentStock(item.ItemID, branchId);
                    if (currentStock < (double)item.SaleQnty)
                    {
                        var itemName = await _context.ItemFile
                            .Where(x => x.ItemID == item.ItemID)
                            .Select(x => x.ItemName)
                            .FirstOrDefaultAsync();
                        throw new Exception($"Insufficient stock for {itemName}. Available: {currentStock}, Requested: {item.SaleQnty}");
                    }
                }

                int totlQty = (int)dto.Items.Sum(i => i.SaleQnty);
                decimal totlAmnt = dto.Items.Sum(i => i.SaleQnty * i.SaleRate);

                // Get customer name from database if CustID is provided
                string customerName = null;
                if (dto.CustID.HasValue && dto.CustID.Value > 0)
                {
                    var customer = await _context.tblCOA
                        .Where(x => x.acctID == dto.CustID.Value)
                        .Select(x => x.AcctName)
                        .FirstOrDefaultAsync();
                    customerName = customer ?? "Customer";
                }

                // Determine display name
                string displayName;
                if (!string.IsNullOrEmpty(dto.WalkingCustomer))
                {
                    displayName = dto.WalkingCustomer;
                }
                else if (!string.IsNullOrEmpty(customerName))
                {
                    displayName = customerName;
                }
                else
                {
                    displayName = "Cash Customer";
                }

                var sale = new SaleFile
                {
                    TranDate = dto.TranDate,
                    TranMode = dto.TranMode,
                    TranType = dto.TranMode,
                    CustID = dto.CustID,
                    WalkingCustomer = dto.WalkingCustomer,
                    CustName = displayName,
                    TranDesc = dto.TranDesc,
                    TotlQnty = totlQty,
                    TotlAmnt = totlAmnt,
                    BranchID = branchId,
                    GodnID = dto.GodownID,
                    AddBy = userId,
                    AddOn = DateTime.Now,
                    CancStat = false
                };

                // Add sale to context first
                _context.SaleFiles.Add(sale);
                await _context.SaveChangesAsync();

                // Now add items with the TranNumb
                foreach (var item in dto.Items)
                {
                    var saleItem = new SaleFild
                    {
                        TranNumb = sale.TranNumb,
                        TranDate = dto.TranDate,
                        ItemID = item.ItemID,
                        SaleQnty = item.SaleQnty,
                        SaleRate = item.SaleRate,
                        SaleAmnt = item.SaleQnty * item.SaleRate,
                        ItemRmks = item.ItemRmks,
                        GodnID = item.GodownID
                    };
                    _context.SaleFilds.Add(saleItem);
                }

                await _context.SaveChangesAsync();

                // Generate invoice number
                sale.BillNumb = await GenerateInvoiceNumberAsync(branchId);
                await _context.SaveChangesAsync();

                // Update stock
                await _stockService.PostSaleStockAsync(sale.TranNumb);

                // ✅ STEP 4: Create voucher for this sale (AFTER successful sale)
                try
                {
                    int voucherId = await _voucherService.CreateFromSaleAsync(sale.TranNumb, userId, branchId);
                    Console.WriteLine($"✅ Voucher created successfully for Sale #{sale.TranNumb}. Voucher ID: {voucherId}");
                }
                catch (Exception voucherEx)
                {
                    // ⚠️ ONLY LOG ERROR - NO ROLLBACK OF SALE
                    Console.WriteLine($"⚠️ VOUCHER CREATION FAILED for Sale #{sale.TranNumb}: {voucherEx.Message}");
                    Console.WriteLine($"Stack Trace: {voucherEx.StackTrace}");
                    // You can also log to a database table if needed
                }

                return sale.TranNumb;
            }
            catch (DbUpdateException ex)
            {
                var innerMessage = ex.InnerException?.Message ?? ex.Message;
                Console.WriteLine($"DbUpdateException: {innerMessage}");
                throw new Exception($"Database error: {innerMessage}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"CreateSaleAsync Error: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                throw new Exception($"Sale creation failed: {ex.Message}");
            }
        }

        public async Task<SaleCreateDto?> GetSaleByTranNumb(int tranNumb)
        {
            try
            {
                var sale = await _context.SaleFiles
                    .Include(x => x.SaleFilds)
                    .FirstOrDefaultAsync(s => s.TranNumb == tranNumb && (s.CancStat == null || s.CancStat == false));

                if (sale == null)
                    return null;

                return new SaleCreateDto
                {
                    TranDate = sale.TranDate ?? DateTime.Now,
                    TranMode = sale.TranMode ?? "CASH",
                    CustID = sale.CustID,
                    WalkingCustomer = sale.WalkingCustomer,
                    CustName = sale.CustName,
                    TranDesc = sale.TranDesc,
                    Items = sale.SaleFilds.Select(x => new SaleItemCreateDto
                    {
                        ItemID = x.ItemID ?? 0,
                        SaleQnty = x.SaleQnty ?? 0,
                        SaleRate = x.SaleRate ?? 0,
                        ItemRmks = x.ItemRmks,
                        GodownID = x.GodnID
                    }).ToList()
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetSaleByTranNumb Error: {ex.Message}");
                throw new Exception($"Error loading sale: {ex.Message}");
            }
        }

        public async Task<bool> UpdateSaleAsync(int tranNumb, SaleCreateDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var sale = await _context.SaleFiles
                    .Include(x => x.SaleFilds)
                    .FirstOrDefaultAsync(s => s.TranNumb == tranNumb);

                if (sale == null)
                    throw new Exception("Sale not found");

                var validItems = dto.Items.Where(i => i.ItemID > 0).ToList();
                if (!validItems.Any())
                    throw new Exception("No valid items provided");

                // STEP 1: FIRST reverse old stock
                await _stockService.ReverseSaleStockAsync(tranNumb);

                // STEP 2: Now validate stock for new quantities (stock already reversed)
                foreach (var item in validItems)
                {
                    var currentStock = _stockService.GetCurrentStock(item.ItemID, sale.BranchID ?? 1);
                    if (currentStock < (double)item.SaleQnty)
                    {
                        var itemName = await _context.ItemFile
                            .Where(x => x.ItemID == item.ItemID)
                            .Select(x => x.ItemName)
                            .FirstOrDefaultAsync();

                        // Rollback: Post back the old stock
                        await _stockService.PostSaleStockAsync(tranNumb);
                        throw new Exception($"Insufficient stock for {itemName}. Available: {currentStock}, Requested: {item.SaleQnty}");
                    }
                }

                // Get customer name
                string customerName = null;
                if (dto.CustID.HasValue && dto.CustID.Value > 0)
                {
                    var customer = await _context.tblCOA
                        .Where(x => x.acctID == dto.CustID.Value)
                        .Select(x => x.AcctName)
                        .FirstOrDefaultAsync();
                    customerName = customer ?? "Customer";
                }

                // Determine display name
                string displayName;
                if (!string.IsNullOrEmpty(dto.WalkingCustomer))
                {
                    displayName = dto.WalkingCustomer;
                }
                else if (!string.IsNullOrEmpty(customerName))
                {
                    displayName = customerName;
                }
                else
                {
                    displayName = "Cash Customer";
                }

                // Calculate totals
                int totlQty = (int)validItems.Sum(i => i.SaleQnty);
                decimal totlAmnt = validItems.Sum(i => i.SaleQnty * i.SaleRate);

                // Update sale header
                sale.TranDate = dto.TranDate;
                sale.TranMode = dto.TranMode;
                sale.TranType = dto.TranMode;
                sale.CustID = dto.CustID;
                sale.WalkingCustomer = dto.WalkingCustomer;
                sale.CustName = displayName;
                sale.TranDesc = dto.TranDesc;
                sale.TotlQnty = totlQty;
                sale.TotlAmnt = totlAmnt;

                // Remove old items
                _context.SaleFilds.RemoveRange(sale.SaleFilds);
                await _context.SaveChangesAsync();

                // Add new items
                foreach (var i in validItems)
                {
                    _context.SaleFilds.Add(new SaleFild
                    {
                        TranNumb = tranNumb,
                        TranDate = dto.TranDate,
                        ItemID = i.ItemID,
                        SaleQnty = i.SaleQnty,
                        SaleRate = i.SaleRate,
                        SaleAmnt = i.SaleQnty * i.SaleRate,
                        ItemRmks = i.ItemRmks ?? "",
                        GodnID = i.GodownID
                    });
                }

                await _context.SaveChangesAsync();

                // STEP 3: Post new stock
                await _stockService.PostSaleStockAsync(tranNumb);

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"UpdateSaleAsync Error: {ex.Message}");
                throw new Exception($"Update failed: {ex.Message}");
            }
        }

        public async Task<bool> DeleteSaleAsync(int tranNumb)
        {
            try
            {
                var sale = await _context.SaleFiles
                    .FirstOrDefaultAsync(s => s.TranNumb == tranNumb);

                if (sale == null)
                    return false;

                // Reverse stock
                await _stockService.ReverseSaleStockAsync(tranNumb);

                // Soft delete
                sale.CancStat = true;
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DeleteSaleAsync Error: {ex.Message}");
                throw new Exception($"Delete failed: {ex.Message}");
            }
        }

        // ✅ NEW: Method to create vouchers for existing sales (for back-dating)
        public async Task<int> CreateVoucherForExistingSaleAsync(int tranNumb, int userId, int branchId)
        {
            try
            {
                int voucherId = await _voucherService.CreateFromSaleAsync(tranNumb, userId, branchId);
                Console.WriteLine($"✅ Voucher created for existing Sale #{tranNumb}. Voucher ID: {voucherId}");
                return voucherId;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Failed to create voucher for existing Sale #{tranNumb}: {ex.Message}");
                throw;
            }
        }

        public decimal GetItemSaleRate(int itemId)
        {
            var activePrice = _priceService.GetCurrentPrice(itemId, "SALE");
            return activePrice ?? 0;
        }
    }
}