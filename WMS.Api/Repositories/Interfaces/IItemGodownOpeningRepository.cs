using WMS.Api.Models;

namespace WMS.Api.Repositories.Interfaces
{
    public interface IItemGodownOpeningRepository
    {
        List<ItemGodownOpening> GetByItemId(int itemId);
        void Add(ItemGodownOpening opening);
        void AddRange(List<ItemGodownOpening> openings);
        void Update(ItemGodownOpening opening);
        void DeleteByItemId(int itemId);
    }
}
