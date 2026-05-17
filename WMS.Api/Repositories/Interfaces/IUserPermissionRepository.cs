using WMS.Api.Models;

namespace WMS.Api.Repositories.Interfaces
{
    public interface IUserPermissionRepository
    {
        Task<IEnumerable<UserPermission>> GetAllAsync();
        Task<UserPermission?> GetByIdAsync(int id);
        Task<UserPermission> AddAsync(UserPermission entity);
        Task<UserPermission> UpdateAsync(UserPermission entity);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<UserPermission>> GetByUserIdAsync(int userId);
        Task<UserPermission?> GetByUserAndMenuAsync(int userId, int menuId);
        //Task<UserPermission?> GetByUserAndFormAsync(int userId, int formId);

    }
}
