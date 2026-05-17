using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.COA;
using WMS.Api.Models;
using WMS.Api.Repositories.Interfaces;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class CoaService : ICoaService
    {
        private readonly ICoaRepository _repo;
        private readonly WmsDbContext _context;

        public CoaService(ICoaRepository repo, WmsDbContext context)
        {
            _repo = repo;
            _context = context;
        }

        // ====================================================================
        // TREE OPERATIONS
        // ====================================================================

        public async Task<List<COADto>> GetTreeAsync(int branchId)
        {
            var allAccounts = await _repo.GetByBranchAsync(branchId);

            COADto BuildTree(string? parentCode)
            {
                var account = allAccounts.FirstOrDefault(x => x.AcctCode == parentCode);
                if (account == null && parentCode != null) return null;

                var children = allAccounts
                    .Where(x => x.PrntCode == parentCode)
                    .OrderBy(x => x.SortOrder)
                    .ThenBy(x => x.AcctCode)
                    .Select(x => BuildTree(x.AcctCode))
                    .Where(x => x != null)
                    .Select(x => x!)
                    .ToList();

                if (account == null && parentCode == null)
                {
                    // Root level - return all top-level accounts
                    return new COADto
                    {
                        acctID = 0,
                        AcctCode = "ROOT",
                        AcctName = "Chart of Accounts",
                        Children = children
                    };
                }

                return MapToDto(account!, children);
            }

            var root = BuildTree(null);
            return root?.Children ?? new List<COADto>();
        }

        public async Task<COADto?> GetAccountByIdAsync(int id, int branchId)
        {
            var account = await _repo.GetByIdAndBranchAsync(id, branchId);
            return account != null ? MapToDto(account, new List<COADto>()) : null;
        }

        // ====================================================================
        // CREATE ACCOUNT (5-STEP LOGIC)
        // ====================================================================

        public async Task<int> CreateAccountAsync(COACreateDto dto, int branchId, string user)
        {
            // ====================================================================
            // VALIDATION
            // ====================================================================
            if (string.IsNullOrEmpty(dto.AcctName))
                throw new Exception("Account Name is required");

            if (string.IsNullOrEmpty(dto.PrntCode) && string.IsNullOrEmpty(dto.NormalSide))
                throw new Exception("Normal Side (Dr/Cr) is required for root accounts");

            if (await _repo.IsDuplicateNameAsync(dto.PrntCode, dto.AcctName, branchId))
                throw new Exception($"Account name '{dto.AcctName}' already exists under this parent");

            // ====================================================================
            // GET PARENT INFO
            // ====================================================================
            COA? parent = null;
            string finalAcctType = dto.AcctType ?? "";

            if (!string.IsNullOrEmpty(dto.PrntCode))
            {
                parent = await _repo.GetByCodeAsync(dto.PrntCode, branchId);
                if (parent == null)
                    throw new Exception("Parent account not found");

                if (string.IsNullOrEmpty(finalAcctType))
                    finalAcctType = parent.AcctType ?? "";
            }
            else
            {
                // Root account: Dr -> Asset/Expense, Cr -> Liability/Equity/Revenue
                if (!string.IsNullOrEmpty(dto.NormalSide))
                {
                    finalAcctType = dto.NormalSide == "Dr" ? "Asset" : "Liability";
                }
            }

            // ====================================================================
            // GENERATE CODE (using tblCOALength)
            // ====================================================================
            var acctCode = await _repo.GenerateNextCodeAsync(dto.PrntCode, branchId);

            // ====================================================================
            // DETERMINE LEVEL
            // ====================================================================
            int Level = string.IsNullOrEmpty(dto.PrntCode) ? 0 : (parent?.Level ?? 0) + 1;

            // ====================================================================
            // DETERMINE NORMAL SIDE
            // ====================================================================
            string normalSide = dto.NormalSide ?? GetNormalSide(finalAcctType);
            if (!string.IsNullOrEmpty(dto.PrntCode) && parent != null)
            {
                normalSide = parent.NormalSide ?? normalSide;
            }

            // ====================================================================
            // DETERMINE REPORT GROUP
            // ====================================================================
            string reportGroup = GetReportGroup(finalAcctType);

            // ====================================================================
            // DETERMINE ACCOUNT CATEGORY
            // ====================================================================
            string? accountCategory = dto.AccountCategory;

            // Inherit from parent if not specified
            if (string.IsNullOrEmpty(accountCategory) && parent != null)
            {
                accountCategory = parent.AccountCategory;
            }

            // ====================================================================
            // GET SORT ORDER
            // ====================================================================
            int sortOrder = await _repo.GetNextSortOrderAsync(dto.PrntCode, branchId);

            // ====================================================================
            // DETERMINE CONTROL ACCOUNT FLAG
            // ====================================================================
            bool isControlAccount;
            if (dto.IsControlAccount.HasValue)
                isControlAccount = dto.IsControlAccount.Value;
            else
                isControlAccount = Level <= 2;  // Level 0,1,2 are control accounts

            // ====================================================================
            // BUILD PATH
            // ====================================================================
            string path = parent?.Path != null ? $"{parent.Path} > {acctCode}" : acctCode;

            // ====================================================================
            // CREATE ENTITY
            // ====================================================================
            var entity = new COA
            {
                AcctCode = acctCode,
                AcctName = dto.AcctName,
                PrntCode = dto.PrntCode,
                AcctType = finalAcctType,
                NormalSide = normalSide,
                AcctLast = !isControlAccount,
                Active = dto.Active ?? true,
                IsControlAccount = isControlAccount,
                IsSystem = false,
                LockAcct = false,
                StopSale = false,
                ParkEntries = false,
                IsBranchAC = false,
                AcctDebt = false,
                OriginalSystem = false,
                Level = Level,
                MinLevel = 0,
                MaxLevel = 6,
                SortOrder = sortOrder,
                OpenAmnt = dto.OpenAmnt ?? 0,
                AcctDesc = dto.AcctDesc,
                BranchID = branchId,
                AddBy = user,
                AddOn = DateTime.Now,
                ControlAccountId = dto.ControlAccountId,
                AccountCategory = accountCategory,
                ReportGroup = reportGroup,
                Path = path,
                CategoryCode = accountCategory switch
                {
                    "Customer" or "Cash & Bank" or "Bank" => 1100,
                    "Supplier" => 2100,
                    _ => null
                }
            };

            await _repo.AddAsync(entity);

            // Update parent's AcctLast flag
            if (!string.IsNullOrEmpty(dto.PrntCode))
            {
                await _repo.UpdateParentLastFlagAsync(dto.PrntCode, branchId);
            }

            // Add opening balance (only for leaf/posting accounts)
            if (dto.OpenAmnt.HasValue && dto.OpenAmnt.Value != 0 && !isControlAccount)
            {
                await AddOpeningBalanceToLedger(entity, dto.OpenAmnt.Value, branchId);
            }

            return entity.acctID;
        }

        // ====================================================================
        // UPDATE ACCOUNT
        // ====================================================================

        public async Task UpdateAccountAsync(COAUpdateDto dto, int branchId, string user)
        {
            var entity = await _repo.GetByIdAndBranchAsync(dto.acctID, branchId);
            if (entity == null)
                throw new Exception("Account not found");

            // Don't allow changing control account flag if has transactions
            if (dto.IsControlAccount.HasValue && dto.IsControlAccount != entity.IsControlAccount)
            {
                if (await _repo.HasTransactionsAsync(entity.acctID))
                    throw new Exception("Cannot change Control Account flag as account has transactions");
            }

            // Update fields
            entity.AcctName = dto.AcctName;
            entity.Active = dto.Active ?? entity.Active;
            entity.LockAcct = dto.LockAcct ?? entity.LockAcct;
            entity.IsControlAccount = dto.IsControlAccount ?? entity.IsControlAccount;
            entity.AccountCategory = dto.AccountCategory ?? entity.AccountCategory;
            entity.EditBy = user;
            entity.EditOn = DateTime.Now;

            // Update AcctLast based on IsControlAccount
            if (dto.IsControlAccount.HasValue)
            {
                entity.AcctLast = !dto.IsControlAccount.Value;
            }

            await _repo.UpdateAsync(entity);

            // Update path
            await _repo.UpdatePathAsync(entity.acctID);
        }

        // ====================================================================
        // DELETE ACCOUNT
        // ====================================================================

        public async Task DeleteAccountAsync(int accountId, int branchId, string user)
        {
            var entity = await _repo.GetByIdAndBranchAsync(accountId, branchId);
            if (entity == null)
                throw new Exception("Account not found");

            // Validation
            if (entity.IsSystem == true)
                throw new Exception("Cannot delete system account");

            if (await _repo.HasChildrenAsync(accountId))
                throw new Exception("Cannot delete account with child accounts. Delete children first.");

            if (await _repo.HasTransactionsAsync(accountId))
                throw new Exception("Cannot delete account with transactions");

            var parentCode = entity.PrntCode;

            await _repo.DeleteAsync(entity);

            // Update parent's AcctLast flag
            if (!string.IsNullOrEmpty(parentCode))
            {
                await _repo.UpdateParentLastFlagAsync(parentCode, branchId);
            }
        }

        // ====================================================================
        // STEP CONFIGURATION
        // ====================================================================

        public async Task<COAStepConfigDto> GetStepConfigAsync(int step, string? parentCode, int branchId)
        {
            var config = new COAStepConfigDto
            {
                Step = step,
                Level = step - 1,
                ShowAccountType = step == 1,
                ShowCategory = step >= 3 && step <= 4,
                ShowOpeningBalance = step == 5,
                ShowDescription = step == 5,
                IsControlAccountDefault = step <= 4,
                CanChangeControlAccount = step <= 4,
                ParentLevel = step == 1 ? null : step - 2
            };

            // Set title and description based on step
            switch (step)
            {
                case 1:
                    config.Title = "Create Root Account";
                    config.Description = "Create main account types: Assets, Liabilities, Equity, Revenue, or Expenses";
                    config.AllowedAccountTypes = new List<string> { "Asset", "Liability", "Equity", "Revenue", "Expense" };
                    break;

                case 2:
                    config.Title = "Create Major Account";
                    config.Description = "Create major categories under the root account";
                    break;

                case 3:
                    config.Title = "Create Sub Account";
                    config.Description = "Create sub-categories under the major account";
                    config.AccountCategories = new List<string> { "Current Assets", "Fixed Assets", "Current Liabilities", "Long Term Liabilities" };
                    break;

                case 4:
                    config.Title = "Create Control Account";
                    config.Description = "Create control accounts for Customers, Suppliers, Banks, etc.";
                    config.AccountCategories = new List<string> { "Customer", "Supplier", "Bank", "Expense", "Other" };
                    break;

                case 5:
                    config.Title = "Create Detail Account";
                    config.Description = "Create leaf accounts for Customers, Suppliers, Banks, etc.";
                    config.AccountCategories = new List<string> { "Customer", "Supplier", "Bank", "Expense", "Other" };
                    break;
            }

            // If parent provided, get parent info
            if (!string.IsNullOrEmpty(parentCode))
            {
                var parent = await _repo.GetByCodeAsync(parentCode, branchId);
                if (parent != null)
                {
                    config.ParentType = parent.AcctType;
                }
            }

            return config;
        }

        
        public async Task<List<object>> GetParentOptionsAsync(int? level, string? acctType, string? category, int branchId)
        {
            var allAccounts = await _repo.GetByBranchAsync(branchId);

            var query = allAccounts.AsQueryable();

            // Filter by level
            if (level.HasValue)
            {
                query = query.Where(x => x.Level == level.Value);
            }

            // Filter by account type
            if (!string.IsNullOrEmpty(acctType))
            {
                query = query.Where(x => x.AcctType == acctType);
            }

            // CRITICAL FIX: For level 3, IGNORE category filter completely
            // Because control accounts like "Suppliers" have NULL AccountCategory
            if (level.HasValue && level.Value == 3)
            {
                // Don't apply any category filter for level 3
                // Just return all control accounts at this level
            }
            else if (!string.IsNullOrEmpty(category))
            {
                // Apply category filter for other levels
                if (category == "Customer")
                {
                    query = query.Where(x => x.AcctName.Contains("Receivable") || x.AccountCategory == "Customer");
                }
                else if (category == "Supplier")
                {
                    query = query.Where(x => x.AcctName.Contains("Payable") || x.AccountCategory == "Supplier");
                }
                else if (category == "Bank")
                {
                    query = query.Where(x => x.AcctName.Contains("Bank") || x.AcctName.Contains("Cash") || x.AccountCategory == "Bank");
                }
                else if (category == "Expense")
                {
                    query = query.Where(x => x.AcctName.Contains("Expense") || x.AccountCategory == "Expense");
                }
                else if (category == "Other")
                {
                    query = query.Where(x => x.AccountCategory == "Other");
                }
            }

            // Only show control accounts
            query = query.Where(x => x.IsControlAccount == true);

            var result = query.Select(x => new
            {
                x.acctID,
                x.AcctCode,
                x.AcctName,
                x.Level,
                x.AcctType,
                x.NormalSide,
                displayName = $"{x.AcctCode} - {x.AcctName}"
            }).OrderBy(x => x.AcctCode).ToList();

            return result.Cast<object>().ToList();
        }
        // ====================================================================
        // CATEGORY-BASED QUERIES (For dropdowns)
        // ====================================================================

        public async Task<List<COADto>> GetCustomersAsync(int branchId)
        {
            var accounts = await _repo.GetAccountsByCategoryAsync("Customer", branchId);
            return accounts.Select(a => MapToDto(a, new List<COADto>())).ToList();
        }

        public async Task<List<COADto>> GetSuppliersAsync(int branchId)
        {
            var accounts = await _repo.GetAccountsByCategoryAsync("Supplier", branchId);
            return accounts.Select(a => MapToDto(a, new List<COADto>())).ToList();
        }

        public async Task<List<COADto>> GetBankAccountsAsync(int branchId)
        {
            var accounts = await _repo.GetAccountsByCategoryAsync("Bank", branchId);
            return accounts.Select(a => MapToDto(a, new List<COADto>())).ToList();
        }

        public async Task<List<COADto>> GetExpenseAccountsAsync(int branchId)
        {
            var accounts = await _repo.GetAccountsByCategoryAsync("Expense", branchId);
            return accounts.Select(a => MapToDto(a, new List<COADto>())).ToList();
        }

        public async Task<List<COADto>> GetOtherAccountsAsync(int branchId)
        {
            var accounts = await _repo.GetAccountsByCategoryAsync("Other", branchId);
            return accounts.Select(a => MapToDto(a, new List<COADto>())).ToList();
        }

        // ====================================================================
        // VALIDATION
        // ====================================================================

        public async Task<bool> ValidateAccountCodeAsync(string acctCode, int branchId)
        {
            return !await _repo.IsDuplicateCodeAsync(acctCode, branchId);
        }

        public async Task<bool> ValidateAccountNameAsync(string parentCode, string acctName, int branchId, int? excludeId = null)
        {
            return !await _repo.IsDuplicateNameAsync(parentCode, acctName, branchId, excludeId);
        }

        // ====================================================================
        // HELPER METHODS
        // ====================================================================

        public async Task<List<COADto>> GetControlAccountsByLevelAsync(int level, int branchId)
        {
            var accounts = await _repo.GetControlAccountsByLevelAsync(level, branchId);
            return accounts.Select(a => MapToDto(a, new List<COADto>())).ToList();
        }

        // ====================================================================
        // PRIVATE HELPERS
        // ====================================================================

        private COADto MapToDto(COA entity, List<COADto> children)
        {
            return new COADto
            {
                acctID = entity.acctID,
                AcctCode = entity.AcctCode ?? "",
                AcctName = entity.AcctName ?? "",
                PrntCode = entity.PrntCode,
                AcctType = entity.AcctType ?? "",
                NormalSide = entity.NormalSide,
                Level = entity.Level ?? 0,
                AcctLast = entity.AcctLast ?? false,
                IsControlAccount = entity.IsControlAccount ?? false,
                ControlAccountId = entity.ControlAccountId,
                OpenAmnt = entity.OpenAmnt,
                Active = entity.Active,
                LockAcct = entity.LockAcct,
                ReportGroup = entity.ReportGroup,
                AccountCategory = entity.AccountCategory,
                Path = entity.Path,
                Children = children
            };
        }

        private string GetNormalSide(string acctType)
        {
            return acctType switch
            {
                "Asset" => "Dr",
                "Expense" => "Dr",
                "Liability" => "Cr",
                "Equity" => "Cr",
                "Revenue" => "Cr",
                _ => "Dr"
            };
        }

        private string GetReportGroup(string acctType)
        {
            return acctType switch
            {
                "Asset" => "BS",
                "Liability" => "BS",
                "Equity" => "BS",
                "Revenue" => "PL",
                "Expense" => "PL",
                _ => "BS"
            };
        }

        private async Task AddOpeningBalanceToLedger(COA account, decimal amount, int branchId)
        {
            decimal debit = 0;
            decimal credit = 0;

            if (account.NormalSide == "Dr")
            {
                debit = amount;
                credit = 0;
            }
            else
            {
                debit = 0;
                credit = amount;
            }

            var openingEntry = new LedgerEntry
            {
                BranchID = branchId,
                AccountID = account.acctID,
                EntryDate = DateTime.Now.Date,
                Debit = debit,
                Credit = credit,
                Description = $"Opening Balance as on {DateTime.Now.Date:yyyy-MM-dd}",
                AddBy = 1,
                AddOn = DateTime.Now
            };

            _context.LedgerEntries.Add(openingEntry);
            await _context.SaveChangesAsync();
        }
    }
}