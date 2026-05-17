using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.Purchase;
using WMS.Api.Services.Interfaces;
using System.Threading.Tasks;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseController : BaseController
    {
        private readonly IPurchaseService _service;

        public PurchaseController(IPurchaseService service)
        {
            _service = service;
        }

        // GET: api/purchase/suppliers
        [HttpGet("suppliers")]
        public async Task<IActionResult> GetSuppliers()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var suppliers = await _service.GetSuppliersAsync(branchId);
                return Ok(CreateResponse(suppliers));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        // GET: api/purchase/items
        [HttpGet("items")]
        public async Task<IActionResult> GetItems()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var items = await _service.GetItemsAsync(branchId);
                return Ok(CreateResponse(items));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        // GET: api/purchase/next-bill
        [HttpGet("next-bill")]
        public async Task<IActionResult> GetNextBill()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var billNo = await _service.GenerateNextBillAsync(branchId);
                return Ok(CreateResponse(billNo));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        // GET: api/purchase
        [HttpGet]
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

        // GET: api/purchase/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var purchase = await _service.GetByIdAsync(id);
                if (purchase == null)
                    return NotFound(CreateErrorResponse("Purchase not found"));

                return Ok(CreateResponse(purchase));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        // POST: api/purchase
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PurchaseCreateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    // 🔥 FIXED: Extract error messages from ModelState
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage);
                    return BadRequest(CreateErrorResponse(string.Join(", ", errors)));
                }

                int branchId = GetCurrentBranchId();
                int userId = GetCurrentUserId();

                dto.BranchID = branchId;
                var result = await _service.CreateAsync(dto, userId);

                return Ok(CreateResponse(result, "Purchase created successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        // PUT: api/purchase/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] PurchaseUpdateDto dto)
        {
            try
            {
                if (id != dto.TranNumb)
                    return BadRequest(CreateErrorResponse("Transaction mismatch"));

                if (!ModelState.IsValid)
                {
                    // 🔥 FIXED: Extract error messages from ModelState
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage);
                    return BadRequest(CreateErrorResponse(string.Join(", ", errors)));
                }

                int userId = GetCurrentUserId();
                await _service.UpdateAsync(dto, userId);

                return Ok(CreateResponse(null, "Purchase updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        // DELETE: api/purchase/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _service.DeleteAsync(id);
                return Ok(CreateResponse(null, "Purchase deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }
    }
}