//using Microsoft.AspNetCore.Mvc;
//using WMS.Api.DTOs.FormDetail;

//[Route("api/[controller]")]
//[ApiController]
//public class FormDetailController : ControllerBase
//{
//    private readonly IFormDetailService _service;

//    public FormDetailController(IFormDetailService service)
//    {
//        _service = service;
//    }

//    [HttpGet]
//    public async Task<IActionResult> GetAll()
//        => Ok(await _service.GetAllAsync());

//    [HttpGet("{id}")]
//    public async Task<IActionResult> Get(int id)
//    {
//        var result = await _service.GetByIdAsync(id);
//        return result == null ? NotFound() : Ok(result);
//    }

//    [HttpPost]
//    public async Task<IActionResult> Create(FormDetailCreateDto dto)
//        => Ok(await _service.CreateAsync(dto));

//    [HttpPut("{id}")]
//    public async Task<IActionResult> Update(int id, FormDetailUpdateDto dto)
//    {
//        var result = await _service.UpdateAsync(id, dto);
//        return result == null ? NotFound() : Ok(result);
//    }

//    [HttpDelete("{id}")]
//    public async Task<IActionResult> Delete(int id)
//        => Ok(await _service.DeleteAsync(id));
//}
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.Controllers;
using WMS.Api.DTOs.FormDetail;
using WMS.Api.Services.Interfaces;

[Authorize]  // 👈 Require authentication
[Route("api/[controller]")]
[ApiController]
public class FormDetailController : BaseController  // 👈 Inherit from BaseController
{
    private readonly IFormDetailService _service;

    public FormDetailController(IFormDetailService service)
    {
        _service = service;
    }

    // 🔥 PUBLIC METHODS - Available to all authenticated users
    //[HttpGet]
    //public async Task<IActionResult> GetAll()
    //{
    //    try
    //    {
    //        var result = await _service.GetAllAsync();
    //        return Ok(CreateResponse(result));
    //    }
    //    catch (Exception ex)
    //    {
    //        return StatusCode(500, CreateErrorResponse(ex.Message, ex));
    //    }
    //}
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            // 🔒 Check if user is SuperAdmin
            if (!IsSuperAdmin())
                return Unauthorized(CreateErrorResponse("Only SuperAdmin can access form management"));

            var result = await _service.GetAllAsync();
            return Ok(CreateResponse(result));
        }
        catch (Exception ex)
        {
            return StatusCode(500, CreateErrorResponse(ex.Message, ex));
        }
    }



    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        try
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null)
                return NotFound(CreateErrorResponse("Form not found"));

            return Ok(CreateResponse(result));
        }
        catch (Exception ex)
        {
            return StatusCode(500, CreateErrorResponse(ex.Message, ex));
        }
    }

    [HttpGet("by-category/{category}")]
    public async Task<IActionResult> GetByCategory(string category)
    {
        try
        {
            var result = await _service.GetByCategoryAsync(category);
            return Ok(CreateResponse(result));
        }
        catch (Exception ex)
        {
            return StatusCode(500, CreateErrorResponse(ex.Message, ex));
        }
    }

    [HttpGet("menu")]
    public async Task<IActionResult> GetMenu()
    {
        try
        {
            var result = await _service.GetMenuStructureAsync();
            return Ok(CreateResponse(result));
        }
        catch (Exception ex)
        {
            return StatusCode(500, CreateErrorResponse(ex.Message, ex));
        }
    }

    [HttpGet("by-parent/{parentId}")]
    public async Task<IActionResult> GetByParent(int parentId)
    {
        try
        {
            var result = await _service.GetByParentAsync(parentId);
            return Ok(CreateResponse(result));
        }
        catch (Exception ex)
        {
            return StatusCode(500, CreateErrorResponse(ex.Message, ex));
        }
    }

    // 🔒 SUPERADMIN ONLY METHODS - CRUD operations
    [HttpPost]
    public async Task<IActionResult> Create(FormDetailCreateDto dto)
    {
        try
        {
            // 🔒 Check if user is SuperAdmin
            if (!IsSuperAdmin())
                return Unauthorized(CreateErrorResponse("Only SuperAdmin can create forms"));

            var result = await _service.CreateAsync(dto);
            return Ok(CreateResponse(result, "Form created successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, CreateErrorResponse(ex.Message, ex));
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, FormDetailUpdateDto dto)
    {
        try
        {
            // 🔒 Check if user is SuperAdmin
            if (!IsSuperAdmin())
                return Unauthorized(CreateErrorResponse("Only SuperAdmin can update forms"));

            var result = await _service.UpdateAsync(id, dto);
            if (result == null)
                return NotFound(CreateErrorResponse("Form not found"));

            return Ok(CreateResponse(result, "Form updated successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, CreateErrorResponse(ex.Message, ex));
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            // 🔒 Check if user is SuperAdmin
            if (!IsSuperAdmin())
                return Unauthorized(CreateErrorResponse("Only SuperAdmin can delete forms"));

            var result = await _service.DeleteAsync(id);
            return Ok(CreateResponse(result, "Form deleted successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, CreateErrorResponse(ex.Message, ex));
        }
    }
}