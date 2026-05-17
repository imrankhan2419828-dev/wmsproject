using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("RoleMaster")]
    public class RoleMaster
    {
        [Key]
        public int RoleID { get; set; }

        public string? RoleName { get; set; }
        public string? RoleRemarks { get; set; }
        public bool? InActive { get; set; }
        public int? AddBy { get; set; }
        public DateTime? AddOn { get; set; }
        public int? EditBy { get; set; }
        public DateTime? EditOn { get; set; }

        // Navigation Properties
        public virtual ICollection<SystemUser>? Users { get; set; }
        public virtual ICollection<RolePermission>? RolePermissions { get; set; }
    }
}