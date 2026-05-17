using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.Models;
using WMS.Api.Data;
using Microsoft.EntityFrameworkCore;
using WMS.Api.Helpers;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class GodownController : BaseController
    {
        private readonly WmsDbContext _context;

        public GodownController(WmsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var godowns = _context.Godowns
                    .Where(x => x.BranchID == branchId && (x.InActive == false || x.InActive == null))
                    .OrderBy(x => x.GodnName)
                    .Select(x => new
                    {
                        x.GodnID,
                        x.GodnName,
                        x.BranchID,
                        x.InActive
                    })
                    .ToList();

                return Ok(CreateResponse(godowns, "Godowns retrieved successfully"));
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
                int branchId = GetCurrentBranchId();
                var godown = _context.Godowns
                    .FirstOrDefault(x => x.GodnID == id && x.BranchID == branchId);

                if (godown == null)
                    return NotFound(CreateErrorResponse("Godown not found"));

                return Ok(CreateResponse(godown));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost]
        public IActionResult Create([FromBody] Godown godown)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(godown.GodnName))
                    return BadRequest(CreateErrorResponse("Godown name is required"));

                int branchId = GetCurrentBranchId();
                int userId = GetCurrentUserId();

                var existing = _context.Godowns
                    .FirstOrDefault(x => x.GodnName == godown.GodnName && x.BranchID == branchId);

                if (existing != null)
                    return BadRequest(CreateErrorResponse("Godown with this name already exists"));

                var newGodown = new Godown
                {
                    GodnName = godown.GodnName,
                    BranchID = branchId,
                    InActive = false,
                    AddBy = userId,
                    AddOn = DateTime.Now
                };

                _context.Godowns.Add(newGodown);
                _context.SaveChanges();

                return Ok(CreateResponse(new { newGodown.GodnID, message = "Godown created successfully" }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPut]
        public IActionResult Update([FromBody] Godown godown)
        {
            try
            {
                if (godown.GodnID <= 0)
                    return BadRequest(CreateErrorResponse("Invalid godown ID"));

                int branchId = GetCurrentBranchId();
                int userId = GetCurrentUserId();

                var existing = _context.Godowns
                    .FirstOrDefault(x => x.GodnID == godown.GodnID && x.BranchID == branchId);

                if (existing == null)
                    return NotFound(CreateErrorResponse("Godown not found"));

                existing.GodnName = godown.GodnName;
                existing.InActive = godown.InActive;
                existing.AddBy = userId;
                existing.AddOn = DateTime.Now;

                _context.SaveChanges();

                return Ok(CreateResponse(new { message = "Godown updated successfully" }));
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
                int branchId = GetCurrentBranchId();
                var godown = _context.Godowns
                    .FirstOrDefault(x => x.GodnID == id && x.BranchID == branchId);

                if (godown == null)
                    return NotFound(CreateErrorResponse("Godown not found"));

                // Check if godown has any stock
                var hasStock = _context.ItemGodownOpening.Any(x => x.GodownID == id);
                if (hasStock)
                    return BadRequest(CreateErrorResponse("Cannot delete godown with existing stock"));

                _context.Godowns.Remove(godown);
                _context.SaveChanges();

                return Ok(CreateResponse(new { message = "Godown deleted successfully" }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }
    }
}
