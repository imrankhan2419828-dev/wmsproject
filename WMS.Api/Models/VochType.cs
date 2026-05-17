//namespace WMS.Api.Models
//{
//    public class VochType
//    {
//        public int VochTypeID { get; set; }
//        public string VochName { get; set; }
//        public string TypeAbbr { get; set; }
//    }
//}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WMS.Api.Models
{
    [Table("VochType")]
    public class VochType
    {
        [Key]
        public int VochTypeID { get; set; }

        [MaxLength(50)]
        public string? VochName { get; set; }

        [MaxLength(3)]
        public string? TypeAbbr { get; set; }

        [MaxLength(2)]
        public string? VochTypeCode { get; set; }

        [MaxLength(50)]
        public string? VochDesc { get; set; }

        public bool? InActive { get; set; }
    }
}