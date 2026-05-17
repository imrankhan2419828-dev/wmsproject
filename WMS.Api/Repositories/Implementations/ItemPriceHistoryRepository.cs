using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.Models;
using WMS.Api.Repositories.Interfaces;

namespace WMS.Api.Repositories.Implementations
{
    public class ItemPriceHistoryRepository : IItemPriceHistoryRepository
    {
        private readonly WmsDbContext _context;

        public ItemPriceHistoryRepository(WmsDbContext context)
        {
            _context = context;
        }

        public List<ItemPriceHistory> GetByItemId(int itemId)
        {
            return _context.ItemPriceHistory
                .Where(x => x.ItemID == itemId && !x.IsDeleted)
                .OrderByDescending(x => x.EffectiveDate)
                .ToList();
        }

        public List<ItemPriceHistory> GetByItemAndType(int itemId, string priceType)
        {
            return _context.ItemPriceHistory
                .Where(x => x.ItemID == itemId
                       && x.PriceType == priceType
                       && !x.IsDeleted)
                .OrderByDescending(x => x.EffectiveDate)
                .ToList();
        }

        public ItemPriceHistory? GetActivePrice(int itemId, string priceType)
        {
            return _context.ItemPriceHistory
                .FirstOrDefault(x => x.ItemID == itemId
                           && x.PriceType == priceType
                           && x.IsActive
                           && !x.IsDeleted);
        }

        public ItemPriceHistory? GetById(int id)
        {
            return _context.ItemPriceHistory
                .FirstOrDefault(x => x.Id == id && !x.IsDeleted);
        }

        public void Add(ItemPriceHistory history)
        {
            _context.ItemPriceHistory.Add(history);
            _context.SaveChanges();
        }

        public void Update(ItemPriceHistory history)
        {
            _context.Entry(history).State = EntityState.Modified;
            _context.SaveChanges();
        }

        public void SoftDelete(int id, int userId)
        {
            var history = GetById(id);
            if (history != null)
            {
                history.IsDeleted = true;
                history.UpdatedBy = userId;
                history.UpdatedOn = DateTime.Now;
                _context.SaveChanges();
            }
        }

        public void ActivatePrice(int priceId, int userId)
        {
            var price = GetById(priceId);
            if (price == null) return;

            // Deactivate all other prices of same type for this item
            DeactivateOtherPrices(price.ItemID, price.PriceType, priceId);

            // Activate this price
            price.IsActive = true;
            price.UpdatedBy = userId;
            price.UpdatedOn = DateTime.Now;

            // Set EffectiveDate to current if it's future dated
            if (price.EffectiveDate > DateTime.Now)
            {
                price.EffectiveDate = DateTime.Now;
            }

            _context.SaveChanges();
        }

        public void DeactivateOtherPrices(int itemId, string priceType, int excludePriceId)
        {
            var otherPrices = _context.ItemPriceHistory
                .Where(x => x.ItemID == itemId
                       && x.PriceType == priceType
                       && x.Id != excludePriceId
                       && x.IsActive
                       && !x.IsDeleted)
                .ToList();

            foreach (var price in otherPrices)
            {
                price.IsActive = false;
                price.EffectiveTo = DateTime.Now;
            }
        }

        public List<ItemPriceHistory> GetActivePricesByType(string priceType)
        {
            return _context.ItemPriceHistory
                .Where(x => x.PriceType == priceType
                       && x.IsActive
                       && !x.IsDeleted)
                .ToList();
        }

        public decimal? GetCurrentPrice(int itemId, string priceType)
        {
            var activePrice = GetActivePrice(itemId, priceType);

            if (activePrice != null)
                return activePrice.Price;

            // Fallback to ItemFile (backward compatibility)
            var item = _context.ItemFile.Find(itemId);

            return priceType switch
            {
                "OPENING" => item?.OpenRate,
                "PURCHASE" => item?.PurcRate,
                "SALE" => item?.SaleRate,
                _ => null
            };
        }
    }
}