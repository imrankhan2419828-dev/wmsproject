using WMS.Api.Data;
using WMS.Api.Models;

public class UserService : IUserService
{
    private readonly WmsDbContext _context;

    public UserService(WmsDbContext context)
    {
        _context = context;
    }

    // GET ALL USERS
    public IEnumerable<SystemUser> GetAll()
        => _context.SystemUsers.ToList();

    // CREATE USER
    public SystemUser Create(SystemUser user)
    {
        _context.SystemUsers.Add(user);
        _context.SaveChanges();
        return user;
    }

    // UPDATE USER
    public SystemUser Update(int id, SystemUser user)
    {
        var existing = _context.SystemUsers.Find(id);
        if (existing == null) return null;

        existing.UserFullName = user.UserFullName;
        existing.UserName = user.UserName;
        existing.InActive = user.InActive;
        existing.RoleID = user.RoleID;
        existing.BranchID = user.BranchID;
        existing.EditOn = DateTime.Now;

        _context.SaveChanges();
        return existing;
    }

    // DELETE USER (soft delete recommended)
    public bool Delete(int id)
    {
        var user = _context.SystemUsers.Find(id);
        if (user == null) return false;

        user.InActive = true; // soft delete
        _context.SaveChanges();
        return true;
    }
}
