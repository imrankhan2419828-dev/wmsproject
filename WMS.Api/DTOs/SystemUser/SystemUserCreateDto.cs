namespace WMS.Api.DTOs.SystemUser
{
    public class SystemUserCreateDto
    {
        public string UserFullName { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? UserEmail { get; set; }
        public int RoleID { get; set; }
        public bool IsAdmin { get; set; }


    }
}