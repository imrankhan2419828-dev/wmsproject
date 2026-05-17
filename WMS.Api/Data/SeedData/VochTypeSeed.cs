using WMS.Api.Models;

namespace WMS.Api.Data.SeedData
{
    public static class VochTypeSeed
    {
        public static void Seed(WmsDbContext context)
        {
            if (!context.VochType.Any())
            {
                context.VochType.AddRange(
                    new VochType { VochTypeID = 1, VochName = "Sale", TypeAbbr = "SAL", VochTypeCode = "SI", VochDesc = "Sale Invoice", InActive = false },
                    new VochType { VochTypeID = 2, VochName = "Purchase", TypeAbbr = "PUR", VochTypeCode = "PI", VochDesc = "Purchase Invoice", InActive = false },
                    new VochType { VochTypeID = 3, VochName = "Receiving", TypeAbbr = "RCV", VochTypeCode = "RV", VochDesc = "Receipt Voucher", InActive = false },
                    new VochType { VochTypeID = 4, VochName = "Payment", TypeAbbr = "PAY", VochTypeCode = "PV", VochDesc = "Payment Voucher", InActive = false },
                    new VochType { VochTypeID = 5, VochName = "Journal", TypeAbbr = "JRN", VochTypeCode = "JV", VochDesc = "Journal Voucher", InActive = false },
                    new VochType { VochTypeID = 6, VochName = "Sale Return", TypeAbbr = "SRT", VochTypeCode = "CR", VochDesc = "Credit Note", InActive = false },
                    new VochType { VochTypeID = 7, VochName = "Purchase Return", TypeAbbr = "PRT", VochTypeCode = "DB", VochDesc = "Debit Note", InActive = false }
                );
                context.SaveChanges();
            }
        }
    }
}