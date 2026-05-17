using WMS.Api.Models;

namespace WMS.Api.Repositories.Interfaces
{
    public interface IItemPriceHistoryRepository
    {
        // Get Methods
        List<ItemPriceHistory> GetByItemId(int itemId);
        List<ItemPriceHistory> GetByItemAndType(int itemId, string priceType);
        ItemPriceHistory? GetActivePrice(int itemId, string priceType);
        ItemPriceHistory? GetById(int id);

        // CRUD Operations
        void Add(ItemPriceHistory history);
        void Update(ItemPriceHistory history);
        void SoftDelete(int id, int userId);

        // Activation Logic
        void ActivatePrice(int priceId, int userId);
        void DeactivateOtherPrices(int itemId, string priceType, int excludePriceId);

        // Bulk Operations
        List<ItemPriceHistory> GetActivePricesByType(string priceType);
        decimal? GetCurrentPrice(int itemId, string priceType);
    }
}