using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Sales;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SalesController : BaseController
    {
        private readonly ISaleService _saleService;
        private readonly WmsDbContext _context;  // 🔥 ADD THIS

        public SalesController(ISaleService saleService, WmsDbContext context)  // 🔥 ADD context parameter
        {
            _saleService = saleService;
            _context = context;  // 🔥 ADD THIS
        }

        // GET: api/sales/customers
        [HttpGet("customers")]
        public async Task<IActionResult> GetCustomers()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var customers = await GetCustomerAccountsAsync(branchId);

                Console.WriteLine($"Returning {customers.Count} customers to frontend");

                return Ok(CreateResponse(customers));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetCustomers: {ex.Message}");
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        // GET: api/sales/items
        [HttpGet("items")]
        public async Task<IActionResult> GetItems()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var items = await GetItemsAsync(branchId);
                return Ok(CreateResponse(items));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        // GET: api/sales/next-invoice
        [HttpGet("next-invoice")]
        public async Task<IActionResult> GetNextInvoice()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var invoiceNo = await GenerateInvoiceNumberAsync(branchId);
                return Ok(CreateResponse(invoiceNo));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SaleCreateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                    return BadRequest(CreateErrorResponse(string.Join(", ", errors)));
                }

                int branchId = GetCurrentBranchId();
                int userId = GetCurrentUserId();

                var tranNumb = await _saleService.CreateSaleAsync(dto, userId, branchId);

                return Ok(CreateResponse(new { tranNumb }, "Sale saved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpGet("all")]
        public IActionResult GetAll()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = _saleService.GetAll(branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpGet("{tranNumb}")]
        public async Task<IActionResult> GetByTranNumb(int tranNumb)
        {
            try
            {
                if (tranNumb <= 0)
                    return BadRequest(CreateErrorResponse("Invalid transaction number"));

                var sale = await _saleService.GetSaleByTranNumb(tranNumb);

                if (sale == null)
                    return NotFound(CreateErrorResponse("Sale not found"));

                return Ok(CreateResponse(sale));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpPut("{tranNumb}")]
        public async Task<IActionResult> Update(int tranNumb, [FromBody] SaleCreateDto dto)
        {
            try
            {
                if (tranNumb <= 0 || dto == null)
                    return BadRequest(CreateErrorResponse("Invalid data"));

                var ok = await _saleService.UpdateSaleAsync(tranNumb, dto);

                if (!ok)
                    return NotFound(CreateErrorResponse("Sale not found"));

                return Ok(CreateResponse(null, "Sale updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        [HttpDelete("{tranNumb}")]
        public async Task<IActionResult> Delete(int tranNumb)
        {
            try
            {
                if (tranNumb <= 0)
                    return BadRequest(CreateErrorResponse("Invalid transaction number"));

                var ok = await _saleService.DeleteSaleAsync(tranNumb);

                if (!ok)
                    return NotFound(CreateErrorResponse("Sale not found"));

                return Ok(CreateResponse(null, "Sale deleted successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message));
            }
        }

        // ==================== Helper Methods ====================

        private async Task<List<CustomerDropdownDto>> GetCustomerAccountsAsync(int branchId)
        {
            var customers = await _context.tblCOA
                .Where(x => x.AccountCategory == "Customer"
                       && x.AcctLast == true
                       && x.Active == true)
                .Select(x => new CustomerDropdownDto
                {
                    acctID = x.acctID,
                    AcctCode = x.AcctCode ?? "",
                    AcctName = x.AcctName ?? "",
                    NTNNo = x.NTNNo,
                    STRNo = x.STRNo
                })
                .OrderBy(x => x.AcctName)
                .ToListAsync();

            return customers;
        }

        private async Task<List<ItemDropdownDto>> GetItemsAsync(int branchId)
        {
            var items = await _context.ItemFile
                .Where(x => (x.BranchID == branchId || x.BranchID == null) &&
                       (x.InActive == false || x.InActive == null))
                .Select(x => new ItemDropdownDto
                {
                    ItemID = x.ItemID,
                    ItemName = x.ItemName ?? string.Empty,
                    ModlNumb = x.ModlNumb,
                    // ✅ FIX: Get active purchase price from PriceHistory, fallback to ItemFile
                    PurcRate = _context.ItemPriceHistory
                        .Where(p => p.ItemID == x.ItemID
                               && p.PriceType == "PURCHASE"
                               && p.IsActive
                               && !p.IsDeleted)
                        .Select(p => (decimal?)p.Price)
                        .FirstOrDefault() ?? x.PurcRate ?? 0,
                    // ✅ FIX: Get active sale price from PriceHistory, fallback to ItemFile
                    SaleRate = _context.ItemPriceHistory
                        .Where(p => p.ItemID == x.ItemID
                               && p.PriceType == "SALE"
                               && p.IsActive
                               && !p.IsDeleted)
                        .Select(p => (decimal?)p.Price)
                        .FirstOrDefault() ?? x.SaleRate ?? 0,
                    GodownID = x.GodnID
                })
                .OrderBy(x => x.ItemName)
                .ToListAsync();

            return items;
        }

        private async Task<string> GenerateInvoiceNumberAsync(int branchId)
        {
            var year = DateTime.Now.Year;
            var month = DateTime.Now.ToString("MM");
            var branchCodeStr = $"BR{branchId:D3}";
            var pattern = $"{branchCodeStr}/SALE/{year}{month}";

            var lastInvoice = await _context.SaleFiles
                .Where(x => x.BillNumb != null && x.BillNumb.Contains(pattern))
                .OrderByDescending(x => x.TranNumb)
                .FirstOrDefaultAsync();

            int sequence = 1;
            if (lastInvoice?.BillNumb != null)
            {
                var parts = lastInvoice.BillNumb.Split('/');
                if (parts.Length >= 4 && int.TryParse(parts[3], out int lastSeq))
                {
                    sequence = lastSeq + 1;
                }
            }

            return $"{branchCodeStr}/SALE/{year}{month}/{sequence:D5}";
        }
    }

    public class CustomerDropdownDto
    {
        public int acctID { get; set; }
        public string AcctCode { get; set; } = string.Empty;
        public string AcctName { get; set; } = string.Empty;
        public string? NTNNo { get; set; }
        public string? STRNo { get; set; }
    }

    public class ItemDropdownDto
    {
        public int ItemID { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string? ModlNumb { get; set; }
        public decimal? PurcRate { get; set; }
        public decimal? SaleRate { get; set; }
        public int? GodownID { get; set; }
    }
}