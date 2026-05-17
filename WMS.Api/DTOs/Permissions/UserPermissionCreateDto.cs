namespace WMS.Api.DTOs.Permissions
{
    public class UserPermissionCreateDto
    {
        public int UserID { get; set; }
        public int MenuID { get; set; }
        public bool? CanView { get; set; }
        public bool? CanAdd { get; set; }
        public bool? CanEdit { get; set; }
        public bool? CanDelete { get; set; }
    }
}
