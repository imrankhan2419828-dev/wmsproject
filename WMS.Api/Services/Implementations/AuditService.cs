using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using WMS.Api.Data;
using WMS.Api.Models;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    /// <summary>
    /// Audit service implementation
    /// </summary>
    public class AuditService : IAuditService
    {
        private readonly WmsDbContext _context;

        public AuditService(WmsDbContext context)
        {
            _context = context;
        }

        public async Task LogCreateAsync(COA account, string user, string ipAddress = null, string userAgent = null)
        {
            var audit = new COAAudit
            {
                acctID = account.acctID,
                BranchID = account.BranchID,
                Action = "CREATE",
                FieldName = null,
                OldValue = null,
                NewValue = JsonConvert.SerializeObject(account, new JsonSerializerSettings
                {
                    ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                }),
                ChangedBy = user,
                ChangedOn = DateTime.Now,
                IPAddress = ipAddress,
                UserAgent = userAgent
            };

            _context.Set<COAAudit>().Add(audit);
            await _context.SaveChangesAsync();
        }

        public async Task LogUpdateAsync(COA oldAccount, COA newAccount, string user, string ipAddress = null, string userAgent = null)
        {
            var changes = GetPropertyChanges(oldAccount, newAccount);

            foreach (var change in changes)
            {
                var audit = new COAAudit
                {
                    acctID = newAccount.acctID,
                    BranchID = newAccount.BranchID,
                    Action = "UPDATE",
                    FieldName = change.Key,
                    OldValue = change.Value.OldValue,
                    NewValue = change.Value.NewValue,
                    ChangedBy = user,
                    ChangedOn = DateTime.Now,
                    IPAddress = ipAddress,
                    UserAgent = userAgent
                };

                _context.Set<COAAudit>().Add(audit);
            }

            await _context.SaveChangesAsync();
        }

        public async Task LogDeleteAsync(COA account, string user, string ipAddress = null, string userAgent = null)
        {
            var audit = new COAAudit
            {
                acctID = account.acctID,
                BranchID = account.BranchID,
                Action = "DELETE",
                FieldName = null,
                OldValue = JsonConvert.SerializeObject(account, new JsonSerializerSettings
                {
                    ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                }),
                NewValue = null,
                ChangedBy = user,
                ChangedOn = DateTime.Now,
                IPAddress = ipAddress,
                UserAgent = userAgent
            };

            _context.Set<COAAudit>().Add(audit);
            await _context.SaveChangesAsync();
        }

        public async Task LogLockAsync(int accountId, bool isLocked, string user, string ipAddress = null, string userAgent = null)
        {
            var audit = new COAAudit
            {
                acctID = accountId,
                Action = isLocked ? "LOCK" : "UNLOCK",
                ChangedBy = user,
                ChangedOn = DateTime.Now,
                IPAddress = ipAddress,
                UserAgent = userAgent
            };

            _context.Set<COAAudit>().Add(audit);
            await _context.SaveChangesAsync();
        }

        public async Task LogRangeExtensionAsync(string parentCode, int oldMax, int newMax, string user, string ipAddress = null, string userAgent = null)
        {
            var audit = new COAAudit
            {
                Action = "RANGE_EXTENSION",
                FieldName = parentCode ?? "ROOT",
                OldValue = oldMax.ToString(),
                NewValue = newMax.ToString(),
                ChangedBy = user,
                ChangedOn = DateTime.Now,
                IPAddress = ipAddress,
                UserAgent = userAgent
            };

            _context.Set<COAAudit>().Add(audit);
            await _context.SaveChangesAsync();
        }

        public async Task<List<AuditLogDto>> GetAuditTrailAsync(int accountId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.Set<COAAudit>()
                .Where(x => x.acctID == accountId);

            if (fromDate.HasValue)
                query = query.Where(x => x.ChangedOn >= fromDate.Value);
            if (toDate.HasValue)
                query = query.Where(x => x.ChangedOn <= toDate.Value);

            var audits = await query
                .OrderByDescending(x => x.ChangedOn)
                .ToListAsync();

            return audits.Select(x => new AuditLogDto
            {
                AuditID = x.AuditID,
                acctID = x.acctID ?? 0,
                Action = x.Action,
                FieldName = x.FieldName,
                OldValue = x.OldValue,
                NewValue = x.NewValue,
                ChangedBy = x.ChangedBy,
                ChangedOn = x.ChangedOn,
                IPAddress = x.IPAddress,
                UserAgent = x.UserAgent
            }).ToList();
        }

        public async Task<List<AuditLogDto>> GetAllAuditLogsAsync(int? branchId = null, string action = null, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.Set<COAAudit>().AsQueryable();

            if (branchId.HasValue)
                query = query.Where(x => x.BranchID == branchId);
            if (!string.IsNullOrEmpty(action))
                query = query.Where(x => x.Action == action);
            if (fromDate.HasValue)
                query = query.Where(x => x.ChangedOn >= fromDate.Value);
            if (toDate.HasValue)
                query = query.Where(x => x.ChangedOn <= toDate.Value);

            var audits = await query
                .OrderByDescending(x => x.ChangedOn)
                .Take(1000)
                .ToListAsync();

            return audits.Select(x => new AuditLogDto
            {
                AuditID = x.AuditID,
                acctID = x.acctID ?? 0,
                Action = x.Action,
                FieldName = x.FieldName,
                OldValue = x.OldValue,
                NewValue = x.NewValue,
                ChangedBy = x.ChangedBy,
                ChangedOn = x.ChangedOn,
                IPAddress = x.IPAddress,
                UserAgent = x.UserAgent
            }).ToList();
        }

        private Dictionary<string, (string OldValue, string NewValue)> GetPropertyChanges(COA oldObj, COA newObj)
        {
            var changes = new Dictionary<string, (string, string)>();
            var properties = typeof(COA).GetProperties();

            foreach (var prop in properties)
            {
                var oldValue = prop.GetValue(oldObj)?.ToString() ?? "";
                var newValue = prop.GetValue(newObj)?.ToString() ?? "";

                if (oldValue != newValue && prop.Name != "AddOn" && prop.Name != "EditOn")
                {
                    changes[prop.Name] = (oldValue, newValue);
                }
            }

            return changes;
        }
    }
}
