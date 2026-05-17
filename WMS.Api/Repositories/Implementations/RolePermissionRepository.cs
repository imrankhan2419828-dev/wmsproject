using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.Models;
using WMS.Api.Repositories.Interfaces;

namespace WMS.Api.Repositories.Implementations
{
    public class RolePermissionRepository : IRolePermissionRepository
    {
        private readonly WmsDbContext _context;
        public RolePermissionRepository(WmsDbContext context) => _context = context;

        public async Task<IEnumerable<RolePermission>> GetAllAsync()
            => await _context.RolePermissions.ToListAsync();

        public async Task<RolePermission?> GetByIdAsync(int id)
            => await _context.RolePermissions.FindAsync(id);

        public async Task<RolePermission> AddAsync(RolePermission entity)
        {
            _context.RolePermissions.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<RolePermission> UpdateAsync(RolePermission entity)
        {
            _context.RolePermissions.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var e = await _context.RolePermissions.FindAsync(id);
            if (e == null) return false;
            _context.RolePermissions.Remove(e);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<RolePermission>> GetByRoleIdAsync(int roleId)
            => await _context.RolePermissions.Where(r => r.RoleID == roleId).ToListAsync();
    }
}
