namespace WMS.Api.DTOs.Payments
{
    public class PaymentItemCreateDto
    {
        // PurchaseTranNumb / ExpenseID / NULLa
        public int? BillID { get; set; }

        public int? ItemID { get; set; }   // future use

        public decimal Amount { get; set; }

        public string? Description { get; set; }
    }
}

