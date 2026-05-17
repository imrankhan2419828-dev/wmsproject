namespace WMS.Api.Models
{
    public class UserBranch
    {
        public int UserBranchID { get; set; }
        public int UserID { get; set; }
        public int BranchID { get; set; }

        // Navigation
        public SystemUser? User { get; set; }
        public Branch? Branch { get; set; }
    }
}
