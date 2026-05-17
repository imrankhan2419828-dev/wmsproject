using System.ComponentModel.DataAnnotations;

namespace WMS.Api.DTOs.Workshop
{
    public class WorkshopSettingsDto
    {
        public int SettingID { get; set; }
        public int BranchID { get; set; }
        public string? BranchName { get; set; }
        public int DailyBookingCapacity { get; set; }
        public int MaxTechnicianLoad { get; set; }
        public int OverbookingAlertThreshold { get; set; }
        public bool SMSEnabled { get; set; }
        public bool WhatsAppEnabled { get; set; }
        public bool InspectionRequired { get; set; }
    }

    public class WorkshopSettingsCreateDto
    {
        [Required]
        public int BranchID { get; set; }

        public int DailyBookingCapacity { get; set; } = 50;
        public int MaxTechnicianLoad { get; set; } = 8;
        public int OverbookingAlertThreshold { get; set; } = 80;
        public bool SMSEnabled { get; set; } = false;
        public bool WhatsAppEnabled { get; set; } = false;
        public bool InspectionRequired { get; set; } = true;
    }

    public class WorkshopSettingsUpdateDto : WorkshopSettingsCreateDto
    {
        [Required]
        public int SettingID { get; set; }
    }

    public class CapacityCheckResultDto
    {
        public string Status { get; set; } = string.Empty; // AVAILABLE, NEAR_CAPACITY, OVERBOOKED
        public int CurrentBookings { get; set; }
        public int Capacity { get; set; }
        public int Percentage { get; set; }
        public string? Message { get; set; }
    }
}