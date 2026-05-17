using WMS.Api.Models;

public interface IUserService
{
    IEnumerable<SystemUser> GetAll();
    SystemUser Create(SystemUser user);
    SystemUser Update(int id, SystemUser user);
    bool Delete(int id);
}

