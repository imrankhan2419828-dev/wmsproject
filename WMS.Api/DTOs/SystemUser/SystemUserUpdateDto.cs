namespace WMS.Api.DTOs.SystemUser
{
    public class SystemUserUpdateDto
    {
        public string UserFullName { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string? Password { get; set; }
        public string? UserEmail { get; set; }
        public int RoleID { get; set; }
        public bool IsAdmin { get; set; } = false;
        public bool InActive { get; set; } = false;
    }
}