using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.Voucher;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class VochTypeController : BaseController
    {
        private readonly IVoucherService _voucherService;

        public VochTypeController(IVoucherService voucherService)
        {
            _voucherService = voucherService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var data = _voucherService.GetAllVoucherTypes();
            return Ok(CreateResponse(data));
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var data = _voucherService.GetVoucherTypeById(id);
            if (data == null)
                return NotFound(CreateErrorResponse("Voucher type not found"));
            return Ok(CreateResponse(data));
        }

        [HttpPost]
        public IActionResult Create([FromBody] VochTypeCreateDto dto)
        {
            try
            {
                _voucherService.CreateVoucherType(dto);
                return Ok(CreateResponse(null, "Voucher type created successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] VochTypeCreateDto dto)
        {
            try
            {
                _voucherService.UpdateVoucherType(id, dto);
                return Ok(CreateResponse(null, "Voucher type updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                _voucherService.DeleteVoucherType(id);
                return Ok(CreateResponse(null, "Voucher type deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        // GET: api/Voucher/accounts
        [HttpGet("accounts")]
        public async Task<IActionResult> GetAccountsForDropdown()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var accounts = await _voucherService.GetAccountsForVoucherDropdown(branchId);
                return Ok(CreateResponse(accounts));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }


    }
}