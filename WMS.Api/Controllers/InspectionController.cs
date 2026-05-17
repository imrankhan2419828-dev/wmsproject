using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Services.Interfaces.Workshop;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class InspectionController : BaseController
    {
        private readonly IInspectionService _service;

        public InspectionController(IInspectionService service)
        {
            _service = service;
        }

        #region Templates

        [HttpGet("templates")]
        public async Task<IActionResult> GetAllTemplates()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetAllTemplatesAsync(branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("templates/{id}")]
        public async Task<IActionResult> GetTemplateById(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetTemplateByIdAsync(id, branchId);

                if (data == null)
                    return NotFound(CreateErrorResponse("Template not found"));

                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("templates")]
        public async Task<IActionResult> CreateTemplate(InspectionTemplateCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.CreateTemplateAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, "Template created successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPut("templates/{id}")]
        public async Task<IActionResult> UpdateTemplate(int id, InspectionTemplateUpdateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.UpdateTemplateAsync(id, dto, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Template not found"));

                return Ok(CreateResponse(result, "Template updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpDelete("templates/{id}")]
        public async Task<IActionResult> DeleteTemplate(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _service.DeleteTemplateAsync(id, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Template not found"));

                return Ok(CreateResponse(null, "Template deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion

        #region Inspection Items

        [HttpGet("templates/{templateId}/items")]
        public async Task<IActionResult> GetItemsByTemplate(int templateId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetItemsByTemplateAsync(templateId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("items/{id}")]
        public async Task<IActionResult> GetItemById(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetItemByIdAsync(id, branchId);

                if (data == null)
                    return NotFound(CreateErrorResponse("Item not found"));

                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("items")]
        public async Task<IActionResult> CreateItem(InspectionItemCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.CreateItemAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, "Item created successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPut("items/{id}")]
        public async Task<IActionResult> UpdateItem(int id, InspectionItemUpdateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.UpdateItemAsync(id, dto, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Item not found"));

                return Ok(CreateResponse(result, "Item updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpDelete("items/{id}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _service.DeleteItemAsync(id, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Item not found"));

                return Ok(CreateResponse(null, "Item deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion

        #region Job Inspections

        [HttpGet("job/{jobCardId}")]
        public async Task<IActionResult> GetInspectionsByJob(int jobCardId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetInspectionsByJobAsync(jobCardId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetInspectionById(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetInspectionByIdAsync(id, branchId);

                if (data == null)
                    return NotFound(CreateErrorResponse("Inspection not found"));

                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateInspection(JobInspectionCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.CreateInspectionAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, "Inspection created successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("{id}/start")]
        public async Task<IActionResult> StartInspection(int id)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.StartInspectionAsync(id, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Inspection not found"));

                return Ok(CreateResponse(result, "Inspection started successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("{id}/submit")]
        public async Task<IActionResult> SubmitInspection(int id, InspectionCompleteDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.SubmitInspectionResultsAsync(id, dto, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Inspection not found"));

                return Ok(CreateResponse(result, "Inspection submitted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInspectionStatus(int id, JobInspectionUpdateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.UpdateInspectionStatusAsync(id, dto, userId, branchId);

                if (result == null)
                    return NotFound(CreateErrorResponse("Inspection not found"));

                return Ok(CreateResponse(result, "Inspection updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInspection(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var result = await _service.DeleteInspectionAsync(id, branchId);

                if (!result)
                    return NotFound(CreateErrorResponse("Inspection not found"));

                return Ok(CreateResponse(null, "Inspection deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion

        #region Results

        [HttpGet("{inspectionId}/results")]
        public async Task<IActionResult> GetResultsByInspection(int inspectionId)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = await _service.GetResultsByInspectionAsync(inspectionId, branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("results")]
        public async Task<IActionResult> SubmitResult(InspectionResultSubmitDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                int branchId = GetCurrentBranchId();

                var result = await _service.SubmitResultAsync(dto, userId, branchId);
                return Ok(CreateResponse(result, "Result submitted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion

        #region Reports

        [HttpGet("{id}/report")]
        public async Task<IActionResult> GenerateReport(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var pdfData = await _service.GenerateInspectionReportAsync(id, branchId);

                return File(pdfData, "application/pdf", $"Inspection_{id}.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        #endregion
    }
}