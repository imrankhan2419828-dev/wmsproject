using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.SaleReturns;
using WMS.Api.Services.Interfaces;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SaleReturnController : BaseController
    {
        private readonly ISaleReturnService _service;
        private readonly WmsDbContext _context;

        public SaleReturnController(ISaleReturnService service, WmsDbContext context)
        {
            _service = service;
            _context = context;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetAllReturnsAsync(branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpGet("open-sales")]
        public async Task<IActionResult> GetOpenSales()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetOpenSalesAsync(branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpGet("sale-items/{saleTranNumb}")]
        public async Task<IActionResult> GetSaleItemsForReturn(int saleTranNumb)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetSaleItemsForReturnAsync(saleTranNumb, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return BadRequest(CreateErrorResponse(ex.Message));
            }
        }

        // ✅ NEW: Get all returns for a specific sale
        [HttpGet("by-sale/{saleTranNumb}")]
        public async Task<IActionResult> GetReturnsBySale(int saleTranNumb)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var returns = await _context.SaleReturnFiles
                    .Include(x => x.Items)
                    .Where(x => x.SaleTranNumb == saleTranNumb && x.BranchID == branchId && !x.CancStat)
                    .Select(x => new
                    {
                        x.ReturnTranNumb,
                        x.SaleTranNumb,
                        Items = x.Items.Select(i => new
                        {
                            i.ItemID,
                            i.ReturnQnty
                        })
                    })
                    .ToListAsync();

                return Ok(CreateResponse(returns));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpGet("{returnTranNumb}")]
        public async Task<IActionResult> GetById(int returnTranNumb)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetReturnByTranNumbAsync(returnTranNumb, branchId);
                if (data == null)
                    return NotFound(CreateErrorResponse("Return not found"));
                return Ok(CreateResponse(data));
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

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SaleReturnCreateDto dto)
        {
            try
            {
                Console.WriteLine("=== SaleReturn Create Called ===");

                if (dto == null)
                    return BadRequest(new { error = "Invalid data" });

                int branchId = GetCurrentBranchId();
                int userId = GetCurrentUserId();

                var returnTranNumb = await _service.CreateReturnAsync(dto, userId, branchId);

                return Ok(new { message = "Sale return saved successfully", returnTranNumb });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpDelete("{returnTranNumb}")]
        public async Task<IActionResult> Delete(int returnTranNumb)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var ok = await _service.DeleteReturnAsync(returnTranNumb, branchId);
                if (!ok)
                    return NotFound(CreateErrorResponse("Return not found"));
                return Ok(CreateResponse(null, "Return deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }
    }
}