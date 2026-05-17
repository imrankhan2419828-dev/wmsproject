namespace WMS.Api.DTOs.SystemUser
{
    public class RoleDto
    {
        public int RoleID { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string? RoleRemarks { get; set; }
    }
}