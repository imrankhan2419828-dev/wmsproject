//using Microsoft.AspNetCore.Mvc;
//using WMS.Api.DTOs.Company;
//using WMS.Api.Services.Interfaces;

//[ApiController]
//[Route("api/[controller]")]
//public class CompFileController : ControllerBase
//{
//    private readonly ICompFileService _service;

//    public CompFileController(ICompFileService service)
//    {
//        _service = service;
//    }

//    [HttpGet]
//    public IActionResult GetAll() => Ok(_service.GetAll());

//    [HttpGet("{id}")]
//    public IActionResult GetById(int id)
//    {
//        var company = _service.GetById(id);
//        if (company == null) return NotFound();
//        return Ok(company);
//    }

//    [HttpPost]
//    public IActionResult Create([FromBody] CompFileCreateDto dto)
//    {
//        _service.Create(dto);
//        return Ok();
//    }

//    [HttpPut("{id}")]
//    public IActionResult Update(int id, [FromBody] CompFileCreateDto dto)
//    {
//        _service.Update(id, dto);
//        return Ok();
//    }

//    [HttpDelete("{id}")]
//    public IActionResult Delete(int id)
//    {
//        _service.Delete(id);
//        return Ok();
//    }
//}
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.Controllers;
using WMS.Api.DTOs.Company;
using WMS.Api.Services.Interfaces;

// CompFileController.cs
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CompFileController : BaseController
{
    private readonly ICompFileService _service;

    public CompFileController(ICompFileService service)
    {
        _service = service;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        try
        {
            int branchId = GetCurrentBranchId();  // ✅ Get branch from logged-in user
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
            var company = _service.GetById(id, branchId);
            if (company == null)
                return NotFound(CreateErrorResponse("Company not found"));

            return Ok(CreateResponse(company));
        }
        catch (Exception ex)
        {
            return StatusCode(500, CreateErrorResponse(ex.Message, ex));
        }
    }

    [HttpPost]
    public IActionResult Create([FromBody] CompFileCreateDto dto)
    {
        try
        {
            int branchId = GetCurrentBranchId();  // ✅ Get current branch
            int userId = GetCurrentUserId();       // ✅ Get current user

            _service.Create(dto, branchId, userId);
            return Ok(CreateResponse(null, "Company created successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, CreateErrorResponse(ex.Message, ex));
        }
    }

    [HttpPut("{id}")]
    public IActionResult Update(int id, [FromBody] CompFileCreateDto dto)
    {
        try
        {
            int branchId = GetCurrentBranchId();  // ✅ Add branch check
            int userId = GetCurrentUserId();

            _service.Update(id, dto, branchId, userId);
            return Ok(CreateResponse(null, "Company updated successfully"));
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
            return Ok(CreateResponse(null, "Company deleted successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, CreateErrorResponse(ex.Message, ex));
        }
    }
}