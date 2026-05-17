using WMS.Api.Models;

namespace WMS.Api.Services.Interfaces
{
    /// <summary>
    /// Audit service for tracking all COA changes
    /// </summary>
    public interface IAuditService
    {
        /// <summary>
        /// Log account creation
        /// </summary>
        Task LogCreateAsync(COA account, string user, string ipAddress = null, string userAgent = null);

        /// <summary>
        /// Log account update
        /// </summary>
        Task LogUpdateAsync(COA oldAccount, COA newAccount, string user, string ipAddress = null, string userAgent = null);

        /// <summary>
        /// Log account deletion
        /// </summary>
        Task LogDeleteAsync(COA account, string user, string ipAddress = null, string userAgent = null);

        /// <summary>
        /// Log account lock/unlock
        /// </summary>
        Task LogLockAsync(int accountId, bool isLocked, string user, string ipAddress = null, string userAgent = null);

        /// <summary>
        /// Log code range extension
        /// </summary>
        Task LogRangeExtensionAsync(string parentCode, int oldMax, int newMax, string user, string ipAddress = null, string userAgent = null);

        /// <summary>
        /// Get audit trail for an account
        /// </summary>
        Task<List<AuditLogDto>> GetAuditTrailAsync(int accountId, DateTime? fromDate = null, DateTime? toDate = null);

        /// <summary>
        /// Get all audit logs with filters
        /// </summary>
        Task<List<AuditLogDto>> GetAllAuditLogsAsync(int? branchId = null, string action = null, DateTime? fromDate = null, DateTime? toDate = null);
    }

    public class AuditLogDto
    {
        public long AuditID { get; set; }
        public int acctID { get; set; }
        public string AcctCode { get; set; } = null!;
        public string AcctName { get; set; } = null!;
        public string Action { get; set; } = null!;
        public string? FieldName { get; set; }
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public string ChangedBy { get; set; } = null!;
        public DateTime ChangedOn { get; set; }
        public string? IPAddress { get; set; }
        public string? UserAgent { get; set; }
    }
}
