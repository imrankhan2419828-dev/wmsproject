using WMS.Api.DTOs.Workshop;

namespace WMS.Api.Services.Interfaces.Workshop
{
    public interface IInspectionService
    {
        // Template Management
        Task<IEnumerable<InspectionTemplateDto>> GetAllTemplatesAsync(int branchId);
        Task<InspectionTemplateDto?> GetTemplateByIdAsync(int id, int branchId);
        Task<InspectionTemplateDto> CreateTemplateAsync(InspectionTemplateCreateDto dto, int userId, int branchId);
        Task<InspectionTemplateDto?> UpdateTemplateAsync(int id, InspectionTemplateUpdateDto dto, int userId, int branchId);
        Task<bool> DeleteTemplateAsync(int id, int branchId);

        // Inspection Item Management
        Task<IEnumerable<InspectionItemDto>> GetItemsByTemplateAsync(int templateId, int branchId);
        Task<InspectionItemDto?> GetItemByIdAsync(int id, int branchId);
        Task<InspectionItemDto> CreateItemAsync(InspectionItemCreateDto dto, int userId, int branchId);
        Task<InspectionItemDto?> UpdateItemAsync(int id, InspectionItemUpdateDto dto, int userId, int branchId);
        Task<bool> DeleteItemAsync(int id, int branchId);

        // Job Inspections
        Task<IEnumerable<JobInspectionDto>> GetInspectionsByJobAsync(int jobCardId, int branchId);
        Task<JobInspectionDto?> GetInspectionByIdAsync(int id, int branchId);
        Task<JobInspectionDto> CreateInspectionAsync(JobInspectionCreateDto dto, int userId, int branchId);
        Task<JobInspectionDto?> UpdateInspectionStatusAsync(int id, JobInspectionUpdateDto dto, int userId, int branchId);
        Task<JobInspectionDto?> SubmitInspectionResultsAsync(int id, InspectionCompleteDto dto, int userId, int branchId);
        Task<JobInspectionDto?> StartInspectionAsync(int id, int userId, int branchId);
        Task<bool> DeleteInspectionAsync(int id, int branchId);

        // Results
        Task<InspectionResultDto?> SubmitResultAsync(InspectionResultSubmitDto dto, int userId, int branchId);
        Task<IEnumerable<InspectionResultDto>> GetResultsByInspectionAsync(int inspectionId, int branchId);

        // Reports
        Task<byte[]> GenerateInspectionReportAsync(int inspectionId, int branchId);
    }
}