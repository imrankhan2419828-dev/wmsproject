using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("ReceivingCash")]
    public class ReceivingCash
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("ReceivingFile")]  // 🔥 Add this
        public int ReceivingFileId { get; set; }

        public decimal Amount { get; set; }

        public ReceivingFile ReceivingFile { get; set; }
    }
}