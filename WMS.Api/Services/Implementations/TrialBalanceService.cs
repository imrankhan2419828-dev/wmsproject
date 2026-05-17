using System.Linq;
using System.Collections.Generic;
using WMS.Api.Data;
using WMS.Api.DTOs.TrialBalance;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class TrialBalanceService : ITrialBalanceService
    {
        private readonly WmsDbContext _context;

        public TrialBalanceService(WmsDbContext context)
        {
            _context = context;
        }

        public List<TrialBalanceDto> GetTrialBalance(int branchId)
        {
            var result = (
                from t in _context.AcctTrad
                join c in _context.tblCOA on t.AcctID equals c.acctID
                join h in _context.AcctTran on t.AcctTranID equals h.AcctTranID
                where h.BranchID == branchId
                      && h.IsDeleted != true
                      && t.IsDeleted != true
                group t by new
                {
                    c.acctID,
                    c.AcctCode,
                    c.AcctName
                }
                into g
                select new TrialBalanceDto
                {
                    AcctID = g.Key.acctID,
                    AcctCode = g.Key.AcctCode,
                    AcctName = g.Key.AcctName,
                    Debit = g.Sum(x => x.DebtAmnt ?? 0),
                    Credit = g.Sum(x => x.CrdtAmnt ?? 0)
                }
            ).OrderBy(x => x.AcctCode).ToList();

            return result;
        }
    }
}

