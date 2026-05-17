using System.Threading.Tasks;
using WMS.Api.Models;

namespace WMS.Api.Services.Interfaces
{
    public interface ILedgerService
    {
        Task CreateReceivingLedgerAsync(ReceivingFile receiving);
        Task DeleteReceivingLedgerAsync(int receivingId);
    }
}

