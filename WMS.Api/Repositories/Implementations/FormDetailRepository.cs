//using WMS.Api.Data;
//using WMS.Api.Models;
//using Microsoft.EntityFrameworkCore;

//public class FormDetailRepository : IFormDetailRepository
//{
//    private readonly WmsDbContext _context;

//    public FormDetailRepository(WmsDbContext context)
//    {
//        _context = context;
//    }

//    public async Task<IEnumerable<FormDetail>> GetAllAsync()
//        => await _context.FormDetail.ToListAsync();

//    public async Task<FormDetail?> GetByIdAsync(int id)
//        => await _context.FormDetail.FindAsync(id);

//    public async Task<FormDetail> AddAsync(FormDetail form)
//    {
//        _context.FormDetail.Add(form);
//        await _context.SaveChangesAsync();
//        return form;
//    }

//    public async Task<FormDetail> UpdateAsync(FormDetail form)
//    {
//        _context.FormDetail.Update(form);
//        await _context.SaveChangesAsync();
//        return form;
//    }

//    public async Task<bool> DeleteAsync(int id)
//    {
//        var form = await _context.FormDetail.FindAsync(id);
//        if (form == null) return false;

//        _context.FormDetail.Remove(form);
//        await _context.SaveChangesAsync();
//        return true;
//    }
//}
using WMS.Api.Data;
using WMS.Api.Models;
using Microsoft.EntityFrameworkCore;

public class FormDetailRepository : IFormDetailRepository
{
    private readonly WmsDbContext _context;

    public FormDetailRepository(WmsDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<FormDetail>> GetAllAsync()
        => await _context.FormDetail
            .Include(x => x.Children)
            .ToListAsync();

    public async Task<FormDetail?> GetByIdAsync(int id)
        => await _context.FormDetail
            .Include(x => x.Children)
            .FirstOrDefaultAsync(x => x.FormID == id);

    public async Task<FormDetail> AddAsync(FormDetail form)
    {
        _context.FormDetail.Add(form);
        await _context.SaveChangesAsync();
        return form;
    }

    public async Task<FormDetail> UpdateAsync(FormDetail form)
    {
        _context.FormDetail.Update(form);
        await _context.SaveChangesAsync();
        return form;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var form = await _context.FormDetail.FindAsync(id);
        if (form == null) return false;

        _context.FormDetail.Remove(form);
        await _context.SaveChangesAsync();
        return true;
    }

    // 🔥 FIXED: Use FormCategory instead of MenuCategory
    public async Task<IEnumerable<FormDetail>> GetByCategoryAsync(string category)
        => await _context.FormDetail
            .Where(x => x.FormCategory == category)  // 👈 FormCategory use karo
            .OrderBy(x => x.CategoryOrder)
            .ThenBy(x => x.FormOrder)
            .ToListAsync();

    public async Task<IEnumerable<FormDetail>> GetByParentAsync(int parentId)
        => await _context.FormDetail
            .Where(x => x.ParentPage == parentId)
            .OrderBy(x => x.MenuOrder)
            .ThenBy(x => x.FormOrder)
            .ToListAsync();
}