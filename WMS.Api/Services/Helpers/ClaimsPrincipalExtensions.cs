//using System.Security.Claims;

//namespace WMS.Api.Helpers
//{
//    public static class ClaimsPrincipalExtensions
//    {
//        public static int GetUserId(this ClaimsPrincipal user)
//        {
//            var id = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
//            return int.TryParse(id, out var result) ? result : 0;
//        }

//        public static int GetBranchId(this ClaimsPrincipal user)
//        {
//            var branch = user.FindFirst("BranchId")?.Value; // ya tumhare token me jo claim name hai
//            return int.TryParse(branch, out var result) ? result : 0;
//        }
//    }
//}
using System.Security.Claims;

namespace WMS.Api.Helpers
{
    public static class ClaimsPrincipalExtensions
    {
        public static int GetUserId(this ClaimsPrincipal user)
        {
            var id = user.FindFirst("UserID")?.Value;
            return int.TryParse(id, out var result) ? result : 0;
        }

        public static int GetBranchId(this ClaimsPrincipal user)
        {
            var claim =
                user.FindFirst("BranchID") ??
                user.FindFirst("BranchId");

            if (claim == null)
                throw new UnauthorizedAccessException("BranchID claim missing");

            return int.Parse(claim.Value);
        }

    }
}




