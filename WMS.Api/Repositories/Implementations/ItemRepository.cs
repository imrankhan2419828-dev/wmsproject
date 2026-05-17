//using WMS.Api.Data;
//using WMS.Api.Models;
//using WMS.Api.Repositories.Interfaces;

//namespace WMS.Api.Repositories.Implementations
//{
//    public class ItemRepository : IItemRepository
//    {
//        private readonly WmsDbContext _context;

//        public ItemRepository(WmsDbContext context)
//        {
//            _context = context;
//        }

//        public List<ItemFile> GetAll()
//        {
//            return _context.ItemFile
//                .Where(x => !x.IsDeleted)
//                .ToList();
//        }

//        public ItemFile? GetById(int id)
//        {
//            return _context.ItemFile.FirstOrDefault(x => x.ItemID == id);
//        }

//        public void Create(ItemFile item)
//        {
//            item.AddOn = DateTime.Now;
//            _context.ItemFile.Add(item);
//            _context.SaveChanges();
//        }

//        public void Update(ItemFile item)
//        {
//            item.EditOn = DateTime.Now;
//            _context.ItemFile.Update(item);
//            _context.SaveChanges();
//        }

//        public void Delete(int id)
//        {
//            var item = GetById(id);
//            if (item != null)
//            {
//                item.IsDeleted = true;
//                _context.SaveChanges();
//            }
//        }
//    }
//}

using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.Models;
using WMS.Api.Repositories.Interfaces;

namespace WMS.Api.Repositories.Implementations
{
    public class ItemRepository : IItemRepository
    {
        private readonly WmsDbContext _context;

        public ItemRepository(WmsDbContext context)
        {
            _context = context;
        }

        public List<ItemFile> GetAll(int branchId)
        {
            return _context.ItemFile
                .Where(x => !x.IsDeleted && x.BranchID == branchId)
                .OrderByDescending(x => x.ItemID)
                .ToList();
        }

        public ItemFile? GetById(int id)
        {
            return _context.ItemFile
                .FirstOrDefault(x => x.ItemID == id && !x.IsDeleted);
        }

        public ItemFile? GetById(int id, int branchId)
        {
            return _context.ItemFile
                .FirstOrDefault(x => x.ItemID == id && !x.IsDeleted && x.BranchID == branchId);
        }

        public int Create(ItemFile item)
        {
            _context.ItemFile.Add(item);
            _context.SaveChanges();
            return item.ItemID;
        }

        public void Update(ItemFile item)
        {
            _context.Entry(item).State = EntityState.Modified;
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            var item = GetById(id);
            if (item != null)
            {
                item.IsDeleted = true;
                _context.SaveChanges();
            }
        }
    }
}