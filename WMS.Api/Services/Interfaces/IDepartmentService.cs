using WMS.Api.DTOs.Workshop;

namespace WMS.Api.Services.Interfaces.Workshop
{
    public interface IDepartmentService
    {
        // Department CRUD
        Task<IEnumerable<DepartmentDto>> GetAllDepartmentsAsync(int branchId, bool? isActive = null);
        Task<DepartmentDto?> GetDepartmentByIdAsync(int id, int branchId);
        Task<DepartmentDto> CreateDepartmentAsync(DepartmentCreateDto dto, int userId, int branchId);
        Task<DepartmentDto?> UpdateDepartmentAsync(int id, DepartmentUpdateDto dto, int userId, int branchId);
        Task<bool> DeleteDepartmentAsync(int id, int branchId);
        Task<bool> ToggleDepartmentStatusAsync(int id, bool isActive, int userId, int branchId);

        // Job Department Assignment
        Task<IEnumerable<JobDepartmentDto>> GetJobDepartmentsAsync(int jobCardId, int branchId);
        Task<JobDepartmentDto> AssignJobToDepartmentAsync(JobDepartmentAssignDto dto, int userId, int branchId);
        Task<bool> CompleteJobDepartmentAsync(int jobCardId, int departmentId, int userId, int branchId);
        Task<IEnumerable<JobDepartmentDto>> GetJobsByDepartmentAsync(int departmentId, int branchId, string? status = null);

        // Technician Department Assignment
        Task<IEnumerable<TechnicianDepartmentDto>> GetTechnicianDepartmentsAsync(int technicianId, int branchId);
        Task<IEnumerable<TechnicianDepartmentDto>> GetDepartmentTechniciansAsync(int departmentId, int branchId);
        Task<TechnicianDepartmentDto> AssignTechnicianToDepartmentAsync(TechnicianDepartmentAssignDto dto, int userId, int branchId);
        Task<bool> RemoveTechnicianFromDepartmentAsync(int technicianId, int departmentId, int userId, int branchId);
        Task<bool> SetPrimaryDepartmentAsync(int technicianId, int departmentId, int userId, int branchId);

        // Department Services
        Task<IEnumerable<DepartmentServiceDto>> GetDepartmentServicesAsync(int departmentId, int branchId);
        Task<DepartmentServiceDto> AssignServiceToDepartmentAsync(DepartmentServiceAssignDto dto, int userId, int branchId);
        Task<bool> RemoveServiceFromDepartmentAsync(int departmentId, int serviceId, int branchId);
        Task<bool> UpdateServiceAvailabilityAsync(int departmentId, int serviceId, bool isAvailable, int userId, int branchId);

        // Department Parts
        Task<IEnumerable<DepartmentPartDto>> GetDepartmentPartsAsync(int departmentId, int branchId);
        Task<DepartmentPartDto> AssignPartToDepartmentAsync(DepartmentPartAssignDto dto, int userId, int branchId);
        Task<bool> RemovePartFromDepartmentAsync(int departmentId, int itemId, int branchId);
        Task<bool> UpdatePartMinStockAsync(int departmentId, int itemId, decimal minStock, int userId, int branchId);

        // Department Transfers
        Task<IEnumerable<DepartmentTransferDto>> GetDepartmentTransfersAsync(int branchId, string? status = null);
        Task<DepartmentTransferDto> TransferJobDepartmentAsync(DepartmentTransferCreateDto dto, int userId, int branchId);
        Task<DepartmentTransferDto?> ReceiveDepartmentTransferAsync(int transferId, DepartmentTransferReceiveDto dto, int userId, int branchId);
        Task<bool> CancelDepartmentTransferAsync(int transferId, int userId, int branchId);

        // Dashboard & Reports
        Task<DepartmentDashboardDto> GetDepartmentDashboardAsync(int branchId);
        Task<IEnumerable<DepartmentSummaryDto>> GetDepartmentSummaryAsync(int branchId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<byte[]> GenerateDepartmentReportAsync(int departmentId, int branchId, DateTime? fromDate = null, DateTime? toDate = null);
    }
}