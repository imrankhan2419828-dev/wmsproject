using System.Collections.Generic;
using WMS.Api.DTOs.SystemUser;

namespace WMS.Api.Services.Interfaces
{
    public interface ISystemUserService
    {
        IEnumerable<SystemUserListDto> GetAll(int? branchId = null);
        SystemUserDto? GetById(int id);
        SystemUserDto Create(SystemUserCreateDto dto, int createdBy, int branchId);
        SystemUserDto? Update(int id, SystemUserUpdateDto dto, int editedBy);
        bool Delete(int id, int deletedBy);
        IEnumerable<RoleDto> GetRoles();
        bool IsUsernameExists(string username, int? branchId = null, int? excludeUserId = null);
    }
}