using WMS.Api.DTOs.Permissions;

namespace WMS.Api.Services.Interfaces
{
    public interface IRolePermissionService
    {
        Task<IEnumerable<RolePermissionDto>> GetAllAsync();
        Task<IEnumerable<RolePermissionDto>> GetByRoleAsync(int roleId, int branchId = 1);
        Task SavePermissionsAsync(RolePermissionBulkSaveDto dto);
        Task CreateOrUpdateAsync(RolePermissionCreateDto dto);
    }
}