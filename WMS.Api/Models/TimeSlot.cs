using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("TimeSlots")]
    public class TimeSlot
    {
        [Key]
        public int TimeSlotID { get; set; }

        [Required]
        [StringLength(50)]
        public string SlotName { get; set; } = string.Empty;

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        [Required]
        public int Duration { get; set; }

        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; } = 0;

        public int? BranchID { get; set; }
        public int MaxBookings { get; set; } = 1;

        [ForeignKey("BranchID")]
        public virtual Branch? Branch { get; set; }
    }
}