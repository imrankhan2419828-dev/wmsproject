using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.PurchaseReturn;
using WMS.Api.Services.Interfaces;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseReturnController : BaseController
    {
        private readonly IPurchaseReturnService _service;

        public PurchaseReturnController(IPurchaseReturnService service)
        {
            _service = service;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetAllAsync(branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetByIdAsync(id, branchId);
                if (data == null)
                    return NotFound(CreateErrorResponse("Purchase return not found"));
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpGet("for-return")]
        public async Task<IActionResult> GetOpenPurchases()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetOpenPurchases(branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpGet("purchase/{tranNumb}")]
        public async Task<IActionResult> GetPurchaseItemsForReturn(int tranNumb)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetPurchaseItemsForReturn(tranNumb, branchId);
                if (data == null)
                    return NotFound(CreateErrorResponse("Purchase not found"));
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PurchaseReturnDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                    return BadRequest(CreateErrorResponse(string.Join(", ", errors)));
                }

                int branchId = GetCurrentBranchId();
                int userId = GetCurrentUserId();

                var result = await _service.CreateAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, "Purchase return created successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] PurchaseReturnDto dto)
        {
            try
            {
                if (id != dto.ReturnID)
                    return BadRequest(CreateErrorResponse("ID mismatch"));

                int branchId = GetCurrentBranchId();
                int userId = GetCurrentUserId();

                var result = await _service.UpdateAsync(id, dto, userId, branchId);
                if (result == null)
                    return NotFound(CreateErrorResponse("Purchase return not found"));

                return Ok(CreateResponse(result, "Purchase return updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _service.DeleteAsync(id, branchId);
                if (!result)
                    return NotFound(CreateErrorResponse("Purchase return not found"));

                return Ok(CreateResponse(null, "Purchase return deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }


        [HttpGet("next-bill")]
        public async Task<IActionResult> GetNextBillNumber()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var nextBill = await _service.GenerateReturnBillNumberAsync(branchId);
                return Ok(CreateResponse(nextBill));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }
    }
}