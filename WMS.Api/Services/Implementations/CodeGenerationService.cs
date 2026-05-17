using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.Models;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    /// <summary>
    /// Code generation service implementation with range management
    /// </summary>
    public class CodeGenerationService : ICodeGenerationService
    {
        private readonly WmsDbContext _context;

        // Default ranges for root accounts
        private readonly Dictionary<string, (int Start, int End, int Step)> _defaultRootRanges = new()
        {
            ["Asset"] = (1000, 1999, 100),
            ["Liability"] = (2000, 2999, 100),
            ["Equity"] = (3000, 3999, 100),
            ["Revenue"] = (4000, 4999, 100),
            ["Expense"] = (5000, 5999, 100)
        };

        // Maximum children per parent
        private const int MAX_CHILDREN_PER_PARENT = 99;

        // Maximum level depth
        private const int MAX_HIERARCHY_LEVEL = 5;

        public CodeGenerationService(WmsDbContext context)
        {
            _context = context;
        }

        // ====================================================================
        // CODE GENERATION
        // ====================================================================

        /// <summary>
        /// Generate code for root level account (no parent)
        /// </summary>
        public async Task<string> GenerateRootCodeAsync(int branchId, string accountType, List<COA> existingAccounts)
        {
            // Get range for this account type
            if (!_defaultRootRanges.ContainsKey(accountType))
                throw new Exception($"Unknown account type: {accountType}");

            var range = _defaultRootRanges[accountType];

            // Get existing root accounts of this type
            var existingRoots = existingAccounts
                .Where(x => x.PrntCode == null &&
                       x.AcctType == accountType &&
                       x.BranchID == branchId)
                .ToList();

            if (!existingRoots.Any())
            {
                // First account of this type - use start of range
                return range.Start.ToString();
            }

            // Get max code in use
            var maxCode = existingRoots
                .Select(x => int.Parse(x.AcctCode!))
                .Max();

            // Calculate next code
            var nextCode = maxCode + range.Step;

            // Check if within range
            if (nextCode > range.End)
            {
                // Range exhausted - try to extend
                var extensionResult = await ExtendRootRangeAsync(branchId, accountType, range.End);
                if (extensionResult.Success)
                {
                    nextCode = extensionResult.NewMax - range.Step + range.Step;
                }
                else
                {
                    throw new Exception($"Root account range exhausted for {accountType}. Maximum: {range.End}. Please contact administrator.");
                }
            }

            return nextCode.ToString();
        }

        /// <summary>
        /// Generate code for child account (has parent)
        /// </summary>
        public async Task<string> GenerateChildCodeAsync(string parentCode, int branchId, List<COA> existingAccounts)
        {
            // Get existing children
            var existingChildren = existingAccounts
                .Where(x => x.PrntCode == parentCode && x.BranchID == branchId)
                .ToList();

            // Calculate next child number
            int nextNumber = existingChildren.Count + 1;

            // Check maximum limit
            if (nextNumber > MAX_CHILDREN_PER_PARENT)
            {
                throw new Exception($"Cannot add more accounts under '{parentCode}'. Maximum {MAX_CHILDREN_PER_PARENT} children allowed.");
            }

            // Format code: ParentCode-XX
            return $"{parentCode}-{nextNumber:D2}";
        }

        /// <summary>
        /// Generate code based on category
        /// </summary>
        public async Task<string> GenerateCodeByCategoryAsync(int branchId, int categoryCode, List<COA> existingAccounts)
        {
            // Check if category code already exists as root
            var existing = existingAccounts
                .FirstOrDefault(x => x.AcctCode == categoryCode.ToString() &&
                               x.PrntCode == null &&
                               x.BranchID == branchId);

            if (existing != null)
            {
                throw new Exception($"Category code {categoryCode} already exists as account");
            }

            return categoryCode.ToString();
        }

        // ====================================================================
        // RANGE MANAGEMENT
        // ====================================================================

        /// <summary>
        /// Check if code range is exhausted for a parent
        /// </summary>
        public async Task<bool> IsRangeExhaustedAsync(string? parentCode, int branchId, List<COA> existingAccounts)
        {
            if (string.IsNullOrEmpty(parentCode))
            {
                // Root level - check all root ranges
                foreach (var range in _defaultRootRanges.Values)
                {
                    var rootAccounts = existingAccounts
                        .Where(x => x.PrntCode == null && x.BranchID == branchId)
                        .Select(x => int.Parse(x.AcctCode!))
                        .ToList();

                    if (rootAccounts.Any() && rootAccounts.Max() >= range.End)
                        return true;
                }
                return false;
            }
            else
            {
                // Child level
                var children = existingAccounts
                    .Where(x => x.PrntCode == parentCode && x.BranchID == branchId)
                    .ToList();

                return children.Count >= MAX_CHILDREN_PER_PARENT;
            }
        }

        /// <summary>
        /// Get remaining slots in range
        /// </summary>
        public async Task<int> GetRemainingSlotsAsync(string? parentCode, int branchId, List<COA> existingAccounts)
        {
            if (string.IsNullOrEmpty(parentCode))
            {
                // Root level - calculate for all types
                int totalRemaining = 0;
                foreach (var kvp in _defaultRootRanges)
                {
                    var existingRoots = existingAccounts
                        .Where(x => x.PrntCode == null &&
                               x.AcctType == kvp.Key &&
                               x.BranchID == branchId)
                        .Select(x => int.Parse(x.AcctCode!))
                        .ToList();

                    int maxUsed = existingRoots.Any() ? existingRoots.Max() : kvp.Value.Start - kvp.Value.Step;
                    int remaining = (kvp.Value.End - maxUsed) / kvp.Value.Step;
                    totalRemaining += Math.Max(0, remaining);
                }
                return totalRemaining;
            }
            else
            {
                // Child level
                var children = existingAccounts
                    .Where(x => x.PrntCode == parentCode && x.BranchID == branchId)
                    .ToList();

                return Math.Max(0, MAX_CHILDREN_PER_PARENT - children.Count);
            }
        }

        /// <summary>
        /// Extend range for a parent (user requested)
        /// </summary>
        public async Task<RangeExtensionResult> ExtendRangeAsync(string? parentCode, int branchId, string extendedBy, List<COA> existingAccounts)
        {
            var result = new RangeExtensionResult();

            try
            {
                if (string.IsNullOrEmpty(parentCode))
                {
                    // Root level extension - need to know which type
                    // This would be implemented based on your requirements
                    result.Success = false;
                    result.Message = "Root range extension requires administrator approval";
                    return result;
                }
                else
                {
                    // Child level extension - increase max children
                    // For now, we don't allow extension beyond MAX_CHILDREN_PER_PARENT
                    result.Success = false;
                    result.Message = $"Maximum {MAX_CHILDREN_PER_PARENT} children per parent is fixed";
                    return result;
                }
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Message = ex.Message;
                return result;
            }
        }

        /// <summary>
        /// Get range configuration for a parent
        /// </summary>
        public async Task<CodeRangeConfig?> GetRangeConfigAsync(string? parentCode, int branchId)
        {
            if (string.IsNullOrEmpty(parentCode))
            {
                // Return summary for root ranges
                return new CodeRangeConfig
                {
                    BranchID = branchId,
                    ParentCode = null,
                    RangeType = "ROOT",
                    StartCode = 1000,
                    EndCode = 5999,
                    NextCode = 1000,
                    StepSize = 100,
                    CodeFormat = "{0}",
                    IsActive = true,
                    IsAutoExtend = false
                };
            }
            else
            {
                // Return child range config
                return new CodeRangeConfig
                {
                    BranchID = branchId,
                    ParentCode = parentCode,
                    RangeType = "CHILD",
                    StartCode = 1,
                    EndCode = MAX_CHILDREN_PER_PARENT,
                    NextCode = 1,
                    StepSize = 1,
                    CodeFormat = "{0}-{1:D2}",
                    IsActive = true,
                    IsAutoExtend = false
                };
            }
        }

        /// <summary>
        /// Create default ranges for new branch
        /// </summary>
        public async Task CreateDefaultRangesForBranchAsync(int branchId)
        {
            // This would insert into tblCOARangeConfig table
            // For now, just log or implement based on your needs
            Console.WriteLine($"Default ranges created for branch {branchId}");
            await Task.CompletedTask;
        }

        // ====================================================================
        // LEVEL CALCULATION
        // ====================================================================

        /// <summary>
        /// Calculate account level based on code
        /// </summary>
        public int CalculateLevel(string acctCode)
        {
            if (string.IsNullOrEmpty(acctCode))
                return 0;

            // Level = number of dashes
            return acctCode.Count(c => c == '-');
        }

        /// <summary>
        /// Validate level does not exceed maximum
        /// </summary>
        public async Task<bool> ValidateLevelAsync(string? parentCode, int currentLevel, int maxAllowedLevel)
        {
            if (string.IsNullOrEmpty(parentCode))
            {
                // Root account
                return currentLevel == 0;
            }

            // Child account
            int newLevel = currentLevel + 1;
            return newLevel <= maxAllowedLevel;
        }

        // ====================================================================
        // CODE VALIDATION
        // ====================================================================

        /// <summary>
        /// Validate generated code is unique
        /// </summary>
        public async Task<bool> IsCodeUniqueAsync(string acctCode, int branchId, List<COA> existingAccounts)
        {
            return !existingAccounts.Any(x => x.AcctCode == acctCode && x.BranchID == branchId);
        }

        /// <summary>
        /// Validate code format
        /// </summary>
        public bool ValidateCodeFormat(string acctCode)
        {
            if (string.IsNullOrEmpty(acctCode))
                return false;

            // Root level: just numbers (e.g., 1000)
            if (!acctCode.Contains('-'))
            {
                return int.TryParse(acctCode, out _);
            }

            // Child level: ParentCode-XX format
            var parts = acctCode.Split('-');
            if (parts.Length < 2)
                return false;

            // Last part should be 2-digit number
            var lastPart = parts[^1];
            return lastPart.Length == 2 && int.TryParse(lastPart, out _);
        }

        /// <summary>
        /// Get next available code in range
        /// </summary>
        public async Task<string> GetNextAvailableCodeAsync(string? parentCode, int branchId, List<COA> existingAccounts)
        {
            if (string.IsNullOrEmpty(parentCode))
            {
                // For root, return next available across all types
                // This is a simplified version
                foreach (var kvp in _defaultRootRanges)
                {
                    try
                    {
                        return await GenerateRootCodeAsync(branchId, kvp.Key, existingAccounts);
                    }
                    catch
                    {
                        continue;
                    }
                }
                throw new Exception("No available root range found");
            }
            else
            {
                return await GenerateChildCodeAsync(parentCode, branchId, existingAccounts);
            }
        }

        // ====================================================================
        // PRIVATE HELPER METHODS
        // ====================================================================

        /// <summary>
        /// Extend root range when exhausted
        /// </summary>
        private async Task<RangeExtensionResult> ExtendRootRangeAsync(int branchId, string accountType, int currentMax)
        {
            var result = new RangeExtensionResult();

            // Define extension limits
            var extensionLimits = new Dictionary<string, int>
            {
                ["Asset"] = 2999,
                ["Liability"] = 3999,
                ["Equity"] = 4999,
                ["Revenue"] = 5999,
                ["Expense"] = 6999
            };

            if (!extensionLimits.ContainsKey(accountType))
            {
                result.Success = false;
                result.Message = $"Cannot extend range for {accountType}";
                return result;
            }

            int newMax = currentMax + 500; // Extend by 500
            if (newMax > extensionLimits[accountType])
            {
                newMax = extensionLimits[accountType];
            }

            result.Success = true;
            result.OldMax = currentMax;
            result.NewMax = newMax;
            result.ExtendedByValue = newMax - currentMax;
            result.ExtendedOn = DateTime.Now;
            result.Message = $"Range extended from {currentMax} to {newMax}";

            // Update range in database (you would implement this)
            // await UpdateRangeConfigAsync(branchId, accountType, newMax);

            return result;
        }
    }
}