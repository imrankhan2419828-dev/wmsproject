//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using WMS.Api.Data;
//using WMS.Api.DTOs.Branch;
//using WMS.Api.Models;
//using AutoMapper;

//namespace WMS.Api.Controllers
//{
//    [ApiController]
//    [Route("api/[controller]")]
//    [Authorize]
//    public class BranchController : ControllerBase
//    {
//        private readonly WmsDbContext _context;
//        private readonly IMapper _mapper;
//        private readonly ILogger<BranchController> _logger;

//        public BranchController(
//            WmsDbContext context,
//            IMapper mapper,
//            ILogger<BranchController> logger)
//        {
//            _context = context;
//            _mapper = mapper;
//            _logger = logger;
//        }

//        // =========================
//        // GET ALL
//        // =========================
//        [HttpGet]
//        public async Task<IActionResult> GetAll()
//        {
//            try
//            {
//                var branches = await _context.Branches
//                    .Where(x => x.IsDeleted == false || x.IsDeleted == null)
//                    .OrderBy(x => x.BranchName)
//                    .ToListAsync();

//                var branchDtos = _mapper.Map<List<BranchDto>>(branches);
//                return Ok(branchDtos);
//            }
//            catch (Exception ex)
//            {
//                _logger.LogError(ex, "Error getting branches");
//                return StatusCode(500, new { message = "Error loading branches" });
//            }
//        }

//        // =========================
//        // GET BY ID
//        // =========================
//        [HttpGet("{id}")]
//        public async Task<IActionResult> Get(int id)
//        {
//            try
//            {
//                var branch = await _context.Branches.FindAsync(id);
//                if (branch == null)
//                    return NotFound(new { message = "Branch not found" });

//                var branchDto = _mapper.Map<BranchDto>(branch);
//                return Ok(branchDto);
//            }
//            catch (Exception ex)
//            {
//                _logger.LogError(ex, "Error getting branch {Id}", id);
//                return StatusCode(500, new { message = "Error loading branch" });
//            }
//        }

//        // =========================
//        // CREATE
//        // =========================
//        [HttpPost]
//        public async Task<IActionResult> Create([FromBody] BranchDto dto)
//        {
//            try
//            {
//                if (dto == null)
//                    return BadRequest(new { message = "Invalid branch data" });

//                var branch = _mapper.Map<Branch>(dto);
//                branch.IsDeleted = false;
//                branch.InActive = dto.InActive ?? false;

//                _context.Branches.Add(branch);
//                await _context.SaveChangesAsync();

//                var result = _mapper.Map<BranchDto>(branch);
//                return Ok(result);
//            }
//            catch (Exception ex)
//            {
//                _logger.LogError(ex, "Error creating branch");
//                return StatusCode(500, new { message = "Error creating branch" });
//            }
//        }

//        // =========================
//        // UPDATE
//        // =========================
//        [HttpPut("{id}")]
//        public async Task<IActionResult> Update(int id, [FromBody] BranchDto dto)
//        {
//            try
//            {
//                _logger.LogInformation($"Updating branch with ID: {id}");

//                var branch = await _context.Branches.FindAsync(id);
//                if (branch == null)
//                    return NotFound(new { message = "Branch not found" });

//                // ✅ Manual mapping - BranchID ko map mat karo
//                branch.BranchName = dto.BranchName ?? branch.BranchName;
//                branch.BranchAddress = dto.BranchAddress ?? branch.BranchAddress;
//                branch.BranchPhone = dto.BranchPhone ?? branch.BranchPhone;
//                branch.BranchCooridnator = dto.BranchCooridnator ?? branch.BranchCooridnator;
//                branch.BranchAbbr = dto.BranchAbbr ?? branch.BranchAbbr;
//                branch.C_Cell = dto.C_Cell ?? branch.C_Cell;
//                branch.C_Email = dto.C_Email ?? branch.C_Email;
//                branch.BranchCity = dto.BranchCity ?? branch.BranchCity;
//                branch.Remarks = dto.Remarks ?? branch.Remarks;
//                branch.InActive = dto.InActive ?? branch.InActive;

//                await _context.SaveChangesAsync();

