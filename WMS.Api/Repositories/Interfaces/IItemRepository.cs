//using WMS.Api.Models;

//namespace WMS.Api.Repositories.Interfaces
//{
//    public interface IItemRepository
//    {
//        List<ItemFile> GetAll();
//        ItemFile? GetById(int id);
//        void Create(ItemFile item);
//        void Update(ItemFile item);
//        void Delete(int id);
//    }
//}

using WMS.Api.Models;

namespace WMS.Api.Repositories.Interfaces
{
    public interface IItemRepository
    {
        List<ItemFile> GetAll(int branchId);
        ItemFile? GetById(int id);
        ItemFile? GetById(int id, int branchId);
        int Create(ItemFile item);
        void Update(ItemFile item);
        void Delete(int id);
    }
}