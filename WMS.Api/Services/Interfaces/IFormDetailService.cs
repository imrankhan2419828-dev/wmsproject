//using WMS.Api.DTOs.FormDetail;

//public interface IFormDetailService
//{
//    Task<IEnumerable<FormDetailDto>> GetAllAsync();
//    Task<FormDetailDto?> GetByIdAsync(int id);
//    Task<FormDetailDto> CreateAsync(FormDetailCreateDto dto);
//    Task<FormDetailDto?> UpdateAsync(int id, FormDetailUpdateDto dto);
//    Task<bool> DeleteAsync(int id);
//}
using WMS.Api.DTOs.FormDetail;

public interface IFormDetailService
{
    // CRUD Operations
    Task<IEnumerable<FormDetailDto>> GetAllAsync();
    Task<FormDetailDto?> GetByIdAsync(int id);
    Task<FormDetailDto> CreateAsync(FormDetailCreateDto dto);
    Task<FormDetailDto?> UpdateAsync(int id, FormDetailUpdateDto dto);
    Task<bool> DeleteAsync(int id);

    // 🔥 New methods for dynamic menu
    Task<IEnumerable<FormDetailDto>> GetByCategoryAsync(string category);
    Task<IEnumerable<FormDetailDto>> GetMenuStructureAsync();
    Task<IEnumerable<FormDetailDto>> GetByParentAsync(int parentId);
}