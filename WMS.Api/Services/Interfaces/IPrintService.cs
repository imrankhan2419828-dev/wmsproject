namespace WMS.Api.Services.Interfaces
{
    public interface IPrintService
    {
        Task<string> GenerateHtmlAsync(string module, int id, int branchId);
        Task<object> GetPrintDataAsync(string module, int id, int branchId);
    }
}