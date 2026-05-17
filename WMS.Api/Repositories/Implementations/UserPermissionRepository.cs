using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.Models;
using WMS.Api.Repositories.Interfaces;

namespace WMS.Api.Repositories.Implementations
{
    public class UserPermissionRepository : IUserPermissionRepository
    {
        private readonly WmsDbContext _context;
        public UserPermissionRepository(WmsDbContext context) => _context = context;

        public async Task<IEnumerable<UserPermission>> GetAllAsync()
            => await _context.UserPermissions.ToListAsync();

        public async Task<UserPermission?> GetByIdAsync(int id)
            => await _context.UserPermissions.FindAsync(id);

        public async Task<UserPermission> AddAsync(UserPermission entity)
        {
            _context.UserPermissions.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<UserPermission> UpdateAsync(UserPermission entity)
        {
            _context.UserPermissions.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var e = await _context.UserPermissions.FindAsync(id);
            if (e == null) return false;
            _context.UserPermissions.Remove(e);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<UserPermission>> GetByUserIdAsync(int userId)
            => await _context.UserPermissions.Where(u => u.UserID == userId).ToListAsync();

        public async Task<UserPermission?> GetByUserAndMenuAsync(int userId, int menuId)  // Changed method name
        {
            return await _context.UserPermissions
                .FirstOrDefaultAsync(u => u.UserID == userId && u.MenuID == menuId);  // ✅ MenuID
        }

        // Agar method name change nahi karna to:
        public async Task<UserPermission?> GetByUserAndFormAsync(int userId, int formId)
        {
            // Yeh ab MenuID se match karega
            return await _context.UserPermissions
                .FirstOrDefaultAsync(u => u.UserID == userId && u.MenuID == formId);  // ✅ MenuID
        }

    }
}
