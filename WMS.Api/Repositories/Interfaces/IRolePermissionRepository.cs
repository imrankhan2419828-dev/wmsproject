using WMS.Api.Models;

namespace WMS.Api.Repositories.Interfaces
{
    public interface IRolePermissionRepository
    {
        Task<IEnumerable<RolePermission>> GetAllAsync();
        Task<RolePermission?> GetByIdAsync(int id);
        Task<RolePermission> AddAsync(RolePermission entity);
        Task<RolePermission> UpdateAsync(RolePermission entity);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<RolePermission>> GetByRoleIdAsync(int roleId);
    }
}
