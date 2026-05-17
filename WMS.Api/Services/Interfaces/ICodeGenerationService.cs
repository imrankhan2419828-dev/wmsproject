using WMS.Api.Models;

namespace WMS.Api.Services.Interfaces
{
    /// <summary>
    /// Service for automatic account code generation with range management
    /// </summary>
    public interface ICodeGenerationService
    {
        // ====================================================================
        // CODE GENERATION
        // ====================================================================

        /// <summary>
        /// Generate code for root level account (no parent)
        /// </summary>
        Task<string> GenerateRootCodeAsync(int branchId, string accountType, List<COA> existingAccounts);

        /// <summary>
        /// Generate code for child account (has parent)
        /// </summary>
        Task<string> GenerateChildCodeAsync(string parentCode, int branchId, List<COA> existingAccounts);

        /// <summary>
        /// Generate code based on category
        /// </summary>
        Task<string> GenerateCodeByCategoryAsync(int branchId, int categoryCode, List<COA> existingAccounts);

        // ====================================================================
        // RANGE MANAGEMENT
        // ====================================================================

        /// <summary>
        /// Check if code range is exhausted for a parent
        /// </summary>
        Task<bool> IsRangeExhaustedAsync(string? parentCode, int branchId, List<COA> existingAccounts);

        /// <summary>
        /// Get remaining slots in range
        /// </summary>
        Task<int> GetRemainingSlotsAsync(string? parentCode, int branchId, List<COA> existingAccounts);

        /// <summary>
        /// Extend range for a parent (user requested)
        /// </summary>
        Task<RangeExtensionResult> ExtendRangeAsync(string? parentCode, int branchId, string extendedBy, List<COA> existingAccounts);

        /// <summary>
        /// Get range configuration for a parent
        /// </summary>
        Task<CodeRangeConfig?> GetRangeConfigAsync(string? parentCode, int branchId);

        /// <summary>
        /// Create default ranges for new branch
        /// </summary>
        Task CreateDefaultRangesForBranchAsync(int branchId);

        // ====================================================================
        // LEVEL CALCULATION
        // ====================================================================

        /// <summary>
        /// Calculate account level based on code
        /// </summary>
        int CalculateLevel(string acctCode);

        /// <summary>
        /// Validate level does not exceed maximum
        /// </summary>
        Task<bool> ValidateLevelAsync(string? parentCode, int currentLevel, int maxAllowedLevel);

        // ====================================================================
        // CODE VALIDATION
        // ====================================================================

        /// <summary>
        /// Validate generated code is unique
        /// </summary>
        Task<bool> IsCodeUniqueAsync(string acctCode, int branchId, List<COA> existingAccounts);

        /// <summary>
        /// Validate code format
        /// </summary>
        bool ValidateCodeFormat(string acctCode);

        /// <summary>
        /// Get next available code in range
        /// </summary>
        Task<string> GetNextAvailableCodeAsync(string? parentCode, int branchId, List<COA> existingAccounts);
    }

    /// <summary>
    /// Result of range extension operation
    /// </summary>
    public class RangeExtensionResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int OldMax { get; set; }
        public int NewMax { get; set; }
        public int ExtendedByValue { get; set; }
        public DateTime ExtendedOn { get; set; }
    }

    /// <summary>
    /// Code range configuration
    /// </summary>
    public class CodeRangeConfig
    {
        public int ConfigID { get; set; }
        public int BranchID { get; set; }
        public string? ParentCode { get; set; }
        public string RangeType { get; set; } = string.Empty;
        public int StartCode { get; set; }
        public int EndCode { get; set; }
        public int NextCode { get; set; }
        public int StepSize { get; set; }
        public string CodeFormat { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsAutoExtend { get; set; }
    }
}
