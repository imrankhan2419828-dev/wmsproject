// CatgFileRepository.cs - Complete fixed version
using WMS.Api.Data;
using WMS.Api.Models;
using WMS.Api.Repositories.Interfaces;

namespace WMS.Api.Repositories.Implementations
{
    public class CatgFileRepository : ICatgFileRepository
    {
        private readonly WmsDbContext _context;

        public CatgFileRepository(WmsDbContext context)
        {
            _context = context;
        }

        // ✅ With branch filter
        public List<CatgFile> GetAll(int branchId)
        {
            return _context.CatgFile
                .Where(x => !x.IsDeleted && x.BranchID == branchId)
                .OrderBy(x => x.CatgName)
                .ToList();
        }

        // ✅ With branch filter
        public CatgFile? GetById(int id, int branchId)
        {
            return _context.CatgFile
                .FirstOrDefault(x => x.CatgID == id && !x.IsDeleted && x.BranchID == branchId);
        }

        // ✅ WITHOUT branch filter - for ItemService relationships
        public CatgFile? GetByIdOnly(int id)
        {
            return _context.CatgFile
                .FirstOrDefault(x => x.CatgID == id && !x.IsDeleted);
        }

        public void Add(CatgFile catg)
        {
            _context.CatgFile.Add(catg);
            _context.SaveChanges();  // ✅ ADD THIS
        }

        public void Update(CatgFile catg)
        {
            _context.CatgFile.Update(catg);
            _context.SaveChanges();  // ✅ ADD THIS
        }

        // ✅ With branch filter
        public void Delete(int id, int branchId)
        {
            var catg = GetById(id, branchId);
            if (catg != null)
            {
                catg.IsDeleted = true;
                _context.CatgFile.Update(catg);
                _context.SaveChanges();  // ✅ ADD THIS
            }
        }
    }
}