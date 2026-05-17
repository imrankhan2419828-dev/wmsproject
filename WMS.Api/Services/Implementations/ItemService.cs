//using WMS.Api.DTOs.Item;
//using WMS.Api.Models;
//using WMS.Api.Repositories.Interfaces;
//using WMS.Api.Services.Interfaces;

//namespace WMS.Api.Services.Implementations
//{
//    public class ItemService : IItemService
//    {
//        private readonly IItemRepository _repo;
//        private readonly ICompFileRepository _compRepo;
//        private readonly ICatgFileRepository _catgRepo;
//        private readonly ISubcategoryService _subcatService;  // ✅ CHANGE: Use Service instead of Repository

//        public ItemService(
//            IItemRepository repo,
//            ICompFileRepository compRepo,
//            ICatgFileRepository catgRepo,
//            ISubcategoryService subcatService)  // ✅ CHANGE: Inject Service
//        {
//            _repo = repo;
//            _compRepo = compRepo;
//            _catgRepo = catgRepo;
//            _subcatService = subcatService;  // ✅ CHANGE: Use Service
//        }

//        public List<ItemDto> GetAll(int branchId)
//        {
//            var items = _repo.GetAll(branchId);

//            return items.Select(x => new ItemDto
//            {
//                ItemID = x.ItemID,
//                ItemName = x.ItemName,
//                ModlNumb = x.ModlNumb,

//                CompanyName = _compRepo.GetByIdOnly(x.CompID ?? 0)?.CompName,

//                CategoryName = _catgRepo.GetByIdOnly(x.CatgID ?? 0)?.CatgName,
//                SubcategoryName = GetSubcategoryName(x.SubcatID ?? 0),  // ✅ CHANGE: Use helper method
//                SubcatID = x.SubcatID,
//                IsSparePart = x.IsSparePart,
//                PurcRate = x.PurcRate,
//                SaleRate = x.SaleRate,
//                OpenQnty = x.OpenQnty,
//                OpenRate = x.OpenRate,
//                InActive = x.InActive
//            }).ToList();
//        }

//        // ✅ ADD: Helper method to get subcategory name
//        private string? GetSubcategoryName(int subcatId)
//        {
//            if (subcatId == 0) return null;
//            try
//            {
//                var subcat = _subcatService.GetByIdAsync(subcatId).GetAwaiter().GetResult();
//                return subcat?.SubcatName;
//            }
//            catch
//            {
//                return null;
//            }
//        }

//        public ItemDto? GetById(int id, int branchId)
//        {
//            var item = _repo.GetById(id, branchId);
//            if (item == null) return null;

//            return new ItemDto
//            {
//                ItemID = item.ItemID,
//                ItemName = item.ItemName,
//                ModlNumb = item.ModlNumb,

//                CompanyName = _compRepo.GetByIdOnly(item.CompID ?? 0)?.CompName,

//                CategoryName = _catgRepo.GetByIdOnly(item.CatgID ?? 0)?.CatgName,
//                SubcategoryName = GetSubcategoryName(item.SubcatID ?? 0),
//                SubcatID = item.SubcatID,
//                IsSparePart = item.IsSparePart,
//                PurcRate = item.PurcRate,
//                SaleRate = item.SaleRate,
//                OpenQnty = item.OpenQnty,
//                OpenRate = item.OpenRate,
//                InActive = item.InActive
//            };
//        }

//        public int Create(ItemCreateDto dto, int branchId, int userId)
//        {
//            // Auto-generate name if not provided or empty
//            string itemName = dto.ItemName;
//            if (string.IsNullOrWhiteSpace(itemName))
//            {
//                itemName = GenerateItemName(dto.ModlNumb, dto.CompID, dto.CatgID, dto.SubcatID);
//            }

//            var item = new ItemFile
//            {
//                ItemName = itemName,
//                ModlNumb = dto.ModlNumb,
//                CompID = dto.CompID,
//                CatgID = dto.CatgID,
//                SubcatID = dto.SubcatID,
//                BranchID = branchId,
//                IsSparePart = dto.IsSparePart ?? false,
//                OpenQnty = dto.OpenQnty,
//                OpenRate = dto.OpenRate,
//                PurcRate = dto.PurcRate,
//                SaleRate = dto.SaleRate,
//                InActive = dto.InActive ?? false,
//                IsDeleted = false,
//                AddBy = userId,
//                AddOn = DateTime.Now
//            };

