using WMS.Api.Models;

namespace WMS.Api.Repositories.Interfaces
{
    public interface IItemImagesRepository
    {
        List<ItemImages> GetByItemId(int itemId);
        void Add(ItemImages image);
        void AddRange(List<ItemImages> images);
        void Delete(int imageId);
        void SetPrimary(int imageId, int itemId);
    }
}
