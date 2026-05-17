//using System.ComponentModel.DataAnnotations;
//using System.ComponentModel.DataAnnotations.Schema;

//namespace WMS.Api.Models
//{
//    public class RolePermission
//    {
//        [Key]
//        public int RolePermissionID { get; set; }

//        public int RoleID { get; set; }

//        public int BranchID { get; set; }
//        public int FormID { get; set; }

//        public bool CanView { get; set; }
//        public bool CanAdd { get; set; }
//        public bool CanEdit { get; set; }
//        public bool CanDelete { get; set; }

//        // 🔥 REQUIRED navigation properties
//        [ForeignKey("RoleID")]
//        public RoleMaster Role { get; set; }

//        [ForeignKey("FormID")]
//        public FormDetail FormDetail { get; set; }

//        [ForeignKey("BranchID")]
//        public Branch Branch { get; set; }
//    }
//}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    public class RolePermission
    {
        [Key]
        public int RolePermissionID { get; set; }

        public int RoleID { get; set; }

        public int BranchID { get; set; }

        public int MenuID { get; set; }

        public bool CanView { get; set; }
        public bool CanAdd { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }

        // Navigation properties
        [ForeignKey("RoleID")]
        public virtual RoleMaster Role { get; set; }

        // 👈 Explicitly tell EF that MenuID maps to FormDetail's FormID
        [ForeignKey("MenuID")]
        public virtual FormDetail FormDetail { get; set; }

        [ForeignKey("BranchID")]
        public virtual Branch Branch { get; set; }
    }
}