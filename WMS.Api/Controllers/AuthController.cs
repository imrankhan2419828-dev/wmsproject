using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.Auth;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthService authService,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequestDto dto)
        {
            try
            {
                _logger.LogInformation($"Login request for user: {dto.UserName}");

                var result = await _authService.LoginAsync(dto);

                _logger.LogInformation($"Login successful for user: {dto.UserName}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Login failed for user: {dto.UserName}");
                return Unauthorized(new { message = ex.Message });
            }
        }
    }
}