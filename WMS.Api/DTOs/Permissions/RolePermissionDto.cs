//public class RolePermissionDto
//{
//    public int RolePermissionID { get; set; }
//    public int RoleID { get; set; }
//    public string RoleName { get; set; }
//    public int FormID { get; set; }
//    public string FormName { get; set; }
//    public bool CanView { get; set; }
//    public bool CanAdd { get; set; }
//    public bool CanEdit { get; set; }
//    public bool CanDelete { get; set; }
//}
// DTOs/Permissions/RolePermissionDto.cs
namespace WMS.Api.DTOs.Permissions
{
    public class RolePermissionDto
    {
        public int RolePermissionID { get; set; }
        public int RoleID { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public int MenuID { get; set; }  // ✅ MenuID
        public string FormName { get; set; } = string.Empty;
        public string FormTitle { get; set; } = string.Empty;
        public bool CanView { get; set; }
        public bool CanAdd { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
    }

    public class RolePermissionCreateDto
    {
        public int RoleID { get; set; }
        public int MenuID { get; set; }  // ✅ MenuID
        public bool CanView { get; set; }
        public bool CanAdd { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
        public int BranchID { get; set; } = 1;  // ✅ Add BranchID with default
    }

    public class RolePermissionBulkSaveDto
    {
        public int RoleID { get; set; }
        public int BranchID { get; set; } = 1;
        public List<RolePermissionItemDto> Permissions { get; set; } = new();
    }

    public class RolePermissionItemDto
    {
        public int MenuID { get; set; }
        public bool CanView { get; set; }
        public bool CanAdd { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
    }
}