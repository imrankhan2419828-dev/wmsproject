using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Services.Interfaces.Workshop;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class WarrantyController : BaseController
    {
        private readonly IWarrantyService _service;

        public WarrantyController(IWarrantyService service)
        {
            _service = service;
        }

        #region Warranty Claims

        [HttpGet]
        public async Task<IActionResult> GetAllClaims([FromQuery] string? status, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetAllClaimsAsync(branchId, status, fromDate, toDate);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetClaimById(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetClaimByIdAsync(id, branchId);

                if (data == null)
                    return NotFound(CreateErrorResponse("Claim not found"));

                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateClaim(WarrantyClaimCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.CreateClaimAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, "Claim created successfully"));
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
        public async Task<IActionResult> UpdateClaim(int id, WarrantyClaimUpdateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.UpdateClaimAsync(id, dto, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Claim not found"));

                return Ok(CreateResponse(result, "Claim updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateClaimStatus(int id, WarrantyClaimStatusUpdateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.UpdateClaimStatusAsync(id, dto, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Claim not found"));

                return Ok(CreateResponse(result, "Claim status updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClaim(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _service.DeleteClaimAsync(id, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Claim not found"));

                return Ok(CreateResponse(null, "Claim deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("job/{jobCardId}")]
        public async Task<IActionResult> GetClaimsByJob(int jobCardId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetClaimsByJobAsync(jobCardId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("supplier/{supplierId}")]
        public async Task<IActionResult> GetClaimsBySupplier(int supplierId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetClaimsBySupplierAsync(supplierId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion

        #region Attachments

        [HttpGet("{claimId}/attachments")]
        public async Task<IActionResult> GetAttachments(int claimId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetAttachmentsAsync(claimId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("attachments")]
        public async Task<IActionResult> AddAttachment([FromBody] WarrantyAttachmentCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.AddAttachmentAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, "Attachment added successfully"));
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

        [HttpDelete("attachments/{attachmentId}")]
        public async Task<IActionResult> DeleteAttachment(int attachmentId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _service.DeleteAttachmentAsync(attachmentId, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Attachment not found"));

                return Ok(CreateResponse(null, "Attachment deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion

        #region History

        [HttpGet("{claimId}/history")]
        public async Task<IActionResult> GetClaimHistory(int claimId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetClaimHistoryAsync(claimId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion

        #region Supplier Warranties

        [HttpGet("supplier-warranties")]
        public async Task<IActionResult> GetAllSupplierWarranties()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetAllSupplierWarrantiesAsync(branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("supplier-warranties/{id}")]
        public async Task<IActionResult> GetSupplierWarrantyById(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetSupplierWarrantyByIdAsync(id, branchId);

                if (data == null)
                    return NotFound(CreateErrorResponse("Supplier warranty not found"));

                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("supplier-warranties")]
        public async Task<IActionResult> CreateSupplierWarranty(SupplierWarrantyCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.CreateSupplierWarrantyAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, "Supplier warranty created successfully"));
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

        [HttpPut("supplier-warranties/{id}")]
        public async Task<IActionResult> UpdateSupplierWarranty(int id, SupplierWarrantyUpdateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.UpdateSupplierWarrantyAsync(id, dto, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Supplier warranty not found"));

                return Ok(CreateResponse(result, "Supplier warranty updated successfully"));
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

        [HttpDelete("supplier-warranties/{id}")]
        public async Task<IActionResult> DeleteSupplierWarranty(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _service.DeleteSupplierWarrantyAsync(id, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Supplier warranty not found"));

                return Ok(CreateResponse(null, "Supplier warranty deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("supplier/{supplierId}/warranties")]
        public async Task<IActionResult> GetWarrantiesBySupplier(int supplierId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetWarrantiesBySupplierAsync(supplierId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("item/{itemId}/warranties")]
        public async Task<IActionResult> GetWarrantiesByItem(int itemId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetWarrantiesByItemAsync(itemId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion

        #region Reports & Summary

        [HttpGet("summary")]
        public async Task<IActionResult> GetWarrantySummary([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetWarrantySummaryAsync(branchId, fromDate, toDate);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("report")]
        public async Task<IActionResult> GenerateWarrantyReport([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var pdfData = await _service.GenerateWarrantyReportAsync(branchId, fromDate, toDate);

                return File(pdfData, "application/pdf", $"Warranty_Report_{DateTime.Now:yyyyMMdd}.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("{claimId}/report")]
        public async Task<IActionResult> GenerateClaimReport(int claimId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var pdfData = await _service.GenerateClaimReportAsync(claimId, branchId);

                return File(pdfData, "application/pdf", $"Claim_{claimId}_Report.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion
    }
}