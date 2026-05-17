using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Services.Interfaces.Workshop;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentController : BaseController
    {
        private readonly IDepartmentService _service;

        public DepartmentController(IDepartmentService service)
        {
            _service = service;
        }

        #region Department CRUD

        [HttpGet]
        public async Task<IActionResult> GetAllDepartments([FromQuery] bool? isActive = null)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetAllDepartmentsAsync(branchId, isActive);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDepartmentById(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetDepartmentByIdAsync(id, branchId);

                if (data == null)
                    return NotFound(CreateErrorResponse("Department not found"));

                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateDepartment(DepartmentCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.CreateDepartmentAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, "Department created successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(CreateErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDepartment(int id, DepartmentUpdateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.UpdateDepartmentAsync(id, dto, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Department not found"));

                return Ok(CreateResponse(result, "Department updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _service.DeleteDepartmentAsync(id, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Department not found"));

                return Ok(CreateResponse(null, "Department deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> ToggleDepartmentStatus(int id, [FromBody] bool isActive)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.ToggleDepartmentStatusAsync(id, isActive, userId, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Department not found"));

                return Ok(CreateResponse(null, $"Department {(isActive ? "activated" : "deactivated")} successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion

        #region Job Department Assignment

        [HttpGet("job/{jobCardId}")]
        public async Task<IActionResult> GetJobDepartments(int jobCardId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetJobDepartmentsAsync(jobCardId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("job/assign")]
        public async Task<IActionResult> AssignJobToDepartment(JobDepartmentAssignDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.AssignJobToDepartmentAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, "Job assigned to department successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(CreateErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("job/complete")]
        public async Task<IActionResult> CompleteJobDepartment(int jobCardId, int departmentId)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.CompleteJobDepartmentAsync(jobCardId, departmentId, userId, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Job or department not found"));

                return Ok(CreateResponse(null, "Job department completed successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("department/{departmentId}/jobs")]
        public async Task<IActionResult> GetJobsByDepartment(int departmentId, [FromQuery] string? status = null)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetJobsByDepartmentAsync(departmentId, branchId, status);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion

        #region Technician Department Assignment

        [HttpGet("technician/{technicianId}")]
        public async Task<IActionResult> GetTechnicianDepartments(int technicianId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetTechnicianDepartmentsAsync(technicianId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("department/{departmentId}/technicians")]
        public async Task<IActionResult> GetDepartmentTechnicians(int departmentId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetDepartmentTechniciansAsync(departmentId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("technician/assign")]
        public async Task<IActionResult> AssignTechnicianToDepartment(TechnicianDepartmentAssignDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.AssignTechnicianToDepartmentAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, "Technician assigned to department successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(CreateErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpDelete("technician/remove")]
        public async Task<IActionResult> RemoveTechnicianFromDepartment(int technicianId, int departmentId)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.RemoveTechnicianFromDepartmentAsync(technicianId, departmentId, userId, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Assignment not found"));

                return Ok(CreateResponse(null, "Technician removed from department successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("technician/primary")]
        public async Task<IActionResult> SetPrimaryDepartment(int technicianId, int departmentId)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.SetPrimaryDepartmentAsync(technicianId, departmentId, userId, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Assignment not found"));

                return Ok(CreateResponse(null, "Primary department set successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion

        #region Department Services

        [HttpGet("{departmentId}/services")]
        public async Task<IActionResult> GetDepartmentServices(int departmentId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetDepartmentServicesAsync(departmentId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("services/assign")]
        public async Task<IActionResult> AssignServiceToDepartment(DepartmentServiceAssignDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.AssignServiceToDepartmentAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, "Service assigned to department successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(CreateErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpDelete("services/remove")]
        public async Task<IActionResult> RemoveServiceFromDepartment(int departmentId, int serviceId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _service.RemoveServiceFromDepartmentAsync(departmentId, serviceId, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Service assignment not found"));

                return Ok(CreateResponse(null, "Service removed from department successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPatch("services/availability")]
        public async Task<IActionResult> UpdateServiceAvailability(int departmentId, int serviceId, bool isAvailable)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.UpdateServiceAvailabilityAsync(departmentId, serviceId, isAvailable, userId, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Service assignment not found"));

                return Ok(CreateResponse(null, $"Service {(isAvailable ? "enabled" : "disabled")} successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion

        #region Department Parts

        [HttpGet("{departmentId}/parts")]
        public async Task<IActionResult> GetDepartmentParts(int departmentId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetDepartmentPartsAsync(departmentId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("parts/assign")]
        public async Task<IActionResult> AssignPartToDepartment(DepartmentPartAssignDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.AssignPartToDepartmentAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, "Part assigned to department successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(CreateErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpDelete("parts/remove")]
        public async Task<IActionResult> RemovePartFromDepartment(int departmentId, int itemId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _service.RemovePartFromDepartmentAsync(departmentId, itemId, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Part assignment not found"));

                return Ok(CreateResponse(null, "Part removed from department successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPatch("parts/minstock")]
        public async Task<IActionResult> UpdatePartMinStock(int departmentId, int itemId, decimal minStock)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.UpdatePartMinStockAsync(departmentId, itemId, minStock, userId, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Part assignment not found"));

                return Ok(CreateResponse(null, "Minimum stock level updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion

        #region Department Transfers

        [HttpGet("transfers")]
        public async Task<IActionResult> GetDepartmentTransfers([FromQuery] string? status = null)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetDepartmentTransfersAsync(branchId, status);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("transfers")]
        public async Task<IActionResult> TransferJobDepartment(DepartmentTransferCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.TransferJobDepartmentAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, "Job transferred successfully"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(CreateErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("transfers/{transferId}/receive")]
        public async Task<IActionResult> ReceiveDepartmentTransfer(int transferId, DepartmentTransferReceiveDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.ReceiveDepartmentTransferAsync(transferId, dto, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Transfer not found"));

                return Ok(CreateResponse(result, "Transfer received successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("transfers/{transferId}/cancel")]
        public async Task<IActionResult> CancelDepartmentTransfer(int transferId)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.CancelDepartmentTransferAsync(transferId, userId, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Transfer not found"));

                return Ok(CreateResponse(null, "Transfer cancelled successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion

        #region Dashboard & Reports

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDepartmentDashboard()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetDepartmentDashboardAsync(branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetDepartmentSummary([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetDepartmentSummaryAsync(branchId, fromDate, toDate);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("{departmentId}/report")]
        public async Task<IActionResult> GenerateDepartmentReport(int departmentId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var pdfData = await _service.GenerateDepartmentReportAsync(departmentId, branchId, fromDate, toDate);

                return File(pdfData, "application/pdf", $"Department_{departmentId}_Report.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion
    }
}