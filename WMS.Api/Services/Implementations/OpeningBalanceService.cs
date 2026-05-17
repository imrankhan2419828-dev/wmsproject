using System;
using System.Linq;
using WMS.Api.Data;
using WMS.Api.DTOs.OpeningBalance;
using WMS.Api.Models;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class OpeningBalanceService : IOpeningBalanceService
    {
        private readonly WmsDbContext _context;

        public OpeningBalanceService(WmsDbContext context)
        {
            _context = context;
        }

        public OpeningBalanceResponseDto CreateOpeningBalance(OpeningBalanceRequestDto dto)
        {
            // 🔒 1. Check if Opening already exists
            var alreadyExists = _context.AcctTran
                .Any(x => x.TypeAbbr == "OB"
                       && x.BranchID == dto.BranchID
                       && x.IsDeleted != true);

            if (alreadyExists)
            {
                throw new Exception("Opening Balance already exists for this branch.");
            }

            // 🧾 2. Create AcctTran (Voucher Header)
            var tran = new AcctTran
            {
                TranDate = DateTime.Today,
                VochType = "OPENING",
                TypeAbbr = "OB",
                TranDesc = "Opening Balance",
                BranchID = dto.BranchID,
                AddOn = DateTime.Now,
                AddBy = dto.UserID,
                IsDeleted = false
            };

            _context.AcctTran.Add(tran);
            _context.SaveChanges(); // 🔥 AcctTranID generated

            // 📘 3. Read COA Opening Amounts
            var coaList = _context.tblCOA
                .Where(x => x.OpenAmnt != null
                         && x.OpenAmnt != 0
                         && x.BranchID == dto.BranchID
                         && x.Active == true)
                .ToList();

            // 🧮 4. Create AcctTrad Lines
            foreach (var coa in coaList)
            {
                var trad = new AcctTrad
                {
                    AcctTranID = tran.AcctTranID,
                    TranDate = tran.TranDate,
                    AcctID = coa.acctID,
                    AcctCode = coa.AcctCode,
                    TranNatr = coa.AcctDebt == true ? "DR" : "CR",
                    DebtAmnt = coa.AcctDebt == true ? (double?)coa.OpenAmnt : 0,
                    CrdtAmnt = coa.AcctDebt == false ? (double?)coa.OpenAmnt : 0,
                    Remarks = "Opening Balance",
                    IsDeleted = false
                };

                _context.AcctTrad.Add(trad);
            }

            _context.SaveChanges(); // ✅ AcctTrad saved

            // 🔒 5. LOCK COA AFTER OPENING  ✅ (ADDED HERE)
            var coaToLock = _context.tblCOA
                .Where(x => x.BranchID == dto.BranchID && x.Active == true)
                .ToList();

            foreach (var coa in coaToLock)
            {
                coa.LockAcct = true;
            }

            _context.SaveChanges(); // 🔐 COA locked

            // ✅ 6. Response
            return new OpeningBalanceResponseDto
            {
                AcctTranID = tran.AcctTranID,
                Message = "Opening Balance posted successfully"
            };
        }
    }
}
