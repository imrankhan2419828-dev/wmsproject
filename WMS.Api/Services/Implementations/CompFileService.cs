using System;
using System.Collections.Generic;
using System.Linq;
using WMS.Api.Data;
using WMS.Api.DTOs.Company;
using WMS.Api.Models;
using WMS.Api.Repositories.Interfaces;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    // CompFileService.cs
    public class CompFileService : ICompFileService
    {
        private readonly ICompFileRepository _repo;

        public CompFileService(ICompFileRepository repo)  // ✅ CHANGE: Use repository, not direct context
        {
            _repo = repo;
        }

        public IEnumerable<CompFile> GetAll(int branchId)
        {
            return _repo.GetAll(branchId);
        }

        public CompFile? GetById(int id, int branchId)
        {
            return _repo.GetById(id, branchId);
        }

        public void Create(CompFileCreateDto dto, int branchId, int userId)
        {
            var company = new CompFile
            {
                CompName = dto.CompName,
                CompAddr = dto.CompAddr,
                ContPrsn = dto.ContPrsn,
                PhonNumb = dto.PhonNumb,
                CellNumb = dto.CellNumb,
                EmalAddr = dto.EmalAddr,
                InActive = dto.InActive ?? false,
                BranchID = branchId,  // ✅ Auto assign current branch
                IsDeleted = false,
                AddBy = userId,
                AddOn = DateTime.Now
            };

            _repo.Add(company);
            _repo.SaveChanges();
        }

        public void Update(int id, CompFileCreateDto dto, int branchId, int userId)
        {
            var company = _repo.GetById(id, branchId);
            if (company == null)
                throw new Exception("Company not found or access denied");

            company.CompName = dto.CompName;
            company.CompAddr = dto.CompAddr;
            company.ContPrsn = dto.ContPrsn;
            company.PhonNumb = dto.PhonNumb;
            company.CellNumb = dto.CellNumb;
            company.EmalAddr = dto.EmalAddr;
            company.InActive = dto.InActive;
            company.EditBy = userId;
            company.EditOn = DateTime.Now;

            _repo.Update(company);
            _repo.SaveChanges();
        }

        public void Delete(int id, int branchId, int userId)
        {
            var company = _repo.GetById(id, branchId);
            if (company == null)
                throw new Exception("Company not found or access denied");

            company.IsDeleted = true;
            company.DeleteBy = userId;
            company.DeleteOn = DateTime.Now;

            _repo.Update(company);
            _repo.SaveChanges();
        }
    }
}
