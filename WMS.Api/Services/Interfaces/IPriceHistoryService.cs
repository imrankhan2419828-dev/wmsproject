using WMS.Api.DTOs.Item;

namespace WMS.Api.Services.Interfaces
{
    public interface IPriceHistoryService
    {
        // Get Methods
        ItemPricesResponseDto GetAllItemPrices(int itemId);
        List<PriceHistoryDto> GetPriceHistoryByType(int itemId, string priceType);
        PriceHistoryDto? GetActivePrice(int itemId, string priceType);
        decimal? GetCurrentPrice(int itemId, string priceType);

        // CRUD Operations
        PriceHistoryDto AddPrice(AddPriceHistoryDto dto, int userId);
        PriceHistoryDto UpdatePrice(UpdatePriceHistoryDto dto, int userId);
        void DeletePrice(int priceId, int userId);

        // Activation
        void ActivatePrice(int priceId, int userId);

        // Migration Helper
        void MigrateExistingPrices();
    }
}
