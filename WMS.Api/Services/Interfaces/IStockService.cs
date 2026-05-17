public interface IStockService
{
    void PostPurchaseStock(int tranNumb);
    void ReversePurchaseStock(int tranNumb);

    void PostPurchaseReturnStock(int returnID);
    void ReversePurchaseReturnStock(int returnID);

    void PostSaleStock(int tranNumb);
    void ReverseSaleStock(int tranNumb);

    void PostSaleReturnStock(int returnTranNumb);
    void ReverseSaleReturnStock(int returnTranNumb);

    Task PostPurchaseStockAsync(int tranNumb);
    Task ReversePurchaseStockAsync(int tranNumb);

    Task PostSaleStockAsync(int tranNumb);
    Task ReverseSaleStockAsync(int tranNumb);

    Task PostSaleReturnStockAsync(int returnTranNumb);
    Task ReverseSaleReturnStockAsync(int returnTranNumb);

    // 🔥 ADD GetCurrentStock method
    double GetCurrentStock(int itemId, int branchId);


}

