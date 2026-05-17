using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Reports;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class ReportService : IReportService
    {
        private readonly WmsDbContext _context;

        public ReportService(WmsDbContext context)
        {
            _context = context;
        }


        public async Task<GeneralLedgerDto> GetGeneralLedgerAsync(ReportFilterDto filter, int branchId)
        {
            var fromDate = filter.FromDate ?? DateTime.Now.AddMonths(-1);
            var toDate = filter.ToDate ?? DateTime.Now;
            var toDateEnd = toDate.Date.AddDays(1).AddSeconds(-1);

            var account = await _context.tblCOA
                .FirstOrDefaultAsync(x => x.acctID == filter.AccountId && x.BranchID == branchId);

            if (account == null)
                throw new Exception("Account not found in this branch");

            bool isDebitNormal = account.NormalSide == "Dr";
            decimal coaOpenAmnt = account.OpenAmnt ?? 0;

            // Opening balance from ledger (before fromDate)
            var openingDebit = await _context.LedgerEntries
                .Where(x => x.AccountID == filter.AccountId && x.BranchID == branchId && x.EntryDate < fromDate)
                .SumAsync(x => (decimal?)x.Debit) ?? 0;

            var openingCredit = await _context.LedgerEntries
                .Where(x => x.AccountID == filter.AccountId && x.BranchID == branchId && x.EntryDate < fromDate)
                .SumAsync(x => (decimal?)x.Credit) ?? 0;

            decimal openingBalanceValue;
            string openingBalanceType;

            if (isDebitNormal)
            {
                openingBalanceValue = coaOpenAmnt + (openingDebit - openingCredit);
                openingBalanceType = openingBalanceValue >= 0 ? "Dr" : "Cr";
            }
            else
            {
                openingBalanceValue = coaOpenAmnt + (openingCredit - openingDebit);
                openingBalanceType = openingBalanceValue >= 0 ? "Cr" : "Dr";
            }
            openingBalanceValue = Math.Abs(openingBalanceValue);

            // ✅ Get transactions — EXCLUDE Opening Balance entries
            var transactionsList = await _context.LedgerEntries
                .Where(x => x.AccountID == filter.AccountId && x.BranchID == branchId
                            && x.EntryDate >= fromDate && x.EntryDate <= toDateEnd
                            && !x.Description.StartsWith("Opening Balance"))
                .OrderBy(x => x.EntryDate)
                .ToListAsync();

            var transactions = new List<LedgerTransactionDto>();
            decimal runningBalance = isDebitNormal
                ? coaOpenAmnt + (openingDebit - openingCredit)
                : coaOpenAmnt + (openingCredit - openingDebit);

            foreach (var t in transactionsList)
            {
                if (isDebitNormal)
                    runningBalance += t.Debit - t.Credit;
                else
                    runningBalance += t.Credit - t.Debit;

                // Get actual voucher number
                string voucherNo = "-";
                if (t.PaymentID.HasValue)
                {
                    var payment = await _context.PaymentFiles.FirstOrDefaultAsync(x => x.PaymentID == t.PaymentID);
                    voucherNo = payment?.VoucherNumb ?? $"PAY-{t.PaymentID}";
                }
                else if (t.ReceivingID.HasValue)
                {
                    var acctTran = await _context.AcctTran.FirstOrDefaultAsync(x => x.AcctTranID == t.ReceivingID);
                    voucherNo = acctTran?.VochNumb?.ToString() ?? $"VCH-{t.ReceivingID}";
                }

                transactions.Add(new LedgerTransactionDto
                {
                    TransactionDate = t.EntryDate,
                    VoucherNo = voucherNo,
                    VoucherType = t.PaymentID != null ? "PV" : (t.ReceivingID != null ? "RV" : ""),
                    Description = t.Description ?? "",
                    Debit = t.Debit,
                    Credit = t.Credit,
                    Balance = Math.Abs(runningBalance)
                });
            }

            decimal closingBalanceValue = Math.Abs(runningBalance);
            string closingBalanceType;

            if (isDebitNormal)
                closingBalanceType = runningBalance >= 0 ? "Dr" : "Cr";
            else
                closingBalanceType = runningBalance >= 0 ? "Cr" : "Dr";

            return new GeneralLedgerDto
            {
                AccountId = account.acctID,
                AccountCode = account.AcctCode ?? "",
                AccountName = account.AcctName ?? "",
                OpeningBalance = openingBalanceValue,
                OpeningBalanceType = openingBalanceType,
                Transactions = transactions,
                ClosingBalance = closingBalanceValue,
                ClosingBalanceType = closingBalanceType
            };
        }




        public async Task<List<TrialBalanceDto>> GetTrialBalanceAsync(DateTime fromDate, DateTime toDate, int branchId)
        {
            // Get all leaf accounts for this branch only
            var accounts = await _context.tblCOA
                .Where(x => x.AcctLast == true
                            && x.Active == true
                            && x.BranchID == branchId)
                .ToListAsync();

            var result = new List<TrialBalanceDto>();

            foreach (var account in accounts)
            {
                // Opening balance (before fromDate) - branch filtered
                var openingDebit = await _context.LedgerEntries
                    .Where(x => x.AccountID == account.acctID
                                && x.BranchID == branchId
                                && x.EntryDate < fromDate)
                    .SumAsync(x => (decimal?)x.Debit) ?? 0;

                var openingCredit = await _context.LedgerEntries
                    .Where(x => x.AccountID == account.acctID
                                && x.BranchID == branchId
                                && x.EntryDate < fromDate)
                    .SumAsync(x => (decimal?)x.Credit) ?? 0;

                // Period transactions - branch filtered
                var periodDebit = await _context.LedgerEntries
                    .Where(x => x.AccountID == account.acctID
                                && x.BranchID == branchId
                                && x.EntryDate >= fromDate
                                && x.EntryDate <= toDate)
                    .SumAsync(x => (decimal?)x.Debit) ?? 0;

                var periodCredit = await _context.LedgerEntries
                    .Where(x => x.AccountID == account.acctID
                                && x.BranchID == branchId
                                && x.EntryDate >= fromDate
                                && x.EntryDate <= toDate)
                    .SumAsync(x => (decimal?)x.Credit) ?? 0;

                decimal closingBalance = (openingDebit - openingCredit) + (periodDebit - periodCredit);
                string balanceType = closingBalance >= 0 ? "Dr" : "Cr";
                closingBalance = Math.Abs(closingBalance);

                // Only include accounts with any activity or balance
                if (closingBalance != 0 || openingDebit != 0 || openingCredit != 0 || periodDebit != 0 || periodCredit != 0)
                {
                    result.Add(new TrialBalanceDto
                    {
                        AccountId = account.acctID,
                        AccountCode = account.AcctCode ?? "",
                        AccountName = account.AcctName ?? "",
                        OpeningDebit = openingDebit,
                        OpeningCredit = openingCredit,
                        PeriodDebit = periodDebit,
                        PeriodCredit = periodCredit,
                        ClosingBalance = closingBalance,
                        ClosingBalanceType = balanceType
                    });
                }
            }

            return result.OrderBy(x => x.AccountCode).ToList();
        }

        //public async Task<List<CustomerStatementDto>> GetCustomerStatementAsync(DateTime fromDate, DateTime toDate, int? customerId, int branchId)
        //{
        //    var query = _context.tblCOA
        //        .Where(x => x.AccountCategory == "Customer" && x.AcctLast == true && x.Active == true && x.BranchID == branchId);
        //    if (customerId.HasValue && customerId > 0) query = query.Where(x => x.acctID == customerId);
        //    var customers = await query.OrderBy(x => x.AcctName).ToListAsync();
        //    var result = new List<CustomerStatementDto>();

        //    foreach (var cust in customers)
        //    {
        //        // ✅ Opening balance — Include COA OpenAmnt
        //        var openDr = await _context.LedgerEntries.Where(x => x.AccountID == cust.acctID && x.BranchID == branchId && x.EntryDate < fromDate).SumAsync(x => (decimal?)x.Debit) ?? 0;
        //        var openCr = await _context.LedgerEntries.Where(x => x.AccountID == cust.acctID && x.BranchID == branchId && x.EntryDate < fromDate).SumAsync(x => (decimal?)x.Credit) ?? 0;
        //        decimal coaOpenAmnt = cust.OpenAmnt ?? 0;
        //        decimal opening = coaOpenAmnt + (openDr - openCr);
        //        decimal runningBalance = opening;

        //        var transactions = new List<CustomerStatementLineDto>();

        //        // === SALES ===
        //        var sales = await _context.SaleFiles.Where(x => x.CustID == cust.acctID && x.BranchID == branchId && x.TranDate >= fromDate && x.TranDate <= toDate && x.CancStat != true).ToListAsync();
        //        foreach (var sale in sales)
        //        {
        //            var items = await _context.SaleFilds.Where(x => x.TranNumb == sale.TranNumb).Join(_context.ItemFile, s => s.ItemID, i => i.ItemID, (s, i) => new { s, i }).ToListAsync();
        //            foreach (var it in items)
        //            {
        //                runningBalance += (it.s.SaleQnty ?? 0) * (it.s.SaleRate ?? 0);
        //                transactions.Add(new CustomerStatementLineDto { Date = sale.TranDate ?? DateTime.Now, VoucherNo = sale.BillNumb ?? $"SA-{sale.TranNumb}", Type = "SALE", ItemName = it.i.ItemName ?? "", Model = it.i.ModlNumb ?? "", Quantity = it.s.SaleQnty ?? 0, Rate = it.s.SaleRate ?? 0, Debit = (it.s.SaleQnty ?? 0) * (it.s.SaleRate ?? 0), Credit = 0, Balance = runningBalance });
        //            }
        //        }

        //        // === SALE RETURNS ===
        //        var returns = await _context.SaleReturnFiles.Where(x => x.CustID == cust.acctID && x.BranchID == branchId && x.TranDate >= fromDate && x.TranDate <= toDate && !x.CancStat).Include(x => x.Items).ToListAsync();
        //        foreach (var ret in returns)
        //        {
        //            foreach (var item in ret.Items)
        //            {
        //                var itemName = await _context.ItemFile.Where(i => i.ItemID == item.ItemID).Select(i => i.ItemName).FirstOrDefaultAsync() ?? "";
        //                runningBalance -= item.Amount;
        //                transactions.Add(new CustomerStatementLineDto { Date = ret.TranDate ?? DateTime.Now, VoucherNo = ret.BillNumb ?? $"SR-{ret.ReturnTranNumb}", Type = "SALE_RETURN", ItemName = itemName, Model = "", Quantity = item.ReturnQnty, Rate = item.Rate, Debit = 0, Credit = item.Amount, Balance = runningBalance });
        //            }
        //        }

        //        // === RECEIVINGS ===
        //        var receivings = await _context.ReceivingFiles.Where(x => x.PartyId == cust.acctID && x.BranchId == branchId && x.ReceiveDate >= fromDate && x.ReceiveDate <= toDate).ToListAsync();
        //        foreach (var rec in receivings)
        //        {
        //            runningBalance -= rec.TotalAmount;
        //            transactions.Add(new CustomerStatementLineDto { Date = rec.ReceiveDate, VoucherNo = rec.VoucherNumb ?? $"REC-{rec.Id}", Type = "RECEIVING", ItemName = "Receipt", Model = "", Quantity = 0, Rate = 0, Debit = 0, Credit = rec.TotalAmount, Balance = runningBalance });
        //        }

        //        decimal closing = runningBalance;
        //        decimal totalDr = transactions.Sum(t => t.Debit);
        //        decimal totalCr = transactions.Sum(t => t.Credit);

        //        if (transactions.Any() || opening != 0)
        //        {
        //            result.Add(new CustomerStatementDto { CustomerId = cust.acctID, CustomerCode = cust.AcctCode ?? "", CustomerName = cust.AcctName ?? "", OpeningBalance = Math.Abs(opening), OpeningBalanceType = opening >= 0 ? "Dr" : "Cr", ClosingBalance = Math.Abs(closing), ClosingBalanceType = closing >= 0 ? "Dr" : "Cr", TotalDebit = totalDr, TotalCredit = totalCr, Transactions = transactions.OrderBy(t => t.Date).ToList() });
        //        }
        //    }
        //    return result;
        //}
        public async Task<List<CustomerStatementDto>> GetCustomerStatementAsync(DateTime fromDate, DateTime toDate, int? customerId, int branchId)
        {
            var toDateEnd = toDate.Date.AddDays(1).AddSeconds(-1);

            var query = _context.tblCOA
                .Where(x => x.AccountCategory == "Customer" && x.AcctLast == true && x.Active == true && x.BranchID == branchId);
            if (customerId.HasValue && customerId > 0) query = query.Where(x => x.acctID == customerId);
            var customers = await query.OrderBy(x => x.AcctName).ToListAsync();
            var result = new List<CustomerStatementDto>();

            foreach (var cust in customers)
            {
                // ✅ Opening balance — Include COA OpenAmnt
                var openDr = await _context.LedgerEntries
                    .Where(x => x.AccountID == cust.acctID && x.BranchID == branchId && x.EntryDate < fromDate)
                    .SumAsync(x => (decimal?)x.Debit) ?? 0;
                var openCr = await _context.LedgerEntries
                    .Where(x => x.AccountID == cust.acctID && x.BranchID == branchId && x.EntryDate < fromDate)
                    .SumAsync(x => (decimal?)x.Credit) ?? 0;

                decimal coaOpenAmnt = cust.OpenAmnt ?? 0;
                decimal opening = coaOpenAmnt + (openDr - openCr);
                decimal runningBalance = opening;

                var transactions = new List<CustomerStatementLineDto>();

                // ============================================================
                // SALES — from SaleFile + SaleFild (item-level detail)
                // ============================================================
                var sales = await _context.SaleFiles
                    .Where(x => x.CustID == cust.acctID && x.BranchID == branchId
                           && x.TranDate >= fromDate && x.TranDate <= toDateEnd && x.CancStat != true)
                    .ToListAsync();

                foreach (var sale in sales)
                {
                    var items = await _context.SaleFilds
                        .Where(x => x.TranNumb == sale.TranNumb)
                        .Join(_context.ItemFile, s => s.ItemID, i => i.ItemID, (s, i) => new { s, i })
                        .ToListAsync();

                    foreach (var it in items)
                    {
                        runningBalance += (it.s.SaleQnty ?? 0) * (it.s.SaleRate ?? 0);
                        transactions.Add(new CustomerStatementLineDto
                        {
                            Date = sale.TranDate ?? DateTime.Now,
                            VoucherNo = sale.BillNumb ?? $"SA-{sale.TranNumb}",
                            Type = "SALE",
                            ItemName = it.i.ItemName ?? "",
                            Model = it.i.ModlNumb ?? "",
                            Quantity = it.s.SaleQnty ?? 0,
                            Rate = it.s.SaleRate ?? 0,
                            Debit = (it.s.SaleQnty ?? 0) * (it.s.SaleRate ?? 0),
                            Credit = 0,
                            Balance = runningBalance
                        });
                    }
                }

                // ============================================================
                // SALE RETURNS — from SaleReturnFile + Items
                // ============================================================
                var returns = await _context.SaleReturnFiles
                    .Where(x => x.CustID == cust.acctID && x.BranchID == branchId
                           && x.TranDate >= fromDate && x.TranDate <= toDateEnd && !x.CancStat)
                    .Include(x => x.Items)
                    .ToListAsync();

                foreach (var ret in returns)
                {
                    foreach (var item in ret.Items)
                    {
                        var itemName = await _context.ItemFile
                            .Where(i => i.ItemID == item.ItemID)
                            .Select(i => i.ItemName)
                            .FirstOrDefaultAsync() ?? "";

                        runningBalance -= item.Amount;
                        transactions.Add(new CustomerStatementLineDto
                        {
                            Date = ret.TranDate ?? DateTime.Now,
                            VoucherNo = ret.BillNumb ?? $"SR-{ret.ReturnTranNumb}",
                            Type = "SALE_RETURN",
                            ItemName = itemName,
                            Model = "",
                            Quantity = item.ReturnQnty,
                            Rate = item.Rate,
                            Debit = 0,
                            Credit = item.Amount,
                            Balance = runningBalance
                        });
                    }
                }

                // ============================================================
                // RECEIVINGS — from LedgerEntry (Cash/Cheque breakup!)
                // ============================================================
                var receivingEntries = await _context.LedgerEntries
                    .Where(x => x.AccountID == cust.acctID && x.BranchID == branchId
                           && x.EntryDate >= fromDate && x.EntryDate <= toDateEnd
                           && x.Description.Contains("Receiving"))
                    .OrderBy(x => x.EntryDate)
                    .ToListAsync();

                foreach (var entry in receivingEntries)
                {
                    runningBalance = runningBalance - entry.Credit + entry.Debit;
                    transactions.Add(new CustomerStatementLineDto
                    {
                        Date = entry.EntryDate,
                        VoucherNo = entry.ReceivingID?.ToString() ?? "",
                        Type = "RECEIVING",
                        ItemName = entry.Description ?? "Receipt",
                        Model = "",
                        Quantity = 0,
                        Rate = 0,
                        Debit = entry.Debit,
                        Credit = entry.Credit,
                        Balance = runningBalance
                    });
                }

                decimal closing = runningBalance;
                decimal totalDr = transactions.Sum(t => t.Debit);
                decimal totalCr = transactions.Sum(t => t.Credit);

                if (transactions.Any() || opening != 0)
                {
                    result.Add(new CustomerStatementDto
                    {
                        CustomerId = cust.acctID,
                        CustomerCode = cust.AcctCode ?? "",
                        CustomerName = cust.AcctName ?? "",
                        OpeningBalance = Math.Abs(opening),
                        OpeningBalanceType = opening >= 0 ? "Dr" : "Cr",
                        ClosingBalance = Math.Abs(closing),
                        ClosingBalanceType = closing >= 0 ? "Dr" : "Cr",
                        TotalDebit = totalDr,
                        TotalCredit = totalCr,
                        Transactions = transactions.OrderBy(t => t.Date).ToList()
                    });
                }
            }
            return result;
        }

        //public async Task<List<SupplierStatementDto>> GetSupplierStatementAsync(DateTime fromDate, DateTime toDate, int? supplierId, int branchId)
        //{
        //    var query = _context.tblCOA
        //        .Where(x => x.AccountCategory == "Supplier" && x.AcctLast == true && x.Active == true && x.BranchID == branchId);
        //    if (supplierId.HasValue && supplierId > 0) query = query.Where(x => x.acctID == supplierId);
        //    var suppliers = await query.OrderBy(x => x.AcctName).ToListAsync();
        //    var result = new List<SupplierStatementDto>();

        //    foreach (var supp in suppliers)
        //    {
        //        var openDr = await _context.LedgerEntries.Where(x => x.AccountID == supp.acctID && x.BranchID == branchId && x.EntryDate < fromDate).SumAsync(x => (decimal?)x.Debit) ?? 0;
        //        var openCr = await _context.LedgerEntries.Where(x => x.AccountID == supp.acctID && x.BranchID == branchId && x.EntryDate < fromDate).SumAsync(x => (decimal?)x.Credit) ?? 0;
        //        decimal coaOpenAmnt = supp.OpenAmnt ?? 0;
        //        decimal opening = coaOpenAmnt + (openCr - openDr); // Liability: Credit normal
        //        decimal runningBalance = opening;

        //        var transactions = new List<SupplierStatementLineDto>();

        //        // === PURCHASES ===
        //        var purchases = await _context.PurcFile.Where(x => x.SuppID == supp.acctID && x.BranchID == branchId && x.TranDate >= fromDate && x.TranDate <= toDate && !x.IsDeleted).ToListAsync();
        //        foreach (var pur in purchases)
        //        {
        //            var items = await _context.PurcFild.Where(x => x.TranNumb == pur.TranNumb).Join(_context.ItemFile, p => p.ItemID, i => i.ItemID, (p, i) => new { p, i }).ToListAsync();
        //            foreach (var it in items)
        //            {
        //                runningBalance += (decimal)(it.p.PurcQnty * it.p.PurcRate);
        //                transactions.Add(new SupplierStatementLineDto { Date = pur.TranDate ?? DateTime.Now, VoucherNo = pur.BillNumb ?? $"PU-{pur.TranNumb}", Type = "PURCHASE", ItemName = it.i.ItemName ?? "", Model = it.i.ModlNumb ?? "", Quantity = (decimal)it.p.PurcQnty, Rate = (decimal)it.p.PurcRate, Debit = 0, Credit = (decimal)(it.p.PurcQnty * it.p.PurcRate), Balance = runningBalance });
        //            }
        //        }

        //        // === PURCHASE RETURNS ===
        //        var returns = await _context.PurchaseReturn.Where(x => x.SuppID == supp.acctID && x.BranchID == branchId && x.TranDate >= fromDate && x.TranDate <= toDate).Include(x => x.Items).ToListAsync();
        //        foreach (var ret in returns)
        //        {
        //            foreach (var item in ret.Items)
        //            {
        //                var itemName = await _context.ItemFile.Where(i => i.ItemID == item.ItemID).Select(i => i.ItemName).FirstOrDefaultAsync() ?? "";
        //                runningBalance -= item.ReturnQty * item.PurcRate;
        //                transactions.Add(new SupplierStatementLineDto { Date = ret.TranDate, VoucherNo = ret.BillNumb ?? $"PR-{ret.ReturnID}", Type = "PURCHASE_RETURN", ItemName = itemName, Model = "", Quantity = item.ReturnQty, Rate = item.PurcRate, Debit = item.ReturnQty * item.PurcRate, Credit = 0, Balance = runningBalance });
        //            }
        //        }

        //        // === PAYMENTS ===
        //        var payments = await _context.PaymentFiles.Where(x => x.ReferenceID == supp.acctID && x.BranchID == branchId && x.PaymentDate >= fromDate && x.PaymentDate <= toDate && x.CancStat != true).ToListAsync();
        //        foreach (var pay in payments)
        //        {
        //            runningBalance -= pay.Amount;
        //            transactions.Add(new SupplierStatementLineDto { Date = pay.PaymentDate, VoucherNo = pay.VoucherNumb ?? $"PAY-{pay.PaymentID}", Type = "PAYMENT", ItemName = "Payment", Model = "", Quantity = 0, Rate = 0, Debit = pay.Amount, Credit = 0, Balance = runningBalance });
        //        }

        //        decimal closing = runningBalance;
        //        decimal totalDr = transactions.Sum(t => t.Debit);
        //        decimal totalCr = transactions.Sum(t => t.Credit);

        //        if (transactions.Any() || opening != 0)
        //        {
        //            result.Add(new SupplierStatementDto { SupplierId = supp.acctID, SupplierCode = supp.AcctCode ?? "", SupplierName = supp.AcctName ?? "", OpeningBalance = Math.Abs(opening), OpeningBalanceType = opening >= 0 ? "Cr" : "Dr", ClosingBalance = Math.Abs(closing), ClosingBalanceType = closing >= 0 ? "Cr" : "Dr", TotalDebit = totalDr, TotalCredit = totalCr, Transactions = transactions.OrderBy(t => t.Date).ToList() });
        //        }
        //    }
        //    return result;
        //}
        public async Task<List<SupplierStatementDto>> GetSupplierStatementAsync(DateTime fromDate, DateTime toDate, int? supplierId, int branchId)
        {
            var toDateEnd = toDate.Date.AddDays(1).AddSeconds(-1);

            var query = _context.tblCOA
                .Where(x => x.AccountCategory == "Supplier" && x.AcctLast == true && x.Active == true && x.BranchID == branchId);
            if (supplierId.HasValue && supplierId > 0) query = query.Where(x => x.acctID == supplierId);
            var suppliers = await query.OrderBy(x => x.AcctName).ToListAsync();
            var result = new List<SupplierStatementDto>();

            foreach (var supp in suppliers)
            {
                var openDr = await _context.LedgerEntries.Where(x => x.AccountID == supp.acctID && x.BranchID == branchId && x.EntryDate < fromDate).SumAsync(x => (decimal?)x.Debit) ?? 0;
                var openCr = await _context.LedgerEntries.Where(x => x.AccountID == supp.acctID && x.BranchID == branchId && x.EntryDate < fromDate).SumAsync(x => (decimal?)x.Credit) ?? 0;
                decimal coaOpenAmnt = supp.OpenAmnt ?? 0;
                decimal opening = coaOpenAmnt + (openCr - openDr);
                decimal runningBalance = opening;

                var transactions = new List<SupplierStatementLineDto>();

                // === PURCHASES ===
                var purchases = await _context.PurcFile.Where(x => x.SuppID == supp.acctID && x.BranchID == branchId && x.TranDate >= fromDate && x.TranDate <= toDateEnd && !x.IsDeleted).ToListAsync();
                foreach (var pur in purchases)
                {
                    var items = await _context.PurcFild.Where(x => x.TranNumb == pur.TranNumb).Join(_context.ItemFile, p => p.ItemID, i => i.ItemID, (p, i) => new { p, i }).ToListAsync();
                    foreach (var it in items)
                    {
                        runningBalance += (decimal)(it.p.PurcQnty * it.p.PurcRate);
                        transactions.Add(new SupplierStatementLineDto { Date = pur.TranDate ?? DateTime.Now, VoucherNo = pur.BillNumb ?? $"PU-{pur.TranNumb}", Type = "PURCHASE", ItemName = it.i.ItemName ?? "", Model = it.i.ModlNumb ?? "", Quantity = (decimal)it.p.PurcQnty, Rate = (decimal)it.p.PurcRate, Debit = 0, Credit = (decimal)(it.p.PurcQnty * it.p.PurcRate), Balance = runningBalance });
                    }
                }

                // === PURCHASE RETURNS ===
                var returns = await _context.PurchaseReturn.Where(x => x.SuppID == supp.acctID && x.BranchID == branchId && x.TranDate >= fromDate && x.TranDate <= toDateEnd).Include(x => x.Items).ToListAsync();
                foreach (var ret in returns)
                {
                    foreach (var item in ret.Items)
                    {
                        var itemName = await _context.ItemFile.Where(i => i.ItemID == item.ItemID).Select(i => i.ItemName).FirstOrDefaultAsync() ?? "";
                        runningBalance -= item.ReturnQty * item.PurcRate;
                        transactions.Add(new SupplierStatementLineDto { Date = ret.TranDate, VoucherNo = ret.BillNumb ?? $"PR-{ret.ReturnID}", Type = "PURCHASE_RETURN", ItemName = itemName, Model = "", Quantity = item.ReturnQty, Rate = item.PurcRate, Debit = item.ReturnQty * item.PurcRate, Credit = 0, Balance = runningBalance });
                    }
                }

                // === PAYMENTS — from LedgerEntry (Cash/Cheque breakup!) ===
                var paymentEntries = await _context.LedgerEntries
                    .Where(x => x.AccountID == supp.acctID && x.BranchID == branchId
                           && x.EntryDate >= fromDate && x.EntryDate <= toDateEnd
                           && x.Description.Contains("Payment"))
                    .OrderBy(x => x.EntryDate)
                    .ToListAsync();

                foreach (var entry in paymentEntries)
                {
                    runningBalance = runningBalance - entry.Debit + entry.Credit;
                    transactions.Add(new SupplierStatementLineDto
                    {
                        Date = entry.EntryDate,
                        VoucherNo = entry.ReceivingID?.ToString() ?? "",
                        Type = "PAYMENT",
                        ItemName = entry.Description ?? "Payment",
                        Model = "",
                        Quantity = 0,
                        Rate = 0,
                        Debit = entry.Debit,
                        Credit = entry.Credit,
                        Balance = runningBalance
                    });
                }

                decimal closing = runningBalance;
                decimal totalDr = transactions.Sum(t => t.Debit);
                decimal totalCr = transactions.Sum(t => t.Credit);

                if (transactions.Any() || opening != 0)
                {
                    result.Add(new SupplierStatementDto { SupplierId = supp.acctID, SupplierCode = supp.AcctCode ?? "", SupplierName = supp.AcctName ?? "", OpeningBalance = Math.Abs(opening), OpeningBalanceType = opening >= 0 ? "Cr" : "Dr", ClosingBalance = Math.Abs(closing), ClosingBalanceType = closing >= 0 ? "Cr" : "Dr", TotalDebit = totalDr, TotalCredit = totalCr, Transactions = transactions.OrderBy(t => t.Date).ToList() });
                }
            }
            return result;
        }
        public async Task<List<PurchaseReportDto>> GetPurchaseReportAsync(DateTime fromDate, DateTime toDate, int? supplierId, int? itemId, int branchId)
        {
            var query = _context.PurcFile
                .Where(x => x.BranchID == branchId && !x.IsDeleted && x.TranDate >= fromDate && x.TranDate <= toDate);

            if (supplierId.HasValue && supplierId > 0)
                query = query.Where(x => x.SuppID == supplierId);

            if (itemId.HasValue && itemId > 0)
                query = query.Where(x => _context.PurcFild.Any(d => d.TranNumb == x.TranNumb && d.ItemID == itemId));

            var purchases = await query.OrderByDescending(x => x.TranDate).ToListAsync();
            var result = new List<PurchaseReportDto>();

            foreach (var p in purchases)
            {
                var items = await _context.PurcFild
                    .Where(x => x.TranNumb == p.TranNumb)
                    .Join(_context.ItemFile, d => d.ItemID, i => i.ItemID, (d, i) => new { d, i })
                    .ToListAsync();

                if (itemId.HasValue && itemId > 0)
                    items = items.Where(x => x.d.ItemID == itemId).ToList();

                var supplier = await _context.tblCOA.FirstOrDefaultAsync(x => x.acctID == p.SuppID);

                result.Add(new PurchaseReportDto
                {
                    TranNumb = p.TranNumb,
                    BillNumb = p.BillNumb ?? $"PU-{p.TranNumb}",
                    TranDate = p.TranDate ?? DateTime.Now,
                    SupplierName = supplier?.AcctName ?? "N/A",
                    TranType = p.TranType ?? "Credit",
                    TotalAmount = (decimal)(p.TotlAmnt ?? 0),
                    TotalQty = (decimal)(items.Sum(x => x.d.PurcQnty)),
                    ItemCount = items.Count,
                    Items = items.Select(x => new PurchaseReportItemDto
                    {
                        ItemName = x.i.ItemName ?? "",
                        Model = x.i.ModlNumb ?? "",
                        Quantity = (decimal)x.d.PurcQnty,
                        Rate = (decimal)x.d.PurcRate,
                        Amount = (decimal)(x.d.PurcQnty * x.d.PurcRate)
                    }).ToList()
                });
            }

            return result;
        }

        public async Task<List<PurchaseReturnReportDto>> GetPurchaseReturnReportAsync(DateTime fromDate, DateTime toDate, int? supplierId, int? itemId, int branchId)
        {
            var query = _context.PurchaseReturn
                .Where(x => x.BranchID == branchId && x.TranDate >= fromDate && x.TranDate <= toDate);

            if (supplierId.HasValue && supplierId > 0)
                query = query.Where(x => x.SuppID == supplierId);

            var returns = await query.Include(x => x.Items).OrderByDescending(x => x.TranDate).ToListAsync();
            var result = new List<PurchaseReturnReportDto>();

            foreach (var r in returns)
            {
                var items = r.Items.ToList();
                if (itemId.HasValue && itemId > 0)
                    items = items.Where(x => x.ItemID == itemId).ToList();

                var supplier = await _context.tblCOA.FirstOrDefaultAsync(x => x.acctID == r.SuppID);
                var itemDetails = new List<PurchaseReturnReportItemDto>();

                foreach (var item in items)
                {
                    var itemName = await _context.ItemFile.Where(i => i.ItemID == item.ItemID).Select(i => i.ItemName).FirstOrDefaultAsync() ?? "";
                    var model = await _context.ItemFile.Where(i => i.ItemID == item.ItemID).Select(i => i.ModlNumb).FirstOrDefaultAsync() ?? "";
                    itemDetails.Add(new PurchaseReturnReportItemDto
                    {
                        ItemName = itemName,
                        Model = model,
                        Quantity = item.ReturnQty,
                        Rate = item.PurcRate,
                        Amount = item.ReturnQty * item.PurcRate
                    });
                }

                result.Add(new PurchaseReturnReportDto
                {
                    ReturnID = r.ReturnID,
                    BillNumb = r.BillNumb ?? $"PR-{r.ReturnID}",
                    TranDate = r.TranDate,
                    SupplierName = supplier?.AcctName ?? "N/A",
                    TotalAmount = items.Sum(x => x.ReturnQty * x.PurcRate),
                    TotalQty = items.Sum(x => x.ReturnQty),
                    ItemCount = items.Count,
                    Items = itemDetails
                });
            }

            return result;
        }

        public async Task<List<SaleReportDto>> GetSaleReportAsync(DateTime fromDate, DateTime toDate, int? customerId, int? itemId, int branchId)
        {
            var query = _context.SaleFiles
                .Where(x => x.BranchID == branchId && x.CancStat != true && x.TranDate >= fromDate && x.TranDate <= toDate);

            if (customerId.HasValue && customerId > 0) query = query.Where(x => x.CustID == customerId);
            if (itemId.HasValue && itemId > 0) query = query.Where(x => _context.SaleFilds.Any(d => d.TranNumb == x.TranNumb && d.ItemID == itemId));

            var sales = await query.OrderByDescending(x => x.TranDate).ToListAsync();
            var result = new List<SaleReportDto>();

            foreach (var s in sales)
            {
                var items = await _context.SaleFilds.Where(x => x.TranNumb == s.TranNumb)
                    .Join(_context.ItemFile, d => d.ItemID, i => i.ItemID, (d, i) => new { d, i }).ToListAsync();

                if (itemId.HasValue && itemId > 0) items = items.Where(x => x.d.ItemID == itemId).ToList();

                var customer = await _context.tblCOA.FirstOrDefaultAsync(x => x.acctID == s.CustID);

                result.Add(new SaleReportDto
                {
                    TranNumb = s.TranNumb,
                    BillNumb = s.BillNumb ?? $"SA-{s.TranNumb}",
                    TranDate = s.TranDate ?? DateTime.Now,
                    CustomerName = s.WalkingCustomer ?? customer?.AcctName ?? s.CustName ?? "Cash",
                    TranType = s.TranMode ?? "Cash",
                    TotalAmount = s.TotlAmnt ?? 0,
                    TotalQty = items.Sum(x => (decimal)(x.d.SaleQnty ?? 0)),
                    ItemCount = items.Count,
                    Items = items.Select(x => new SaleReportItemDto
                    {
                        ItemName = x.i.ItemName ?? "",
                        Model = x.i.ModlNumb ?? "",
                        Quantity = x.d.SaleQnty ?? 0,
                        Rate = x.d.SaleRate ?? 0,
                        Amount = (x.d.SaleQnty ?? 0) * (x.d.SaleRate ?? 0)
                    }).ToList()
                });
            }
            return result;
        }

        public async Task<List<SaleReturnReportDto>> GetSaleReturnReportAsync(DateTime fromDate, DateTime toDate, int? customerId, int? itemId, int branchId)
        {
            var query = _context.SaleReturnFiles
                .Where(x => x.BranchID == branchId && !x.CancStat && x.TranDate >= fromDate && x.TranDate <= toDate);

            if (customerId.HasValue && customerId > 0) query = query.Where(x => x.CustID == customerId);

            var returns = await query.Include(x => x.Items).OrderByDescending(x => x.TranDate).ToListAsync();
            var result = new List<SaleReturnReportDto>();

            foreach (var r in returns)
            {
                var items = r.Items.ToList();
                if (itemId.HasValue && itemId > 0) items = items.Where(x => x.ItemID == itemId).ToList();

                var customer = await _context.tblCOA.FirstOrDefaultAsync(x => x.acctID == r.CustID);
                var itemDetails = new List<SaleReturnReportItemDto>();

                foreach (var item in items)
                {
                    var itemName = await _context.ItemFile.Where(i => i.ItemID == item.ItemID).Select(i => i.ItemName).FirstOrDefaultAsync() ?? "";
                    var model = await _context.ItemFile.Where(i => i.ItemID == item.ItemID).Select(i => i.ModlNumb).FirstOrDefaultAsync() ?? "";
                    itemDetails.Add(new SaleReturnReportItemDto
                    {
                        ItemName = itemName,
                        Model = model,
                        Quantity = item.ReturnQnty,
                        Rate = item.Rate,
                        Amount = item.Amount
                    });
                }

                result.Add(new SaleReturnReportDto
                {
                    ReturnTranNumb = r.ReturnTranNumb,
                    BillNumb = r.BillNumb ?? $"SR-{r.ReturnTranNumb}",
                    TranDate = r.TranDate ?? DateTime.Now,
                    CustomerName = r.WalkingCustomer ?? customer?.AcctName ?? r.CustName ?? "Cash",
                    TotalAmount = r.TotlAmnt,
                    TotalQty = items.Sum(x => x.ReturnQnty),
                    ItemCount = items.Count,
                    Items = itemDetails
                });
            }
            return result;
        }

        public async Task<List<StockReportDto>> GetStockReportAsync(DateTime fromDate, DateTime toDate, int? itemId, int? companyId, int? categoryId, int? subcategoryId, int? godownId, bool showRateValue, int branchId)
        {
            // ✅ Fix: toDate ko end of day set karo
            var toDateEnd = toDate.Date.AddDays(1).AddSeconds(-1);

            var query = _context.ItemFile
                .Where(x => (x.BranchID == branchId || x.BranchID == null) && x.InActive != true && x.IsDeleted != true);

            if (itemId.HasValue && itemId > 0) query = query.Where(x => x.ItemID == itemId);
            if (companyId.HasValue && companyId > 0) query = query.Where(x => x.CompID == companyId);
            if (categoryId.HasValue && categoryId > 0) query = query.Where(x => x.CatgID == categoryId);
            if (subcategoryId.HasValue && subcategoryId > 0) query = query.Where(x => x.SubcatID == subcategoryId);

            var items = await query.OrderBy(x => x.ItemName).ToListAsync();
            var result = new List<StockReportDto>();

            foreach (var item in items)
            {
                var openQty = await _context.ItemStock
                    .Where(x => x.ItemID == item.ItemID && x.BranchID == branchId && x.TranType == "OPENING")
                    .SumAsync(x => (decimal?)x.InQty) ?? 0;

                // ✅ FIX: Use toDateEnd
                var periodEntries = _context.ItemStock
                    .Where(x => x.ItemID == item.ItemID && x.BranchID == branchId
                           && x.TranDate >= fromDate && x.TranDate <= toDateEnd);

                var purchaseQty = await periodEntries.Where(x => x.TranType == "PURCHASE").SumAsync(x => (decimal?)x.InQty) ?? 0;
                var purchaseReturnQty = await periodEntries.Where(x => x.TranType == "PURCHASE_RETURN").SumAsync(x => (decimal?)x.OutQty) ?? 0;
                var saleQty = await periodEntries.Where(x => x.TranType == "SALE").SumAsync(x => (decimal?)x.OutQty) ?? 0;
                var saleReturnQty = await periodEntries.Where(x => x.TranType == "SALE_RETURN").SumAsync(x => (decimal?)x.InQty) ?? 0;

                decimal currentStock = openQty + purchaseQty - purchaseReturnQty - saleQty + saleReturnQty;

                if (openQty > 0 || purchaseQty > 0 || purchaseReturnQty > 0 || saleQty > 0 || saleReturnQty > 0 || currentStock != 0)
                {
                    var comp = await _context.CompFile.FirstOrDefaultAsync(x => x.CompID == item.CompID);
                    var cat = await _context.CatgFile.FirstOrDefaultAsync(x => x.CatgID == item.CatgID);
                    var subcat = await _context.Subcategories.FirstOrDefaultAsync(x => x.SubcatID == item.SubcatID);

                    result.Add(new StockReportDto
                    {
                        ItemID = item.ItemID,
                        ItemName = item.ItemName ?? "",
                        Model = item.ModlNumb ?? "",
                        Company = comp?.CompName ?? "",
                        Category = cat?.CatgName ?? "",
                        Subcategory = subcat?.SubcatName ?? "",
                        OpeningStock = openQty,
                        PurchaseQty = purchaseQty,
                        PurchaseReturnQty = purchaseReturnQty,
                        SaleQty = saleQty,
                        SaleReturnQty = saleReturnQty,
                        CurrentStock = currentStock,
                        AvgRate = showRateValue ? (item.PurcRate ?? item.SaleRate ?? 0) : null,
                        StockValue = showRateValue ? (currentStock * (item.PurcRate ?? item.SaleRate ?? 0)) : null
                    });
                }
            }

            return result;
        }

        public async Task<ProfitLossDto> GetProfitLossAsync(DateTime fromDate, DateTime toDate, int branchId)
        {
            var toDateEnd = toDate.Date.AddDays(1).AddSeconds(-1);

            // Get ALL Revenue accounts
            var revenueAccounts = await _context.tblCOA
                .Where(x => x.AcctType == "Revenue" && x.AcctLast == true && x.Active == true && x.BranchID == branchId)
                .OrderBy(x => x.AcctCode)
                .ToListAsync();

            // Get ALL Expense accounts
            var expenseAccounts = await _context.tblCOA
                .Where(x => x.AcctType == "Expense" && x.AcctLast == true && x.Active == true && x.BranchID == branchId)
                .OrderBy(x => x.AcctCode)
                .ToListAsync();

            var incomeGroups = new List<ProfitLossGroupDto>();
            var expenseGroups = new List<ProfitLossGroupDto>();
            decimal totalIncome = 0, totalExpenses = 0;

            // Process Revenue (Income) accounts
            foreach (var acc in revenueAccounts)
            {
                var entries = await _context.LedgerEntries
                    .Where(x => x.AccountID == acc.acctID && x.BranchID == branchId && x.EntryDate >= fromDate && x.EntryDate <= toDateEnd)
                    .OrderBy(x => x.EntryDate)
                    .ToListAsync();

                // Revenue: Credit normal = Income
                // Sales Return is contra-revenue: Debit - Credit
                bool isContra = acc.AcctName != null && acc.AcctName.ToLower().Contains("return");
                decimal netAmount;

                if (isContra)
                    netAmount = -(entries.Sum(x => x.Debit) - entries.Sum(x => x.Credit)); // Contra: negative
                else
                    netAmount = entries.Sum(x => x.Credit) - entries.Sum(x => x.Debit); // Normal: Credit - Debit

                if (entries.Any())
                {
                    incomeGroups.Add(new ProfitLossGroupDto
                    {
                        AccountCode = acc.AcctCode ?? "",
                        AccountName = acc.AcctName ?? "",
                        Amount = netAmount,
                        Details = entries.Select(e => new ProfitLossDetailDto
                        {
                            Date = e.EntryDate,
                            VoucherNo = e.ReceivingID?.ToString() ?? e.PaymentID?.ToString() ?? "",
                            Description = e.Description ?? "",
                            Debit = e.Debit,
                            Credit = e.Credit
                        }).ToList()
                    });
                    totalIncome += netAmount;
                }
            }

            // Process Expense accounts
            foreach (var acc in expenseAccounts)
            {
                var entries = await _context.LedgerEntries
                    .Where(x => x.AccountID == acc.acctID && x.BranchID == branchId && x.EntryDate >= fromDate && x.EntryDate <= toDateEnd)
                    .OrderBy(x => x.EntryDate)
                    .ToListAsync();

                // Expense: Debit normal = Expense
                // Purchase Return is contra-expense: Credit - Debit
                bool isContra = acc.AcctName != null && acc.AcctName.ToLower().Contains("return");
                decimal netAmount;

                if (isContra)
                    netAmount = -(entries.Sum(x => x.Credit) - entries.Sum(x => x.Debit)); // Contra: negative
                else
                    netAmount = entries.Sum(x => x.Debit) - entries.Sum(x => x.Credit); // Normal: Debit - Credit

                if (entries.Any())
                {
                    expenseGroups.Add(new ProfitLossGroupDto
                    {
                        AccountCode = acc.AcctCode ?? "",
                        AccountName = acc.AcctName ?? "",
                        Amount = netAmount,
                        Details = entries.Select(e => new ProfitLossDetailDto
                        {
                            Date = e.EntryDate,
                            VoucherNo = e.ReceivingID?.ToString() ?? e.PaymentID?.ToString() ?? "",
                            Description = e.Description ?? "",
                            Debit = e.Debit,
                            Credit = e.Credit
                        }).ToList()
                    });
                    totalExpenses += netAmount;
                }
            }

            decimal netProfitLoss = totalIncome - totalExpenses;

            return new ProfitLossDto
            {
                IncomeGroups = incomeGroups,
                ExpenseGroups = expenseGroups,
                TotalIncome = totalIncome,
                TotalExpenses = totalExpenses,
                NetProfitLoss = Math.Abs(netProfitLoss),
                ResultType = netProfitLoss >= 0 ? "Profit" : "Loss"
            };
        }

        public async Task<List<BankStatementDto>> GetBankStatementAsync(DateTime fromDate, DateTime toDate, int? bankAccountId, int branchId)
        {
            var toDateEnd = toDate.Date.AddDays(1).AddSeconds(-1);

            var query = _context.tblCOA
                .Where(x => (x.AccountCategory == "Bank" || x.AccountCategory == "Cash & Bank")
                       && x.AcctLast == true && x.Active == true && x.BranchID == branchId);

            if (bankAccountId.HasValue && bankAccountId > 0)
                query = query.Where(x => x.acctID == bankAccountId);

            var banks = await query.OrderBy(x => x.AcctName).ToListAsync();
            var result = new List<BankStatementDto>();

            foreach (var bank in banks)
            {
                // ✅ Get transactions — EXCLUDE Opening Balance entries
                var entries = await _context.LedgerEntries
                    .Where(x => x.AccountID == bank.acctID
                           && x.BranchID == branchId
                           && x.EntryDate >= fromDate
                           && x.EntryDate <= toDateEnd
                           && !x.Description.StartsWith("Opening Balance"))
                    .OrderBy(x => x.EntryDate)
                    .ToListAsync();

                // Opening balance
                var openDr = await _context.LedgerEntries
                    .Where(x => x.AccountID == bank.acctID && x.BranchID == branchId && x.EntryDate < fromDate)
                    .SumAsync(x => (decimal?)x.Debit) ?? 0;
                var openCr = await _context.LedgerEntries
                    .Where(x => x.AccountID == bank.acctID && x.BranchID == branchId && x.EntryDate < fromDate)
                    .SumAsync(x => (decimal?)x.Credit) ?? 0;

                decimal opening = (bank.OpenAmnt ?? 0) + (openDr - openCr);
                decimal runningBalance = opening;

                var transactions = entries.Select(e =>
                {
                    runningBalance += e.Debit - e.Credit;

                    // Determine type from description
                    string desc = e.Description ?? "";
                    string type = "";
                    if (desc.Contains("Receiving") || desc.Contains("Receipt"))
                        type = "RECEIVING";
                    else if (desc.Contains("Payment"))
                        type = "PAYMENT";
                    else if (e.Credit > 0 && e.Debit == 0)
                        type = "RECEIVING";
                    else if (e.Debit > 0 && e.Credit == 0)
                        type = "PAYMENT";

                    string voucherNo = e.ReceivingID?.ToString() ?? e.PaymentID?.ToString() ?? "-";

                    return new BankStatementLineDto
                    {
                        Date = e.EntryDate,
                        VoucherNo = voucherNo,
                        Description = desc,
                        Type = type,
                        Debit = e.Debit,
                        Credit = e.Credit,
                        Balance = runningBalance
                    };
                }).ToList();

                if (transactions.Any() || opening != 0)
                {
                    result.Add(new BankStatementDto
                    {
                        AccountId = bank.acctID,
                        AccountCode = bank.AcctCode ?? "",
                        AccountName = bank.AcctName ?? "",
                        OpeningBalance = Math.Abs(opening),
                        OpeningBalanceType = opening >= 0 ? "Dr" : "Cr",
                        ClosingBalance = Math.Abs(runningBalance),
                        ClosingBalanceType = runningBalance >= 0 ? "Dr" : "Cr",
                        Transactions = transactions
                    });
                }
            }

            return result;
        }





    }
}