//using WMS.Api.DTOs.Menu;

//namespace WMS.Api.DTOs.Auth
//{
//    public class LoginResponseDto
//    {
//        public string Token { get; set; }
//        public int UserID { get; set; }
//        public string FullName { get; set; }
//        public int RoleID { get; set; }
//        public int BranchID { get; set; }

//        public List<MenuDto> Menus { get; set; } = new();
//    }
//}
using WMS.Api.DTOs.Menu;

namespace WMS.Api.DTOs.Auth
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public int UserID { get; set; }
        public string FullName { get; set; } = string.Empty;
        public int RoleID { get; set; }
        public string RoleName { get; set; } = string.Empty; // 👈 ADD THIS
        public int BranchID { get; set; }
        public List<MenuDto> Menus { get; set; } = new();
    }
}