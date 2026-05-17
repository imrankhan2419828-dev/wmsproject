using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Workshop;
using WMS.Api.Models;
using WMS.Api.Services.Interfaces;
using AutoMapper;

namespace WMS.Api.Services.Implementations
{
    public class VehicleService : IVehicleService
    {
        private readonly WmsDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<VehicleService> _logger;

        public VehicleService(WmsDbContext context, IMapper mapper, ILogger<VehicleService> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<VehicleDto>> GetAllAsync(int branchId)
        {
            try
            {
                var vehicles = await _context.Vehicles
                    .Include(v => v.Customer)
                    .Where(v => !v.IsDeleted && !v.InActive)
                    .OrderBy(v => v.RegistrationNo)
                    .ToListAsync();

                return vehicles.Select(v => new VehicleDto
                {
                    VehicleID = v.VehicleID,
                    CustomerID = v.CustomerID,
                    CustomerName = !string.IsNullOrWhiteSpace(v.CustomerName) ? v.CustomerName : (v.Customer?.AcctName ?? ""),
                    RegistrationNo = v.RegistrationNo,
                    ChassisNo = v.ChassisNo,
                    EngineNo = v.EngineNo,
                    Make = v.Make,
                    Model = v.Model,
                    Year = v.Year,
                    Color = v.Color,
                    FuelType = v.FuelType,
                    OdometerReading = v.OdometerReading,
                    LastServiceDate = v.LastServiceDate,
                    NextServiceDue = v.NextServiceDue,
                    Remarks = v.Remarks,
                    InActive = v.InActive
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting vehicles");
                throw;
            }
        }

        public async Task<VehicleDto?> GetByIdAsync(int id, int branchId)
        {
            try
            {
                var vehicle = await _context.Vehicles
                    .Include(v => v.Customer)
                    .FirstOrDefaultAsync(v => v.VehicleID == id && !v.IsDeleted);

                if (vehicle == null)
                    return null;

                return new VehicleDto
                {
                    VehicleID = vehicle.VehicleID,
                    CustomerID = vehicle.CustomerID,
                    CustomerName = !string.IsNullOrWhiteSpace(vehicle.CustomerName) ? vehicle.CustomerName : (vehicle.Customer?.AcctName ?? ""),
                    RegistrationNo = vehicle.RegistrationNo,
                    ChassisNo = vehicle.ChassisNo,
                    EngineNo = vehicle.EngineNo,
                    Make = vehicle.Make,
                    Model = vehicle.Model,
                    Year = vehicle.Year,
                    Color = vehicle.Color,
                    FuelType = vehicle.FuelType,
                    OdometerReading = vehicle.OdometerReading,
                    LastServiceDate = vehicle.LastServiceDate,
                    NextServiceDue = vehicle.NextServiceDue,
                    Remarks = vehicle.Remarks,
                    InActive = vehicle.InActive
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting vehicle {Id}", id);
                throw;
            }
        }

        public async Task<VehicleDto> CreateAsync(VehicleCreateDto dto, int userId, int branchId)
        {
            try
            {
                // Check if registration number already exists
                var exists = await _context.Vehicles
                    .AnyAsync(v => v.RegistrationNo == dto.RegistrationNo && !v.IsDeleted);

                if (exists)
                    throw new InvalidOperationException("Vehicle with this registration number already exists");

                var vehicle = new Vehicle
                {
                    CustomerID = dto.CustomerID,  // Can be null
                    CustomerName = dto.CustomerName,  // Text field
                    RegistrationNo = dto.RegistrationNo,
                    ChassisNo = dto.ChassisNo,
                    EngineNo = dto.EngineNo,
                    Make = dto.Make,
                    Model = dto.Model,
                    Year = dto.Year,
                    Color = dto.Color,
                    FuelType = dto.FuelType,
                    OdometerReading = dto.OdometerReading,
                    LastServiceDate = dto.LastServiceDate,
                    NextServiceDue = dto.NextServiceDue,
                    Remarks = dto.Remarks,
                    InActive = dto.InActive,
                    CreatedBy = userId,
                    CreatedDate = DateTime.Now
                };

                _context.Vehicles.Add(vehicle);
                await _context.SaveChangesAsync();

                return await GetByIdAsync(vehicle.VehicleID, branchId)
                    ?? throw new Exception("Failed to retrieve created vehicle");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating vehicle");
                throw;
            }
        }

        public async Task<VehicleDto?> UpdateAsync(int id, VehicleUpdateDto dto, int userId, int branchId)
        {
            try
            {
                var vehicle = await _context.Vehicles
                    .FirstOrDefaultAsync(v => v.VehicleID == id && !v.IsDeleted);

                if (vehicle == null)
                    return null;

                // Check if registration number already exists (excluding current vehicle)
                var exists = await _context.Vehicles
                    .AnyAsync(v => v.RegistrationNo == dto.RegistrationNo
                        && v.VehicleID != id && !v.IsDeleted);

                if (exists)
                    throw new InvalidOperationException("Vehicle with this registration number already exists");

                // Update fields
                vehicle.CustomerID = dto.CustomerID;
                vehicle.CustomerName = dto.CustomerName;
                vehicle.RegistrationNo = dto.RegistrationNo;
                vehicle.ChassisNo = dto.ChassisNo;
                vehicle.EngineNo = dto.EngineNo;
                vehicle.Make = dto.Make;
                vehicle.Model = dto.Model;
                vehicle.Year = dto.Year;
                vehicle.Color = dto.Color;
                vehicle.FuelType = dto.FuelType;
                vehicle.OdometerReading = dto.OdometerReading;
                vehicle.LastServiceDate = dto.LastServiceDate;
                vehicle.NextServiceDue = dto.NextServiceDue;
                vehicle.Remarks = dto.Remarks;
                vehicle.InActive = dto.InActive;
                vehicle.ModifiedBy = userId;
                vehicle.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return await GetByIdAsync(id, branchId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating vehicle {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(int id, int branchId)
        {
            try
            {
                var vehicle = await _context.Vehicles
                    .FirstOrDefaultAsync(v => v.VehicleID == id && !v.IsDeleted);

                if (vehicle == null)
                    return false;

                // Check if vehicle has any job cards
                var hasJobCards = await _context.JobCards
                    .AnyAsync(j => j.VehicleID == id && !j.IsDeleted);

                if (hasJobCards)
                    throw new InvalidOperationException("Cannot delete vehicle with existing job cards");

                vehicle.IsDeleted = true;
                vehicle.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting vehicle {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<VehicleDto>> GetByCustomerAsync(int customerId, int branchId)
        {
            try
            {
                var vehicles = await _context.Vehicles
                    .Include(v => v.Customer)
                    .Where(v => v.CustomerID == customerId && !v.IsDeleted && !v.InActive)
                    .OrderBy(v => v.RegistrationNo)
                    .ToListAsync();

                return vehicles.Select(v => new VehicleDto
                {
                    VehicleID = v.VehicleID,
                    CustomerID = v.CustomerID,
                    CustomerName = !string.IsNullOrWhiteSpace(v.CustomerName) ? v.CustomerName : (v.Customer?.AcctName ?? ""),
                    RegistrationNo = v.RegistrationNo,
                    Make = v.Make,
                    Model = v.Model,
                    Year = v.Year,
                    Color = v.Color
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting vehicles for customer {CustomerId}", customerId);
                throw;
            }
        }

        public async Task<IEnumerable<VehicleDto>> SearchAsync(string searchTerm, int branchId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                    return await GetAllAsync(branchId);

                searchTerm = searchTerm.ToLower();

                var vehicles = await _context.Vehicles
                    .Include(v => v.Customer)
                    .Where(v => !v.IsDeleted && !v.InActive &&
                        (v.RegistrationNo.ToLower().Contains(searchTerm) ||
                         v.ChassisNo.ToLower().Contains(searchTerm) ||
                         v.EngineNo.ToLower().Contains(searchTerm) ||
                         v.Make.ToLower().Contains(searchTerm) ||
                         v.Model.ToLower().Contains(searchTerm) ||
                         (v.CustomerName ?? "").ToLower().Contains(searchTerm)))
                    .OrderBy(v => v.RegistrationNo)
                    .ToListAsync();

                return vehicles.Select(v => new VehicleDto
                {
                    VehicleID = v.VehicleID,
                    RegistrationNo = v.RegistrationNo,
                    Make = v.Make,
                    Model = v.Model,
                    CustomerName = !string.IsNullOrWhiteSpace(v.CustomerName) ? v.CustomerName : (v.Customer?.AcctName ?? "")
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching vehicles");
                throw;
            }
        }
    }
}