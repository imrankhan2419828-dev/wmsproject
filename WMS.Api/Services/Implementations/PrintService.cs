using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class PrintService : IPrintService
    {
        private readonly WmsDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public PrintService(WmsDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        // ==================== HTML ====================
        public async Task<string> GenerateHtmlAsync(string module, int id, int branchId)
        {
            return module.ToLower() switch
            {
                "purchase" => await GeneratePurchaseHtmlAsync(id, branchId),
                "purchasereturn" => await GeneratePurchaseReturnHtmlAsync(id, branchId),
                "sale" => await GenerateSaleHtmlAsync(id, branchId),
                "salereturn" => await GenerateSaleReturnHtmlAsync(id, branchId),
                "receiving" => await GenerateReceivingHtmlAsync(id, branchId),
                "payment" => await GeneratePaymentHtmlAsync(id, branchId),
                _ => throw new Exception($"Unknown module: {module}")
            };
        }

        // ==================== EXCEL DATA ====================
        public async Task<object> GetPrintDataAsync(string module, int id, int branchId)
        {
            return module.ToLower() switch
            {
                "purchase" => await GetPurchaseDataAsync(id),
                "purchasereturn" => await GetPurchaseReturnDataAsync(id),
                "sale" => await GetSaleDataAsync(id),
                "salereturn" => await GetSaleReturnDataAsync(id),
                "receiving" => await GetReceivingDataAsync(id),
                "payment" => await GetPaymentDataAsync(id),
                _ => throw new Exception($"Unknown module: {module}")
            };
        }

        // ==================== HELPER ====================
        private string GetCurrentUserName()
        {
            try
            {
                return _httpContextAccessor?.HttpContext?.User?.Identity?.Name ?? "System";
            }
            catch { return "System"; }
        }

        private string GetCurrentDateTime() => DateTime.Now.ToString("dd-MMM-yyyy hh:mm tt");

        private string Css() => @"
        @page { size: A4; margin: 5mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #333; }
        .slip-container { max-width: 148mm; margin: 0 auto; padding: 5mm; border: 1px solid #ddd; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 10px; }
        .header h2 { font-size: 16px; }
        .title { text-align: center; font-size: 14px; font-weight: bold; margin: 8px 0; padding: 5px; background: #f5f5f5; }
        .info-row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 10px; }
        .info-row span { font-weight: bold; min-width: 80px; }
        table { width: 100%; border-collapse: collapse; margin: 8px 0; }
        th { background: #f0f0f0; padding: 5px; font-size: 10px; text-align: left; border-top: 2px solid #333; border-bottom: 2px solid #333; }
        td { padding: 4px 5px; border-bottom: 1px solid #ddd; font-size: 10px; }
        .text-right { text-align: right; } .text-center { text-align: center; }
        .total-row { font-weight: bold; background: #f9f9f9; } .total-row td { border-top: 2px solid #333; }
        .footer { margin-top: 15px; font-size: 9px; color: #777; border-top: 1px solid #ddd; padding-top: 8px; display: flex; justify-content: space-between; }
        .signature { display: flex; justify-content: space-between; margin-top: 20px; }
        .signature-line { width: 120px; border-top: 1px solid #333; text-align: center; font-size: 9px; padding-top: 3px; }
    ";

        // ==================== PURCHASE HTML ====================
        private async Task<string> GeneratePurchaseHtmlAsync(int tranNumb, int branchId)
        {
            var p = await _context.PurcFile.FirstOrDefaultAsync(x => x.TranNumb == tranNumb);
            if (p == null) throw new Exception("Not found");
            var items = await _context.PurcFild.Where(x => x.TranNumb == tranNumb)
                .Join(_context.ItemFile, d => d.ItemID, i => i.ItemID, (d, i) => new { d, i }).ToListAsync();
            var supp = await _context.tblCOA.FirstOrDefaultAsync(x => x.acctID == p.SuppID);
            var branch = await _context.Branches.FirstOrDefaultAsync(b => b.BranchID == branchId);
            string u = GetCurrentUserName(), dt = GetCurrentDateTime(), bn = branch?.BranchName ?? "Main Branch";
            double tq = items.Sum(x => x.d.PurcQnty), ta = items.Sum(x => x.d.PurcQnty * x.d.PurcRate);

            return $"<html><head><style>{Css()}</style></head><body><div class='slip-container'>" +
                $"<div class='header'><h2>{bn}</h2><div>Auto Workshop</div><div style='font-size:9px;color:#777'>{dt}</div></div>" +
                $"<div class='title'>PURCHASE INVOICE</div>" +
                $"<div class='info-row'><span>Bill #:</span> {p.BillNumb}</div>" +
                $"<div class='info-row'><span>Date:</span> {p.TranDate:dd-MMM-yyyy}</div>" +
                $"<div class='info-row'><span>Supplier:</span> {supp?.AcctName ?? "N/A"}</div>" +
                $"<table><thead><tr><th>Item</th><th class='text-center'>Qty</th><th class='text-right'>Rate</th><th class='text-right'>Amount</th></tr></thead><tbody>" +
                string.Join("", items.Select(x => $"<tr><td>{x.i.ItemName}</td><td class='text-center'>{x.d.PurcQnty:N0}</td><td class='text-right'>{x.d.PurcRate:N2}</td><td class='text-right'>{(x.d.PurcQnty * x.d.PurcRate):N2}</td></tr>")) +
                $"<tr class='total-row'><td><b>Total</b></td><td class='text-center'><b>{tq:N0}</b></td><td></td><td class='text-right'><b>{ta:N2}</b></td></tr></tbody></table>" +
                $"<div class='signature'><div class='signature-line'>Prepared By</div><div class='signature-line'>Authorized By</div></div>" +
                $"<div class='footer'><div>Printed by: {u}</div><div>{dt}</div></div></div></body></html>";
        }

        // ==================== PURCHASE RETURN HTML ====================
        private async Task<string> GeneratePurchaseReturnHtmlAsync(int returnId, int branchId)
        {
            var pr = await _context.PurchaseReturn.Include(x => x.Items).FirstOrDefaultAsync(x => x.ReturnID == returnId);
            if (pr == null) throw new Exception("Not found");
            var supp = await _context.tblCOA.FirstOrDefaultAsync(x => x.acctID == pr.SuppID);
            var branch = await _context.Branches.FirstOrDefaultAsync(b => b.BranchID == branchId);
            string u = GetCurrentUserName(), dt = GetCurrentDateTime(), bn = branch?.BranchName ?? "Main Branch";
            var rows = new List<string>();
            foreach (var item in pr.Items)
            {
                var nm = await _context.ItemFile.Where(i => i.ItemID == item.ItemID).Select(i => i.ItemName).FirstOrDefaultAsync();
                rows.Add($"<tr><td>{nm}</td><td class='text-center'>{item.ReturnQty}</td><td class='text-right'>{item.PurcRate:N2}</td><td class='text-right'>{(item.ReturnQty * item.PurcRate):N2}</td></tr>");
            }
            double ta = pr.Items.Sum(x => (double)(x.ReturnQty * x.PurcRate));
            return $"<html><head><style>{Css()}</style></head><body><div class='slip-container'>" +
                $"<div class='header'><h2>{bn}</h2><div>Auto Workshop</div><div style='font-size:9px;color:#777'>{dt}</div></div>" +
                $"<div class='title'>PURCHASE RETURN</div>" +
                $"<div class='info-row'><span>Bill #:</span> {pr.BillNumb}</div>" +
                $"<div class='info-row'><span>Date:</span> {pr.TranDate:dd-MMM-yyyy}</div>" +
                $"<div class='info-row'><span>Supplier:</span> {supp?.AcctName ?? "N/A"}</div>" +
                $"<table><thead><tr><th>Item</th><th class='text-center'>Qty</th><th class='text-right'>Rate</th><th class='text-right'>Amount</th></tr></thead><tbody>" +
                string.Join("", rows) +
                $"<tr class='total-row'><td><b>Total</b></td><td></td><td></td><td class='text-right'><b>{ta:N2}</b></td></tr></tbody></table>" +
                $"<div class='signature'><div class='signature-line'>Prepared By</div><div class='signature-line'>Authorized By</div></div>" +
                $"<div class='footer'><div>Printed by: {u}</div><div>{dt}</div></div></div></body></html>";
        }

        // ==================== SALE HTML ====================
        private async Task<string> GenerateSaleHtmlAsync(int tranNumb, int branchId)
        {
            var s = await _context.SaleFiles.FirstOrDefaultAsync(x => x.TranNumb == tranNumb);
            if (s == null) throw new Exception("Not found");
            var items = await _context.SaleFilds.Where(x => x.TranNumb == tranNumb)
                .Join(_context.ItemFile, d => d.ItemID, i => i.ItemID, (d, i) => new { d, i }).ToListAsync();
            var branch = await _context.Branches.FirstOrDefaultAsync(b => b.BranchID == branchId);
            string u = GetCurrentUserName(), dt = GetCurrentDateTime(), bn = branch?.BranchName ?? "Main Branch";
            double tq = items.Sum(x => (double)(x.d.SaleQnty ?? 0)), ta = items.Sum(x => (double)((x.d.SaleQnty ?? 0) * (x.d.SaleRate ?? 0)));

            // ✅ FIX: Direct CustName from SaleFile
            string customer = !string.IsNullOrEmpty(s.CustName) ? s.CustName :
                              !string.IsNullOrEmpty(s.WalkingCustomer) ? s.WalkingCustomer : "Cash Customer";

            return $"<html><head><style>{Css()}</style></head><body><div class='slip-container'>" +
                $"<div class='header'><h2>{bn}</h2><div>Auto Workshop</div><div style='font-size:9px;color:#777'>{dt}</div></div>" +
                $"<div class='title'>SALE INVOICE</div>" +
                $"<div class='info-row'><span>Invoice #:</span> {s.BillNumb}</div>" +
                $"<div class='info-row'><span>Date:</span> {s.TranDate:dd-MMM-yyyy}</div>" +
                $"<div class='info-row'><span>Customer:</span> {customer}</div>" +  // ✅ FIXED
                $"<table><thead><tr><th>Item</th><th class='text-center'>Qty</th><th class='text-right'>Rate</th><th class='text-right'>Amount</th></tr></thead><tbody>" +
                string.Join("", items.Select(x => $"<tr><td>{x.i.ItemName}</td><td class='text-center'>{x.d.SaleQnty:N0}</td><td class='text-right'>{x.d.SaleRate:N2}</td><td class='text-right'>{(x.d.SaleQnty * x.d.SaleRate):N2}</td></tr>")) +
                $"<tr class='total-row'><td><b>Total</b></td><td class='text-center'><b>{tq:N0}</b></td><td></td><td class='text-right'><b>{ta:N2}</b></td></tr></tbody></table>" +
                $"<div class='signature'><div class='signature-line'>Prepared By</div><div class='signature-line'>Customer</div></div>" +
                $"<div class='footer'><div>Printed by: {u}</div><div>{dt}</div></div></div></body></html>";
        }

        // ==================== SALE RETURN HTML ====================
        private async Task<string> GenerateSaleReturnHtmlAsync(int returnTranNumb, int branchId)
        {
            var sr = await _context.SaleReturnFiles.Include(x => x.Items).FirstOrDefaultAsync(x => x.ReturnTranNumb == returnTranNumb);
            if (sr == null) throw new Exception("Not found");
            var cust = await _context.tblCOA.FirstOrDefaultAsync(x => x.acctID == sr.CustID);
            var branch = await _context.Branches.FirstOrDefaultAsync(b => b.BranchID == branchId);
            string u = GetCurrentUserName(), dt = GetCurrentDateTime(), bn = branch?.BranchName ?? "Main Branch";
            var rows = new List<string>();
            foreach (var item in sr.Items)
            {
                var nm = await _context.ItemFile.Where(i => i.ItemID == item.ItemID).Select(i => i.ItemName).FirstOrDefaultAsync();
                rows.Add($"<tr><td>{nm}</td><td class='text-center'>{item.ReturnQnty}</td><td class='text-right'>{item.Rate:N2}</td><td class='text-right'>{item.Amount:N2}</td></tr>");
            }
            return $"<html><head><style>{Css()}</style></head><body><div class='slip-container'>" +
                $"<div class='header'><h2>{bn}</h2><div>Auto Workshop</div><div style='font-size:9px;color:#777'>{dt}</div></div>" +
                $"<div class='title'>SALE RETURN</div>" +
                $"<div class='info-row'><span>Bill #:</span> {sr.BillNumb}</div>" +
                $"<div class='info-row'><span>Date:</span> {sr.TranDate:dd-MMM-yyyy}</div>" +
                $"<div class='info-row'><span>Customer:</span> {sr.WalkingCustomer ?? cust?.AcctName ?? sr.CustName ?? "Cash"}</div>" +
                $"<table><thead><tr><th>Item</th><th class='text-center'>Qty</th><th class='text-right'>Rate</th><th class='text-right'>Amount</th></tr></thead><tbody>" +
                string.Join("", rows) +
                $"<tr class='total-row'><td><b>Total</b></td><td></td><td></td><td class='text-right'><b>{sr.TotlAmnt:N2}</b></td></tr></tbody></table>" +
                $"<div class='signature'><div class='signature-line'>Prepared By</div><div class='signature-line'>Customer</div></div>" +
                $"<div class='footer'><div>Printed by: {u}</div><div>{dt}</div></div></div></body></html>";
        }

        // ==================== RECEIVING HTML ====================
        private async Task<string> GenerateReceivingHtmlAsync(int id, int branchId)
        {
            var rec = await _context.ReceivingFiles.Include(x => x.CashList).Include(x => x.ChequeList).FirstOrDefaultAsync(x => x.Id == id);
            if (rec == null) throw new Exception("Not found");
            var branch = await _context.Branches.FirstOrDefaultAsync(b => b.BranchID == branchId);
            string u = GetCurrentUserName(), dt = GetCurrentDateTime(), bn = branch?.BranchName ?? "Main Branch";

            // ✅ FIX: Get party name from COA if PartyId exists
            string party = rec.WalkingCustomer;
            if (string.IsNullOrEmpty(party) && !string.IsNullOrEmpty(rec.PartyName))
                party = rec.PartyName;
            if (string.IsNullOrEmpty(party) && rec.PartyId > 0)
            {
                var partyAcc = await _context.tblCOA.FirstOrDefaultAsync(x => x.acctID == rec.PartyId);
                party = partyAcc?.AcctName;
            }
            if (string.IsNullOrEmpty(party))
                party = "N/A";

            var rows = new List<string>();
            foreach (var c in rec.CashList) rows.Add($"<tr><td>Cash</td><td>-</td><td class='text-right'>{c.Amount:N2}</td></tr>");
            foreach (var cq in rec.ChequeList) rows.Add($"<tr><td>Cheque</td><td>{cq.BankName} | #{cq.ChequeNumber}</td><td class='text-right'>{cq.Amount:N2}</td></tr>");

            return $"<html><head><style>{Css()}</style></head><body><div class='slip-container'>" +
                $"<div class='header'><h2>{bn}</h2><div>Auto Workshop</div><div style='font-size:9px;color:#777'>{dt}</div></div>" +
                $"<div class='title'>RECEIPT</div>" +
                $"<div class='info-row'><span>Receipt #:</span> {rec.VoucherNumb}</div>" +
                $"<div class='info-row'><span>Date:</span> {rec.ReceiveDate:dd-MMM-yyyy}</div>" +
                $"<div class='info-row'><span>From:</span> {party}</div>" +  // ✅ FIXED
                $"<table><thead><tr><th>Mode</th><th>Details</th><th class='text-right'>Amount</th></tr></thead><tbody>" +
                string.Join("", rows) +
                $"<tr class='total-row'><td><b>Total</b></td><td></td><td class='text-right'><b>{rec.TotalAmount:N2}</b></td></tr></tbody></table>" +
                $"<div class='signature'><div class='signature-line'>Received By</div><div class='signature-line'>Paid By</div></div>" +
                $"<div class='footer'><div>Printed by: {u}</div><div>{dt}</div></div></div></body></html>";
        }

        // ==================== PAYMENT HTML ====================
        private async Task<string> GeneratePaymentHtmlAsync(int paymentId, int branchId)
        {
            var pay = await _context.PaymentFiles.FirstOrDefaultAsync(x => x.PaymentID == paymentId);
            if (pay == null) throw new Exception("Not found");
            var details = await _context.PaymentDetails.Where(x => x.PaymentID == paymentId).ToListAsync();
            var branch = await _context.Branches.FirstOrDefaultAsync(b => b.BranchID == branchId);
            string u = GetCurrentUserName(), dt = GetCurrentDateTime(), bn = branch?.BranchName ?? "Main Branch";
            var rows = details.Select(d => $"<tr><td>{(d.PaymentMode == "CASH" ? "Cash" : d.PaymentMode == "BANK" ? "Bank" : "Cheque")}</td><td>{(d.PaymentMode == "CHEQUE" ? $"#{d.ChequeNo}" : "-")}</td><td class='text-right'>{d.Amount:N2}</td></tr>");
            return $"<html><head><style>{Css()}</style></head><body><div class='slip-container'>" +
                $"<div class='header'><h2>{bn}</h2><div>Auto Workshop</div><div style='font-size:9px;color:#777'>{dt}</div></div>" +
                $"<div class='title'>PAYMENT VOUCHER</div>" +
                $"<div class='info-row'><span>Voucher #:</span> {pay.VoucherNumb}</div>" +
                $"<div class='info-row'><span>Date:</span> {pay.PaymentDate:dd-MMM-yyyy}</div>" +
                $"<div class='info-row'><span>Paid To:</span> {pay.ReferenceName ?? "N/A"}</div>" +
                $"<table><thead><tr><th>Mode</th><th>Details</th><th class='text-right'>Amount</th></tr></thead><tbody>" +
                string.Join("", rows) +
                $"<tr class='total-row'><td><b>Total</b></td><td></td><td class='text-right'><b>{pay.Amount:N2}</b></td></tr></tbody></table>" +
                $"<div class='signature'><div class='signature-line'>Paid By</div><div class='signature-line'>Received By</div></div>" +
                $"<div class='footer'><div>Printed by: {u}</div><div>{dt}</div></div></div></body></html>";
        }

        // ==================== EXCEL DATA METHODS ====================
        private async Task<object> GetPurchaseDataAsync(int id)
        {
            var p = await _context.PurcFile.FirstOrDefaultAsync(x => x.TranNumb == id);
            var items = await _context.PurcFild.Where(x => x.TranNumb == id).Join(_context.ItemFile, d => d.ItemID, i => i.ItemID, (d, i) => new { d, i }).ToListAsync();
            var supp = await _context.tblCOA.FirstOrDefaultAsync(x => x.acctID == p.SuppID);
            return new { title = "PURCHASE INVOICE", date = p.TranDate?.ToString("dd-MMM-yyyy"), partyLabel = "Supplier", partyName = supp?.AcctName ?? "N/A", billNumber = p.BillNumb, headers = new[] { "Item", "Qty", "Rate", "Amount" }, rows = items.Select(x => new object[] { x.i.ItemName, x.d.PurcQnty, x.d.PurcRate, x.d.PurcQnty * x.d.PurcRate }).ToList(), totalLabel = "Total", totalAmount = items.Sum(x => x.d.PurcQnty * x.d.PurcRate).ToString("N2") };
        }

        private async Task<object> GetPurchaseReturnDataAsync(int id)
        {
            var pr = await _context.PurchaseReturn.Include(x => x.Items).FirstOrDefaultAsync(x => x.ReturnID == id);
            var supp = await _context.tblCOA.FirstOrDefaultAsync(x => x.acctID == pr.SuppID);
            var rows = new List<object[]>(); foreach (var item in pr.Items) { var nm = await _context.ItemFile.Where(i => i.ItemID == item.ItemID).Select(i => i.ItemName).FirstOrDefaultAsync(); rows.Add(new object[] { nm, item.ReturnQty, item.PurcRate, item.ReturnQty * item.PurcRate }); }
            return new { title = "PURCHASE RETURN", date = pr.TranDate.ToString("dd-MMM-yyyy"), partyLabel = "Supplier", partyName = supp?.AcctName ?? "N/A", billNumber = pr.BillNumb, headers = new[] { "Item", "Qty", "Rate", "Amount" }, rows, totalLabel = "Total", totalAmount = pr.Items.Sum(x => (x.ReturnQty * x.PurcRate)).ToString("N2") };
        }

        private async Task<object> GetSaleDataAsync(int id)
        {
            var s = await _context.SaleFiles.FirstOrDefaultAsync(x => x.TranNumb == id);
            var items = await _context.SaleFilds.Where(x => x.TranNumb == id).Join(_context.ItemFile, d => d.ItemID, i => i.ItemID, (d, i) => new { d, i }).ToListAsync();
            var cust = await _context.tblCOA.FirstOrDefaultAsync(x => x.acctID == s.CustID);
            return new { title = "SALE INVOICE", date = s.TranDate?.ToString("dd-MMM-yyyy"), partyLabel = "Customer", partyName = s.WalkingCustomer ?? cust?.AcctName ?? "Cash", billNumber = s.BillNumb, headers = new[] { "Item", "Qty", "Rate", "Amount" }, rows = items.Select(x => new object[] { x.i.ItemName, x.d.SaleQnty, x.d.SaleRate, (x.d.SaleQnty ?? 0) * (x.d.SaleRate ?? 0) }).ToList(), totalLabel = "Total", totalAmount = items.Sum(x => (x.d.SaleQnty ?? 0) * (x.d.SaleRate ?? 0)).ToString("N2") };
        }

        private async Task<object> GetSaleReturnDataAsync(int id)
        {
            var sr = await _context.SaleReturnFiles.Include(x => x.Items).FirstOrDefaultAsync(x => x.ReturnTranNumb == id);
            var cust = await _context.tblCOA.FirstOrDefaultAsync(x => x.acctID == sr.CustID);
            var rows = new List<object[]>(); foreach (var item in sr.Items) { var nm = await _context.ItemFile.Where(i => i.ItemID == item.ItemID).Select(i => i.ItemName).FirstOrDefaultAsync(); rows.Add(new object[] { nm, item.ReturnQnty, item.Rate, item.Amount }); }
            return new { title = "SALE RETURN", date = sr.TranDate?.ToString("dd-MMM-yyyy"), partyLabel = "Customer", partyName = sr.WalkingCustomer ?? cust?.AcctName ?? "Cash", billNumber = sr.BillNumb, headers = new[] { "Item", "Qty", "Rate", "Amount" }, rows, totalLabel = "Total", totalAmount = sr.TotlAmnt.ToString("N2") };
        }

        private async Task<object> GetReceivingDataAsync(int id)
        {
            var rec = await _context.ReceivingFiles.Include(x => x.CashList).Include(x => x.ChequeList).FirstOrDefaultAsync(x => x.Id == id);
            var rows = new List<object[]>(); foreach (var c in rec.CashList) rows.Add(new object[] { "Cash", "-", c.Amount }); foreach (var cq in rec.ChequeList) rows.Add(new object[] { "Cheque", $"{cq.BankName} | #{cq.ChequeNumber}", cq.Amount });
            return new { title = "RECEIPT", date = rec.ReceiveDate.ToString("dd-MMM-yyyy"), partyLabel = "From", partyName = rec.WalkingCustomer ?? rec.PartyName ?? "N/A", billNumber = rec.VoucherNumb, headers = new[] { "Mode", "Details", "Amount" }, rows, totalLabel = "Total", totalAmount = rec.TotalAmount.ToString("N2") };
        }

        private async Task<object> GetPaymentDataAsync(int id)
        {
            var pay = await _context.PaymentFiles.FirstOrDefaultAsync(x => x.PaymentID == id);
            var details = await _context.PaymentDetails.Where(x => x.PaymentID == id).ToListAsync();
            return new { title = "PAYMENT VOUCHER", date = pay.PaymentDate.ToString("dd-MMM-yyyy"), partyLabel = "Paid To", partyName = pay.ReferenceName ?? "N/A", billNumber = pay.VoucherNumb, headers = new[] { "Mode", "Details", "Amount" }, rows = details.Select(d => new object[] { d.PaymentMode, d.ChequeNo ?? "-", d.Amount }).ToList(), totalLabel = "Total", totalAmount = pay.Amount.ToString("N2") };
        }
    }
}