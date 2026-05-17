using System.Collections.Generic;
using WMS.Api.DTOs.TrialBalance;

namespace WMS.Api.Services.Interfaces
{
    public interface ITrialBalanceService
    {
        List<TrialBalanceDto> GetTrialBalance(int branchId);
    }
}

