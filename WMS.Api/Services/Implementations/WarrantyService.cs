using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Models.Workshop;
using WMS.Api.Services.Interfaces.Workshop;
using Microsoft.Data.SqlClient;
using iTextSharp.text;
using iTextSharp.text.pdf;

namespace WMS.Api.Services.Implementations.Workshop
{
    public class WarrantyService : IWarrantyService
    {
        private readonly WmsDbContext _context;
        private readonly ILogger<WarrantyService> _logger;

        public WarrantyService(WmsDbContext context, ILogger<WarrantyService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Warranty Claims

        public async Task<IEnumerable<WarrantyClaimDto>> GetAllClaimsAsync(int branchId, string? status = null, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                var query = _context.WarrantyClaims
                    .Include(c => c.JobCard)
                        .ThenInclude(j => j!.Vehicle)
                    .Include(c => c.JobService)
                    .Include(c => c.JobPart)
                    .Include(c => c.Item)
                    .Include(c => c.Supplier)
                    .Where(c => c.BranchID == branchId);

                if (!string.IsNullOrEmpty(status))
                    query = query.Where(c => c.Status == status);

                if (fromDate.HasValue)
                    query = query.Where(c => c.ClaimDate >= fromDate.Value);

                if (toDate.HasValue)
                {
                    var endDate = toDate.Value.AddDays(1);
                    query = query.Where(c => c.ClaimDate < endDate);
                }

                var claims = await query
                    .OrderByDescending(c => c.ClaimDate)
                    .ToListAsync();

                var dtos = new List<WarrantyClaimDto>();

                foreach (var claim in claims)
                {
                    dtos.Add(await MapToDto(claim));
                }

                return dtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting warranty claims");
                throw;
            }
        }

        public async Task<WarrantyClaimDto?> GetClaimByIdAsync(int id, int branchId)
        {
            try
            {
                var claim = await _context.WarrantyClaims
                    .Include(c => c.JobCard)
                        .ThenInclude(j => j!.Vehicle)
                    .Include(c => c.JobService)
                    .Include(c => c.JobPart)
                    .Include(c => c.Item)
                    .Include(c => c.Supplier)
                    .Include(c => c.Attachments)
                    .Include(c => c.History)
                    .FirstOrDefaultAsync(c => c.ClaimID == id && c.BranchID == branchId);

                return claim == null ? null : await MapToDto(claim);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting claim {Id}", id);
                throw;
            }
        }

        public async Task<WarrantyClaimDto> CreateClaimAsync(WarrantyClaimCreateDto dto, int userId, int branchId)
        {
            try
            {
                // Validate job exists
                var job = await _context.JobCards
                    .FirstOrDefaultAsync(j => j.JobCardID == dto.JobCardID && j.BranchID == branchId);

                if (job == null)
                    throw new InvalidOperationException("Job card not found");

                // Check supplier warranty if applicable
                if (dto.ItemID.HasValue && dto.SupplierID.HasValue)
                {
                    var supplierWarranty = await _context.SupplierWarranties
                        .FirstOrDefaultAsync(w => w.SupplierID == dto.SupplierID
                            && w.ItemID == dto.ItemID
                            && w.IsActive);

                    if (supplierWarranty != null)
                    {
                        // Calculate warranty expiry
                        var expiryDate = DateTime.Now.AddDays(supplierWarranty.WarrantyPeriod);
                        // You can store this in claim or use for validation
                    }
                }

                // Generate claim number
                var claimNo = await GenerateClaimNumberAsync(branchId);

                var claim = new WarrantyClaim
                {
                    ClaimNo = claimNo,
                    JobCardID = dto.JobCardID,
                    ClaimDate = DateTime.Now,
                    ClaimType = dto.ClaimType,
                    JobServiceID = dto.JobServiceID,
                    JobPartID = dto.JobPartID,
                    ItemID = dto.ItemID,
                    SupplierID = dto.SupplierID,
                    ClaimAmount = dto.ClaimAmount,
                    Description = dto.Description,
                    Priority = dto.Priority,
                    Status = "OPEN",
                    BranchID = branchId,
                    CreatedBy = userId,
                    CreatedDate = DateTime.Now
                };

                _context.WarrantyClaims.Add(claim);
                await _context.SaveChangesAsync();

                return await GetClaimByIdAsync(claim.ClaimID, branchId)
                    ?? throw new Exception("Failed to retrieve created claim");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating warranty claim");
                throw;
            }
        }

