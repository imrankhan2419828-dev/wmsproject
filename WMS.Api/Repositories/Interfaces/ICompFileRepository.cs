using System.Collections.Generic;
using WMS.Api.Models;

namespace WMS.Api.Repositories.Interfaces
{
    // ICompFileRepository.cs
    public interface ICompFileRepository
    {
        // ✅ For CRUD operations with branch filter (called from CompanyController)
        IEnumerable<CompFile> GetAll(int branchId);
        CompFile? GetById(int id, int branchId);
        void Add(CompFile company);
        void Update(CompFile company);
        void Delete(int id, int branchId);
        bool SaveChanges();

        // ✅ For internal relationships WITHOUT branch filter (called from ItemService, PurchaseService, etc.)
        CompFile? GetByIdOnly(int id);  // Sirf ID se company lao, branch filter nahi
        CompFile? GetByIdWithDeleted(int id);  // Agar deleted bhi chahiye
    }
}