//                var result = new BranchDto
//                {
//                    BranchID = branch.BranchID,
//                    BranchName = branch.BranchName,
//                    BranchAddress = branch.BranchAddress,
//                    BranchPhone = branch.BranchPhone,
//                    BranchCooridnator = branch.BranchCooridnator,
//                    BranchAbbr = branch.BranchAbbr,
//                    C_Cell = branch.C_Cell,
//                    C_Email = branch.C_Email,
//                    BranchCity = branch.BranchCity,
//                    Remarks = branch.Remarks,
//                    InActive = branch.InActive
//                };

//                _logger.LogInformation($"Branch {id} updated successfully");
//                return Ok(result);
//            }
//            catch (Exception ex)
//            {
//                _logger.LogError(ex, "Error updating branch {Id}", id);
//                return StatusCode(500, new { message = "Error updating branch" });
//            }
//        }

//        // =========================
//        // DELETE (Soft delete)
//        // =========================
//        [HttpDelete("{id}")]
//        public async Task<IActionResult> Delete(int id)
//        {
//            try
//            {
//                var branch = await _context.Branches.FindAsync(id);
//                if (branch == null)
//                    return NotFound(new { message = "Branch not found" });

//                // Soft delete
//                branch.IsDeleted = true;
//                await _context.SaveChangesAsync();

//                return Ok(new { message = "Branch deleted successfully" });
//            }
//            catch (Exception ex)
//            {
//                _logger.LogError(ex, "Error deleting branch {Id}", id);
//                return StatusCode(500, new { message = "Error deleting branch" });
//            }
//        }
//    }
//}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Branch;
using WMS.Api.Models;
using AutoMapper;

