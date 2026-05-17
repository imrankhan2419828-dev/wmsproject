using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Models;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class JobCardService : IJobCardService
    {
        private readonly WmsDbContext _context;
        private readonly ILogger<JobCardService> _logger;

        public JobCardService(WmsDbContext context, ILogger<JobCardService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<JobCardDto>> GetAllAsync(int branchId, string? status = null)
        {
            try
            {
                var query = _context.JobCards
                    .Include(j => j.Vehicle)
                    .Include(j => j.Customer)
                    .Include(j => j.ServiceAdvisor)
                    .Include(j => j.Technician)
                        .ThenInclude(t => t.User)
                    .Where(j => !j.IsDeleted && j.BranchID == branchId);

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(j => j.Status == status);
                }

                var jobCards = await query
                    .OrderByDescending(j => j.JobCardID)
                    .ToListAsync();

                return jobCards.Select(MapToDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting job cards");
                throw;
            }
        }

        public async Task<JobCardDto?> GetByIdAsync(int id, int branchId)
        {
            try
            {
                // ✅ CRITICAL FIX: Use AsNoTracking() and ensure includes
                var jobCard = await _context.JobCards
                    .AsNoTracking()
                    .Include(j => j.Vehicle)
                    .Include(j => j.Customer)
                    .Include(j => j.ServiceAdvisor)
                    .Include(j => j.Technician)
                        .ThenInclude(t => t.User)
                    .Include(j => j.Services)
                        .ThenInclude(s => s.Service)
                    .Include(j => j.Services)
                        .ThenInclude(s => s.Technician)
                            .ThenInclude(t => t.User)
                    .Include(j => j.Parts)
                        .ThenInclude(p => p.Item)
                    .AsSplitQuery()
                    .FirstOrDefaultAsync(j => j.JobCardID == id && !j.IsDeleted && j.BranchID == branchId);

                if (jobCard == null)
                    return null;

                // ✅ Force load if needed
                if (jobCard.Services == null)
                {
                    await _context.Entry(jobCard)
                        .Collection(j => j.Services)
                        .LoadAsync();
                }

                if (jobCard.Parts == null)
                {
                    await _context.Entry(jobCard)
                        .Collection(j => j.Parts)
                        .LoadAsync();
                }

                Console.WriteLine($"=== JOB CARD {id} DATA ===");
                Console.WriteLine($"Services count: {jobCard.Services?.Count ?? 0}");
                Console.WriteLine($"Parts count: {jobCard.Parts?.Count ?? 0}");

                var result = MapToDto(jobCard);

                Console.WriteLine($"DTO Services count: {result.Services?.Count ?? 0}");
                Console.WriteLine($"DTO Parts count: {result.Parts?.Count ?? 0}");

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting job card {Id}", id);
                throw;
            }
        }

        public async Task<JobCardDto> CreateAsync(JobCardCreateDto dto, int userId, int branchId)
        {
            try
            {
                // Get vehicle to fetch CustomerID
                var vehicle = await _context.Vehicles
                    .FirstOrDefaultAsync(v => v.VehicleID == dto.VehicleID && !v.IsDeleted);

                if (vehicle == null)
                    throw new InvalidOperationException("Vehicle not found");

                // Handle Service Advisor - prioritize ServiceAdvisorName
                int? serviceAdvisorId = dto.ServiceAdvisorID;

                if (!string.IsNullOrWhiteSpace(dto.ServiceAdvisorName) && !serviceAdvisorId.HasValue)
                {
                    var advisor = await _context.SystemUsers
                        .FirstOrDefaultAsync(u => u.UserFullName == dto.ServiceAdvisorName && u.BranchID == branchId);

                    if (advisor != null)
                        serviceAdvisorId = advisor.UserID;
                }

                // Generate job card number
                var jobCardNo = await GenerateJobCardNumberAsync(branchId);

                var jobCard = new JobCard
                {
                    JobCardNo = jobCardNo,
                    VehicleID = dto.VehicleID,
                    CustomerID = vehicle.CustomerID,  // ✅ Auto from vehicle
                    BranchID = branchId,
                    Status = "PENDING",
                    ServiceAdvisorName = dto.ServiceAdvisorName,  // ✅ Save text field
                    ServiceAdvisorID = serviceAdvisorId,
                    TechnicianID = dto.TechnicianID,
                    ReceivedDate = dto.ReceivedDate,
                    PromisedDate = dto.PromisedDate,
                    CustomerComplaint = dto.CustomerComplaint,
                    TechnicianFindings = dto.TechnicianFindings,
                    Recommendations = dto.Recommendations,
                    CreatedBy = userId,
                    CreatedDate = DateTime.Now
                };

                _context.JobCards.Add(jobCard);
                await _context.SaveChangesAsync();

                // Add services
                if (dto.Services != null && dto.Services.Any())
                {
                    Console.WriteLine($"Adding {dto.Services.Count} services to job card");
                    foreach (var serviceDto in dto.Services)
                    {
                        await AddServiceInternal(jobCard.JobCardID, serviceDto, branchId);
                        Console.WriteLine($"Added service: {serviceDto.ServiceID}");
                    }
                }

                // Add parts
                if (dto.Parts != null && dto.Parts.Any())
                {
                    Console.WriteLine($"Adding {dto.Parts.Count} parts to job card");
                    foreach (var partDto in dto.Parts)
                    {
                        await AddPartInternal(jobCard.JobCardID, partDto, branchId);
                        Console.WriteLine($"Added part: {partDto.ItemID}");
                    }
                }

                // Calculate totals
                await CalculateTotals(jobCard.JobCardID);

                return await GetByIdAsync(jobCard.JobCardID, branchId)
                    ?? throw new Exception("Failed to retrieve created job card");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating job card");
                throw;
            }
        }

        public async Task<JobCardDto?> UpdateAsync(int id, JobCardUpdateDto dto, int userId, int branchId)
        {
            try
            {
                var jobCard = await _context.JobCards
                    .FirstOrDefaultAsync(j => j.JobCardID == id && !j.IsDeleted && j.BranchID == branchId);

                if (jobCard == null)
                    return null;

                // Handle Service Advisor
                int? serviceAdvisorId = dto.ServiceAdvisorID;

                if (!string.IsNullOrWhiteSpace(dto.ServiceAdvisorName) && !serviceAdvisorId.HasValue)
                {
                    var advisor = await _context.SystemUsers
                        .FirstOrDefaultAsync(u => u.UserFullName == dto.ServiceAdvisorName && u.BranchID == branchId);

                    if (advisor != null)
                        serviceAdvisorId = advisor.UserID;
                }

                // Update basic fields
                jobCard.ServiceAdvisorName = dto.ServiceAdvisorName ?? jobCard.ServiceAdvisorName;
                jobCard.ServiceAdvisorID = serviceAdvisorId ?? jobCard.ServiceAdvisorID;
                jobCard.TechnicianID = dto.TechnicianID ?? jobCard.TechnicianID;
                jobCard.PromisedDate = dto.PromisedDate;
                jobCard.CustomerComplaint = dto.CustomerComplaint ?? jobCard.CustomerComplaint;
                jobCard.TechnicianFindings = dto.TechnicianFindings ?? jobCard.TechnicianFindings;
                jobCard.Recommendations = dto.Recommendations ?? jobCard.Recommendations;

                if (!string.IsNullOrEmpty(dto.Status))
                    jobCard.Status = dto.Status;

                jobCard.ModifiedBy = userId;
                jobCard.ModifiedDate = DateTime.Now;

                // ✅ FIX: Update services - Remove old first
                var existingServices = await _context.JobServices
                    .Where(s => s.JobCardID == id)
                    .ToListAsync();

                if (existingServices.Any())
                {
                    _context.JobServices.RemoveRange(existingServices);
                }

                // ✅ Update parts - Remove old first
                var existingParts = await _context.JobParts
                    .Where(p => p.JobCardID == id)
                    .ToListAsync();

                if (existingParts.Any())
                {
                    _context.JobParts.RemoveRange(existingParts);
                }

                // Save deletions first
                await _context.SaveChangesAsync();

                // Add new services
                if (dto.Services != null && dto.Services.Any())
                {
                    foreach (var serviceDto in dto.Services)
                    {
                        await AddServiceInternal(id, serviceDto, branchId);
                    }
                }

                // Add new parts
                if (dto.Parts != null && dto.Parts.Any())
                {
                    foreach (var partDto in dto.Parts)
                    {
                        await AddPartInternal(id, partDto, branchId);
                    }
                }

                await _context.SaveChangesAsync();
                await CalculateTotals(id);

                return await GetByIdAsync(id, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating job card {Id}", id);
                throw;
            }
        }

        public async Task<bool> UpdateStatusAsync(int id, JobCardStatusUpdateDto dto, int userId, int branchId)
        {
            try
            {
                var jobCard = await _context.JobCards
                    .FirstOrDefaultAsync(j => j.JobCardID == id && !j.IsDeleted && j.BranchID == branchId);

                if (jobCard == null)
                    return false;

                jobCard.Status = dto.Status;

                if (dto.Status == "COMPLETED")
                {
                    jobCard.CompletedDate = dto.CompletedDate ?? DateTime.Now;
                    await CalculateTotals(id);
                }
                else if (dto.Status == "DELIVERED")
                {
                    jobCard.DeliveredDate = dto.DeliveredDate ?? DateTime.Now;
                }
                else if (dto.Status == "CANCELLED")
                {
                    jobCard.CancelledDate = DateTime.Now;
                }

                jobCard.ModifiedBy = userId;
                jobCard.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating job card status {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(int id, int branchId)
        {
            try
            {
                var jobCard = await _context.JobCards
                    .FirstOrDefaultAsync(j => j.JobCardID == id && !j.IsDeleted && j.BranchID == branchId);

                if (jobCard == null)
                    return false;

                jobCard.IsDeleted = true;
                jobCard.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting job card {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<JobCardDto>> GetByVehicleAsync(int vehicleId, int branchId)
        {
            try
            {
                var jobCards = await _context.JobCards
                    .Include(j => j.Vehicle)
                    .Include(j => j.Customer)
                    .Where(j => !j.IsDeleted && j.BranchID == branchId && j.VehicleID == vehicleId)
                    .OrderByDescending(j => j.JobCardID)
                    .ToListAsync();

                return jobCards.Select(MapToDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting job cards for vehicle {VehicleId}", vehicleId);
                throw;
            }
        }

        public async Task<IEnumerable<JobCardDto>> GetByCustomerAsync(int customerId, int branchId)
        {
            try
            {
                var jobCards = await _context.JobCards
                    .Include(j => j.Vehicle)
                    .Include(j => j.Customer)
                    .Where(j => !j.IsDeleted && j.BranchID == branchId && j.CustomerID == customerId)
                    .OrderByDescending(j => j.JobCardID)
                    .ToListAsync();

                return jobCards.Select(MapToDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting job cards for customer {CustomerId}", customerId);
                throw;
            }
        }

        public async Task<IEnumerable<JobCardDto>> GetByDateRangeAsync(DateTime fromDate, DateTime toDate, int branchId)
        {
            try
            {
                var jobCards = await _context.JobCards
                    .Include(j => j.Vehicle)
                    .Include(j => j.Customer)
                    .Where(j => !j.IsDeleted && j.BranchID == branchId
                        && j.ReceivedDate.Date >= fromDate.Date
                        && j.ReceivedDate.Date <= toDate.Date)
                    .OrderByDescending(j => j.ReceivedDate)
                    .ToListAsync();

                return jobCards.Select(MapToDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting job cards by date range");
                throw;
            }
        }

        public async Task<JobCardDto?> AddServiceAsync(int jobCardId, JobServiceCreateDto dto, int userId, int branchId)
        {
            try
            {
                await AddServiceInternal(jobCardId, dto, branchId);
                await CalculateTotals(jobCardId);
                return await GetByIdAsync(jobCardId, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding service to job card {JobCardId}", jobCardId);
                throw;
            }
        }

        public async Task<bool> RemoveServiceAsync(int jobCardId, int serviceId, int branchId)
        {
            try
            {
                var service = await _context.JobServices
                    .FirstOrDefaultAsync(s => s.JobServiceID == serviceId && s.JobCardID == jobCardId);

                if (service == null)
                    return false;

                _context.JobServices.Remove(service);
                await _context.SaveChangesAsync();
                await CalculateTotals(jobCardId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing service from job card {JobCardId}", jobCardId);
                throw;
            }
        }

        public async Task<JobCardDto?> AddPartAsync(int jobCardId, JobPartCreateDto dto, int userId, int branchId)
        {
            try
            {
                await AddPartInternal(jobCardId, dto, branchId);
                await CalculateTotals(jobCardId);
                return await GetByIdAsync(jobCardId, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding part to job card {JobCardId}", jobCardId);
                throw;
            }
        }

        public async Task<bool> RemovePartAsync(int jobCardId, int partId, int branchId)
        {
            try
            {
                var part = await _context.JobParts
                    .FirstOrDefaultAsync(p => p.JobPartID == partId && p.JobCardID == jobCardId);

                if (part == null)
                    return false;

                _context.JobParts.Remove(part);
                await _context.SaveChangesAsync();
                await CalculateTotals(jobCardId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing part from job card {JobCardId}", jobCardId);
                throw;
            }
        }

        public async Task<byte[]> GenerateJobCardPdfAsync(int jobCardId, int branchId)
        {
            throw new NotImplementedException();
        }

        public async Task<string> GenerateJobCardNumberAsync(int branchId)
        {
            var year = DateTime.Now.Year;
            var month = DateTime.Now.Month;

            var lastJobCard = await _context.JobCards
                .Where(j => j.BranchID == branchId)
                .OrderByDescending(j => j.JobCardID)
                .FirstOrDefaultAsync();

            int nextNumber = 1;
            if (lastJobCard != null && lastJobCard.JobCardNo != null)
            {
                var parts = lastJobCard.JobCardNo.Split('-');
                if (parts.Length >= 4 && int.TryParse(parts[3], out int lastNum))
                {
                    nextNumber = lastNum + 1;
                }
            }

            return $"JC-{branchId:D2}-{year}{month:D2}-{nextNumber:D4}";
        }

        private async Task AddServiceInternal(int jobCardId, JobServiceCreateDto dto, int branchId)
        {
            var service = await _context.ServiceCatalog
                .FirstOrDefaultAsync(s => s.ServiceID == dto.ServiceID && !s.IsDeleted);

            if (service == null)
                throw new InvalidOperationException($"Service not found: {dto.ServiceID}");

            decimal unitPrice = dto.UnitPrice > 0 ? dto.UnitPrice : (service.DefaultLaborRate ?? 0);
            decimal discountPercent = dto.DiscountPercent;
            decimal quantity = dto.Quantity;

            decimal totalAmount = unitPrice * quantity * (1 - (discountPercent / 100));

            var jobService = new JobService
            {
                JobCardID = jobCardId,
                ServiceID = dto.ServiceID,
                ServiceName = service.ServiceName,
                Description = dto.Notes,
                Quantity = (int)quantity,
                UnitPrice = unitPrice,
                DiscountPercent = discountPercent,
                TotalAmount = totalAmount,
                TechnicianID = dto.TechnicianID,
                Notes = dto.Notes,
                Status = "PENDING"
            };

            _context.JobServices.Add(jobService);
            await _context.SaveChangesAsync();

            Console.WriteLine($"✅ Service added: ID={dto.ServiceID}, Name={service.ServiceName}, Qty={quantity}");
        }

        private async Task AddPartInternal(int jobCardId, JobPartCreateDto dto, int branchId)
        {
            var item = await _context.ItemFile
                .FirstOrDefaultAsync(i => i.ItemID == dto.ItemID && !i.IsDeleted);

            if (item == null)
                throw new InvalidOperationException($"Item not found: {dto.ItemID}");

            decimal unitPrice = dto.UnitPrice > 0 ? dto.UnitPrice : (item.SaleRate ?? 0);
            decimal discountPercent = dto.DiscountPercent;
            decimal quantity = dto.Quantity;
            decimal discountAmount = unitPrice * quantity * (discountPercent / 100);
            decimal totalAmount = (unitPrice * quantity) - discountAmount;

            // Check stock if source is STOCK
            if (dto.StockSource == "STOCK")
            {
                var stock = await _context.ItemStock
                    .Where(s => s.ItemID == dto.ItemID && s.BranchID == branchId)
                    .SumAsync(s => (decimal)(s.InQty - s.OutQty));

                if (stock < quantity)
                    throw new InvalidOperationException($"Insufficient stock for {item.ItemName}. Available: {stock}, Required: {quantity}");
            }

            int? godownId = dto.GodownID ?? item.GodnID;

            var jobPart = new JobPart
            {
                JobCardID = jobCardId,
                ItemID = dto.ItemID,
                ItemName = item.ItemName ?? "",
                Quantity = quantity,
                UnitPrice = unitPrice,
                DiscountPercent = discountPercent,
                DiscountAmount = discountAmount,
                TotalAmount = totalAmount,
                StockSource = dto.StockSource,
                Notes = dto.Notes,
                GodownID = godownId
            };

            _context.JobParts.Add(jobPart);

            // Update stock if from STOCK
            if (dto.StockSource == "STOCK")
            {
                await UpdateStock(dto.ItemID, quantity, branchId);
            }

            await _context.SaveChangesAsync();

            Console.WriteLine($"✅ Part added: ID={dto.ItemID}, Name={item.ItemName}, Qty={quantity}");
        }

        private async Task UpdateStock(int itemId, decimal quantity, int branchId)
        {
            // ✅ Fix: Find existing stock record or create new
            var stock = await _context.ItemStock
                .FirstOrDefaultAsync(s => s.ItemID == itemId && s.BranchID == branchId && s.TranType == "JOB_CARD");

            if (stock != null)
            {
                stock.OutQty += (double)quantity;
                /*stock.ModifiedDate = DateTime.Now; */ // ✅ Now ModifiedDate exists
                _context.ItemStock.Update(stock);
            }
            else
            {
                // Create new stock record for this job card consumption
                var newStock = new ItemStock
                {
                    TranType = "JOB_CARD",
                    TranNumb = 0,
                    ItemID = itemId,
                    BranchID = branchId,
                    InQty = 0,
                    OutQty = (double)quantity,
                    Rate = 0,
                    TranDate = DateTime.Now,
                    Remarks = "Stock consumed from job card",
                    //ModifiedDate = DateTime.Now
                };
                _context.ItemStock.Add(newStock);
            }

            await _context.SaveChangesAsync();
        }

        private async Task CalculateTotals(int jobCardId)
        {
            var jobCard = await _context.JobCards.FindAsync(jobCardId);
            if (jobCard == null) return;

            var services = await _context.JobServices
                .Where(s => s.JobCardID == jobCardId)
                .ToListAsync();

            var parts = await _context.JobParts
                .Where(p => p.JobCardID == jobCardId)
                .ToListAsync();

            jobCard.TotalLabor = services.Sum(s => s.TotalAmount);
            jobCard.TotalParts = parts.Sum(p => p.TotalAmount);
            jobCard.GrandTotal = jobCard.TotalLabor + jobCard.TotalParts - jobCard.DiscountAmount + jobCard.TaxAmount;

            await _context.SaveChangesAsync();
        }

        private JobCardDto MapToDto(JobCard jobCard)
        {
            var dto = new JobCardDto
            {
                JobCardID = jobCard.JobCardID,
                JobCardNo = jobCard.JobCardNo,
                VehicleID = jobCard.VehicleID,
                VehicleRegNo = jobCard.Vehicle?.RegistrationNo ?? "",
                VehicleMakeModel = $"{jobCard.Vehicle?.Make} {jobCard.Vehicle?.Model}".Trim(),
                CustomerID = jobCard.CustomerID,
                CustomerName = jobCard.Customer?.AcctName ?? "",
                Status = jobCard.Status,
                ServiceAdvisorName = jobCard.ServiceAdvisorName ?? jobCard.ServiceAdvisor?.UserFullName,
                TechnicianName = jobCard.Technician?.User?.UserFullName ?? jobCard.Technician?.TechnicianName,
                ReceivedDate = jobCard.ReceivedDate,
                PromisedDate = jobCard.PromisedDate,
                CompletedDate = jobCard.CompletedDate,
                CustomerComplaint = jobCard.CustomerComplaint,
                TechnicianFindings = jobCard.TechnicianFindings,
                Recommendations = jobCard.Recommendations,
                TotalLabor = jobCard.TotalLabor,
                TotalParts = jobCard.TotalParts,
                DiscountAmount = jobCard.DiscountAmount,
                TaxAmount = jobCard.TaxAmount,
                GrandTotal = jobCard.GrandTotal,
                InvoiceNumber = jobCard.InvoiceNumber,
                InActive = jobCard.InActive,
            };

            // ✅ FIX: Explicitly check and assign Services
            if (jobCard.Services != null && jobCard.Services.Any())
            {
                dto.Services = jobCard.Services.Select(s => new JobServiceDto
                {
                    JobServiceID = s.JobServiceID,
                    ServiceID = s.ServiceID,
                    ServiceName = !string.IsNullOrEmpty(s.ServiceName) ? s.ServiceName : (s.Service?.ServiceName ?? ""),
                    Description = s.Description,
                    Quantity = s.Quantity,
                    UnitPrice = s.UnitPrice,
                    DiscountPercent = s.DiscountPercent,
                    TotalAmount = s.TotalAmount,
                    TechnicianID = s.TechnicianID,
                    TechnicianName = s.Technician?.User?.UserFullName ?? s.Technician?.TechnicianName,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    Status = s.Status
                }).ToList();
            }
            else
            {
                dto.Services = new List<JobServiceDto>();
            }

            // ✅ FIX: Explicitly check and assign Parts
            if (jobCard.Parts != null && jobCard.Parts.Any())
            {
                dto.Parts = jobCard.Parts.Select(p => new JobPartDto
                {
                    JobPartID = p.JobPartID,
                    ItemID = p.ItemID,
                    ItemName = !string.IsNullOrEmpty(p.ItemName) ? p.ItemName : (p.Item?.ItemName ?? ""),
                    Quantity = p.Quantity,
                    UnitPrice = p.UnitPrice,
                    DiscountPercent = p.DiscountPercent,
                    TotalAmount = p.TotalAmount,
                    StockSource = p.StockSource,
                    GodownID = p.GodownID
                }).ToList();
            }
            else
            {
                dto.Parts = new List<JobPartDto>();
            }

            return dto;
        }
    }
}