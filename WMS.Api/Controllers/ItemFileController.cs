//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using WMS.Api.DTOs.Item;
//using WMS.Api.Services.Interfaces;

//namespace WMS.Api.Controllers
//{
//    [Authorize]
//    [ApiController]
//    [Route("api/[controller]")]
//    public class ItemFileController : BaseController
//    {
//        private readonly IItemService _service;

//        public ItemFileController(IItemService service)
//        {
//            _service = service;
//        }

//        [HttpGet]
//        public IActionResult GetAll()
//        {
//            try
//            {
//                var data = _service.GetAll();
//                return Ok(CreateResponse(data));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
//            }
//        }

//        [HttpPost]
//        public IActionResult Create(ItemCreateDto dto)
//        {
//            try
//            {
//                _service.Create(dto);
//                // ✅ Return the created item ID or something meaningful
//                return Ok(CreateResponse(new { message = "Item created successfully" }));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
//            }
//        }

//        [HttpPut]
//        public IActionResult Update(ItemUpdateDto dto)
//        {
//            try
//            {
//                _service.Update(dto);
//                return Ok(CreateResponse(new { message = "Item updated successfully" }));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
//            }
//        }

//        [HttpDelete("{id}")]
//        public IActionResult Delete(int id)
//        {
//            try
//            {
//                _service.Delete(id);
//                return Ok(CreateResponse(new { message = "Item deleted successfully" }));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
//            }
//        }
//    }
//}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Api.Data;
using WMS.Api.DTOs.Item;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ItemFileController : BaseController
    {
        private readonly IItemService _service;
        private readonly WmsDbContext _context;
        private readonly IPriceHistoryService _priceService;

        // ✅ SIRF YEH EK CONSTRUCTOR
        public ItemFileController(
            IItemService service,
            WmsDbContext context,
            IPriceHistoryService priceService)
        {
            _service = service;
            _context = context;
            _priceService = priceService;
        }

        // ========== BASIC CRUD ==========

        [HttpGet]
        public IActionResult GetAll()
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = _service.GetAll(branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR in GetAll: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"INNER: {ex.InnerException.Message}");
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("branch/{branchId}")]
        public IActionResult GetByBranch(int branchId)
        {
            try
            {
                var data = _service.GetAll(branchId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            try
            {
                int branchId = GetCurrentBranchId();
                var data = _service.GetById(id, branchId);
                if (data == null)
                    return NotFound(CreateErrorResponse("Item not found"));
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost]
        public IActionResult Create([FromBody] ItemCreateDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(CreateErrorResponse("Invalid data"));

                int branchId = GetCurrentBranchId();
                int userId = GetCurrentUserId();

                var itemId = _service.Create(dto, branchId, userId);
                return Ok(CreateResponse(new { itemId, message = "Item created successfully" }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPut]
        public IActionResult Update([FromBody] ItemUpdateDto dto)
        {
            try
            {
                if (dto == null || dto.ItemID <= 0)
                    return BadRequest(CreateErrorResponse("Invalid data"));

                int branchId = GetCurrentBranchId();
                int userId = GetCurrentUserId();

                _service.Update(dto, branchId, userId);
                return Ok(CreateResponse(new { message = "Item updated successfully" }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest(CreateErrorResponse("Invalid item ID"));

                int branchId = GetCurrentBranchId();
                int userId = GetCurrentUserId();

                _service.Delete(id, branchId, userId);
                return Ok(CreateResponse(new { message = "Item deleted successfully" }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("generate-name")]
        public IActionResult GenerateItemName(
            [FromQuery] string? modlNumb,
            [FromQuery] int? compId,
            [FromQuery] int? catgId,
            [FromQuery] int? subcatId)
        {
            try
            {
                var name = _service.GenerateItemName(modlNumb, compId, catgId, subcatId);
                return Ok(CreateResponse(new { generatedName = name }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // ========== OLD PRICE HISTORY (Backward Compatibility) ==========

        [HttpGet("{itemId}/price-history")]
        public IActionResult GetPriceHistory(int itemId)
        {
            try
            {
                var data = _service.GetPriceHistory(itemId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("price-history")]
        public IActionResult AddPriceHistory([FromBody] ItemPriceHistoryCreateDto dto)
        {
            try
            {
                int userId = GetCurrentUserId();
                _service.AddPriceHistory(dto.ItemID, dto.Price, userId);
                return Ok(CreateResponse(new { message = "Price history added" }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPut("price-history/{id}")]
        public IActionResult UpdatePriceHistory(int id, [FromBody] UpdatePriceDto dto)
        {
            try
            {
                var history = _context.ItemPriceHistory.Find(id);
                if (history == null)
                    return NotFound(CreateErrorResponse("Price history not found"));

                history.Price = dto.Price;
                _context.SaveChanges();

                return Ok(CreateResponse(new { message = "Price updated successfully" }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // ========== NEW PRICE MANAGEMENT ==========

        [HttpGet("{itemId}/prices")]
        public IActionResult GetAllPrices(int itemId)
        {
            try
            {
                var prices = _priceService.GetAllItemPrices(itemId);
                return Ok(CreateResponse(prices));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("{itemId}/prices/{priceType}")]
        public IActionResult GetPricesByType(int itemId, string priceType)
        {
            try
            {
                var prices = _priceService.GetPriceHistoryByType(itemId, priceType.ToUpper());
                return Ok(CreateResponse(prices));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpGet("{itemId}/active-price/{priceType}")]
        public IActionResult GetActivePrice(int itemId, string priceType)
        {
            try
            {
                var price = _priceService.GetActivePrice(itemId, priceType.ToUpper());
                if (price == null)
                    return Ok(CreateResponse(new { message = "No active price found" }));
                return Ok(CreateResponse(price));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("prices")]
        public IActionResult AddPrice([FromBody] AddPriceHistoryDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var price = _priceService.AddPrice(dto, userId);
                return Ok(CreateResponse(new { price, message = "Price added successfully" }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPut("prices")]
        public IActionResult UpdatePrice([FromBody] UpdatePriceHistoryDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var price = _priceService.UpdatePrice(dto, userId);
                return Ok(CreateResponse(new { price, message = "Price updated successfully" }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpDelete("prices/{priceId}")]
        public IActionResult DeletePrice(int priceId)
        {
            try
            {
                var userId = GetCurrentUserId();
                _priceService.DeletePrice(priceId, userId);
                return Ok(CreateResponse(new { message = "Price deleted successfully" }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPut("prices/{priceId}/activate")]
        public IActionResult ActivatePrice(int priceId)
        {
            try
            {
                var userId = GetCurrentUserId();
                _priceService.ActivatePrice(priceId, userId);
                return Ok(CreateResponse(new { message = "Price activated successfully" }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("migrate-prices")]
        public IActionResult MigratePrices()
        {
            try
            {
                _priceService.MigrateExistingPrices();
                return Ok(CreateResponse(new { message = "Prices migrated successfully" }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // ========== IMAGES ==========

        [HttpGet("{itemId}/images")]
        public IActionResult GetItemImages(int itemId)
        {
            try
            {
                var data = _service.GetItemImages(itemId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("{itemId}/images")]
        public IActionResult AddItemImages(int itemId, [FromBody] List<string> imageUrls)
        {
            try
            {
                int userId = GetCurrentUserId();
                _service.AddItemImages(itemId, imageUrls, userId);
                return Ok(CreateResponse(new { message = "Images added" }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpDelete("images/{imageId}")]
        public IActionResult DeleteItemImage(int imageId)
        {
            try
            {
                _service.DeleteItemImage(imageId);
                return Ok(CreateResponse(new { message = "Image deleted" }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // ========== GODOWN OPENINGS ==========

        [HttpGet("{itemId}/godown-openings")]
        public IActionResult GetGodownOpenings(int itemId)
        {
            try
            {
                var data = _service.GetGodownOpenings(itemId);
                return Ok(CreateResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        [HttpPost("godown-openings")]
        public IActionResult SaveGodownOpenings([FromBody] ItemGodownOpeningBulkDto dto)
        {
            try
            {
                _service.SaveGodownOpenings(dto.ItemID, dto.Openings);
                return Ok(CreateResponse(new { message = "Godown openings saved" }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, CreateErrorResponse(ex.Message, ex));
            }
        }

        // ========== DTO ==========
        public class UpdatePriceDto
        {
            public decimal Price { get; set; }
        }
    }
}