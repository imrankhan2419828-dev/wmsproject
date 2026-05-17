using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.Models;
using WMS.Api.Repositories.Interfaces;

namespace WMS.Api.Repositories.Implementations
{
    public class PurchaseRepository : IPurchaseRepository
    {
        private readonly WmsDbContext _context;

        public PurchaseRepository(WmsDbContext context)
        {
            _context = context;
        }

        public async Task<PurcFile> CreateAsync(PurcFile master, List<PurcFild> details)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Generate bill number if not provided
                if (string.IsNullOrEmpty(master.BillNumb))
                {
                    master.BillNumb = await GenerateBillNumberAsync(master.BranchID ?? 1);
                }

                master.AddOn = DateTime.Now;
                _context.PurcFile.Add(master);
                await _context.SaveChangesAsync();

                foreach (var detail in details)
                {
                    detail.TranNumb = master.TranNumb;
                    _context.PurcFild.Add(detail);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return master;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task UpdateAsync(PurcFile master, List<PurcFild> details)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var existing = await _context.PurcFile
                    .FirstOrDefaultAsync(x => x.TranNumb == master.TranNumb);

                if (existing == null)
                    throw new Exception("Purchase not found");

                // Update master
                existing.TranDate = master.TranDate;
                existing.SuppID = master.SuppID;
                existing.IsWalkingCustomer = master.IsWalkingCustomer;
                existing.RefrNumb = master.RefrNumb;
                existing.TranType = master.TranType;
                existing.TranMode = master.TranMode;
                existing.BillNumb = master.BillNumb;
                existing.TranDesc = master.TranDesc;
                existing.TotlQnty = master.TotlQnty;
                existing.TotlAmnt = master.TotlAmnt;
                existing.NetAmnt = master.NetAmnt;
                existing.EditOn = DateTime.Now;

                await _context.SaveChangesAsync();

                // Remove old details
                var oldDetails = _context.PurcFild
                    .Where(x => x.TranNumb == master.TranNumb);
                _context.PurcFild.RemoveRange(oldDetails);
                await _context.SaveChangesAsync();

                // Add new details
                foreach (var detail in details)
                {
                    detail.TranNumb = master.TranNumb;
                    _context.PurcFild.Add(detail);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task DeleteAsync(int tranNumb)
        {
            var purchase = await _context.PurcFile
                .FirstOrDefaultAsync(x => x.TranNumb == tranNumb);

            if (purchase != null)
            {
                purchase.IsDeleted = true;
                purchase.DeletedOn = DateTime.Now;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<PurcFile?> GetByIdAsync(int tranNumb)
        {
            return await _context.PurcFile
                .Include(x => x.Supplier)
                .FirstOrDefaultAsync(x => x.TranNumb == tranNumb && !x.IsDeleted);
        }

        public async Task<List<PurcFile>> GetAllAsync(int branchId)
        {
            return await _context.PurcFile
                .Include(x => x.Supplier)
                .Where(x => x.BranchID == branchId && !x.IsDeleted)
                .OrderByDescending(x => x.TranNumb)
                .ToListAsync();
        }

        public async Task<string> GenerateBillNumberAsync(int branchId)
        {
            var year = DateTime.Now.Year;
            var month = DateTime.Now.ToString("MM");

            // Get branch code (you can customize this)
            var branchCode = $"BR{branchId:D3}";

            // Get last sequence for this branch/year/month
            var lastBill = await _context.PurcFile
                .Where(x => x.BillNumb != null &&
                       x.BillNumb.Contains($"{branchCode}/PUR/{year}{month}"))
                .OrderByDescending(x => x.TranNumb)
                .FirstOrDefaultAsync();

            int sequence = 1;
            if (lastBill?.BillNumb != null)
            {
                var parts = lastBill.BillNumb.Split('/');
                if (parts.Length >= 4 && int.TryParse(parts[3], out int lastSeq))
                {
                    sequence = lastSeq + 1;
                }
            }

            return $"{branchCode}/PUR/{year}{month}/{sequence:D5}";
        }
    }
}