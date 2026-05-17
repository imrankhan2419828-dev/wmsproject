using WMS.Api.Data;
using System.Linq;

namespace WMS.Api.Services.Helpers
{
    public static class StockHelper
    {
        public static double GetItemBalance(WmsDbContext db, int itemId, int branchId)
        {
            try
            {
                return db.ItemStock
                    .Where(x => x.ItemID == itemId && x.BranchID == branchId)
                    .Sum(x => x.InQty - x.OutQty);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error calculating stock balance for item {itemId}, branch {branchId}: {ex.Message}", ex);
            }
        }

        public static bool IsStockAvailable(WmsDbContext db, int itemId, int branchId, double requiredQty)
        {
            try
            {
                double available = GetItemBalance(db, itemId, branchId);
                return available >= requiredQty;
            }
            catch
            {
                return false;
            }
        }
    }
}