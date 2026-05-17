//namespace WMS.Api.DTOs.Branch
//{
//    public class BranchDto
//    {
//        public int BranchID { get; set; }
//        public string BranchName { get; set; }
//        public string BranchAddress { get; set; }
//        public string BranchPhone { get; set; }
//        public bool? InActive { get; set; }
//    }
//}

namespace WMS.Api.DTOs.Branch
{
    public class BranchDto
    {
        public int BranchID { get; set; }
        public string BranchName { get; set; } = string.Empty;
        public string? BranchAddress { get; set; }
        public string? BranchPhone { get; set; }
        public string? BranchCooridnator { get; set; }
        public string? BranchAbbr { get; set; }
        public string? C_Cell { get; set; }
        public string? C_Email { get; set; }
        public bool? InActive { get; set; }
        public string? BranchCity { get; set; }
        public string? Remarks { get; set; }
    }
}