namespace WMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BranchController : BaseController  // 👈 Inherit from BaseController
    {
        private readonly WmsDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<BranchController> _logger;

        public BranchController(
            WmsDbContext context,
            IMapper mapper,
            ILogger<BranchController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // =========================
        // GET ALL BRANCHES (with SuperAdmin logic)
        // =========================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                _logger.LogInformation("GetAll branches called");

                // ✅ Check if user is SuperAdmin
                bool isSuperAdmin = IsSuperAdmin();
                int userBranchId = GetCurrentBranchId();

                _logger.LogInformation($"IsSuperAdmin: {isSuperAdmin}, UserBranchId: {userBranchId}");

                IQueryable<Branch> query = _context.Branches
                    .Where(x => x.IsDeleted == false || x.IsDeleted == null);

                // 🔥 SuperAdmin - saari branches dikhao
                // Normal user - sirf apni branch dikhao
                if (!isSuperAdmin)
                {
                    query = query.Where(x => x.BranchID == userBranchId);
                }

                var branches = await query
                    .OrderBy(x => x.BranchName)
                    .ToListAsync();

                var branchDtos = _mapper.Map<List<BranchDto>>(branches);

                return Ok(CreateResponse(branchDtos));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting branches");
                return StatusCode(500, CreateErrorResponse("Error loading branches", ex));
            }
        }

        // =========================
        // GET ALL BRANCHES FOR DROPDOWN (SuperAdmin only)
        // =========================
        [HttpGet("dropdown")]
        public async Task<IActionResult> GetDropdown()
        {
            try
            {
                // 🔥 Sirf SuperAdmin ke liye
                if (!IsSuperAdmin())
                {
                    return Unauthorized(CreateErrorResponse("Only SuperAdmin can access all branches"));
                }

                var branches = await _context.Branches
                    .Where(x => x.IsDeleted == false || x.IsDeleted == null)
                    .OrderBy(x => x.BranchName)
                    .Select(x => new { x.BranchID, x.BranchName })
                    .ToListAsync();

                return Ok(CreateResponse(branches));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting branch dropdown");
                return StatusCode(500, CreateErrorResponse("Error loading branches", ex));
            }
        }

        // =========================
        // GET BY ID
        // =========================
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var branch = await _context.Branches.FindAsync(id);
                if (branch == null)
                    return NotFound(CreateErrorResponse("Branch not found"));

                // 🔥 Check access
                int userBranchId = GetCurrentBranchId();
                if (!IsSuperAdmin() && branch.BranchID != userBranchId)
                {
                    return Unauthorized(CreateErrorResponse("You don't have access to this branch"));
                }

                var branchDto = _mapper.Map<BranchDto>(branch);
                return Ok(CreateResponse(branchDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting branch {Id}", id);
                return StatusCode(500, CreateErrorResponse("Error loading branch", ex));
            }
        }

        // =========================
        // CREATE
        // =========================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] BranchDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(CreateErrorResponse("Invalid branch data"));

                // 🔥 Sirf SuperAdmin hi branch create kar sakta hai
                if (!IsSuperAdmin())
                {
                    return Unauthorized(CreateErrorResponse("Only SuperAdmin can create branches"));
                }

                var branch = _mapper.Map<Branch>(dto);
                branch.IsDeleted = false;
                branch.InActive = dto.InActive ?? false;

                _context.Branches.Add(branch);
                await _context.SaveChangesAsync();

                var result = _mapper.Map<BranchDto>(branch);
                return Ok(CreateResponse(result, "Branch created successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating branch");
                return StatusCode(500, CreateErrorResponse("Error creating branch", ex));
            }
        }

        // =========================
        // UPDATE
        // =========================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] BranchDto dto)
        {
            try
            {
                _logger.LogInformation($"Updating branch with ID: {id}");

                // 🔥 Sirf SuperAdmin hi branch update kar sakta hai
                if (!IsSuperAdmin())
                {
                    return Unauthorized(CreateErrorResponse("Only SuperAdmin can update branches"));
                }

                var branch = await _context.Branches.FindAsync(id);
                if (branch == null)
                    return NotFound(CreateErrorResponse("Branch not found"));

                // Manual mapping - BranchID ko map mat karo
                branch.BranchName = dto.BranchName ?? branch.BranchName;
                branch.BranchAddress = dto.BranchAddress ?? branch.BranchAddress;
                branch.BranchPhone = dto.BranchPhone ?? branch.BranchPhone;
                branch.BranchCooridnator = dto.BranchCooridnator ?? branch.BranchCooridnator;
                branch.BranchAbbr = dto.BranchAbbr ?? branch.BranchAbbr;
                branch.C_Cell = dto.C_Cell ?? branch.C_Cell;
                branch.C_Email = dto.C_Email ?? branch.C_Email;
                branch.BranchCity = dto.BranchCity ?? branch.BranchCity;
                branch.Remarks = dto.Remarks ?? branch.Remarks;
                branch.InActive = dto.InActive ?? branch.InActive;

                await _context.SaveChangesAsync();

                var result = new BranchDto
                {
                    BranchID = branch.BranchID,
                    BranchName = branch.BranchName,
                    BranchAddress = branch.BranchAddress,
                    BranchPhone = branch.BranchPhone,
                    BranchCooridnator = branch.BranchCooridnator,
                    BranchAbbr = branch.BranchAbbr,
                    C_Cell = branch.C_Cell,
                    C_Email = branch.C_Email,
                    BranchCity = branch.BranchCity,
                    Remarks = branch.Remarks,
                    InActive = branch.InActive
                };

                _logger.LogInformation($"Branch {id} updated successfully");
                return Ok(CreateResponse(result, "Branch updated successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating branch {Id}", id);
                return StatusCode(500, CreateErrorResponse("Error updating branch", ex));
            }
        }

        // =========================
        // DELETE (Soft delete)
        // =========================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                // 🔥 Sirf SuperAdmin hi branch delete kar sakta hai
                if (!IsSuperAdmin())
                {
                    return Unauthorized(CreateErrorResponse("Only SuperAdmin can delete branches"));
                }

                var branch = await _context.Branches.FindAsync(id);
                if (branch == null)
                    return NotFound(CreateErrorResponse("Branch not found"));

                // Soft delete
                branch.IsDeleted = true;
                await _context.SaveChangesAsync();

                return Ok(CreateResponse(null, "Branch deleted successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting branch {Id}", id);
                return StatusCode(500, CreateErrorResponse("Error deleting branch", ex));
            }
        }

        // =========================
        // GET CURRENT USER'S BRANCH
        // =========================
        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentUserBranch()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var branch = await _context.Branches.FindAsync(branchId);

                if (branch == null)
                    return NotFound(CreateErrorResponse("Branch not found"));

                var branchDto = _mapper.Map<BranchDto>(branch);
                return Ok(CreateResponse(branchDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current branch");
                return StatusCode(500, CreateErrorResponse("Error loading branch", ex));
            }
        }
    }
}