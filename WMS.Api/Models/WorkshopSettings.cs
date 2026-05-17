using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("WorkshopSettings")]
    public class WorkshopSettings
    {
        [Key]
        public int SettingID { get; set; }

        [Required]
        public int BranchID { get; set; }

        public int DailyBookingCapacity { get; set; } = 50;
        public int MaxTechnicianLoad { get; set; } = 8;
        public int OverbookingAlertThreshold { get; set; } = 80; // Percentage
        public bool SMSEnabled { get; set; } = false;
        public bool WhatsAppEnabled { get; set; } = false;
        public bool InspectionRequired { get; set; } = true;

        // Navigation
        [ForeignKey("BranchID")]
        public virtual Branch? Branch { get; set; }
    }
}