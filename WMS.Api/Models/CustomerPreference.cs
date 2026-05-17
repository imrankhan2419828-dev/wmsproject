using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models.Workshop
{
    [Table("CustomerPreferences")]
    public class CustomerPreference
    {
        [Key]
        public int PreferenceID { get; set; }

        [Required]
        public int CustomerID { get; set; }

        public bool PreferSMS { get; set; } = true;
        public bool PreferEmail { get; set; } = true;
        public bool PreferWhatsApp { get; set; } = false;

        [StringLength(50)]
        public string? SMSNumber { get; set; }

        [StringLength(200)]
        public string? EmailAddress { get; set; }

        [StringLength(50)]
        public string? WhatsAppNumber { get; set; }

        public bool AllowMarketing { get; set; } = false;
        public bool AllowServiceReminders { get; set; } = true;
        public bool AllowJobUpdates { get; set; } = true;

        [StringLength(10)]
        public string Language { get; set; } = "EN";

        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? ModifiedDate { get; set; }

        // Navigation Property
        [ForeignKey("CustomerID")]
        public virtual COA? Customer { get; set; }
    }
}