using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("ReceivingCheque")]
    public class ReceivingCheque
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("ReceivingFile")]  // 🔥 Add this
        public int ReceivingFileId { get; set; }

        public string BankName { get; set; }
        public string ChequeNumber { get; set; }
        public DateTime ChequeDate { get; set; }
        public decimal Amount { get; set; }

        public ReceivingFile ReceivingFile { get; set; }
    }
}

