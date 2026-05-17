using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.COA;
using WMS.Api.Models;
using WMS.Api.Repositories.Interfaces;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    /// <summary>
    /// Account group service implementation - NO HARDCODED PATHS
    /// </summary>
    public class AccountGroupService : IAccountGroupService
    {
        private readonly WmsDbContext _context;
        private readonly ICoaRepository _coaRepository;

        public AccountGroupService(WmsDbContext context, ICoaRepository coaRepository)
        {
            _context = context;
            _coaRepository = coaRepository;
        }

        // ====================================================================
        // ACCOUNT RETRIEVAL BY GROUP
        // ====================================================================

        /// <summary>
        /// Get all supplier accounts (Accounts Payable)
        /// </summary>
        public async Task<List<AccountGroupDto>> GetSupplierAccountsAsync(int branchId)
        {
            // Get Accounts Payable group configuration
            var apGroup = await _context.Set<dynamic>()
                .FromSqlRaw("SELECT * FROM tblReportGroups WHERE GroupCode = 'AP' AND GroupType = 'SUPPLIER'")
                .FirstOrDefaultAsync();

            if (apGroup == null)
            {
                // Fallback to standard range
                return await GetAccountsByRangeAsync("2100", "2199", branchId);
            }

            // Get group range
            string minCode = apGroup.MinAccountCode ?? "2100";
            string maxCode = apGroup.MaxAccountCode ?? "2199";

            return await GetAccountsByRangeAsync(minCode, maxCode, branchId);
        }

        /// <summary>
        /// Get all customer accounts (Accounts Receivable)
        /// </summary>
        public async Task<List<AccountGroupDto>> GetCustomerAccountsAsync(int branchId)
        {
            // Get Accounts Receivable group configuration
            var arGroup = await _context.Set<dynamic>()
                .FromSqlRaw("SELECT * FROM tblReportGroups WHERE GroupCode = 'AR' AND GroupType = 'CUSTOMER'")
                .FirstOrDefaultAsync();

            if (arGroup == null)
            {
                // Fallback to standard range
                return await GetAccountsByRangeAsync("1100", "1199", branchId);
            }

            // Get group range
            string minCode = arGroup.MinAccountCode ?? "1100";
            string maxCode = arGroup.MaxAccountCode ?? "1199";

            return await GetAccountsByRangeAsync(minCode, maxCode, branchId);
        }

        /// <summary>
        /// Get all bank accounts
        /// </summary>
        public async Task<List<AccountGroupDto>> GetBankAccountsAsync(int branchId)
        {
            var bankGroup = await _context.Set<dynamic>()
                .FromSqlRaw("SELECT * FROM tblReportGroups WHERE GroupCode = 'BANK' AND GroupType = 'BANK'")
                .FirstOrDefaultAsync();

            if (bankGroup == null)
            {
                return await GetAccountsByRangeAsync("1110", "1129", branchId);
            }

            string minCode = bankGroup.MinAccountCode ?? "1110";
            string maxCode = bankGroup.MaxAccountCode ?? "1129";

            return await GetAccountsByRangeAsync(minCode, maxCode, branchId);
        }

        /// <summary>
        /// Get all cash accounts
        /// </summary>
        public async Task<List<AccountGroupDto>> GetCashAccountsAsync(int branchId)
        {
            var cashGroup = await _context.Set<dynamic>()
                .FromSqlRaw("SELECT * FROM tblReportGroups WHERE GroupCode = 'CASH' AND GroupType = 'CASH'")
                .FirstOrDefaultAsync();

            if (cashGroup == null)
            {
                return await GetAccountsByRangeAsync("1100", "1109", branchId);
            }

            string minCode = cashGroup.MinAccountCode ?? "1100";
            string maxCode = cashGroup.MaxAccountCode ?? "1109";

            return await GetAccountsByRangeAsync(minCode, maxCode, branchId);
        }

        /// <summary>
        /// Get accounts by custom group code
        /// </summary>
        public async Task<List<AccountGroupDto>> GetAccountsByGroupCodeAsync(string groupCode, int branchId)
        {
            var group = await GetGroupByCodeAsync(groupCode);

            if (group == null)
                throw new Exception($"Group code '{groupCode}' not found");

            if (!string.IsNullOrEmpty(group.MinAccountCode) && !string.IsNullOrEmpty(group.MaxAccountCode))
            {
                return await GetAccountsByRangeAsync(group.MinAccountCode, group.MaxAccountCode, branchId);
            }

            // If no range defined, return empty
            return new List<AccountGroupDto>();
        }

        /// <summary>
        /// Get accounts by account type
        /// </summary>
        public async Task<List<AccountGroupDto>> GetAccountsByTypeAsync(string accountType, int branchId)
        {
            var allAccounts = await _coaRepository.GetByBranchAsync(branchId);

            return allAccounts
                .Where(x => x.AcctType == accountType && x.AcctLast == true)
                .Select(x => new AccountGroupDto
                {
                    acctID = x.acctID,
                    AcctCode = x.AcctCode!,
                    AcctName = x.AcctName!,
                    AcctType = x.AcctType,
                    IsActive = x.Active ?? true
                })
                .ToList();
        }

        // ====================================================================
        // GROUP CONFIGURATION MANAGEMENT
        // ====================================================================

        /// <summary>
        /// Get all configured account groups
        /// </summary>
        public async Task<List<AccountGroupConfigDto>> GetAllGroupsAsync(int? branchId = null)
        {
            var query = _context.Set<dynamic>()
                .FromSqlRaw("SELECT * FROM tblReportGroups WHERE IsActive = 1 ORDER BY DisplayOrder");

            var groups = new List<AccountGroupConfigDto>();

            // This is simplified - you'd map properly in real code
            var results = await query.ToListAsync();

            foreach (var result in results)
            {
                groups.Add(new AccountGroupConfigDto
                {
                    GroupCode = result.GroupCode,
                    GroupName = result.GroupName,
                    ReportType = result.ReportType,
                    GroupType = result.GroupType,
                    DisplayOrder = result.DisplayOrder,
                    MinAccountCode = result.MinAccountCode,
                    MaxAccountCode = result.MaxAccountCode,
                    IsActive = result.IsActive,
                    IsSystem = result.IsSystem
                });
            }

            return groups;
        }

        /// <summary>
        /// Get group configuration by code
        /// </summary>
        public async Task<AccountGroupConfigDto?> GetGroupByCodeAsync(string groupCode)
        {
            var group = await _context.Set<dynamic>()
                .FromSqlRaw($"SELECT * FROM tblReportGroups WHERE GroupCode = '{groupCode}'")
                .FirstOrDefaultAsync();

            if (group == null)
                return null;

            return new AccountGroupConfigDto
            {
                GroupCode = group.GroupCode,
                GroupName = group.GroupName,
                ReportType = group.ReportType,
                GroupType = group.GroupType,
                DisplayOrder = group.DisplayOrder,
                MinAccountCode = group.MinAccountCode,
                MaxAccountCode = group.MaxAccountCode,
                Formula = group.Formula,
                IsActive = group.IsActive,
                IsSystem = group.IsSystem
            };
        }

        /// <summary>
        /// Create new account group
        /// </summary>
        public async Task<AccountGroupConfigDto> CreateGroupAsync(CreateAccountGroupDto dto, string user)
        {
            // Check if group already exists
            var existing = await GetGroupByCodeAsync(dto.GroupCode);
            if (existing != null)
                throw new Exception($"Group code '{dto.GroupCode}' already exists");

            // Insert new group
            var sql = @"
                INSERT INTO tblReportGroups 
                (GroupCode, GroupName, ReportType, GroupType, DisplayOrder, MinAccountCode, MaxAccountCode, Formula, AddBy, AddOn, IsActive)
                VALUES 
                ({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, GETDATE(), 1)
            ";

            await _context.Database.ExecuteSqlRawAsync(
                sql, dto.GroupCode, dto.GroupName, dto.ReportType, dto.GroupType,
                dto.DisplayOrder, dto.MinAccountCode, dto.MaxAccountCode, dto.Formula, user);

            return await GetGroupByCodeAsync(dto.GroupCode) ?? throw new Exception("Failed to create group");
        }

        /// <summary>
        /// Update account group
        /// </summary>
        public async Task UpdateGroupAsync(UpdateAccountGroupDto dto, string user)
        {
            var existing = await GetGroupByCodeAsync(dto.GroupCode);
            if (existing == null)
                throw new Exception($"Group code '{dto.GroupCode}' not found");

            if (existing.IsSystem && dto.IsActive == false)
                throw new Exception("Cannot deactivate system group");

            var updates = new List<string>();
            var parameters = new List<object> { dto.GroupCode };

            if (dto.GroupName != null)
            {
                updates.Add("GroupName = {" + parameters.Count + "}");
                parameters.Add(dto.GroupName);
            }

            if (dto.DisplayOrder.HasValue)
            {
                updates.Add("DisplayOrder = {" + parameters.Count + "}");
                parameters.Add(dto.DisplayOrder.Value);
            }

            if (dto.MinAccountCode != null)
            {
                updates.Add("MinAccountCode = {" + parameters.Count + "}");
                parameters.Add(dto.MinAccountCode);
            }

            if (dto.MaxAccountCode != null)
            {
                updates.Add("MaxAccountCode = {" + parameters.Count + "}");
                parameters.Add(dto.MaxAccountCode);
            }

            if (dto.IsActive.HasValue)
            {
                updates.Add("IsActive = {" + parameters.Count + "}");
                parameters.Add(dto.IsActive.Value ? 1 : 0);
            }

            updates.Add("EditBy = {" + parameters.Count + "}");
            parameters.Add(user);

            updates.Add("EditOn = GETDATE()");

            var sql = $"UPDATE tblReportGroups SET {string.Join(", ", updates)} WHERE GroupCode = {{0}}";

            await _context.Database.ExecuteSqlRawAsync(sql, parameters.ToArray());
        }

        /// <summary>
        /// Delete account group
        /// </summary>
        public async Task DeleteGroupAsync(string groupCode, string user)
        {
            var existing = await GetGroupByCodeAsync(groupCode);
            if (existing == null)
                throw new Exception($"Group code '{groupCode}' not found");

            if (existing.IsSystem)
                throw new Exception("Cannot delete system group");

            var sql = "DELETE FROM tblReportGroups WHERE GroupCode = {0}";
            await _context.Database.ExecuteSqlRawAsync(sql, groupCode);
        }

        // ====================================================================
        // DYNAMIC PATH RESOLUTION
        // ====================================================================

        /// <summary>
        /// Get accounts by range
        /// </summary>
        public async Task<List<AccountGroupDto>> GetAccountsByRangeAsync(string minCode, string maxCode, int branchId)
        {
            var allAccounts = await _coaRepository.GetByBranchAsync(branchId);

            // Convert codes to comparable format
            var accountsInRange = allAccounts
                .Where(x => x.AcctLast == true &&
                       string.Compare(x.AcctCode, minCode) >= 0 &&
                       string.Compare(x.AcctCode, maxCode) <= 0)
                .Select(x => new AccountGroupDto
                {
                    acctID = x.acctID,
                    AcctCode = x.AcctCode!,
                    AcctName = x.AcctName!,
                    AcctType = x.AcctType,
                    IsActive = x.Active ?? true
                })
                .ToList();

            return accountsInRange;
        }

        /// <summary>
        /// Resolve group code to actual account codes
        /// </summary>
        public async Task<List<string>> ResolveGroupToAccountCodesAsync(string groupCode, int branchId)
        {
            var accounts = await GetAccountsByGroupCodeAsync(groupCode, branchId);
            return accounts.Select(x => x.AcctCode).ToList();
        }

        /// <summary>
        /// Get control account for a group
        /// </summary>
        public async Task<COADto?> GetControlAccountForGroupAsync(string groupCode, int branchId)
        {
            var group = await GetGroupByCodeAsync(groupCode);
            if (group == null)
                return null;

            // Control account is the parent of all accounts in this group
            var allAccounts = await _coaRepository.GetByBranchAsync(branchId);

            var controlAccount = allAccounts
                .FirstOrDefault(x => x.AcctCode == group.MinAccountCode &&
                               x.PrntCode == null &&
                               x.BranchID == branchId);

            if (controlAccount == null)
                return null;

            return new COADto
            {
                acctID = controlAccount.acctID,
                AcctCode = controlAccount.AcctCode!,
                AcctName = controlAccount.AcctName!
            };
        }

        /// <summary>
        /// Check if account belongs to a group
        /// </summary>
        public async Task<bool> IsAccountInGroupAsync(string acctCode, string groupCode, int branchId)
        {
            var groupAccounts = await GetAccountsByGroupCodeAsync(groupCode, branchId);
            return groupAccounts.Any(x => x.AcctCode == acctCode);
        }
    }
}
