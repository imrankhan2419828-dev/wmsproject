//using WMS.Api.DTOs.Item;

//namespace WMS.Api.Services.Interfaces
//{
//    public interface IItemService
//    {
//        List<ItemDto> GetAll();
//        void Create(ItemCreateDto dto);
//        void Update(ItemUpdateDto dto);
//        void Delete(int id);
//    }
//}

using WMS.Api.DTOs.Item;

namespace WMS.Api.Services.Interfaces
{
    public interface IItemService
    {
        // Basic CRUD
        List<ItemDto> GetAll(int branchId);
        ItemDto? GetById(int id, int branchId);
        int Create(ItemCreateDto dto, int branchId, int userId);
        void Update(ItemUpdateDto dto, int branchId, int userId);
        void Delete(int id, int branchId, int userId);
        string GenerateItemName(string? modlNumb, int? compId, int? catgId, int? subcatId);

        // Price History
        List<ItemPriceHistoryDto> GetPriceHistory(int itemId);
        void AddPriceHistory(int itemId, decimal price, int userId);

        // Images
        List<ItemImagesDto> GetItemImages(int itemId);
        void AddItemImages(int itemId, List<string> imageUrls, int userId);
        void DeleteItemImage(int imageId);

        // Godown Openings
        List<ItemGodownOpeningDto> GetGodownOpenings(int itemId);
        void SaveGodownOpenings(int itemId, List<ItemGodownOpeningCreateDto> openings);
    }
}