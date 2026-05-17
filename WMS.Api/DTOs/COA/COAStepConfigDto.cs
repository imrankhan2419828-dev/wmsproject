namespace WMS.Api.DTOs.COA
{
    public class COAStepConfigDto
    {
        public int Step { get; set; }
        public int Level { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool ShowAccountType { get; set; }
        public bool ShowCategory { get; set; }
        public bool ShowOpeningBalance { get; set; }
        public bool ShowDescription { get; set; }
        public bool IsControlAccountDefault { get; set; }
        public bool CanChangeControlAccount { get; set; }
        public List<string>? AllowedAccountTypes { get; set; }
        public List<string>? AccountCategories { get; set; }
        public int? ParentLevel { get; set; }
        public string? ParentType { get; set; }
    }
}