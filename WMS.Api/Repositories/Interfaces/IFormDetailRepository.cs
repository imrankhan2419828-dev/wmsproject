//using WMS.Api.Models;

//public interface IFormDetailRepository
//{
//    Task<IEnumerable<FormDetail>> GetAllAsync();
//    Task<FormDetail?> GetByIdAsync(int id);
//    Task<FormDetail> AddAsync(FormDetail form);
//    Task<FormDetail> UpdateAsync(FormDetail form);
//    Task<bool> DeleteAsync(int id);
//}
using WMS.Api.Models;

public interface IFormDetailRepository
{
    // CRUD
    Task<IEnumerable<FormDetail>> GetAllAsync();
    Task<FormDetail?> GetByIdAsync(int id);
    Task<FormDetail> AddAsync(FormDetail form);
    Task<FormDetail> UpdateAsync(FormDetail form);
    Task<bool> DeleteAsync(int id);

    // 🔥 New methods for dynamic menu
    Task<IEnumerable<FormDetail>> GetByCategoryAsync(string category);
    Task<IEnumerable<FormDetail>> GetByParentAsync(int parentId);
}