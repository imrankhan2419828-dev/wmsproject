using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("Branch")]
    public class Branch
    {
        [Key]
        public int BranchID { get; set; }

        public string? BranchName { get; set; }
        public int? RegionID { get; set; }
        public string? BranchAddress { get; set; }
        public string? BranchPhone { get; set; }
        public string? BranchCooridnator { get; set; }
        public string? BranchAbbr { get; set; }
        public string? C_Cell { get; set; }
        public string? C_Email { get; set; }
        public bool? InActive { get; set; }
        public bool? IsDeleted { get; set; }
        public string? BranchZone { get; set; }
        public string? BranchCity { get; set; }
        public int? ZoneID { get; set; }
        public string? POSID { get; set; }
        public bool? FBRIntegrate { get; set; }
        public string? IpAddr { get; set; }
        public string? MacAddr { get; set; }
        public string? Remarks { get; set; }

        // Navigation Properties
        public virtual ICollection<SystemUser>? Users { get; set; }
    }
}