//            return _repo.Create(item);
//        }

//        public void Update(ItemUpdateDto dto, int branchId, int userId)
//        {
//            var existing = _repo.GetById(dto.ItemID, branchId);
//            if (existing == null)
//                throw new Exception("Item not found or access denied");

//            // Auto-generate name if user didn't provide one or it's empty
//            string itemName = dto.ItemName;
//            if (string.IsNullOrWhiteSpace(itemName))
//            {
//                itemName = GenerateItemName(dto.ModlNumb, dto.CompID, dto.CatgID, dto.SubcatID);
//            }

//            existing.ItemName = itemName;
//            existing.ModlNumb = dto.ModlNumb;
//            existing.CompID = dto.CompID;
//            existing.CatgID = dto.CatgID;
//            existing.SubcatID = dto.SubcatID;
//            existing.IsSparePart = dto.IsSparePart ?? false;
//            existing.OpenQnty = dto.OpenQnty;
//            existing.OpenRate = dto.OpenRate;
//            existing.PurcRate = dto.PurcRate;
//            existing.SaleRate = dto.SaleRate;
//            existing.InActive = dto.InActive ?? false;
//            existing.EditBy = userId;
//            existing.EditOn = DateTime.Now;

//            _repo.Update(existing);
//        }

//        public void Delete(int id, int branchId, int userId)
//        {
//            var item = _repo.GetById(id, branchId);
//            if (item == null)
//                throw new Exception("Item not found or access denied");

//            item.IsDeleted = true;
//            item.DeleteBy = userId;
//            item.DeleteOn = DateTime.Now;
//            _repo.Update(item);
//        }

//        public string GenerateItemName(string? modlNumb, int? compId, int? catgId, int? subcatId)
//        {
//            var parts = new List<string>();

//            // Add model number
//            if (!string.IsNullOrWhiteSpace(modlNumb))
//                parts.Add(modlNumb.Trim());

//            // Add company name
//            if (compId.HasValue && compId.Value > 0)
//            {
//                //var company = _compRepo.GetById(compId.Value);
//                var company = _compRepo.GetByIdOnly(compId.Value);
//                if (company != null && !string.IsNullOrWhiteSpace(company.CompName))
//                    parts.Add(company.CompName.Trim());
//            }

//            // Add category name
//            if (catgId.HasValue && catgId.Value > 0)
//            {
//                //var category = _catgRepo.GetById(catgId.Value);
//                var category = _catgRepo.GetByIdOnly(catgId.Value);
//                if (category != null && !string.IsNullOrWhiteSpace(category.CatgName))
//                    parts.Add(category.CatgName.Trim());
//            }

//            // Add subcategory name - ✅ CHANGE: Use Service
//            if (subcatId.HasValue && subcatId.Value > 0)
//            {
//                try
//                {
//                    var subcategory = _subcatService.GetByIdAsync(subcatId.Value).GetAwaiter().GetResult();
//                    if (subcategory != null && !string.IsNullOrWhiteSpace(subcategory.SubcatName))
//                        parts.Add(subcategory.SubcatName.Trim());
//                }
//                catch (Exception ex)
//                {
//                    Console.WriteLine($"Error getting subcategory: {ex.Message}");
//                }
//            }

//            // If no parts, return empty string
//            if (parts.Count == 0)
//                return string.Empty;

//            // Join with " - "
//            return string.Join(" - ", parts);
//        }
//    }
//}

