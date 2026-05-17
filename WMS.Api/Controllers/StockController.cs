using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.Data;
using System.Linq;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class StockController : BaseController  // 👈 Inherit from BaseController
    {
        private readonly WmsDbContext _context;

        public StockController(WmsDbContext context)
        {
            _context = context;
        }

        // Get stock by item and branch (with branch from URL)
        [HttpGet("current/{itemId}/{branchId}")]
        public IActionResult GetCurrent(int itemId, int branchId)
        {
            try
            {
                Console.WriteLine($"Getting stock for item {itemId}, branch {branchId}");

                double qty = _context.ItemStock
                    .Where(x => x.ItemID == itemId && x.BranchID == branchId)
                    .Sum(x => x.InQty - x.OutQty);

                Console.WriteLine($"Stock found: {qty}");
                return Ok(CreateResponse(qty));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Stock error: {ex.Message}");
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // Get stock by item (branch from token)
        [HttpGet("current/{itemId}")]
        public IActionResult GetCurrent(int itemId)
        {
            try
            {
                int branchId = GetCurrentBranchId();  // 👈 Use BaseController method

                double qty = _context.ItemStock
                    .Where(x => x.ItemID == itemId && x.BranchID == branchId)
                    .Sum(x => x.InQty - x.OutQty);

                return Ok(CreateResponse(qty));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // Get stock summary for multiple items
        [HttpPost("current/bulk")]
        public IActionResult GetBulkStock([FromBody] List<int> itemIds)
        {
            try
            {
                int branchId = GetCurrentBranchId();

                var stocks = _context.ItemStock
                    .Where(x => itemIds.Contains(x.ItemID) && x.BranchID == branchId)
                    .GroupBy(x => x.ItemID)
                    .Select(g => new
                    {
                        ItemID = g.Key,
                        Quantity = g.Sum(x => x.InQty - x.OutQty)
                    })
                    .ToList();

                return Ok(CreateResponse(stocks));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // Get stock ledger for an item
        [HttpGet("ledger/{itemId}")]
        public IActionResult GetStockLedger(int itemId)
        {
            try
            {
                int branchId = GetCurrentBranchId();

                var ledger = _context.ItemStock
                    .Where(x => x.ItemID == itemId && x.BranchID == branchId)
                    .OrderBy(x => x.TranDate)
                    .Select(x => new
                    {
                        x.TranDate,
                        x.TranType,
                        x.TranNumb,
                        x.InQty,
                        x.OutQty,
                        Balance = x.InQty - x.OutQty,
                        x.Rate,
                        x.Remarks
                    })
                    .ToList();

                return Ok(CreateResponse(ledger));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }
    }
}