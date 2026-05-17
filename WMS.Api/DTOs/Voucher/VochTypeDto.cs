namespace WMS.Api.DTOs.Voucher
{
    public class VochTypeDto
    {
        public int VochTypeID { get; set; }
        public string? VochName { get; set; }
        public string? TypeAbbr { get; set; }
        public string? VochTypeCode { get; set; }
        public string? VochDesc { get; set; }
        public bool? InActive { get; set; }
    }

    public class VochTypeCreateDto
    {
        public string? VochName { get; set; }
        public string? TypeAbbr { get; set; }
        public string? VochTypeCode { get; set; }
        public string? VochDesc { get; set; }
        public bool? InActive { get; set; }
    }
}