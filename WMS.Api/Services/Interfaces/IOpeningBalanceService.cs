using WMS.Api.DTOs.OpeningBalance;

namespace WMS.Api.Services.Interfaces
{
    public interface IOpeningBalanceService
    {
        OpeningBalanceResponseDto CreateOpeningBalance(OpeningBalanceRequestDto dto);
    }
}


