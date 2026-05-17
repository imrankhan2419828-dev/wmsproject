using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Item;
using WMS.Api.Models;
using WMS.Api.Repositories.Interfaces;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class PriceHistoryService : IPriceHistoryService
    {
        private readonly IItemPriceHistoryRepository _priceRepo;
        private readonly IItemRepository _itemRepo;
        private readonly WmsDbContext _context;

        public PriceHistoryService(
            IItemPriceHistoryRepository priceRepo,
            IItemRepository itemRepo,
            WmsDbContext context)
        {
            _priceRepo = priceRepo;
            _itemRepo = itemRepo;
            _context = context;
        }

        public ItemPricesResponseDto GetAllItemPrices(int itemId)
        {
            var openingPrices = _priceRepo.GetByItemAndType(itemId, "OPENING")
                .Select(MapToDto).ToList();

            var purchasePrices = _priceRepo.GetByItemAndType(itemId, "PURCHASE")
                .Select(MapToDto).ToList();

            var salePrices = _priceRepo.GetByItemAndType(itemId, "SALE")
                .Select(MapToDto).ToList();

            return new ItemPricesResponseDto
            {
                OpeningPrices = openingPrices,
                PurchasePrices = purchasePrices,
                SalePrices = salePrices,
                ActiveOpeningPrice = openingPrices.FirstOrDefault(x => x.IsActive),
                ActivePurchasePrice = purchasePrices.FirstOrDefault(x => x.IsActive),
                ActiveSalePrice = salePrices.FirstOrDefault(x => x.IsActive)
            };
        }

        public List<PriceHistoryDto> GetPriceHistoryByType(int itemId, string priceType)
        {
            return _priceRepo.GetByItemAndType(itemId, priceType)
                .Select(MapToDto)
                .ToList();
        }

        public PriceHistoryDto? GetActivePrice(int itemId, string priceType)
        {
            var activePrice = _priceRepo.GetActivePrice(itemId, priceType);
            return activePrice != null ? MapToDto(activePrice) : null;
        }

        public decimal? GetCurrentPrice(int itemId, string priceType)
        {
            return _priceRepo.GetCurrentPrice(itemId, priceType);
        }

        public PriceHistoryDto AddPrice(AddPriceHistoryDto dto, int userId)
        {
            // Validation
            if (dto.Price <= 0)
                throw new Exception("Price must be greater than 0");

            var effectiveDate = dto.EffectiveDate ?? DateTime.Now;

            // For OPENING type, check if already exists
            if (dto.PriceType == "OPENING")
            {
                var existingOpening = _priceRepo.GetActivePrice(dto.ItemID, "OPENING");
                if (existingOpening != null)
                {
                    throw new Exception("Opening price already exists. Please update the existing one.");
                }
            }

            var priceHistory = new ItemPriceHistory
            {
                ItemID = dto.ItemID,
                Price = dto.Price,
                PriceType = dto.PriceType,
                EffectiveDate = effectiveDate,
                IsActive = dto.ActivateImmediately,
                ChangeReason = dto.ChangeReason,
                AddBy = userId,
                AddOn = DateTime.Now
            };

            // If activating immediately, deactivate others
            if (dto.ActivateImmediately && dto.PriceType != "OPENING")
            {
                _priceRepo.DeactivateOtherPrices(dto.ItemID, dto.PriceType, 0);
            }

            _priceRepo.Add(priceHistory);

            return MapToDto(priceHistory);
        }

        public PriceHistoryDto UpdatePrice(UpdatePriceHistoryDto dto, int userId)
        {
            var existingPrice = _priceRepo.GetById(dto.Id);
            if (existingPrice == null)
                throw new Exception("Price history not found");

            // Validate opening price
            if (existingPrice.PriceType == "OPENING")
            {
                // Direct update for opening price (no new record)
                existingPrice.Price = dto.Price;
                existingPrice.ChangeReason = dto.ChangeReason;
                existingPrice.UpdatedBy = userId;
                existingPrice.UpdatedOn = DateTime.Now;
                _priceRepo.Update(existingPrice);
                return MapToDto(existingPrice);
            }

            // For PURCHASE and SALE: Create new record
            var newPrice = new ItemPriceHistory
            {
                ItemID = existingPrice.ItemID,
                Price = dto.Price,
                PriceType = existingPrice.PriceType,
                EffectiveDate = DateTime.Now,
                IsActive = true,
                ChangeReason = dto.ChangeReason ?? $"Updated from price ID: {dto.Id}",
                AddBy = userId,
                AddOn = DateTime.Now
            };

            // Deactivate old price
            existingPrice.IsActive = false;
            existingPrice.EffectiveTo = DateTime.Now;
            existingPrice.UpdatedBy = userId;
            existingPrice.UpdatedOn = DateTime.Now;

            // Deactivate other prices
            _priceRepo.DeactivateOtherPrices(existingPrice.ItemID, existingPrice.PriceType, 0);

            _priceRepo.Update(existingPrice);
            _priceRepo.Add(newPrice);

            return MapToDto(newPrice);
        }

        public void DeletePrice(int priceId, int userId)
        {
            var price = _priceRepo.GetById(priceId);
            if (price == null)
                throw new Exception("Price history not found");

            // Don't allow deleting opening price
            if (price.PriceType == "OPENING" && price.IsActive)
            {
                throw new Exception("Cannot delete active opening price");
            }

            _priceRepo.SoftDelete(priceId, userId);
        }

        public void ActivatePrice(int priceId, int userId)
        {
            var price = _priceRepo.GetById(priceId);
            if (price == null)
                throw new Exception("Price history not found");

            if (price.PriceType == "OPENING")
            {
                throw new Exception("Opening price is always active");
            }

            _priceRepo.ActivatePrice(priceId, userId);
        }

        public void MigrateExistingPrices()
        {
            var items = _itemRepo.GetAll(0); // Get all items regardless of branch

            foreach (var item in items)
            {
                // Migrate Opening Price
                if (item.OpenRate > 0)
                {
                    var existingOpening = _priceRepo.GetActivePrice(item.ItemID, "OPENING");
                    if (existingOpening == null)
                    {
                        _priceRepo.Add(new ItemPriceHistory
                        {
                            ItemID = item.ItemID,
                            Price = item.OpenRate ?? 0,
                            PriceType = "OPENING",
                            EffectiveDate = item.AddOn ?? DateTime.Now,
                            IsActive = true,
                            ChangeReason = "Migrated from ItemFile",
                            AddBy = item.AddBy,
                            AddOn = DateTime.Now
                        });
                    }
                }

                // Migrate Purchase Price
                if (item.PurcRate > 0)
                {
                    var existingPurchase = _priceRepo.GetActivePrice(item.ItemID, "PURCHASE");
                    if (existingPurchase == null)
                    {
                        _priceRepo.Add(new ItemPriceHistory
                        {
                            ItemID = item.ItemID,
                            Price = item.PurcRate ?? 0,
                            PriceType = "PURCHASE",
                            EffectiveDate = item.AddOn ?? DateTime.Now,
                            IsActive = true,
                            ChangeReason = "Migrated from ItemFile",
                            AddBy = item.AddBy,
                            AddOn = DateTime.Now
                        });
                    }
                }

                // Migrate Sale Price
                if (item.SaleRate > 0)
                {
                    var existingSale = _priceRepo.GetActivePrice(item.ItemID, "SALE");
                    if (existingSale == null)
                    {
                        _priceRepo.Add(new ItemPriceHistory
                        {
                            ItemID = item.ItemID,
                            Price = item.SaleRate ?? 0,
                            PriceType = "SALE",
                            EffectiveDate = item.AddOn ?? DateTime.Now,
                            IsActive = true,
                            ChangeReason = "Migrated from ItemFile",
                            AddBy = item.AddBy,
                            AddOn = DateTime.Now
                        });
                    }
                }
            }
        }

        private PriceHistoryDto MapToDto(ItemPriceHistory history)
        {
            return new PriceHistoryDto
            {
                Id = history.Id,
                ItemID = history.ItemID,
                Price = history.Price,
                PriceType = history.PriceType,
                EffectiveDate = history.EffectiveDate,
                FormattedDate = history.EffectiveDate.ToString("dd-MMM-yyyy HH:mm"),
                IsActive = history.IsActive,
                ChangeReason = history.ChangeReason,
                AddBy = history.AddBy,
                AddOn = history.AddOn
            };
        }
    }
}
