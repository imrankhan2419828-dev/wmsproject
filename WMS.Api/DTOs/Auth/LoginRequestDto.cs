//namespace WMS.Api.DTOs.Auth
//{
//    public class LoginRequestDto
//    {
//        public string UserName { get; set; }
//        public string Password { get; set; }
//        public int BranchID { get; set; }
//    }
//}
namespace WMS.Api.DTOs.Auth
{
    public class LoginRequestDto
    {
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        // ❌ BranchID hata do - user record se auto aayega
        // public int BranchID { get; set; }
    }
}