        public async Task<WarrantyClaimDto?> UpdateClaimAsync(int id, WarrantyClaimUpdateDto dto, int userId, int branchId)
        {
            try
            {
                var claim = await _context.WarrantyClaims
                    .FirstOrDefaultAsync(c => c.ClaimID == id && c.BranchID == branchId);

                if (claim == null)
                    return null;

                // Update fields
                claim.ApprovedAmount = dto.ApprovedAmount ?? claim.ApprovedAmount;
                claim.Status = dto.Status ?? claim.Status;
                claim.RejectionReason = dto.RejectionReason ?? claim.RejectionReason;
                claim.ResolutionNotes = dto.ResolutionNotes ?? claim.ResolutionNotes;
                claim.SubmittedDate = dto.SubmittedDate ?? claim.SubmittedDate;
                claim.ApprovedDate = dto.ApprovedDate ?? claim.ApprovedDate;
                claim.ModifiedBy = userId;
                claim.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return await GetClaimByIdAsync(id, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating claim {Id}", id);
                throw;
            }
        }

        public async Task<WarrantyClaimDto?> UpdateClaimStatusAsync(int id, WarrantyClaimStatusUpdateDto dto, int userId, int branchId)
        {
            try
            {
                var claim = await _context.WarrantyClaims
                    .FirstOrDefaultAsync(c => c.ClaimID == id && c.BranchID == branchId);

                if (claim == null)
                    return null;

                var oldStatus = claim.Status;

                // Update status
                claim.Status = dto.Status;
                claim.ApprovedAmount = dto.ApprovedAmount ?? claim.ApprovedAmount;
                claim.RejectionReason = dto.RejectionReason ?? claim.RejectionReason;
                claim.ResolutionNotes = dto.ResolutionNotes ?? claim.ResolutionNotes;
                claim.ModifiedBy = userId;
                claim.ModifiedDate = DateTime.Now;

                // Set dates based on status
                if (dto.Status == "SUBMITTED" && !claim.SubmittedDate.HasValue)
                    claim.SubmittedDate = DateTime.Now;
                else if (dto.Status == "APPROVED" && !claim.ApprovedDate.HasValue)
                    claim.ApprovedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return await GetClaimByIdAsync(id, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating claim status {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteClaimAsync(int id, int branchId)
        {
            try
            {
                var claim = await _context.WarrantyClaims
                    .Include(c => c.Attachments)
                    .Include(c => c.History)
                    .FirstOrDefaultAsync(c => c.ClaimID == id && c.BranchID == branchId);

                if (claim == null)
                    return false;

                // Delete attachments first
                if (claim.Attachments != null && claim.Attachments.Any())
                {
                    _context.WarrantyAttachments.RemoveRange(claim.Attachments);
                }

                // Delete history
                if (claim.History != null && claim.History.Any())
                {
                    _context.WarrantyHistory.RemoveRange(claim.History);
                }

                // Delete claim
                _context.WarrantyClaims.Remove(claim);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting claim {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<WarrantyClaimDto>> GetClaimsByJobAsync(int jobCardId, int branchId)
        {
            try
            {
                var claims = await _context.WarrantyClaims
                    .Include(c => c.JobCard)
                    .Include(c => c.JobService)
                    .Include(c => c.JobPart)
                    .Include(c => c.Item)
                    .Include(c => c.Supplier)
                    .Where(c => c.JobCardID == jobCardId && c.BranchID == branchId)
                    .OrderByDescending(c => c.ClaimDate)
                    .ToListAsync();

                var dtos = new List<WarrantyClaimDto>();

                foreach (var claim in claims)
                {
                    dtos.Add(await MapToDto(claim));
                }

                return dtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting claims for job {JobCardId}", jobCardId);
                throw;
            }
        }

        public async Task<IEnumerable<WarrantyClaimDto>> GetClaimsByServiceAsync(int jobServiceId, int branchId)
        {
            try
            {
                var claims = await _context.WarrantyClaims
                    .Include(c => c.JobCard)
                    .Include(c => c.JobService)
                    .Where(c => c.JobServiceID == jobServiceId && c.BranchID == branchId)
                    .OrderByDescending(c => c.ClaimDate)
                    .ToListAsync();

                var dtos = new List<WarrantyClaimDto>();

                foreach (var claim in claims)
                {
                    dtos.Add(await MapToDto(claim));
                }

                return dtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting claims for service {JobServiceId}", jobServiceId);
                throw;
            }
        }

        public async Task<IEnumerable<WarrantyClaimDto>> GetClaimsByPartAsync(int jobPartId, int branchId)
        {
            try
            {
                var claims = await _context.WarrantyClaims
                    .Include(c => c.JobCard)
                    .Include(c => c.JobPart)
                    .Where(c => c.JobPartID == jobPartId && c.BranchID == branchId)
                    .OrderByDescending(c => c.ClaimDate)
                    .ToListAsync();

                var dtos = new List<WarrantyClaimDto>();

                foreach (var claim in claims)
                {
                    dtos.Add(await MapToDto(claim));
                }

                return dtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting claims for part {JobPartId}", jobPartId);
                throw;
            }
        }

        public async Task<IEnumerable<WarrantyClaimDto>> GetClaimsBySupplierAsync(int supplierId, int branchId)
        {
            try
            {
                var claims = await _context.WarrantyClaims
                    .Include(c => c.JobCard)
                    .Include(c => c.Supplier)
                    .Where(c => c.SupplierID == supplierId && c.BranchID == branchId)
                    .OrderByDescending(c => c.ClaimDate)
                    .ToListAsync();

                var dtos = new List<WarrantyClaimDto>();

                foreach (var claim in claims)
                {
                    dtos.Add(await MapToDto(claim));
                }

                return dtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting claims for supplier {SupplierId}", supplierId);
                throw;
            }
        }

        #endregion

        #region Attachments

        public async Task<IEnumerable<WarrantyAttachmentDto>> GetAttachmentsAsync(int claimId, int branchId)
        {
            try
            {
                var attachments = await _context.WarrantyAttachments
                    .Include(a => a.Claim)
                    .Where(a => a.ClaimID == claimId && a.Claim!.BranchID == branchId)
                    .OrderByDescending(a => a.UploadedDate)
                    .ToListAsync();

                return attachments.Select(MapToAttachmentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting attachments for claim {ClaimId}", claimId);
                throw;
            }
        }

        public async Task<WarrantyAttachmentDto> AddAttachmentAsync(WarrantyAttachmentCreateDto dto, int userId, int branchId)
        {
            try
            {
                // Verify claim exists
                var claim = await _context.WarrantyClaims
                    .FirstOrDefaultAsync(c => c.ClaimID == dto.ClaimID && c.BranchID == branchId);

                if (claim == null)
                    throw new InvalidOperationException("Claim not found");

                var attachment = new WarrantyAttachment
                {
                    ClaimID = dto.ClaimID,
                    FileName = dto.FileName,
                    FilePath = dto.FilePath,
                    FileSize = dto.FileSize,
                    FileType = dto.FileType,
                    Description = dto.Description,
                    UploadedBy = userId,
                    UploadedDate = DateTime.Now
                };

                _context.WarrantyAttachments.Add(attachment);
                await _context.SaveChangesAsync();

                return MapToAttachmentDto(attachment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding attachment to claim {ClaimId}", dto.ClaimID);
                throw;
            }
        }

        public async Task<bool> DeleteAttachmentAsync(int attachmentId, int branchId)
        {
            try
            {
                var attachment = await _context.WarrantyAttachments
                    .Include(a => a.Claim)
                    .FirstOrDefaultAsync(a => a.AttachmentID == attachmentId && a.Claim!.BranchID == branchId);

                if (attachment == null)
                    return false;

                _context.WarrantyAttachments.Remove(attachment);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting attachment {AttachmentId}", attachmentId);
                throw;
            }
        }

        #endregion

        #region History

        public async Task<IEnumerable<WarrantyHistoryDto>> GetClaimHistoryAsync(int claimId, int branchId)
        {
            try
            {
                var history = await _context.WarrantyHistory
                    .Include(h => h.Claim)
                    .Where(h => h.ClaimID == claimId && h.Claim!.BranchID == branchId)
                    .OrderByDescending(h => h.ChangedDate)
                    .ToListAsync();

                return history.Select(MapToHistoryDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting history for claim {ClaimId}", claimId);
                throw;
            }
        }

        #endregion

        #region Supplier Warranties

        public async Task<IEnumerable<SupplierWarrantyDto>> GetAllSupplierWarrantiesAsync(int branchId)
        {
            try
            {
                var warranties = await _context.SupplierWarranties
                    .Include(w => w.Supplier)
                    .Include(w => w.Item)
                    .Where(w => w.IsActive)
                    .OrderBy(w => w.Supplier!.AcctName)
                    .ThenBy(w => w.Item!.ItemName)
                    .ToListAsync();

                return warranties.Select(MapToSupplierWarrantyDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting supplier warranties");
                throw;
            }
        }

        public async Task<SupplierWarrantyDto?> GetSupplierWarrantyByIdAsync(int id, int branchId)
        {
            try
            {
                var warranty = await _context.SupplierWarranties
                    .Include(w => w.Supplier)
                    .Include(w => w.Item)
                    .FirstOrDefaultAsync(w => w.SupplierWarrantyID == id && w.IsActive);

                return warranty == null ? null : MapToSupplierWarrantyDto(warranty);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting supplier warranty {Id}", id);
                throw;
            }
        }

        public async Task<SupplierWarrantyDto> CreateSupplierWarrantyAsync(SupplierWarrantyCreateDto dto, int userId, int branchId)
        {
            try
            {
                // Check if already exists
                var exists = await _context.SupplierWarranties
                    .AnyAsync(w => w.SupplierID == dto.SupplierID && w.ItemID == dto.ItemID && w.IsActive);

                if (exists)
                    throw new InvalidOperationException("Warranty already exists for this supplier and item");

                var warranty = new SupplierWarranty
                {
                    SupplierID = dto.SupplierID,
                    ItemID = dto.ItemID,
                    WarrantyPeriod = dto.WarrantyPeriod,
                    WarrantyType = dto.WarrantyType,
                    Terms = dto.Terms,
                    IsActive = dto.IsActive,
                    CreatedDate = DateTime.Now
                };

                _context.SupplierWarranties.Add(warranty);
                await _context.SaveChangesAsync();

                return MapToSupplierWarrantyDto(warranty);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating supplier warranty");
                throw;
            }
        }

        public async Task<SupplierWarrantyDto?> UpdateSupplierWarrantyAsync(int id, SupplierWarrantyUpdateDto dto, int userId, int branchId)
        {
            try
            {
                var warranty = await _context.SupplierWarranties
                    .FirstOrDefaultAsync(w => w.SupplierWarrantyID == id);

                if (warranty == null)
                    return null;

                // Check if another active warranty exists for same supplier/item
                var exists = await _context.SupplierWarranties
                    .AnyAsync(w => w.SupplierID == dto.SupplierID
                        && w.ItemID == dto.ItemID
                        && w.SupplierWarrantyID != id
                        && w.IsActive);

                if (exists)
                    throw new InvalidOperationException("Another active warranty already exists for this supplier and item");

                warranty.WarrantyPeriod = dto.WarrantyPeriod;
                warranty.WarrantyType = dto.WarrantyType;
                warranty.Terms = dto.Terms;
                warranty.IsActive = dto.IsActive;
                warranty.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return MapToSupplierWarrantyDto(warranty);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating supplier warranty {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteSupplierWarrantyAsync(int id, int branchId)
        {
            try
            {
                var warranty = await _context.SupplierWarranties
                    .FindAsync(id);

                if (warranty == null)
                    return false;

                warranty.IsActive = false;
                warranty.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting supplier warranty {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<SupplierWarrantyDto>> GetWarrantiesBySupplierAsync(int supplierId, int branchId)
        {
            try
            {
                var warranties = await _context.SupplierWarranties
                    .Include(w => w.Item)
                    .Where(w => w.SupplierID == supplierId && w.IsActive)
                    .OrderBy(w => w.Item!.ItemName)
                    .ToListAsync();

                return warranties.Select(MapToSupplierWarrantyDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting warranties for supplier {SupplierId}", supplierId);
                throw;
            }
        }

        public async Task<IEnumerable<SupplierWarrantyDto>> GetWarrantiesByItemAsync(int itemId, int branchId)
        {
            try
            {
                var warranties = await _context.SupplierWarranties
                    .Include(w => w.Supplier)
                    .Where(w => w.ItemID == itemId && w.IsActive)
                    .OrderBy(w => w.Supplier!.AcctName)
                    .ToListAsync();

                return warranties.Select(MapToSupplierWarrantyDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting warranties for item {ItemId}", itemId);
                throw;
            }
        }

        #endregion

        #region Reports & Summary

        public async Task<WarrantySummaryDto> GetWarrantySummaryAsync(int branchId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                var query = _context.WarrantyClaims
                    .Where(c => c.BranchID == branchId);

                if (fromDate.HasValue)
                    query = query.Where(c => c.ClaimDate >= fromDate.Value);

                if (toDate.HasValue)
                {
                    var endDate = toDate.Value.AddDays(1);
                    query = query.Where(c => c.ClaimDate < endDate);
                }

                var claims = await query.ToListAsync();

                var summary = new WarrantySummaryDto
                {
                    TotalClaims = claims.Count,
                    OpenClaims = claims.Count(c => c.Status == "OPEN"),
                    ApprovedClaims = claims.Count(c => c.Status == "APPROVED"),
                    RejectedClaims = claims.Count(c => c.Status == "REJECTED"),
                    PaidClaims = claims.Count(c => c.Status == "PAID"),
                    TotalClaimAmount = claims.Sum(c => c.ClaimAmount ?? 0),
                    TotalApprovedAmount = claims.Sum(c => c.ApprovedAmount ?? 0)
                };

                // Get recent 10 claims
                var recentClaims = await query
                    .OrderByDescending(c => c.ClaimDate)
                    .Take(10)
                    .ToListAsync();

                foreach (var claim in recentClaims)
                {
                    summary.RecentClaims.Add(await MapToDto(claim));
                }

                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting warranty summary");
                throw;
            }
        }

        public async Task<byte[]> GenerateWarrantyReportAsync(int branchId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                var summary = await GetWarrantySummaryAsync(branchId, fromDate, toDate);
                var claims = await GetAllClaimsAsync(branchId, null, fromDate, toDate);

                using (var ms = new MemoryStream())
                {
                    // FIX: Use fully qualified name to avoid ambiguity
                    var document = new iTextSharp.text.Document(PageSize.A4, 50, 50, 50, 50);
                    var writer = PdfWriter.GetInstance(document, ms);
                    document.Open();

                    // Title
                    var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18);
                    var title = new Paragraph("Warranty Claims Report", titleFont);
                    title.Alignment = Element.ALIGN_CENTER;
                    title.SpacingAfter = 20;
                    document.Add(title);

                    // Date Range
                    var dateRange = fromDate.HasValue || toDate.HasValue
                        ? $"Period: {fromDate:dd/MM/yyyy} - {toDate:dd/MM/yyyy}"
                        : "Period: All Time";
                    var datePara = new Paragraph(dateRange);
                    datePara.SpacingAfter = 20;
                    document.Add(datePara);

                    // Summary Statistics - FIX: Use AddTableCell with 2 arguments
                    var table = new PdfPTable(4);
                    table.WidthPercentage = 100;
                    table.SetWidths(new float[] { 25f, 25f, 25f, 25f });

                    AddTableHeader(table, "Total Claims", "Open Claims", "Approved", "Rejected");
                    AddTableValuesRow(table, summary.TotalClaims.ToString(), summary.OpenClaims.ToString(),
                  summary.ApprovedClaims.ToString(), summary.RejectedClaims.ToString());

                    document.Add(table);

                    // Amounts
                    var amountTable = new PdfPTable(2);
                    amountTable.WidthPercentage = 100;
                    amountTable.SetWidths(new float[] { 50f, 50f });

                    AddTableCell(amountTable, "Total Claim Amount:");
                    AddTableCell(amountTable, $"Rs. {summary.TotalClaimAmount:N2}");

                    AddTableCell(amountTable, "Total Approved Amount:");
                    AddTableCell(amountTable, $"Rs. {summary.TotalApprovedAmount:N2}");

                    document.Add(amountTable);

                    // Claims List
                    if (claims.Any())
                    {
                        document.Add(new Paragraph("\nRecent Claims", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 14)));

                        var claimTable = new PdfPTable(6);
                        claimTable.WidthPercentage = 100;
                        claimTable.SetWidths(new float[] { 15f, 20f, 15f, 15f, 20f, 15f });

                        AddTableHeader(claimTable, "Claim No", "Job No", "Type", "Status", "Claim Amount", "Date");

                        foreach (var claim in claims.Take(20))
                        {
                            AddTableCell(claimTable, claim.ClaimNo);
                            AddTableCell(claimTable, claim.JobCardNo);
                            AddTableCell(claimTable, claim.ClaimType);
                            AddTableCell(claimTable, claim.Status);
                            AddTableCell(claimTable, $"Rs. {claim.ClaimAmount:N2}");
                            AddTableCell(claimTable, claim.ClaimDate.ToString("dd/MM/yyyy"));
                        }

                        document.Add(claimTable);
                    }

                    document.Close();
                    return ms.ToArray();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating warranty report");
                throw;
            }
        }

        public async Task<byte[]> GenerateClaimReportAsync(int claimId, int branchId)
        {
            try
            {
                var claim = await GetClaimByIdAsync(claimId, branchId);
                if (claim == null)
                    throw new InvalidOperationException("Claim not found");

                using (var ms = new MemoryStream())
                {
                    var document = new Document(PageSize.A4, 50, 50, 50, 50);
                    var writer = PdfWriter.GetInstance(document, ms);
                    document.Open();

                    // Title
                    var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18);
                    var title = new Paragraph($"Warranty Claim: {claim.ClaimNo}", titleFont);
                    title.Alignment = Element.ALIGN_CENTER;
                    title.SpacingAfter = 20;
                    document.Add(title);

                    // Claim Details
                    var table = new PdfPTable(2);
                    table.WidthPercentage = 100;
                    table.SetWidths(new float[] { 30f, 70f });

                    AddTableRow(table, "Claim Date:", claim.ClaimDate.ToString("dd/MM/yyyy HH:mm"));
                    AddTableRow(table, "Job Card:", claim.JobCardNo);
                    AddTableRow(table, "Vehicle:", claim.VehicleRegNo);
                    AddTableRow(table, "Customer:", claim.CustomerName);
                    AddTableRow(table, "Claim Type:", claim.ClaimType);
                    AddTableRow(table, "Status:", claim.Status);
                    AddTableRow(table, "Priority:", claim.Priority);
                    AddTableRow(table, "Claim Amount:", $"Rs. {claim.ClaimAmount:N2}");

                    if (claim.ApprovedAmount.HasValue)
                        AddTableRow(table, "Approved Amount:", $"Rs. {claim.ApprovedAmount:N2}");

                    if (claim.SupplierName != null)
                        AddTableRow(table, "Supplier:", claim.SupplierName);

                    if (claim.ItemName != null)
                        AddTableRow(table, "Item:", claim.ItemName);

                    document.Add(table);

                    // Description
                    if (!string.IsNullOrEmpty(claim.Description))
                    {
                        document.Add(new Paragraph("\nDescription:", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12)));
                        document.Add(new Paragraph(claim.Description));
                    }

                    // Resolution Notes
                    if (!string.IsNullOrEmpty(claim.ResolutionNotes))
                    {
                        document.Add(new Paragraph("\nResolution Notes:", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12)));
                        document.Add(new Paragraph(claim.ResolutionNotes));
                    }

                    // Rejection Reason
                    if (!string.IsNullOrEmpty(claim.RejectionReason))
                    {
                        document.Add(new Paragraph("\nRejection Reason:", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12)));
                        document.Add(new Paragraph(claim.RejectionReason));
                    }

                    document.Close();
                    return ms.ToArray();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating claim report");
                throw;
            }
        }

        #endregion

        #region Helper Methods

        private async Task<string> GenerateClaimNumberAsync(int branchId)
        {
            var claimNoParam = new SqlParameter("@ClaimNo", System.Data.SqlDbType.NVarChar, 50)
            {
                Direction = System.Data.ParameterDirection.Output
            };

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GenerateClaimNo @BranchID = {0}, @ClaimNo = @ClaimNo OUTPUT",
                branchId, claimNoParam);

            return claimNoParam.Value?.ToString() ?? $"WRN-{branchId}-{DateTime.Now:yyyyMM}-0001";
        }

        private async Task<WarrantyClaimDto> MapToDto(WarrantyClaim claim)
        {
            var daysRemaining = 0;
            if (claim.WarrantyExpiryDate.HasValue)
            {
                daysRemaining = (int)(claim.WarrantyExpiryDate.Value - DateTime.Now).TotalDays;
                if (daysRemaining < 0) daysRemaining = 0;
            }

            return new WarrantyClaimDto
            {
                ClaimID = claim.ClaimID,
                ClaimNo = claim.ClaimNo,
                JobCardID = claim.JobCardID,
                JobCardNo = claim.JobCard?.JobCardNo ?? "",
                VehicleRegNo = claim.JobCard?.Vehicle?.RegistrationNo ?? "",
                CustomerName = claim.JobCard?.Customer?.AcctName ?? "",
                ClaimDate = claim.ClaimDate,
                ClaimType = claim.ClaimType,
                JobServiceID = claim.JobServiceID,
                ServiceName = claim.JobService?.ServiceName,
                JobPartID = claim.JobPartID,
                PartName = claim.JobPart?.ItemName,
                ItemID = claim.ItemID,
                ItemName = claim.Item?.ItemName,
                SupplierID = claim.SupplierID,
                SupplierName = claim.Supplier?.AcctName,
                ClaimAmount = claim.ClaimAmount,
                ApprovedAmount = claim.ApprovedAmount,
                Description = claim.Description,
                Status = claim.Status,
                SubmittedDate = claim.SubmittedDate,
                ApprovedDate = claim.ApprovedDate,
                RejectionReason = claim.RejectionReason,
                ResolutionNotes = claim.ResolutionNotes,
                Priority = claim.Priority,
                WarrantyPeriod = claim.WarrantyPeriod,
                WarrantyExpiryDate = claim.WarrantyExpiryDate,
                DaysRemaining = daysRemaining,
                Attachments = claim.Attachments?.Select(a => MapToAttachmentDto(a)).ToList(),
                History = claim.History?.OrderByDescending(h => h.ChangedDate)
                    .Select(h => MapToHistoryDto(h)).ToList()
            };
        }

        private WarrantyAttachmentDto MapToAttachmentDto(WarrantyAttachment attachment)
        {
            return new WarrantyAttachmentDto
            {
                AttachmentID = attachment.AttachmentID,
                ClaimID = attachment.ClaimID,
                FileName = attachment.FileName,
                FilePath = attachment.FilePath,
                FileSize = attachment.FileSize,
                FileType = attachment.FileType,
                UploadedDate = attachment.UploadedDate,
                Description = attachment.Description
            };
        }

        private WarrantyHistoryDto MapToHistoryDto(WarrantyHistory history)
        {
            return new WarrantyHistoryDto
            {
                HistoryID = history.HistoryID,
                ClaimID = history.ClaimID,
                StatusFrom = history.StatusFrom,
                StatusTo = history.StatusTo,
                ChangedDate = history.ChangedDate,
                Notes = history.Notes
            };
        }

        private SupplierWarrantyDto MapToSupplierWarrantyDto(SupplierWarranty warranty)
        {
            return new SupplierWarrantyDto
            {
                SupplierWarrantyID = warranty.SupplierWarrantyID,
                SupplierID = warranty.SupplierID,
                SupplierName = warranty.Supplier?.AcctName ?? "",
                ItemID = warranty.ItemID,
                ItemName = warranty.Item?.ItemName ?? "",
                WarrantyPeriod = warranty.WarrantyPeriod,
                WarrantyType = warranty.WarrantyType,
                Terms = warranty.Terms,
                IsActive = warranty.IsActive
            };
        }

        private void AddTableHeader(PdfPTable table, params string[] headers)
        {
            foreach (var header in headers)
            {
                var cell = new PdfPCell(new Phrase(header, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10)));
                cell.BackgroundColor = GrayColor.GRAY; // Light gray
                cell.Padding = 5;
                table.AddCell(cell);
            }
        }

        private void AddTableCell(PdfPTable table, string text)
        {
            var cell = new PdfPCell(new Phrase(text ?? "-"));
            cell.Padding = 5;
            table.AddCell(cell);
        }

        private void AddTableRow(PdfPTable table, string label, string value)
        {
            var labelCell = new PdfPCell(new Phrase(label, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10)));
            labelCell.Border = PdfPCell.NO_BORDER;
            labelCell.Padding = 5;
            table.AddCell(labelCell);

            var valueCell = new PdfPCell(new Phrase(value ?? "-"));
            valueCell.Border = PdfPCell.NO_BORDER;
            valueCell.Padding = 5;
            table.AddCell(valueCell);
        }
        private void AddTableValuesRow(PdfPTable table, params string[] values)
        {
            foreach (var value in values)
            {
                var cell = new PdfPCell(new Phrase(value ?? "-"));
                cell.Padding = 5;
                table.AddCell(cell);
            }
        }
        #endregion


    }
}