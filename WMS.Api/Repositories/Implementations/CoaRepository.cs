using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.Models;
using WMS.Api.Repositories.Interfaces;

namespace WMS.Api.Repositories.Implementations
{
    public class CoaRepository : ICoaRepository
    {
        private readonly WmsDbContext _context;

        public CoaRepository(WmsDbContext context)
        {
            _context = context;
        }

        // ====================================================================
        // BASIC CRUD
        // ====================================================================

        public async Task<List<COA>> GetByBranchAsync(int branchId)
        {
            return await _context.Set<COA>()
                .Where(x => x.BranchID == branchId)
                .OrderBy(x => x.SortOrder)
                .ThenBy(x => x.AcctCode)
                .ToListAsync();
        }

        public async Task<COA?> GetByIdAsync(int id)
        {
            return await _context.Set<COA>().FindAsync(id);
        }

        public async Task<COA?> GetByIdAndBranchAsync(int id, int branchId)
        {
            return await _context.Set<COA>()
                .FirstOrDefaultAsync(x => x.acctID == id && x.BranchID == branchId);
        }

        public async Task<COA?> GetByCodeAsync(string acctCode, int branchId)
        {
            return await _context.Set<COA>()
                .FirstOrDefaultAsync(x => x.AcctCode == acctCode && x.BranchID == branchId);
        }

