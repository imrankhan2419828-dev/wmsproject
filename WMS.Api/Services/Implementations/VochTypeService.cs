//using WMS.Api.Data;
//using WMS.Api.DTOs.Voucher;
//using WMS.Api.Models;
//using WMS.Api.Services.Interfaces;

//namespace WMS.Api.Services.Implementations
//{
//    public class VochTypeService : IVoucherService
//    {
//        private readonly WmsDbContext _context;

//        public VochTypeService(WmsDbContext context)
//        {
//            _context = context;
//        }

//        public List<VochTypeDto> GetAllVoucherTypes()
//        {
//            return _context.VochType
//                .Where(x => x.InActive != true)
//                .Select(x => new VochTypeDto
//                {
//                    VochTypeID = x.VochTypeID,
//                    VochName = x.VochName,
//                    TypeAbbr = x.TypeAbbr,
//                    VochType = x.VochType,
//                    VochDesc = x.VochDesc,
//                    InActive = x.InActive
//                }).ToList();
//        }

//        public VochTypeDto? GetVoucherTypeById(int id)
//        {
//            var entity = _context.VochType.Find(id);
//            if (entity == null) return null;

//            return new VochTypeDto
//            {
//                VochTypeID = entity.VochTypeID,
//                VochName = entity.VochName,
//                TypeAbbr = entity.TypeAbbr,
//                VochType = entity.VochType,
//                VochDesc = entity.VochDesc,
//                InActive = entity.InActive
//            };
//        }

//        public void CreateVoucherType(VochTypeCreateDto dto)
//        {
//            var entity = new VochType
//            {
//                VochName = dto.VochName,
//                TypeAbbr = dto.TypeAbbr,
//                VochType = dto.VochType,
//                VochDesc = dto.VochDesc,
//                InActive = dto.InActive ?? false
//            };
//            _context.VochType.Add(entity);
//            _context.SaveChanges();
//        }

//        public void UpdateVoucherType(int id, VochTypeCreateDto dto)
//        {
//            var entity = _context.VochType.Find(id);
//            if (entity == null) throw new Exception("Voucher type not found");

//            entity.VochName = dto.VochName;
//            entity.TypeAbbr = dto.TypeAbbr;
//            entity.VochType = dto.VochType;
//            entity.VochDesc = dto.VochDesc;
//            entity.InActive = dto.InActive ?? false;

//            _context.SaveChanges();
//        }

//        public void DeleteVoucherType(int id)
//        {
//            var entity = _context.VochType.Find(id);
//            if (entity != null)
//            {
//                entity.InActive = true;
//                _context.SaveChanges();
//            }
//        }

//        // Other methods will be implemented in VoucherService
//        public List<AcctTranDto> GetAllVouchers(int branchId, string? vochType = null, DateTime? fromDate = null, DateTime? toDate = null)
//        {
//            throw new NotImplementedException();
//        }

//        public AcctTranDetailDto? GetVoucherById(int id)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<int> CreateManualJournalVoucher(VoucherCreateDto dto, int userId, int branchId)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<int> CreateFromSaleAsync(int tranNumb, int userId, int branchId)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<int> CreateFromPurchaseAsync(int tranNumb, int userId, int branchId)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<int> CreateFromReceivingAsync(int receivingId, int userId, int branchId)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<int> CreateFromPaymentAsync(int paymentId, int userId, int branchId)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<bool> PostVoucherToLedger(int acctTranId, int userId)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<bool> ReversePosting(int acctTranId, int userId)
//        {
//            throw new NotImplementedException();
//        }

//        public Task<byte[]> PrintVoucher(int acctTranId)
//        {
//            throw new NotImplementedException();
//        }

//        public bool ValidateVoucherEntries(List<VoucherDetailDto> details)
//        {
//            throw new NotImplementedException();
//        }
//    }
//}