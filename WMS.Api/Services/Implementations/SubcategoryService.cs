using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Subcategory;
using WMS.Api.Models;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class SubcategoryService : ISubcategoryService
    {
        private readonly WmsDbContext _context;

        public SubcategoryService(WmsDbContext context)
        {
            _context = context;
        }

        public List<SubcategoryListDto> GetAll(int branchId)
        {
            try
            {
                var query = from s in _context.Subcategories
                            join c in _context.CatgFile on s.CatgID equals c.CatgID into catgJoin
                            from c in catgJoin.DefaultIfEmpty()
                            where s.BranchID == branchId
                            orderby s.SubcatName
                            select new SubcategoryListDto
                            {
                                SubcatID = s.SubcatID,
                                SubcatName = s.SubcatName ?? "",
                                CatgID = s.CatgID,
                                CatgName = c != null ? (c.CatgName ?? "") : "",
                                IsSparepart = s.IsSparepart,
                                InActive = s.InActive
                            };

                return query.ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetAll Error: {ex.Message}");
                return new List<SubcategoryListDto>();
            }
        }

        public List<SubcategoryListDto> GetByCategory(int catgId, int branchId)
        {
            try
            {
                var query = from s in _context.Subcategories
                            join c in _context.CatgFile on s.CatgID equals c.CatgID into catgJoin
                            from c in catgJoin.DefaultIfEmpty()
                            where s.BranchID == branchId
                              && s.CatgID == catgId
                              && s.InActive == false
                            orderby s.SubcatName
                            select new SubcategoryListDto
                            {
                                SubcatID = s.SubcatID,
                                SubcatName = s.SubcatName ?? "",
                                CatgID = s.CatgID,
                                CatgName = c != null ? (c.CatgName ?? "") : "",
                                IsSparepart = s.IsSparepart,
                                InActive = s.InActive
                            };

                return query.ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetByCategory Error: {ex.Message}");
                return new List<SubcategoryListDto>();
            }
        }

        public async Task<int> CreateAsync(SubcategoryCreateDto dto, int userId, int branchId)
        {
            var entity = new Subcategory
            {
                SubcatName = dto.SubcatName,
                CatgID = dto.CatgID,
                IsSparepart = dto.IsSparepart,
                BranchID = branchId,
                InActive = dto.InActive,
                AddBy = userId,
                AddOn = DateTime.UtcNow
            };

            _context.Subcategories.Add(entity);
            await _context.SaveChangesAsync();
            return entity.SubcatID;
        }

        public async Task<SubcategoryCreateDto?> GetByIdAsync(int id)
        {
            var entity = await _context.Subcategories
                .FirstOrDefaultAsync(x => x.SubcatID == id);

            if (entity == null) return null;

            return new SubcategoryCreateDto
            {
                SubcatID = entity.SubcatID,
                SubcatName = entity.SubcatName ?? string.Empty,
                CatgID = entity.CatgID,
                IsSparepart = entity.IsSparepart,
                InActive = entity.InActive
            };
        }

        public async Task<bool> UpdateAsync(int id, SubcategoryCreateDto dto, int userId)
        {
            var entity = await _context.Subcategories
                .FirstOrDefaultAsync(x => x.SubcatID == id);

            if (entity == null) return false;

            entity.SubcatName = dto.SubcatName;
            entity.CatgID = dto.CatgID;
            entity.IsSparepart = dto.IsSparepart;
            entity.InActive = dto.InActive;
            entity.EditBy = userId;
            entity.EditOn = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Subcategories
                .FirstOrDefaultAsync(x => x.SubcatID == id);

            if (entity == null) return false;

            _context.Subcategories.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        // This method is kept for compatibility but company filter is removed
        public List<SubcategoryListDto> GetByCategoryAndCompany(int catgId, int companyId, int branchId)
        {
            try
            {
                var query = from s in _context.Subcategories
                            join c in _context.CatgFile on s.CatgID equals c.CatgID into catgJoin
                            from c in catgJoin.DefaultIfEmpty()
                            where s.BranchID == branchId
                              && s.CatgID == catgId
                              && s.InActive == false
                            orderby s.SubcatName
                            select new SubcategoryListDto
                            {
                                SubcatID = s.SubcatID,
                                SubcatName = s.SubcatName ?? "",
                                CatgID = s.CatgID,
                                CatgName = c != null ? (c.CatgName ?? "") : "",
                                IsSparepart = s.IsSparepart,
                                InActive = s.InActive
                            };

                return query.ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetByCategoryAndCompany Error: {ex.Message}");
                return new List<SubcategoryListDto>();
            }
        }
    }
}