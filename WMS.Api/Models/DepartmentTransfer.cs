using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("DepartmentTransfers")]
    public class DepartmentTransfer
    {
        [Key]
        public int TransferID { get; set; }

        [Required]
        public int JobCardID { get; set; }

        [Required]
        public int FromDepartmentID { get; set; }

        [Required]
        public int ToDepartmentID { get; set; }

        public DateTime TransferDate { get; set; } = DateTime.Now;
        public int? TransferredBy { get; set; }

        [StringLength(500)]
        public string? Reason { get; set; }

        public int? ReceivedBy { get; set; }
        public DateTime? ReceivedDate { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "PENDING"; // PENDING, RECEIVED, CANCELLED

        [StringLength(500)]
        public string? Notes { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        // Navigation Properties
        [ForeignKey("JobCardID")]
        public virtual JobCard? JobCard { get; set; }

        [ForeignKey("FromDepartmentID")]
        public virtual Department? FromDepartment { get; set; }

        [ForeignKey("ToDepartmentID")]
        public virtual Department? ToDepartment { get; set; }
    }
}