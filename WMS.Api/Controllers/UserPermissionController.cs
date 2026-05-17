//using Microsoft.AspNetCore.Mvc;
//using WMS.Api.DTOs.Permissions;
//using WMS.Api.Services.Interfaces;

//namespace WMS.Api.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class UserPermissionController : ControllerBase
//    {
//        private readonly IUserPermissionService _service;
//        public UserPermissionController(IUserPermissionService service) => _service = service;

//        [HttpGet]
//        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

//        [HttpGet("user/{userId}")]
//        public async Task<IActionResult> GetByUser(int userId) => Ok(await _service.GetByUserIdAsync(userId));

//        [HttpGet("{id}")]
//        public async Task<IActionResult> Get(int id)
//        {
//            var res = await _service.GetByIdAsync(id);
//            return res == null ? NotFound() : Ok(res);
//        }

//        [HttpPost]
//        public async Task<IActionResult> Create(UserPermissionCreateDto dto) => Ok(await _service.CreateAsync(dto));

//        [HttpPut("{id}")]
//        public async Task<IActionResult> Update(int id, UserPermissionCreateDto dto)
//        {
//            var res = await _service.UpdateAsync(id, dto);
//            return res == null ? NotFound() : Ok(res);
//        }

//        [HttpDelete("{id}")]
//        public async Task<IActionResult> Delete(int id) => Ok(await _service.DeleteAsync(id));
//    }
//}
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.Permissions;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Controllers
{
    [Authorize]  // 👈 Add Authorize
    [Route("api/[controller]")]
    [ApiController]
    public class UserPermissionController : BaseController  // 👈 Inherit from BaseController
    {
        private readonly IUserPermissionService _service;

        public UserPermissionController(IUserPermissionService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _service.GetAllAsync();
                return Ok(CreateResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            try
            {
                var result = await _service.GetByUserIdAsync(userId);
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
                    return NotFound(CreateErrorResponse("User permission not found"));

                return Ok(CreateResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create(UserPermissionCreateDto dto)
        {
            try
            {
                // 🔒 Optional: SuperAdmin check for assigning permissions
                // if (!IsSuperAdmin())
                //     return Unauthorized(CreateErrorResponse("Only SuperAdmin can assign permissions"));

                var result = await _service.CreateAsync(dto);
                return Ok(CreateResponse(result, "User permission created successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UserPermissionCreateDto dto)
        {
            try
            {
                // 🔒 Optional: SuperAdmin check
                // if (!IsSuperAdmin())
                //     return Unauthorized(CreateErrorResponse("Only SuperAdmin can update permissions"));

                var result = await _service.UpdateAsync(id, dto);
                if (result == null)
                    return NotFound(CreateErrorResponse("User permission not found"));

                return Ok(CreateResponse(result, "User permission updated successfully"));
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
                // 🔒 Optional: SuperAdmin check
                // if (!IsSuperAdmin())
                //     return Unauthorized(CreateErrorResponse("Only SuperAdmin can delete permissions"));

                var result = await _service.DeleteAsync(id);
                return Ok(CreateResponse(result, "User permission deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }
    }
}