using WMS.Api.Models;

namespace WMS.Api.Repositories.Interfaces
{
    // ICatgFileRepository.cs
    public interface ICatgFileRepository
    {
        // ✅ For CRUD operations with branch filter (called from CategoryController)
        List<CatgFile> GetAll(int branchId);
        CatgFile? GetById(int id, int branchId);
        void Add(CatgFile catg);
        void Update(CatgFile catg);
        void Delete(int id, int branchId);

        // ✅ For internal relationships WITHOUT branch filter (called from ItemService)
        CatgFile? GetByIdOnly(int id);
    }
}