using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Item;
using WMS.Api.Models;
using WMS.Api.Repositories.Interfaces;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class ItemService : IItemService
    {
        private readonly IItemRepository _repo;
        private readonly ICompFileRepository _compRepo;
        private readonly ICatgFileRepository _catgRepo;
        private readonly ISubcategoryService _subcatService;
        private readonly WmsDbContext _context;

        public ItemService(
            IItemRepository repo,
            ICompFileRepository compRepo,
            ICatgFileRepository catgRepo,
            ISubcategoryService subcatService,
            WmsDbContext context)
        {
            _repo = repo;
            _compRepo = compRepo;
            _catgRepo = catgRepo;
            _subcatService = subcatService;
            _context = context;
        }

        public List<ItemDto> GetAll(int branchId)
        {
            var items = _repo.GetAll(branchId);

            return items.Select(x => new ItemDto
            {
                ItemID = x.ItemID,
                ItemName = x.ItemName,
                ModlNumb = x.ModlNumb,
                CompanyName = _compRepo.GetByIdOnly(x.CompID ?? 0)?.CompName,
                CompID = x.CompID,
                CategoryName = _catgRepo.GetByIdOnly(x.CatgID ?? 0)?.CatgName,
                CatgID = x.CatgID,
                SubcategoryName = x.SubcatID.HasValue && x.SubcatID > 0
                    ? _context.Subcategories
                        .Where(s => s.SubcatID == x.SubcatID.Value)
                        .Select(s => s.SubcatName)
                        .FirstOrDefault()
                    : null,
                SubcatID = x.SubcatID,
                IsSparePart = x.IsSparePart,

                // ✅ FIX: Get active price from PriceHistory, fallback to ItemFile
                PurcRate = _context.ItemPriceHistory
                    .Where(p => p.ItemID == x.ItemID && p.PriceType == "PURCHASE" && p.IsActive && !p.IsDeleted)
                    .Select(p => (decimal?)p.Price)
                    .FirstOrDefault() ?? x.PurcRate,

                SaleRate = _context.ItemPriceHistory
                    .Where(p => p.ItemID == x.ItemID && p.PriceType == "SALE" && p.IsActive && !p.IsDeleted)
                    .Select(p => (decimal?)p.Price)
                    .FirstOrDefault() ?? x.SaleRate,

                OpenRate = _context.ItemPriceHistory
                    .Where(p => p.ItemID == x.ItemID && p.PriceType == "OPENING" && p.IsActive && !p.IsDeleted)
                    .Select(p => (decimal?)p.Price)
                    .FirstOrDefault() ?? x.OpenRate,

                OpenQnty = x.OpenQnty,
                InActive = x.InActive,
                BarCode = x.BarCode,
                OrdrLevl = x.OrdrLevl,
                Max_Levl = x.Max_Levl
            }).ToList();
        }

        public ItemDto? GetById(int id, int branchId)
        {
            var item = _repo.GetById(id, branchId);
            if (item == null) return null;

            return new ItemDto
            {
                ItemID = item.ItemID,
                ItemName = item.ItemName,
                ModlNumb = item.ModlNumb,
                CompanyName = _compRepo.GetByIdOnly(item.CompID ?? 0)?.CompName,
                CompID = item.CompID,
                CategoryName = _catgRepo.GetByIdOnly(item.CatgID ?? 0)?.CatgName,
                CatgID = item.CatgID,
                SubcategoryName = item.SubcatID.HasValue && item.SubcatID > 0
                    ? _context.Subcategories
                        .Where(s => s.SubcatID == item.SubcatID.Value)
                        .Select(s => s.SubcatName)
                        .FirstOrDefault()
                    : null,
                SubcatID = item.SubcatID,
                IsSparePart = item.IsSparePart,

                // ✅ FIX: Get active price from PriceHistory, fallback to ItemFile
                PurcRate = _context.ItemPriceHistory
                    .Where(p => p.ItemID == item.ItemID && p.PriceType == "PURCHASE" && p.IsActive && !p.IsDeleted)
                    .Select(p => (decimal?)p.Price)
                    .FirstOrDefault() ?? item.PurcRate,

                SaleRate = _context.ItemPriceHistory
                    .Where(p => p.ItemID == item.ItemID && p.PriceType == "SALE" && p.IsActive && !p.IsDeleted)
                    .Select(p => (decimal?)p.Price)
                    .FirstOrDefault() ?? item.SaleRate,

                OpenRate = _context.ItemPriceHistory
                    .Where(p => p.ItemID == item.ItemID && p.PriceType == "OPENING" && p.IsActive && !p.IsDeleted)
                    .Select(p => (decimal?)p.Price)
                    .FirstOrDefault() ?? item.OpenRate,

                OpenQnty = item.OpenQnty,
                InActive = item.InActive,
                BarCode = item.BarCode,
                OrdrLevl = item.OrdrLevl,
                Max_Levl = item.Max_Levl
            };
        }

        public int Create(ItemCreateDto dto, int branchId, int userId)
        {
            using var transaction = _context.Database.BeginTransaction();

            try
            {
                string itemName = dto.ItemName;
                if (string.IsNullOrWhiteSpace(itemName))
                {
                    itemName = GenerateItemName(dto.ModlNumb, dto.CompID, dto.CatgID, dto.SubcatID);
                }

                var item = new ItemFile
                {
                    ItemName = itemName,
                    ModlNumb = dto.ModlNumb,
                    CompID = dto.CompID,
                    CatgID = dto.CatgID,
                    SubcatID = dto.SubcatID,
                    BranchID = branchId,
                    IsSparePart = dto.IsSparePart ?? false,
                    OpenQnty = dto.OpenQnty,
                    OpenRate = dto.OpenRate,
                    PurcRate = dto.PurcRate,
                    SaleRate = dto.SaleRate,
                    InActive = dto.InActive ?? false,
                    BarCode = dto.BarCode,
                    OrdrLevl = dto.OrdrLevl,
                    Max_Levl = dto.Max_Levl,
                    IsDeleted = false,
                    AddBy = userId,
                    AddOn = DateTime.Now
                };

                int itemId = _repo.Create(item);

                // Add opening stock
                if (dto.OpenQnty.HasValue && dto.OpenQnty.Value > 0)
                {
                    var openingStock = new ItemStock
                    {
                        TranType = "OPENING",
                        TranNumb = itemId,
                        ItemID = itemId,
                        BranchID = branchId,
                        InQty = (double)dto.OpenQnty.Value,
                        OutQty = 0,
                        Rate = (double)(dto.OpenRate ?? dto.PurcRate ?? 0),
                        TranDate = DateTime.Now.Date,
                        Remarks = $"Opening Stock as on {DateTime.Now.Date:yyyy-MM-dd}"
                    };

                    _context.ItemStock.Add(openingStock);
                    _context.SaveChanges();
                }

                transaction.Commit();
                return itemId;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                throw new Exception($"Item creation failed: {ex.Message}");
            }
        }

        public void Update(ItemUpdateDto dto, int branchId, int userId)
        {
            var existing = _repo.GetById(dto.ItemID, branchId);
            if (existing == null)
                throw new Exception("Item not found or access denied");

            string itemName = dto.ItemName;
            if (string.IsNullOrWhiteSpace(itemName))
            {
                itemName = GenerateItemName(dto.ModlNumb, dto.CompID, dto.CatgID, dto.SubcatID);
            }

            existing.ItemName = itemName;
            existing.ModlNumb = dto.ModlNumb;
            existing.CompID = dto.CompID;
            existing.CatgID = dto.CatgID;
            existing.SubcatID = dto.SubcatID;
            existing.IsSparePart = dto.IsSparePart ?? false;
            existing.OpenQnty = dto.OpenQnty;
            existing.OpenRate = dto.OpenRate;
            existing.PurcRate = dto.PurcRate;
            existing.SaleRate = dto.SaleRate;
            existing.InActive = dto.InActive ?? false;
            existing.BarCode = dto.BarCode;
            existing.OrdrLevl = dto.OrdrLevl;
            existing.Max_Levl = dto.Max_Levl;
            existing.EditBy = userId;
            existing.EditOn = DateTime.Now;

            _repo.Update(existing);
        }

        public void Delete(int id, int branchId, int userId)
        {
            var item = _repo.GetById(id, branchId);
            if (item == null)
                throw new Exception("Item not found or access denied");

            item.IsDeleted = true;
            item.DeleteBy = userId;
            item.DeleteOn = DateTime.Now;
            _repo.Update(item);
        }

        public string GenerateItemName(string? modlNumb, int? compId, int? catgId, int? subcatId)
        {
            var parts = new List<string>();

            if (!string.IsNullOrWhiteSpace(modlNumb))
                parts.Add(modlNumb.Trim());

            if (compId.HasValue && compId.Value > 0)
            {
                var company = _compRepo.GetByIdOnly(compId.Value);
                if (company != null && !string.IsNullOrWhiteSpace(company.CompName))
                    parts.Add(company.CompName.Trim());
            }

            if (catgId.HasValue && catgId.Value > 0)
            {
                var category = _catgRepo.GetByIdOnly(catgId.Value);
                if (category != null && !string.IsNullOrWhiteSpace(category.CatgName))
                    parts.Add(category.CatgName.Trim());
            }

            if (subcatId.HasValue && subcatId.Value > 0)
            {
                // ✅ FIXED: Direct query instead of async
                try
                {
                    var subcatName = _context.Subcategories
                        .Where(s => s.SubcatID == subcatId.Value)
                        .Select(s => s.SubcatName)
                        .FirstOrDefault();

                    if (!string.IsNullOrWhiteSpace(subcatName))
                        parts.Add(subcatName.Trim());
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error getting subcategory: {ex.Message}");
                }
            }

            if (parts.Count == 0)
                return string.Empty;

            return string.Join(" - ", parts);
        }

        // Price History Methods
        public List<ItemPriceHistoryDto> GetPriceHistory(int itemId)
        {
            var history = _context.ItemPriceHistory
                .Where(x => x.ItemID == itemId && !x.IsDeleted)
                .OrderByDescending(x => x.EffectiveDate)
                .Select(x => new ItemPriceHistoryDto
                {
                    Id = x.Id,
                    ItemID = x.ItemID,
                    Price = x.Price,
                    EffectiveDate = x.EffectiveDate,
                    FormattedDate = x.EffectiveDate.ToString("dd-MM-yyyy"),
                    PriceType = x.PriceType,
                    IsActive = x.IsActive,
                    ChangeReason = x.ChangeReason,
                    AddBy = x.AddBy,
                    AddOn = x.AddOn
                })
                .ToList();

            return history;
        }

        public void AddPriceHistory(int itemId, decimal price, int userId)
        {
            var history = new ItemPriceHistory
            {
                ItemID = itemId,
                Price = price,
                PriceType = "PURCHASE",
                EffectiveDate = DateTime.Now,
                IsActive = true,
                AddBy = userId,
                AddOn = DateTime.Now
            };

            _context.ItemPriceHistory.Add(history);
            _context.SaveChanges();
        }

        // Images Methods
        public List<ItemImagesDto> GetItemImages(int itemId)
        {
            var images = _context.ItemImages
                .Where(x => x.ItemID == itemId)
                .Select(x => new ItemImagesDto
                {
                    ImageID = x.ImageID,
                    ItemID = x.ItemID,
                    ImageURL = x.ImageURL,
                    IsPrimary = x.IsPrimary
                })
                .ToList();

            return images;
        }

        public void AddItemImages(int itemId, List<string> imageUrls, int userId)
        {
            if (imageUrls == null || !imageUrls.Any()) return;

            var images = new List<ItemImages>();

            foreach (var url in imageUrls)
            {
                images.Add(new ItemImages
                {
                    ItemID = itemId,
                    ImageURL = url,
                    IsPrimary = images.Count == 0,
                    AddOn = DateTime.Now
                });
            }

            _context.ItemImages.AddRange(images);
            _context.SaveChanges();
        }

        public void DeleteItemImage(int imageId)
        {
            var image = _context.ItemImages.Find(imageId);
            if (image != null)
            {
                _context.ItemImages.Remove(image);
                _context.SaveChanges();
            }
        }

        // Godown Openings Methods
        public List<ItemGodownOpeningDto> GetGodownOpenings(int itemId)
        {
            var openings = from go in _context.ItemGodownOpening
                           join g in _context.Godowns on go.GodownID equals g.GodnID into godownJoin
                           from g in godownJoin.DefaultIfEmpty()
                           where go.ItemID == itemId
                           select new ItemGodownOpeningDto
                           {
                               Id = go.Id,
                               ItemID = go.ItemID,
                               GodownID = go.GodownID,
                               GodownName = g != null ? g.GodnName : "",
                               OpeningQty = go.OpeningQty
                           };

            return openings.ToList();
        }

        public void SaveGodownOpenings(int itemId, List<ItemGodownOpeningCreateDto> openings)
        {
            if (openings == null) return;

            // Remove existing
            var existing = _context.ItemGodownOpening.Where(x => x.ItemID == itemId).ToList();
            _context.ItemGodownOpening.RemoveRange(existing);

            // Add new (only those with quantity > 0)
            var newOpenings = openings
                .Where(o => o.OpeningQty > 0)
                .Select(o => new ItemGodownOpening
                {
                    ItemID = itemId,
                    GodownID = o.GodownID,
                    OpeningQty = o.OpeningQty,
                    AddOn = DateTime.Now
                }).ToList();

            if (newOpenings.Any())
            {
                _context.ItemGodownOpening.AddRange(newOpenings);
                _context.SaveChanges();
            }
        }
    }
}