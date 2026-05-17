using WMS.Api.DTOs.Category;

namespace WMS.Api.Services.Interfaces
{
    // ICatgFileService.cs
    public interface ICatgFileService
    {
        List<CatgFileDto> GetAll(int branchId);  // ✅ ADD branchId
        CatgFileDto? GetById(int id, int branchId);  // ✅ ADD branchId
        void Create(CatgFileCreateDto dto, int branchId, int userId);  // ✅ ADD branchId, userId
        void Update(CatgFileUpdateDto dto, int branchId, int userId);  // ✅ ADD branchId, userId
        void Delete(int id, int branchId, int userId);  // ✅ ADD branchId, userId
    }
}
