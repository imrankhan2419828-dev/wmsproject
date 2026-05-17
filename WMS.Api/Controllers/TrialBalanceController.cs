//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using WMS.Api.Services.Interfaces;

//namespace WMS.Api.Controllers
//{
//    [Authorize]
//    [ApiController]
//    [Route("api/[controller]")]
//    public class TrialBalanceController : ControllerBase
//    {
//        private readonly ITrialBalanceService _service;

//        public TrialBalanceController(ITrialBalanceService service)
//        {
//            _service = service;
//        }

//        [HttpGet]
//        public IActionResult Get()
//        {
//            var branchClaim = User.Claims
//                .FirstOrDefault(x => x.Type.Equals("branchid", System.StringComparison.OrdinalIgnoreCase))
//                ?.Value;

//            if (!int.TryParse(branchClaim, out int branchId))
//                return BadRequest("Invalid Branch");

//            var data = _service.GetTrialBalance(branchId);
//            return Ok(data);
//        }
//    }
//}
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TrialBalanceController : BaseController  // 👈 Inherit from BaseController
    {
        private readonly ITrialBalanceService _service;

        public TrialBalanceController(ITrialBalanceService service)
        {
            _service = service;
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                int branchId = GetCurrentBranchId();  // 👈 Use BaseController method

                var data = _service.GetTrialBalance(branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // ❌ Remove these methods - they don't exist in the interface
        // [HttpGet("by-date")]
        // [HttpGet("summary")]
    }
}