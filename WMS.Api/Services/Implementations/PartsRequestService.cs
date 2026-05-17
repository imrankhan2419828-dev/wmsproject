using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Models.Workshop;
using WMS.Api.Services.Interfaces.Workshop;
using Microsoft.Data.SqlClient;

namespace WMS.Api.Services.Implementations.Workshop
{
    public class PartsRequestService : IPartsRequestService
    {
        private readonly WmsDbContext _context;
        private readonly ILogger<PartsRequestService> _logger;

        public PartsRequestService(WmsDbContext context, ILogger<PartsRequestService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<PartsRequestDto>> GetAllAsync(int branchId, string? status = null)
        {
            try
            {
                var query = _context.PartsRequests
                    .Include(p => p.JobCard)
                        .ThenInclude(j => j.Vehicle)
                    .Include(p => p.Item)
                    .Include(p => p.Supplier)
                    .Where(p => !p.IsDeleted && p.BranchID == branchId);

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(p => p.Status == status);
                }

                var requests = await query
                    .OrderByDescending(p => p.RequestDate)
                    .ToListAsync();

                return requests.Select(MapToDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting parts requests");
                throw;
            }
        }

        public async Task<PartsRequestDto?> GetByIdAsync(int id, int branchId)
        {
            try
            {
                var request = await _context.PartsRequests
                    .Include(p => p.JobCard)
                        .ThenInclude(j => j.Vehicle)
                    .Include(p => p.Item)
                    .Include(p => p.Supplier)
                    .FirstOrDefaultAsync(p => p.RequestID == id && !p.IsDeleted && p.BranchID == branchId);

                return request == null ? null : MapToDto(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting parts request {Id}", id);
                throw;
            }
        }

        public async Task<PartsRequestDto> CreateAsync(PartsRequestCreateDto dto, int userId, int branchId)
        {
            try
            {
                // Generate request number
                var requestNo = await GenerateRequestNumberAsync(branchId);

                // Check stock availability
                var availableStock = await _context.ItemStock
                    .Where(s => s.ItemID == dto.ItemID && s.BranchID == branchId)
                    .SumAsync(s => s.InQty - s.OutQty);

                // Get item details
                var item = await _context.ItemFile.FindAsync(dto.ItemID);

                var request = new PartsRequest
                {
                    RequestNo = requestNo,
                    JobCardID = dto.JobCardID,
                    ItemID = dto.ItemID,
                    Quantity = dto.Quantity,
                    RequiredDate = dto.RequiredDate,
                    SupplierID = dto.SupplierID,
                    EstimatedCost = dto.EstimatedCost,
                    Urgency = dto.Urgency,
                    Notes = dto.Notes,
                    RequestedBy = userId,
                    Status = "PENDING",
                    BranchID = branchId,
                    CreatedBy = userId,
                    CreatedDate = DateTime.Now
                };

                _context.PartsRequests.Add(request);
                await _context.SaveChangesAsync();

                return await GetByIdAsync(request.RequestID, branchId)
                    ?? throw new Exception("Failed to retrieve created request");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating parts request");
                throw;
            }
        }

        public async Task<PartsRequestDto?> UpdateAsync(int id, PartsRequestUpdateDto dto, int userId, int branchId)
        {
            try
            {
                var request = await _context.PartsRequests
                    .FirstOrDefaultAsync(p => p.RequestID == id && !p.IsDeleted && p.BranchID == branchId);

                if (request == null)
                    return null;

                // Update fields
                request.ApprovedQuantity = dto.ApprovedQuantity ?? request.ApprovedQuantity;
                request.ExpectedDate = dto.ExpectedDate ?? request.ExpectedDate;
                request.ReceivedDate = dto.ReceivedDate ?? request.ReceivedDate;
                request.Status = dto.Status ?? request.Status;
                request.SupplierID = dto.SupplierID ?? request.SupplierID;
                request.EstimatedCost = dto.EstimatedCost ?? request.EstimatedCost;
                request.ActualCost = dto.ActualCost ?? request.ActualCost;
                request.Notes = dto.Notes ?? request.Notes;
                request.ApprovedBy = dto.ApprovedBy ?? request.ApprovedBy;
                request.ModifiedBy = userId;
                request.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return await GetByIdAsync(id, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating parts request {Id}", id);
                throw;
            }
        }

        public async Task<PartsRequestDto?> ApproveAsync(int id, PartsRequestApproveDto dto, int userId, int branchId)
        {
            try
            {
                var request = await _context.PartsRequests
                    .FirstOrDefaultAsync(p => p.RequestID == id && !p.IsDeleted && p.BranchID == branchId);

                if (request == null)
                    return null;

                if (request.Status != "PENDING")
                    throw new InvalidOperationException($"Cannot approve request with status {request.Status}");

                request.Status = "APPROVED";
                request.ApprovedQuantity = dto.ApprovedQuantity;
                request.SupplierID = dto.SupplierID ?? request.SupplierID;
                request.ExpectedDate = dto.ExpectedDate ?? request.ExpectedDate;
                request.Notes = dto.Notes ?? request.Notes;
                request.ApprovedBy = userId;
                request.ModifiedBy = userId;
                request.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return await GetByIdAsync(id, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving parts request {Id}", id);
                throw;
            }
        }

        public async Task<PartsRequestDto?> ReceiveAsync(int id, decimal actualCost, int userId, int branchId)
        {
            try
            {
                var request = await _context.PartsRequests
                    .FirstOrDefaultAsync(p => p.RequestID == id && !p.IsDeleted && p.BranchID == branchId);

                if (request == null)
                    return null;

                if (request.Status != "ORDERED")
                    throw new InvalidOperationException($"Cannot receive request with status {request.Status}");

                request.Status = "RECEIVED";
                request.ReceivedDate = DateTime.Now;
                request.ActualCost = actualCost;
                request.ModifiedBy = userId;
                request.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return await GetByIdAsync(id, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error receiving parts request {Id}", id);
                throw;
            }
        }

        public async Task<PartsRequestDto?> CancelAsync(int id, string reason, int userId, int branchId)
        {
            try
            {
                var request = await _context.PartsRequests
                    .FirstOrDefaultAsync(p => p.RequestID == id && !p.IsDeleted && p.BranchID == branchId);

                if (request == null)
                    return null;

                if (request.Status == "RECEIVED" || request.Status == "CANCELLED")
                    throw new InvalidOperationException($"Cannot cancel request with status {request.Status}");

                request.Status = "CANCELLED";
                request.Notes = (request.Notes + " | Cancelled: " + reason).Trim();
                request.ModifiedBy = userId;
                request.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return await GetByIdAsync(id, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling parts request {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(int id, int branchId)
        {
            try
            {
                var request = await _context.PartsRequests
                    .FirstOrDefaultAsync(p => p.RequestID == id && !p.IsDeleted && p.BranchID == branchId);

                if (request == null)
                    return false;

                if (request.Status != "PENDING" && request.Status != "CANCELLED")
                    throw new InvalidOperationException("Cannot delete non-pending requests");

                request.IsDeleted = true;
                request.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting parts request {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<LowStockAlertDto>> GetLowStockAlertsAsync(int branchId, string? status = null)
        {
            try
            {
                var items = await _context.ItemFile
                    .Where(i => !i.IsDeleted && i.InActive != true && (i.BranchID == null || i.BranchID == branchId))
                    .Include(i => i.Company)
                    .Include(i => i.Category)
                    .ToListAsync();

                var alerts = new List<LowStockAlertDto>();

                foreach (var item in items)
                {
                    // Calculate current stock
                    var stock = await _context.ItemStock
                        .Where(s => s.ItemID == item.ItemID && s.BranchID == branchId)
                        .SumAsync(s => (decimal)(s.InQty - s.OutQty));

                    // Get pending requests count
                    var pendingRequests = await _context.PartsRequests
                        .CountAsync(r => r.ItemID == item.ItemID && r.Status == "PENDING" && !r.IsDeleted);

                    // Get earliest required date from pending requests
                    var earliestRequired = await _context.PartsRequests
                        .Where(r => r.ItemID == item.ItemID && r.Status == "PENDING" && r.RequiredDate != null)
                        .OrderBy(r => r.RequiredDate)
                        .Select(r => r.RequiredDate)
                        .FirstOrDefaultAsync();

                    // Determine stock status
                    string stockStatus = "NORMAL";
                    if (stock <= 5) stockStatus = "CRITICAL";
                    else if (stock <= 10) stockStatus = "LOW";

                    // Apply filter
                    if (!string.IsNullOrEmpty(status) && stockStatus != status)
                        continue;

                    // Only include if stock is low or critical
                    if (stockStatus != "NORMAL")
                    {
                        alerts.Add(new LowStockAlertDto
                        {
                            ItemID = item.ItemID,
                            ItemName = item.ItemName ?? "",
                            CompanyName = item.Company?.CompName,
                            CategoryName = item.Category?.CatgName,
                            CurrentStock = stock,
                            PendingRequests = pendingRequests,
                            EarliestRequiredDate = earliestRequired,
                            StockStatus = stockStatus,
                            PurchaseRate = item.PurcRate,
                            SaleRate = item.SaleRate
                        });
                    }
                }

                // Order by critical first, then low
                return alerts.OrderBy(a => a.StockStatus == "CRITICAL" ? 1 : 2);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting low stock alerts");
                throw;
            }
        }

        public async Task<IEnumerable<PartsRequestDto>> GetByJobCardAsync(int jobCardId, int branchId)
        {
            try
            {
                var requests = await _context.PartsRequests
                    .Include(p => p.Item)
                    .Include(p => p.Supplier)
                    .Where(p => p.JobCardID == jobCardId && !p.IsDeleted && p.BranchID == branchId)
                    .OrderByDescending(p => p.RequestDate)
                    .ToListAsync();

                return requests.Select(MapToDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting parts requests for job {JobCardId}", jobCardId);
                throw;
            }
        }

        public async Task<PartsRequestDto?> LinkToPurchaseOrderAsync(int id, int purchaseOrderId, int userId, int branchId)
        {
            try
            {
                var request = await _context.PartsRequests
                    .FirstOrDefaultAsync(p => p.RequestID == id && !p.IsDeleted && p.BranchID == branchId);

                if (request == null)
                    return null;

                request.PurchaseOrderID = purchaseOrderId;
                request.Status = "ORDERED";
                request.ModifiedBy = userId;
                request.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return await GetByIdAsync(id, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error linking parts request to purchase order");
                throw;
            }
        }

        private async Task<string> GenerateRequestNumberAsync(int branchId)
        {
            var requestNoParam = new SqlParameter("@RequestNo", System.Data.SqlDbType.NVarChar, 50)
            {
                Direction = System.Data.ParameterDirection.Output
            };

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GeneratePartsRequestNo @BranchID = {0}, @RequestNo = @RequestNo OUTPUT",
                branchId, requestNoParam);

            return requestNoParam.Value?.ToString() ?? $"PR-{branchId}-{DateTime.Now:yyyyMM}-0001";
        }

        private PartsRequestDto MapToDto(PartsRequest request)
        {
            var daysPending = (DateTime.Now - request.RequestDate).Days;

            return new PartsRequestDto
            {
                RequestID = request.RequestID,
                RequestNo = request.RequestNo,
                JobCardID = request.JobCardID,
                JobCardNo = request.JobCard?.JobCardNo ?? "",
                VehicleRegNo = request.JobCard?.Vehicle?.RegistrationNo ?? "",
                ItemID = request.ItemID,
                ItemName = request.Item?.ItemName ?? "",
                ItemCode = request.Item?.ModlNumb ?? "",
                Quantity = request.Quantity,
                ApprovedQuantity = request.ApprovedQuantity,
                RequestDate = request.RequestDate,
                RequiredDate = request.RequiredDate,
                ExpectedDate = request.ExpectedDate,
                ReceivedDate = request.ReceivedDate,
                Status = request.Status,
                SupplierID = request.SupplierID,
                SupplierName = request.Supplier?.AcctName ?? request.SupplierName,
                PurchaseOrderID = request.PurchaseOrderID,
                EstimatedCost = request.EstimatedCost,
                ActualCost = request.ActualCost,
                Urgency = request.Urgency,
                Notes = request.Notes,
                DaysPending = daysPending
            };
        }
    }
}