using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Models;
using WMS.Api.Services.Interfaces;
using System.Text.Json;

namespace WMS.Api.Services.Implementations
{
    public class ServiceCatalogService : IServiceCatalogService
    {
        private readonly WmsDbContext _context;
        private readonly ILogger<ServiceCatalogService> _logger;

        public ServiceCatalogService(WmsDbContext context, ILogger<ServiceCatalogService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<ServiceCatalogDto>> GetAllAsync()
        {
            try
            {
                var services = await _context.ServiceCatalog
                    .Where(s => !s.IsDeleted)
                    .OrderBy(s => s.Category)
                    .ThenBy(s => s.ServiceName)
                    .ToListAsync();

                return services.Select(MapToDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting service catalog");
                throw;
            }
        }

        public async Task<ServiceCatalogDto?> GetByIdAsync(int id)
        {
            try
            {
                var service = await _context.ServiceCatalog
                    .FirstOrDefaultAsync(s => s.ServiceID == id && !s.IsDeleted);

                return service == null ? null : MapToDto(service);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting service {Id}", id);
                throw;
            }
        }

        public async Task<ServiceCatalogDto> CreateAsync(ServiceCatalogCreateDto dto, int userId)
        {
            try
            {
                // Check if service code already exists
                var exists = await _context.ServiceCatalog
                    .AnyAsync(s => s.ServiceCode == dto.ServiceCode && !s.IsDeleted);

                if (exists)
                    throw new InvalidOperationException("Service with this code already exists");

                var service = new ServiceCatalog
                {
                    ServiceCode = dto.ServiceCode,
                    ServiceName = dto.ServiceName,
                    Category = dto.Category,
                    Description = dto.Description,
                    DefaultLaborRate = dto.DefaultLaborRate,
                    EstimatedTime = dto.EstimatedTime,
                    WarrantyPeriod = dto.WarrantyPeriod,
                    RequiresParts = dto.RequiresParts,
                    PartsList = dto.SuggestedParts != null
                        ? JsonSerializer.Serialize(dto.SuggestedParts)
                        : null,
                    InActive = dto.InActive,
                    CreatedBy = userId,
                    CreatedDate = DateTime.Now
                };

                _context.ServiceCatalog.Add(service);
                await _context.SaveChangesAsync();

                return MapToDto(service);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating service");
                throw;
            }
        }

        public async Task<ServiceCatalogDto?> UpdateAsync(int id, ServiceCatalogUpdateDto dto, int userId)
        {
            try
            {
                var service = await _context.ServiceCatalog
                    .FirstOrDefaultAsync(s => s.ServiceID == id && !s.IsDeleted);

                if (service == null)
                    return null;

                // Check if service code already exists (excluding current)
                var exists = await _context.ServiceCatalog
                    .AnyAsync(s => s.ServiceCode == dto.ServiceCode
                        && s.ServiceID != id && !s.IsDeleted);

                if (exists)
                    throw new InvalidOperationException("Service with this code already exists");

                // Update fields
                service.ServiceCode = dto.ServiceCode;
                service.ServiceName = dto.ServiceName;
                service.Category = dto.Category;
                service.Description = dto.Description;
                service.DefaultLaborRate = dto.DefaultLaborRate;
                service.EstimatedTime = dto.EstimatedTime;
                service.WarrantyPeriod = dto.WarrantyPeriod;
                service.RequiresParts = dto.RequiresParts;
                service.PartsList = dto.SuggestedParts != null
                    ? JsonSerializer.Serialize(dto.SuggestedParts)
                    : null;
                service.InActive = dto.InActive;
                service.ModifiedBy = userId;
                service.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return MapToDto(service);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating service {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            try
            {
                var service = await _context.ServiceCatalog
                    .FirstOrDefaultAsync(s => s.ServiceID == id && !s.IsDeleted);

                if (service == null)
                    return false;

                // Check if service is used in any job cards
                var isUsed = await _context.JobServices
                    .AnyAsync(js => js.ServiceID == id);

                if (isUsed)
                    throw new InvalidOperationException("Cannot delete service that has been used in job cards");

                service.IsDeleted = true;
                service.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting service {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<ServiceCatalogDto>> GetByCategoryAsync(string category)
        {
            try
            {
                var services = await _context.ServiceCatalog
                    .Where(s => s.Category == category && !s.IsDeleted && !s.InActive)
                    .OrderBy(s => s.ServiceName)
                    .ToListAsync();

                return services.Select(MapToDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting services by category {Category}", category);
                throw;
            }
        }

        public async Task<IEnumerable<ServiceCatalogDto>> SearchAsync(string searchTerm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                    return await GetAllAsync();

                searchTerm = searchTerm.ToLower();

                var services = await _context.ServiceCatalog
                    .Where(s => !s.IsDeleted && (
                        s.ServiceCode.ToLower().Contains(searchTerm) ||
                        s.ServiceName.ToLower().Contains(searchTerm) ||
                        (s.Category != null && s.Category.ToLower().Contains(searchTerm)) ||
                        (s.Description != null && s.Description.ToLower().Contains(searchTerm))))
                    .OrderBy(s => s.Category)
                    .ThenBy(s => s.ServiceName)
                    .ToListAsync();

                return services.Select(MapToDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching services");
                throw;
            }
        }

        public async Task<IEnumerable<string>> GetCategoriesAsync()
        {
            try
            {
                return await _context.ServiceCatalog
                    .Where(s => !s.IsDeleted && s.Category != null)
                    .Select(s => s.Category!)
                    .Distinct()
                    .OrderBy(c => c)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting service categories");
                throw;
            }
        }

        private ServiceCatalogDto MapToDto(ServiceCatalog service)
        {
            List<int>? suggestedParts = null;
            if (!string.IsNullOrEmpty(service.PartsList))
            {
                try
                {
                    suggestedParts = JsonSerializer.Deserialize<List<int>>(service.PartsList);
                }
                catch { }
            }

            return new ServiceCatalogDto
            {
                ServiceID = service.ServiceID,
                ServiceCode = service.ServiceCode,
                ServiceName = service.ServiceName,
                Category = service.Category,
                Description = service.Description,
                DefaultLaborRate = service.DefaultLaborRate,
                EstimatedTime = service.EstimatedTime,
                WarrantyPeriod = service.WarrantyPeriod,
                RequiresParts = service.RequiresParts,
                SuggestedParts = suggestedParts,
                InActive = service.InActive
            };
        }
    }
}