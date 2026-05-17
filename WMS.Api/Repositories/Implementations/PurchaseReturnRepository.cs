using WMS.Api.Data;
using WMS.Api.Models;
using WMS.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WMS.Api.Repositories.Implementations
{
    public class PurchaseReturnRepository : IPurchaseReturnRepository
    {
        private readonly WmsDbContext _context;

        public PurchaseReturnRepository(WmsDbContext context)
        {
            _context = context;
        }

        public async Task<PurchaseReturn> CreateAsync(PurchaseReturn purchaseReturn)
        {
            _context.PurchaseReturn.Add(purchaseReturn);
            await _context.SaveChangesAsync();
            return purchaseReturn;
        }

        public async Task<PurchaseReturn> GetByIdAsync(int returnID)
        {
            return await _context.PurchaseReturn
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.ReturnID == returnID);
        }

        public async Task<IEnumerable<PurchaseReturn>> GetByBranchAsync(int branchID)
        {
            return await _context.PurchaseReturn
                .Include(x => x.Items)
                .Where(x => x.BranchID == branchID)
                .ToListAsync();
        }

        public async Task<IEnumerable<PurchaseReturn>> GetAllAsync()
        {
            return await _context.PurchaseReturn
                .Include(x => x.Items)
                .ToListAsync();
        }

        public async Task<PurchaseReturn> GetLastAsync()
        {
            return await _context.PurchaseReturn
                .OrderByDescending(x => x.ReturnID)
                .FirstOrDefaultAsync();
        }

        // 🔹 Purchase bills for dropdown
        public async Task<IEnumerable<object>> GetPurchaseBillsAsync()
        {
            return await _context.PurcFile
                .Where(x => !x.IsDeleted)
                .OrderByDescending(x => x.TranNumb)
                .Select(x => new
                {
                    x.TranNumb,
                    x.BillNumb
                })
                .ToListAsync();
        }

        // 🔹 Bill detail with items
        public async Task<object> GetPurchaseByBillAsync(string billNumb)
        {
            var purchase = await _context.PurcFile
                .Where(p => p.BillNumb == billNumb && !p.IsDeleted)
                .Select(p => new
                {
                    p.TranNumb,
                    p.BillNumb,
                    p.SuppID,
                    Items = _context.PurcFild
                        .Where(i => i.TranNumb == p.TranNumb)
                        .Select(i => new
                        {
                            itemID = i.ItemID,
                            itemName = _context.ItemFile
    .Where(it => it.ItemID == i.ItemID)
    .Select(it => it.ItemName)
    .FirstOrDefault(),

                            purcQnty = i.PurcQnty,
                            purcRate = i.PurcRate
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            return purchase;
        }

        public async Task DeleteAsync(int id)
        {
            var pr = await _context.PurchaseReturn
                .Include(x => x.Items)
                .FirstAsync(x => x.ReturnID == id);

            _context.PurchaseReturnItems.RemoveRange(pr.Items);
            _context.PurchaseReturn.Remove(pr);
            await _context.SaveChangesAsync();
        }

    }
}
