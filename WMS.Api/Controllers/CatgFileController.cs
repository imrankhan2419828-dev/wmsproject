using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.Category;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Controllers
{
    // CatgFileController.cs
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CatgFileController : BaseController
    {
        private readonly ICatgFileService _service;

        public CatgFileController(ICatgFileService service)
        {
            _service = service;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            try
            {
                int branchId = GetCurrentBranchId();  // ✅ Get branch from user
                var data = _service.GetAll(branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();  // ✅ Add branch check
                var data = _service.GetById(id, branchId);
                if (data == null)
                    return NotFound(CreateErrorResponse("Category not found"));

                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost]
        public IActionResult Create(CatgFileCreateDto dto)
        {
            try
            {
                int branchId = GetCurrentBranchId();  // ✅ Get current branch
                int userId = GetCurrentUserId();       // ✅ Get current user

                _service.Create(dto, branchId, userId);
                return Ok(CreateResponse(null, "Category created successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, CatgFileUpdateDto dto)
        {
            try
            {
                if (id != dto.CatgID)
                    return BadRequest(CreateErrorResponse("ID mismatch"));

                int branchId = GetCurrentBranchId();  // ✅ Add branch check
                int userId = GetCurrentUserId();

                _service.Update(dto, branchId, userId);
                return Ok(CreateResponse(null, "Category updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();  // ✅ Add branch check
                int userId = GetCurrentUserId();

                _service.Delete(id, branchId, userId);
                return Ok(CreateResponse(null, "Category deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }
    }
}