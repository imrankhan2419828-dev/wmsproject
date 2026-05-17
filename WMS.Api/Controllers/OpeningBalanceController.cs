//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using WMS.Api.DTOs.OpeningBalance;
//using WMS.Api.Services.Interfaces;

//namespace WMS.Api.Controllers
//{
//    [Authorize]
//    [ApiController]
//    [Route("api/[controller]")]
//    public class OpeningBalanceController : ControllerBase
//    {
//        private readonly IOpeningBalanceService _service;

//        public OpeningBalanceController(IOpeningBalanceService service)
//        {
//            _service = service;
//        }

//        [HttpPost("post")]
//        public IActionResult PostOpeningBalance([FromBody] OpeningBalanceRequestDto dto)
//        {
//            var result = _service.CreateOpeningBalance(dto);
//            return Ok(result);
//        }
//    }
//}
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.OpeningBalance;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class OpeningBalanceController : BaseController  // 👈 Inherit from BaseController
    {
        private readonly IOpeningBalanceService _service;

        public OpeningBalanceController(IOpeningBalanceService service)
        {
            _service = service;
        }

        [HttpPost("post")]
        public IActionResult PostOpeningBalance([FromBody] OpeningBalanceRequestDto dto)
        {
            try
            {
                int branchId = GetCurrentBranchId();  // 👈 Get branch from token/header
                int userId = GetCurrentUserId();      // 👈 Get user from token

                // ✅ Service mein yeh method exist karta hai
                var result = _service.CreateOpeningBalance(dto);
                return Ok(CreateResponse(result, "Opening balance posted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // ❌ Remove these methods - they don't exist in the service
        // [HttpGet]
        // [HttpGet("by-coa/{coaId}")]
    }
}