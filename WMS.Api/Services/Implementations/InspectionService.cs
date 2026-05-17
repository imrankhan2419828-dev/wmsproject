using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Models.Workshop;
using WMS.Api.Services.Interfaces.Workshop;
using Microsoft.Data.SqlClient;

namespace WMS.Api.Services.Implementations.Workshop
{
    public class InspectionService : IInspectionService
    {
        private readonly WmsDbContext _context;
        private readonly ILogger<InspectionService> _logger;

        public InspectionService(WmsDbContext context, ILogger<InspectionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Template Management

        public async Task<IEnumerable<InspectionTemplateDto>> GetAllTemplatesAsync(int branchId)
        {
            try
            {
                var templates = await _context.InspectionTemplates
                    .Include(t => t.Items)
                    .Where(t => t.BranchID == branchId && t.IsActive)
                    .OrderBy(t => t.Category)
                    .ThenBy(t => t.TemplateName)
                    .ToListAsync();

                return templates.Select(MapToTemplateDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting inspection templates");
                throw;
            }
        }

        public async Task<InspectionTemplateDto?> GetTemplateByIdAsync(int id, int branchId)
        {
            try
            {
                var template = await _context.InspectionTemplates
                    .Include(t => t.Items)
                    .FirstOrDefaultAsync(t => t.TemplateID == id && t.BranchID == branchId);

                return template == null ? null : MapToTemplateDto(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting inspection template {Id}", id);
                throw;
            }
        }

        public async Task<InspectionTemplateDto> CreateTemplateAsync(InspectionTemplateCreateDto dto, int userId, int branchId)
        {
            try
            {
                var template = new InspectionTemplate
                {
                    TemplateCode = dto.TemplateCode,
                    TemplateName = dto.TemplateName,
                    Category = dto.Category,
                    Description = dto.Description,
                    IsActive = dto.IsActive,
                    BranchID = branchId,
                    CreatedBy = userId,
                    CreatedDate = DateTime.Now
                };

                _context.InspectionTemplates.Add(template);
                await _context.SaveChangesAsync();

                return await GetTemplateByIdAsync(template.TemplateID, branchId)
                    ?? throw new Exception("Failed to retrieve created template");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating inspection template");
                throw;
            }
        }

        public async Task<InspectionTemplateDto?> UpdateTemplateAsync(int id, InspectionTemplateUpdateDto dto, int userId, int branchId)
        {
            try
            {
                var template = await _context.InspectionTemplates
                    .FirstOrDefaultAsync(t => t.TemplateID == id && t.BranchID == branchId);

                if (template == null)
                    return null;

                template.TemplateCode = dto.TemplateCode;
                template.TemplateName = dto.TemplateName;
                template.Category = dto.Category;
                template.Description = dto.Description;
                template.IsActive = dto.IsActive;
                template.ModifiedBy = userId;
                template.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return await GetTemplateByIdAsync(id, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating inspection template {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteTemplateAsync(int id, int branchId)
        {
            try
            {
                var template = await _context.InspectionTemplates
                    .Include(t => t.Items)
                    .FirstOrDefaultAsync(t => t.TemplateID == id && t.BranchID == branchId);

                if (template == null)
                    return false;

                // Check if template is used in any inspections
                var hasInspections = await _context.JobInspections
                    .AnyAsync(ji => ji.TemplateID == id);

                if (hasInspections)
                    throw new InvalidOperationException("Cannot delete template that has been used in inspections");

                // Delete associated items first
                if (template.Items != null && template.Items.Any())
                {
                    _context.InspectionItems.RemoveRange(template.Items);
                }

                _context.InspectionTemplates.Remove(template);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting inspection template {Id}", id);
                throw;
            }
        }

        #endregion

        #region Inspection Item Management

        public async Task<IEnumerable<InspectionItemDto>> GetItemsByTemplateAsync(int templateId, int branchId)
        {
            try
            {
                var items = await _context.InspectionItems
                    .Include(i => i.Template)
                    .Where(i => i.TemplateID == templateId && i.Template!.BranchID == branchId && i.IsActive)
                    .OrderBy(i => i.DisplayOrder)
                    .ToListAsync();

                return items.Select(MapToItemDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting items for template {TemplateId}", templateId);
                throw;
            }
        }

        public async Task<InspectionItemDto?> GetItemByIdAsync(int id, int branchId)
        {
            try
            {
                var item = await _context.InspectionItems
                    .Include(i => i.Template)
                    .FirstOrDefaultAsync(i => i.ItemID == id && i.Template!.BranchID == branchId);

                return item == null ? null : MapToItemDto(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting inspection item {Id}", id);
                throw;
            }
        }

        public async Task<InspectionItemDto> CreateItemAsync(InspectionItemCreateDto dto, int userId, int branchId)
        {
            try
            {
                // Verify template exists
                var template = await _context.InspectionTemplates
                    .FirstOrDefaultAsync(t => t.TemplateID == dto.TemplateID && t.BranchID == branchId);

                if (template == null)
                    throw new InvalidOperationException("Template not found");

                var item = new InspectionItem
                {
                    TemplateID = dto.TemplateID,
                    ItemCode = dto.ItemCode,
                    ItemName = dto.ItemName,
                    Description = dto.Description,
                    ItemType = dto.ItemType,
                    ExpectedValue = dto.ExpectedValue,
                    MinValue = dto.MinValue,
                    MaxValue = dto.MaxValue,
                    Unit = dto.Unit,
                    IsCritical = dto.IsCritical,
                    DisplayOrder = dto.DisplayOrder,
                    RequiresPhoto = dto.RequiresPhoto,
                    RequiresRemarks = dto.RequiresRemarks,
                    IsActive = dto.IsActive,
                    CreatedDate = DateTime.Now
                };

                _context.InspectionItems.Add(item);
                await _context.SaveChangesAsync();

                return MapToItemDto(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating inspection item");
                throw;
            }
        }

        public async Task<InspectionItemDto?> UpdateItemAsync(int id, InspectionItemUpdateDto dto, int userId, int branchId)
        {
            try
            {
                var item = await _context.InspectionItems
                    .Include(i => i.Template)
                    .FirstOrDefaultAsync(i => i.ItemID == id && i.Template!.BranchID == branchId);

                if (item == null)
                    return null;

                item.ItemCode = dto.ItemCode;
                item.ItemName = dto.ItemName;
                item.Description = dto.Description;
                item.ItemType = dto.ItemType;
                item.ExpectedValue = dto.ExpectedValue;
                item.MinValue = dto.MinValue;
                item.MaxValue = dto.MaxValue;
                item.Unit = dto.Unit;
                item.IsCritical = dto.IsCritical;
                item.DisplayOrder = dto.DisplayOrder;
                item.RequiresPhoto = dto.RequiresPhoto;
                item.RequiresRemarks = dto.RequiresRemarks;
                item.IsActive = dto.IsActive;

                await _context.SaveChangesAsync();

                return MapToItemDto(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating inspection item {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteItemAsync(int id, int branchId)
        {
            try
            {
                var item = await _context.InspectionItems
                    .Include(i => i.Template)
                    .FirstOrDefaultAsync(i => i.ItemID == id && i.Template!.BranchID == branchId);

                if (item == null)
                    return false;

                // Check if item has any results
                var hasResults = await _context.InspectionResults
                    .AnyAsync(ir => ir.ItemID == id);

                if (hasResults)
                    throw new InvalidOperationException("Cannot delete item that has inspection results");

                _context.InspectionItems.Remove(item);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting inspection item {Id}", id);
                throw;
            }
        }

        #endregion

        #region Job Inspections

        public async Task<IEnumerable<JobInspectionDto>> GetInspectionsByJobAsync(int jobCardId, int branchId)
        {
            try
            {
                var inspections = await _context.JobInspections
                    .Include(ji => ji.Template)
                    .Include(ji => ji.Results)
                        .ThenInclude(r => r.Item)
                    .Where(ji => ji.JobCardID == jobCardId && ji.BranchID == branchId)
                    .OrderByDescending(ji => ji.InspectionDate)
                    .ToListAsync();

                var dtos = new List<JobInspectionDto>();

                foreach (var inspection in inspections)
                {
                    dtos.Add(await MapToJobInspectionDto(inspection));
                }

                return dtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting inspections for job {JobCardId}", jobCardId);
                throw;
            }
        }

        public async Task<JobInspectionDto?> GetInspectionByIdAsync(int id, int branchId)
        {
            try
            {
                var inspection = await _context.JobInspections
                    .Include(ji => ji.Template)
                    .Include(ji => ji.Results)
                        .ThenInclude(r => r.Item)
                    .Include(ji => ji.JobCard)
                        .ThenInclude(j => j!.Vehicle)
                    .FirstOrDefaultAsync(ji => ji.InspectionID == id && ji.BranchID == branchId);

                return inspection == null ? null : await MapToJobInspectionDto(inspection);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting inspection {Id}", id);
                throw;
            }
        }

        public async Task<JobInspectionDto> CreateInspectionAsync(JobInspectionCreateDto dto, int userId, int branchId)
        {
            try
            {
                // Generate inspection number
                var inspectionNo = await GenerateInspectionNumberAsync(branchId);

                var inspection = new JobInspection
                {
                    JobCardID = dto.JobCardID,
                    TemplateID = dto.TemplateID,
                    InspectionNo = inspectionNo,
                    InspectionDate = DateTime.Now,
                    InspectedBy = dto.InspectedBy,
                    Status = "PENDING",
                    OverallNotes = dto.OverallNotes,
                    CreatedBy = userId,
                    CreatedDate = DateTime.Now,
                    BranchID = branchId
                };

                _context.JobInspections.Add(inspection);
                await _context.SaveChangesAsync();

                // Create empty results for all template items
                var items = await _context.InspectionItems
                    .Where(i => i.TemplateID == dto.TemplateID && i.IsActive)
                    .ToListAsync();

                foreach (var item in items)
                {
                    var result = new InspectionResult
                    {
                        InspectionID = inspection.InspectionID,
                        ItemID = item.ItemID,
                        CreatedDate = DateTime.Now
                    };
                    _context.InspectionResults.Add(result);
                }

                await _context.SaveChangesAsync();

                return await GetInspectionByIdAsync(inspection.InspectionID, branchId)
                    ?? throw new Exception("Failed to retrieve created inspection");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating job inspection");
                throw;
            }
        }

        public async Task<JobInspectionDto?> UpdateInspectionStatusAsync(int id, JobInspectionUpdateDto dto, int userId, int branchId)
        {
            try
            {
                var inspection = await _context.JobInspections
                    .FirstOrDefaultAsync(i => i.InspectionID == id && i.BranchID == branchId);

                if (inspection == null)
                    return null;

                inspection.Status = dto.Status ?? inspection.Status;
                inspection.InspectedBy = dto.InspectedBy ?? inspection.InspectedBy;
                inspection.OverallNotes = dto.OverallNotes ?? inspection.OverallNotes;
                inspection.CompletedAt = dto.CompletedAt ?? inspection.CompletedAt;
                inspection.ModifiedBy = userId;
                inspection.ModifiedDate = DateTime.Now;

                if (dto.Status == "IN_PROGRESS" && !inspection.StartedAt.HasValue)
                {
                    inspection.StartedAt = DateTime.Now;
                }

                await _context.SaveChangesAsync();

                return await GetInspectionByIdAsync(id, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating inspection status {Id}", id);
                throw;
            }
        }

        public async Task<JobInspectionDto?> SubmitInspectionResultsAsync(int id, InspectionCompleteDto dto, int userId, int branchId)
        {
            try
            {
                var inspection = await _context.JobInspections
                    .Include(i => i.Results)
                    .FirstOrDefaultAsync(i => i.InspectionID == id && i.BranchID == branchId);

                if (inspection == null)
                    return null;

                inspection.Status = dto.Status;
                inspection.OverallNotes = dto.OverallNotes ?? inspection.OverallNotes;
                inspection.CompletedAt = DateTime.Now;
                inspection.ModifiedBy = userId;
                inspection.ModifiedDate = DateTime.Now;

                // Update results if provided
                if (dto.Results != null && dto.Results.Any())
                {
                    foreach (var resultDto in dto.Results)
                    {
                        var result = inspection.Results?
                            .FirstOrDefault(r => r.ItemID == resultDto.ItemID);

                        if (result != null)
                        {
                            result.ObservedValue = resultDto.ObservedValue;
                            result.NumericValue = resultDto.NumericValue;
                            result.IsPass = resultDto.IsPass;
                            result.Remarks = resultDto.Remarks;
                            result.ImagePath = resultDto.ImagePath;
                            result.CheckedBy = userId;
                            result.CheckedDate = DateTime.Now;
                        }
                    }
                }

                await _context.SaveChangesAsync();

                return await GetInspectionByIdAsync(id, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting inspection results");
                throw;
            }
        }

        public async Task<JobInspectionDto?> StartInspectionAsync(int id, int userId, int branchId)
        {
            try
            {
                var inspection = await _context.JobInspections
                    .FirstOrDefaultAsync(i => i.InspectionID == id && i.BranchID == branchId);

                if (inspection == null)
                    return null;

                if (inspection.Status != "PENDING")
                    throw new InvalidOperationException($"Cannot start inspection with status {inspection.Status}");

                inspection.Status = "IN_PROGRESS";
                inspection.StartedAt = DateTime.Now;
                inspection.ModifiedBy = userId;
                inspection.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return await GetInspectionByIdAsync(id, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting inspection {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteInspectionAsync(int id, int branchId)
        {
            try
            {
                var inspection = await _context.JobInspections
                    .Include(i => i.Results)
                    .FirstOrDefaultAsync(i => i.InspectionID == id && i.BranchID == branchId);

                if (inspection == null)
                    return false;

                // Delete associated results first
                if (inspection.Results != null && inspection.Results.Any())
                {
                    _context.InspectionResults.RemoveRange(inspection.Results);
                }

                _context.JobInspections.Remove(inspection);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting inspection {Id}", id);
                throw;
            }
        }

        #endregion

        #region Results

        public async Task<InspectionResultDto?> SubmitResultAsync(InspectionResultSubmitDto dto, int userId, int branchId)
        {
            try
            {
                // Verify inspection exists
                var inspection = await _context.JobInspections
                    .FirstOrDefaultAsync(i => i.InspectionID == dto.InspectionID && i.BranchID == branchId);

                if (inspection == null)
                    throw new InvalidOperationException("Inspection not found");

                var result = await _context.InspectionResults
                    .Include(r => r.Item)
                    .FirstOrDefaultAsync(r => r.InspectionID == dto.InspectionID && r.ItemID == dto.ItemID);

                if (result == null)
                {
                    result = new InspectionResult
                    {
                        InspectionID = dto.InspectionID,
                        ItemID = dto.ItemID,
                        CreatedDate = DateTime.Now
                    };
                    _context.InspectionResults.Add(result);
                }

                result.ObservedValue = dto.ObservedValue;
                result.NumericValue = dto.NumericValue;
                result.IsPass = dto.IsPass;
                result.Remarks = dto.Remarks;
                result.ImagePath = dto.ImagePath;
                result.CheckedBy = userId;
                result.CheckedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return new InspectionResultDto
                {
                    ResultID = result.ResultID,
                    InspectionID = result.InspectionID,
                    ItemID = result.ItemID,
                    ItemCode = result.Item?.ItemCode ?? "",
                    ItemName = result.Item?.ItemName ?? "",
                    ItemType = result.Item?.ItemType ?? "",
                    ObservedValue = result.ObservedValue,
                    NumericValue = result.NumericValue,
                    IsPass = result.IsPass,
                    Remarks = result.Remarks,
                    ImagePath = result.ImagePath,
                    IsCritical = result.Item?.IsCritical ?? false,
                    RequiresPhoto = result.Item?.RequiresPhoto ?? false,
                    RequiresRemarks = result.Item?.RequiresRemarks ?? false
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting inspection result");
                throw;
            }
        }

        public async Task<IEnumerable<InspectionResultDto>> GetResultsByInspectionAsync(int inspectionId, int branchId)
        {
            try
            {
                var results = await _context.InspectionResults
                    .Include(r => r.Item)
                    .Include(r => r.Inspection)
                    .Where(r => r.InspectionID == inspectionId && r.Inspection!.BranchID == branchId)
                    .OrderBy(r => r.Item!.DisplayOrder)
                    .ToListAsync();

                return results.Select(r => new InspectionResultDto
                {
                    ResultID = r.ResultID,
                    InspectionID = r.InspectionID,
                    ItemID = r.ItemID,
                    ItemCode = r.Item?.ItemCode ?? "",
                    ItemName = r.Item?.ItemName ?? "",
                    ItemType = r.Item?.ItemType ?? "",
                    ExpectedValue = r.Item?.ExpectedValue,
                    ObservedValue = r.ObservedValue,
                    NumericValue = r.NumericValue,
                    IsPass = r.IsPass,
                    Remarks = r.Remarks,
                    ImagePath = r.ImagePath,
                    IsCritical = r.Item?.IsCritical ?? false,
                    RequiresPhoto = r.Item?.RequiresPhoto ?? false,
                    RequiresRemarks = r.Item?.RequiresRemarks ?? false,
                    DisplayOrder = r.Item?.DisplayOrder ?? 0
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting results for inspection {InspectionId}", inspectionId);
                throw;
            }
        }

        #endregion

        #region Reports

        public async Task<byte[]> GenerateInspectionReportAsync(int inspectionId, int branchId)
        {
            try
            {
                var inspection = await GetInspectionByIdAsync(inspectionId, branchId);
                if (inspection == null)
                    throw new InvalidOperationException("Inspection not found");

                // TODO: Implement PDF generation
                // For now, return empty byte array
                return new byte[0];
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating inspection report");
                throw;
            }
        }

        #endregion

        #region Helper Methods

        private async Task<string> GenerateInspectionNumberAsync(int branchId)
        {
            var inspNoParam = new SqlParameter("@InspectionNo", System.Data.SqlDbType.NVarChar, 50)
            {
                Direction = System.Data.ParameterDirection.Output
            };

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GenerateInspectionNo @BranchID = {0}, @InspectionNo = @InspectionNo OUTPUT",
                branchId, inspNoParam);

            return inspNoParam.Value?.ToString() ?? $"INSP-{branchId}-{DateTime.Now:yyyyMM}-0001";
        }

        private InspectionTemplateDto MapToTemplateDto(InspectionTemplate template)
        {
            return new InspectionTemplateDto
            {
                TemplateID = template.TemplateID,
                TemplateCode = template.TemplateCode,
                TemplateName = template.TemplateName,
                Category = template.Category,
                Description = template.Description,
                IsActive = template.IsActive,
                BranchID = template.BranchID,
                Items = template.Items?.Select(i => MapToItemDto(i)).OrderBy(i => i.DisplayOrder).ToList()
            };
        }

        private InspectionItemDto MapToItemDto(InspectionItem item)
        {
            return new InspectionItemDto
            {
                ItemID = item.ItemID,
                TemplateID = item.TemplateID,
                ItemCode = item.ItemCode,
                ItemName = item.ItemName,
                Description = item.Description,
                ItemType = item.ItemType,
                ExpectedValue = item.ExpectedValue,
                MinValue = item.MinValue,
                MaxValue = item.MaxValue,
                Unit = item.Unit,
                IsCritical = item.IsCritical,
                DisplayOrder = item.DisplayOrder,
                RequiresPhoto = item.RequiresPhoto,
                RequiresRemarks = item.RequiresRemarks,
                IsActive = item.IsActive
            };
        }

        private async Task<JobInspectionDto> MapToJobInspectionDto(JobInspection inspection)
        {
            var results = inspection.Results ?? new List<InspectionResult>();

            var passCount = results.Count(r => r.IsPass == true);
            var failCount = results.Count(r => r.IsPass == false);
            var pendingCount = results.Count(r => r.IsPass == null);

            return new JobInspectionDto
            {
                InspectionID = inspection.InspectionID,
                JobCardID = inspection.JobCardID,
                JobCardNo = inspection.JobCard?.JobCardNo ?? "",
                VehicleRegNo = inspection.JobCard?.Vehicle?.RegistrationNo ?? "",
                TemplateID = inspection.TemplateID,
                TemplateName = inspection.Template?.TemplateName ?? "",
                InspectionNo = inspection.InspectionNo,
                InspectionDate = inspection.InspectionDate,
                InspectedBy = inspection.InspectedBy,
                InspectorName = "", // You can fetch from SystemUsers if needed
                Status = inspection.Status,
                OverallNotes = inspection.OverallNotes,
                StartedAt = inspection.StartedAt,
                CompletedAt = inspection.CompletedAt,
                CreatedBy = inspection.CreatedBy,
                PassCount = passCount,
                FailCount = failCount,
                PendingCount = pendingCount,
                Results = results.Select(r => new InspectionResultDto
                {
                    ResultID = r.ResultID,
                    InspectionID = r.InspectionID,
                    ItemID = r.ItemID,
                    ItemCode = r.Item?.ItemCode ?? "",
                    ItemName = r.Item?.ItemName ?? "",
                    ItemType = r.Item?.ItemType ?? "",
                    ExpectedValue = r.Item?.ExpectedValue,
                    ObservedValue = r.ObservedValue,
                    NumericValue = r.NumericValue,
                    IsPass = r.IsPass,
                    Remarks = r.Remarks,
                    ImagePath = r.ImagePath,
                    IsCritical = r.Item?.IsCritical ?? false,
                    RequiresPhoto = r.Item?.RequiresPhoto ?? false,
                    RequiresRemarks = r.Item?.RequiresRemarks ?? false,
                    DisplayOrder = r.Item?.DisplayOrder ?? 0
                }).ToList()
            };
        }

        #endregion
    }
}