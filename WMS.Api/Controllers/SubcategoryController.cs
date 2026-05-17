// File: WMS.Api/Controllers/SubcategoryController.cs

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.Subcategory;
using WMS.Api.Helpers;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SubcategoryController : BaseController
    {
        private readonly ISubcategoryService _subcategoryService;

        public SubcategoryController(ISubcategoryService subcategoryService)
        {
            _subcategoryService = subcategoryService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SubcategoryCreateDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { error = "Invalid data" });

                int branchId = GetCurrentBranchId();
                int userId = GetCurrentUserId();

                var subcatID = await _subcategoryService.CreateAsync(dto, userId, branchId);

                return Ok(new { message = "Subcategory saved successfully", subcatID });
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // File: WMS.Api/Controllers/SubcategoryController.cs

        [HttpGet("all")]
        public IActionResult GetAll()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = _subcategoryService.GetAll(branchId);

                // Log the data to console
                Console.WriteLine($"Subcategory GetAll returned: {data?.Count ?? 0} records");

                return Ok(CreateResponse(data, "Subcategories retrieved successfully"));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Subcategory GetAll Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var subcategory = await _subcategoryService.GetByIdAsync(id);
                if (subcategory == null)
                    return NotFound(CreateErrorResponse("Subcategory not found"));

                return Ok(CreateResponse(subcategory));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] SubcategoryCreateDto dto)
        {
            try
            {
                if (id <= 0 || dto == null)
                    return BadRequest(new { error = "Invalid data" });

                int userId = GetCurrentUserId();
                var ok = await _subcategoryService.UpdateAsync(id, dto, userId);

                if (!ok)
                    return NotFound(CreateErrorResponse("Subcategory not found"));

                return Ok(CreateResponse(null, "Subcategory updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var ok = await _subcategoryService.DeleteAsync(id);
                if (!ok)
                    return NotFound(CreateErrorResponse("Subcategory not found"));

                return Ok(CreateResponse(null, "Subcategory deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // Extra: Get by Category (for dropdown filtering)
        [HttpGet("by-category/{catgId:int}")]
        public IActionResult GetByCategory(int catgId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = _subcategoryService.GetByCategory(catgId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // Add this method to SubcategoryController.cs
        [HttpGet("by-category-company")]
        public IActionResult GetByCategoryAndCompany([FromQuery] int catgId, [FromQuery] int companyId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                Console.WriteLine($"GetByCategoryAndCompany called - Category: {catgId}, Company: {companyId}, Branch: {branchId}");

                // Get all subcategories for this branch, category, and company
                var data = _subcategoryService.GetByCategoryAndCompany(catgId, companyId, branchId);

                Console.WriteLine($"Found {data?.Count ?? 0} subcategories");

                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetByCategoryAndCompany: {ex.Message}");
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }
    }
}