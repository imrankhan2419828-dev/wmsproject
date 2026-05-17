using WMS.Api.DTOs.Workshop;

namespace WMS.Api.Services.Interfaces.Workshop
{
    public interface IWarrantyService
    {
        // Warranty Claims
        Task<IEnumerable<WarrantyClaimDto>> GetAllClaimsAsync(int branchId, string? status = null, DateTime? fromDate = null, DateTime? toDate = null);
        Task<WarrantyClaimDto?> GetClaimByIdAsync(int id, int branchId);
        Task<WarrantyClaimDto> CreateClaimAsync(WarrantyClaimCreateDto dto, int userId, int branchId);
        Task<WarrantyClaimDto?> UpdateClaimAsync(int id, WarrantyClaimUpdateDto dto, int userId, int branchId);
        Task<WarrantyClaimDto?> UpdateClaimStatusAsync(int id, WarrantyClaimStatusUpdateDto dto, int userId, int branchId);
        Task<bool> DeleteClaimAsync(int id, int branchId);

        // Claims by Reference
        Task<IEnumerable<WarrantyClaimDto>> GetClaimsByJobAsync(int jobCardId, int branchId);
        Task<IEnumerable<WarrantyClaimDto>> GetClaimsByServiceAsync(int jobServiceId, int branchId);
        Task<IEnumerable<WarrantyClaimDto>> GetClaimsByPartAsync(int jobPartId, int branchId);
        Task<IEnumerable<WarrantyClaimDto>> GetClaimsBySupplierAsync(int supplierId, int branchId);

        // Attachments
        Task<IEnumerable<WarrantyAttachmentDto>> GetAttachmentsAsync(int claimId, int branchId);
        Task<WarrantyAttachmentDto> AddAttachmentAsync(WarrantyAttachmentCreateDto dto, int userId, int branchId);
        Task<bool> DeleteAttachmentAsync(int attachmentId, int branchId);

        // History
        Task<IEnumerable<WarrantyHistoryDto>> GetClaimHistoryAsync(int claimId, int branchId);

        // Supplier Warranties
        Task<IEnumerable<SupplierWarrantyDto>> GetAllSupplierWarrantiesAsync(int branchId);
        Task<SupplierWarrantyDto?> GetSupplierWarrantyByIdAsync(int id, int branchId);
        Task<SupplierWarrantyDto> CreateSupplierWarrantyAsync(SupplierWarrantyCreateDto dto, int userId, int branchId);
        Task<SupplierWarrantyDto?> UpdateSupplierWarrantyAsync(int id, SupplierWarrantyUpdateDto dto, int userId, int branchId);
        Task<bool> DeleteSupplierWarrantyAsync(int id, int branchId);
        Task<IEnumerable<SupplierWarrantyDto>> GetWarrantiesBySupplierAsync(int supplierId, int branchId);
        Task<IEnumerable<SupplierWarrantyDto>> GetWarrantiesByItemAsync(int itemId, int branchId);

        // Reports & Summary
        Task<WarrantySummaryDto> GetWarrantySummaryAsync(int branchId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<byte[]> GenerateWarrantyReportAsync(int branchId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<byte[]> GenerateClaimReportAsync(int claimId, int branchId);
    }
}
