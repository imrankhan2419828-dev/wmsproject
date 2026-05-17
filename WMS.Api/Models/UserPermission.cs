using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    public class UserPermission
    {
        [Key]
        public int UserPermissionID { get; set; }

        public int UserID { get; set; }

        [ForeignKey("UserID")]
        public SystemUser User { get; set; }

        // ✅ CHANGE: FormID → MenuID (database column name)
        public int MenuID { get; set; }

        [ForeignKey("MenuID")]  // Changed from FormID to MenuID
        public FormDetail FormDetail { get; set; }

        public bool CanView { get; set; }
        public bool CanAdd { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
    }
}