        public async Task AddAsync(COA entity)
        {
            entity.AddOn = DateTime.Now;
            _context.Set<COA>().Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(COA entity)
        {
            entity.EditOn = DateTime.Now;
            _context.Set<COA>().Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(COA entity)
        {
            _context.Set<COA>().Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateRangeAsync(List<COA> entities)
        {
            _context.Set<COA>().UpdateRange(entities);
            await _context.SaveChangesAsync();
        }

        // ====================================================================
        // HIERARCHY METHODS
        // ====================================================================

        public async Task<List<COA>> GetChildrenAsync(string parentCode, int branchId)
        {
            return await _context.Set<COA>()
                .Where(x => x.PrntCode == parentCode && x.BranchID == branchId)
                .OrderBy(x => x.SortOrder)
                .ThenBy(x => x.AcctCode)
                .ToListAsync();
        }

        public async Task<List<COA>> GetRootAccountsAsync(int branchId)
        {
            return await _context.Set<COA>()
                .Where(x => x.PrntCode == null && x.BranchID == branchId)
                .OrderBy(x => x.SortOrder)
                .ThenBy(x => x.AcctCode)
                .ToListAsync();
        }

        public async Task<List<COA>> GetByLevelAsync(int level, int branchId)
        {
            return await _context.Set<COA>()
                .Where(x => x.Level == level && x.BranchID == branchId)
                .OrderBy(x => x.SortOrder)
                .ThenBy(x => x.AcctCode)
                .ToListAsync();
        }

        public async Task<List<COA>> GetByParentLevelAsync(int parentLevel, int branchId)
        {
            return await _context.Set<COA>()
                .Where(x => x.Level == parentLevel + 1 && x.BranchID == branchId)
                .OrderBy(x => x.SortOrder)
                .ThenBy(x => x.AcctCode)
                .ToListAsync();
        }

        public async Task<List<COA>> GetControlAccountsByLevelAsync(int level, int branchId)
        {
            return await _context.Set<COA>()
                .Where(x => x.Level == level && x.IsControlAccount == true && x.BranchID == branchId)
                .OrderBy(x => x.SortOrder)
                .ThenBy(x => x.AcctCode)
                .ToListAsync();
        }

        // ====================================================================
        // VALIDATION METHODS
        // ====================================================================

        public async Task<bool> HasTransactionsAsync(int accountId)
        {
            try
            {
                // Try to check using direct SQL
                var sql = $@"
            SELECT 
                CASE WHEN EXISTS (
                    SELECT 1 FROM tblJournalDetails WHERE acctID = {accountId}
                    UNION ALL
                    SELECT 1 FROM tblInvoiceDetails WHERE acctID = {accountId}
                    UNION ALL  
                    SELECT 1 FROM tblPaymentDetails WHERE acctID = {accountId}
                    UNION ALL
                    SELECT 1 FROM tblReceiptDetails WHERE acctID = {accountId}
                ) THEN 1 ELSE 0 END
        ";

                var result = await _context.Database.SqlQueryRaw<int>(sql).FirstOrDefaultAsync();
                return result == 1;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error checking transactions: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> HasChildrenAsync(int accountId)
        {
            var account = await GetByIdAsync(accountId);
            if (account == null || string.IsNullOrEmpty(account.AcctCode))
                return false;

            return await _context.Set<COA>()
                .AnyAsync(x => x.PrntCode == account.AcctCode && x.BranchID == account.BranchID);
        }

        public async Task<bool> IsDuplicateNameAsync(string parentCode, string acctName, int branchId, int? excludeId = null)
        {
            var query = _context.Set<COA>()
                .Where(x => x.PrntCode == parentCode && x.AcctName == acctName && x.BranchID == branchId);

            if (excludeId.HasValue)
            {
                query = query.Where(x => x.acctID != excludeId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<bool> IsDuplicateCodeAsync(string acctCode, int branchId)
        {
            return await _context.Set<COA>()
                .AnyAsync(x => x.AcctCode == acctCode && x.BranchID == branchId);
        }

        // ====================================================================
        // CODE GENERATION
        // ====================================================================



        // REPLACE THE ENTIRE GenerateNextCodeAsync method with this:
        public async Task<string> GenerateNextCodeAsync(string? parentCode, int branchId)
        {
            if (string.IsNullOrEmpty(parentCode))
            {
                // ================================================================
                // LEVEL 1: Root Accounts (01, 02, 03, 04, 05)
                // ================================================================
                var levelNo = 1;
                var codeLength = await GetCodeLengthAsync(branchId, levelNo);

                var existingRoots = await _context.Set<COA>()
                    .Where(x => x.PrntCode == null && x.BranchID == branchId)
                    .Select(x => x.AcctCode)
                    .ToListAsync();

                int maxSequence = 0;

                foreach (var code in existingRoots)
                {
                    if (!string.IsNullOrEmpty(code) && code.Length >= codeLength)
                    {
                        string seqPart = code.Substring(code.Length - codeLength);
                        if (int.TryParse(seqPart, out int seq))
                        {
                            if (seq > maxSequence) maxSequence = seq;
                        }
                    }
                }

                int nextSequence = maxSequence + 1;

                if (nextSequence >= Math.Pow(10, codeLength))
                    throw new Exception($"Code range exhausted! Max {codeLength}-digit sequence reached.");

                return nextSequence.ToString($"D{codeLength}");
            }
            else
            {
                // ================================================================
                // CHILD ACCOUNTS: ParentCode + ZeroPaddedSequence
                // ================================================================
                var parent = await GetByCodeAsync(parentCode, branchId);
                if (parent == null)
                    throw new Exception($"Parent account not found: {parentCode}");

                int childLevel = (parent.Level ?? 0) + 1;
                var codeLength = await GetCodeLengthAsync(branchId, childLevel);

                var existingChildren = await _context.Set<COA>()
                    .Where(x => x.PrntCode == parentCode && x.BranchID == branchId)
                    .Select(x => x.AcctCode)
                    .ToListAsync();

                int maxSequence = 0;

                foreach (var childCode in existingChildren)
                {
                    if (!string.IsNullOrEmpty(childCode) && childCode.Length >= parentCode.Length + codeLength)
                    {
                        string seqPart = childCode.Substring(parentCode.Length, codeLength);
                        if (int.TryParse(seqPart, out int seq))
                        {
                            if (seq > maxSequence) maxSequence = seq;
                        }
                    }
                }

                int nextSequence = maxSequence + 1;

                if (nextSequence >= Math.Pow(10, codeLength))
                    throw new Exception($"Code range exhausted! Max {codeLength}-digit sequence reached for parent: {parentCode}");

                string paddedSequence = nextSequence.ToString($"D{codeLength}");
                return parentCode + paddedSequence;
            }
        }
        public async Task<int> GetNextSortOrderAsync(string? parentCode, int branchId)
        {
            var maxOrder = await _context.Set<COA>()
                .Where(x => x.PrntCode == parentCode && x.BranchID == branchId)
                .MaxAsync(x => (int?)x.SortOrder) ?? 0;

            return maxOrder + 1;
        }

        // ====================================================================
        // PARENT FLAG MANAGEMENT
        // ====================================================================

        public async Task UpdateParentLastFlagAsync(string parentCode, int branchId)
        {
            if (string.IsNullOrEmpty(parentCode))
                return;

            var parent = await GetByCodeAsync(parentCode, branchId);
            if (parent != null)
            {
                var hasChildren = await HasChildrenAsync(parent.acctID);
                parent.AcctLast = !hasChildren;
                await UpdateAsync(parent);
            }
        }

        // ====================================================================
        // CATEGORY METHODS
        // ====================================================================

        public async Task<List<COA>> GetAccountsByCategoryAsync(string category, int branchId)
        {
            return await _context.Set<COA>()
                .Where(x => x.AccountCategory == category && x.BranchID == branchId && x.AcctLast == true)
                .OrderBy(x => x.AcctName)
                .ToListAsync();
        }

        // ====================================================================
        // PATH UPDATE
        // ====================================================================

        public async Task UpdatePathAsync(int accountId)
        {
            var account = await GetByIdAsync(accountId);
            if (account == null) return;

            // Build path recursively
            var path = new List<string>();
            var current = account;

            while (current != null)
            {
                path.Insert(0, current.AcctName ?? "");
                if (string.IsNullOrEmpty(current.PrntCode))
                    break;

                current = await GetByCodeAsync(current.PrntCode, current.BranchID ?? 0);
            }

            account.Path = string.Join(" > ", path);
            await UpdateAsync(account);
        }

        // ADD THIS METHOD to the class
        public async Task<int> GetCodeLengthAsync(int branchId, int levelNo)
        {
            var config = await _context.Set<COALength>()
                .FirstOrDefaultAsync(x => x.BranchID == branchId && x.LevelNo == levelNo && x.IsActive);

            // Fallback to default lengths if not configured
            if (config == null)
            {
                return levelNo switch
                {
                    1 => 2,   // Level 1: 2 digits
                    2 => 3,   // Level 2: 3 digits
                    3 => 3,   // Level 3: 3 digits
                    4 => 3,   // Level 4: 3 digits
                    5 => 3,   // Level 5: 3 digits
                    6 => 3,   // Level 6: 3 digits
                    _ => 3
                };
            }

            return config.CodeLength;
        }
    }
}