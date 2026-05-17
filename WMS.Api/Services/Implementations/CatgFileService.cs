using WMS.Api.DTOs.Category;
using WMS.Api.Models;
using WMS.Api.Repositories.Interfaces;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class CatgFileService : ICatgFileService
    {
        private readonly ICatgFileRepository _repo;

        public CatgFileService(ICatgFileRepository repo)
        {
            _repo = repo;
        }

        public List<CatgFileDto> GetAll(int branchId)
        {
            return _repo.GetAll(branchId).Select(x => new CatgFileDto
            {
                CatgID = x.CatgID,
                CatgName = x.CatgName,
                InActive = x.InActive,
                ExclComm = x.ExclComm,
                RetailDiff = x.RetailDiff,
                PCTCode = x.PCTCode
            }).ToList();
        }

        public CatgFileDto? GetById(int id, int branchId)
        {
            var x = _repo.GetById(id, branchId);
            if (x == null) return null;

            return new CatgFileDto
            {
                CatgID = x.CatgID,
                CatgName = x.CatgName,
                InActive = x.InActive,
                ExclComm = x.ExclComm,
                RetailDiff = x.RetailDiff,
                PCTCode = x.PCTCode
            };
        }

        public void Create(CatgFileCreateDto dto, int branchId, int userId)
        {
            var catg = new CatgFile
            {
                CatgName = dto.CatgName,
                InActive = dto.InActive ?? false,
                ExclComm = dto.ExclComm ?? false,
                RetailDiff = dto.RetailDiff,
                PCTCode = dto.PCTCode,
                BranchID = branchId,
                AddBy = userId,
                AddOn = DateTime.Now,
                IsDeleted = false
            };
            _repo.Add(catg);  // ✅ SaveChanges is inside Add method
        }

        public void Update(CatgFileUpdateDto dto, int branchId, int userId)
        {
            var catg = _repo.GetById(dto.CatgID, branchId);
            if (catg == null)
                throw new Exception("Category not found or access denied");

            catg.CatgName = dto.CatgName;
            catg.InActive = dto.InActive;
            catg.ExclComm = dto.ExclComm;
            catg.RetailDiff = dto.RetailDiff;
            catg.PCTCode = dto.PCTCode;
            catg.EditBy = userId;
            catg.EditOn = DateTime.Now;

            _repo.Update(catg);  // ✅ SaveChanges is inside Update method
        }

        public void Delete(int id, int branchId, int userId)
        {
            var catg = _repo.GetById(id, branchId);
            if (catg == null)
                throw new Exception("Category not found or access denied");

            catg.IsDeleted = true;
            catg.DeleteBy = userId;
            catg.DeleteOn = DateTime.Now;

            _repo.Update(catg);  // ✅ SaveChanges is inside Update method
        }
    }
}