using WMS.Api.DTOs.Auth;

namespace WMS.Api.Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    }
}
