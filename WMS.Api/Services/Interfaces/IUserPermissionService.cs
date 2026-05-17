using WMS.Api.DTOs.Permissions;

namespace WMS.Api.Services.Interfaces
{
    public interface IUserPermissionService
    {
        Task<IEnumerable<UserPermissionDto>> GetAllAsync();
        Task<UserPermissionDto?> GetByIdAsync(int id);
        Task<UserPermissionDto> CreateAsync(UserPermissionCreateDto dto);
        Task<UserPermissionDto?> UpdateAsync(int id, UserPermissionCreateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<UserPermissionDto>> GetByUserIdAsync(int userId);
    }
}
