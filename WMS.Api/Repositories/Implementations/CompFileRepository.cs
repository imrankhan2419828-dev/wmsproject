using System.Collections.Generic;
using System.Linq;
using WMS.Api.Data;
using WMS.Api.Models;
using WMS.Api.Repositories.Interfaces;

namespace WMS.Api.Repositories.Implementations
{
    // CompFileRepository.cs
    public class CompFileRepository : ICompFileRepository
    {
        private readonly WmsDbContext _context;

        public CompFileRepository(WmsDbContext context)
        {
            _context = context;
        }

        // ✅ With branch filter - for CRUD operations
        public IEnumerable<CompFile> GetAll(int branchId)
        {
            return _context.CompFile
                .Where(x => !x.IsDeleted && x.BranchID == branchId)
                .OrderBy(x => x.CompName)
                .ToList();
        }

        // ✅ With branch filter - for CRUD operations
        public CompFile? GetById(int id, int branchId)
        {
            return _context.CompFile
                .FirstOrDefault(x => x.CompID == id && !x.IsDeleted && x.BranchID == branchId);
        }

        // ✅ WITHOUT branch filter - for internal relationships (Item, Purchase, etc.)
        public CompFile? GetByIdOnly(int id)
        {
            return _context.CompFile
                .FirstOrDefault(x => x.CompID == id && !x.IsDeleted);
        }

        // ✅ WITHOUT branch filter - agar deleted records bhi chahiye (rare case)
        public CompFile? GetByIdWithDeleted(int id)
        {
            return _context.CompFile
                .FirstOrDefault(x => x.CompID == id);
        }

        public void Add(CompFile company)
        {
            _context.CompFile.Add(company);
        }

        public void Update(CompFile company)
        {
            _context.CompFile.Update(company);
        }

        public void Delete(int id, int branchId)
        {
            var company = GetById(id, branchId);
            if (company != null)
            {
                company.IsDeleted = true;
                _context.CompFile.Update(company);
            }
        }

        public bool SaveChanges()
        {
            return (_context.SaveChanges() >= 0);
        }
    }
}


