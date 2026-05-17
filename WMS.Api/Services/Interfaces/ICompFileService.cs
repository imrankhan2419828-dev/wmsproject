using WMS.Api.DTOs.Company;
using WMS.Api.Models;

// ICompFileService.cs
public interface ICompFileService
{
    IEnumerable<CompFile> GetAll(int branchId);  // ✅ ADD branchId
    CompFile? GetById(int id, int branchId);     // ✅ ADD branchId
    void Create(CompFileCreateDto dto, int branchId, int userId);  // ✅ ADD branchId, userId
    void Update(int id, CompFileCreateDto dto, int branchId, int userId);  // ✅ ADD branchId, userId
    void Delete(int id, int branchId, int userId);  // ✅ ADD branchId, userId
}



