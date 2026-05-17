using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Voucher;
using WMS.Api.Models;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class VoucherService : IVoucherService
    {
        private readonly WmsDbContext _context;

        public VoucherService(WmsDbContext context)
        {
            _context = context;
        }

        // ==================== VOUCHER TYPE METHODS ====================
        public List<VochTypeDto> GetAllVoucherTypes()
        {
            return _context.VochType
                .Where(x => x.InActive != true)
                .Select(x => new VochTypeDto
                {
                    VochTypeID = x.VochTypeID,
                    VochName = x.VochName,
                    TypeAbbr = x.TypeAbbr,
                    VochTypeCode = x.VochTypeCode,
                    VochDesc = x.VochDesc,
                    InActive = x.InActive
                }).ToList();
        }

        public VochTypeDto? GetVoucherTypeById(int id)
        {
            var entity = _context.VochType.Find(id);
            if (entity == null) return null;

            return new VochTypeDto
            {
                VochTypeID = entity.VochTypeID,
                VochName = entity.VochName,
                TypeAbbr = entity.TypeAbbr,
                VochTypeCode = entity.VochTypeCode,
                VochDesc = entity.VochDesc,
                InActive = entity.InActive
            };
        }

        public void CreateVoucherType(VochTypeCreateDto dto)
        {
            var entity = new VochType
            {
                VochName = dto.VochName,
                TypeAbbr = dto.TypeAbbr,
                VochTypeCode = dto.VochTypeCode,
                VochDesc = dto.VochDesc,
                InActive = dto.InActive ?? false
            };
            _context.VochType.Add(entity);
            _context.SaveChanges();
        }

        public void UpdateVoucherType(int id, VochTypeCreateDto dto)
        {
            var entity = _context.VochType.Find(id);
            if (entity == null) throw new Exception("Voucher type not found");

            entity.VochName = dto.VochName;
            entity.TypeAbbr = dto.TypeAbbr;
            entity.VochTypeCode = dto.VochTypeCode;
            entity.VochDesc = dto.VochDesc;
            entity.InActive = dto.InActive ?? false;

            _context.SaveChanges();
        }

        public void DeleteVoucherType(int id)
        {
            var entity = _context.VochType.Find(id);
            if (entity != null)
            {
                entity.InActive = true;
                _context.SaveChanges();
            }
        }

        // ==================== VOUCHER CRUD METHODS ====================
        public List<AcctTranDto> GetAllVouchers(int branchId, string? vochType = null, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.AcctTran
                .Where(x => x.BranchID == branchId && x.IsDeleted != true)
                .AsQueryable();

            if (!string.IsNullOrEmpty(vochType))
                query = query.Where(x => x.VochType == vochType);

            if (fromDate.HasValue)
                query = query.Where(x => x.TranDate >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(x => x.TranDate <= toDate.Value);

            var result = query
                .OrderByDescending(x => x.AcctTranID)
                .Select(x => new AcctTranDto
                {
                    AcctTranID = x.AcctTranID,
                    TranDate = x.TranDate,
                    VochType = x.VochType,
                    TypeAbbr = x.TypeAbbr,
                    VochNumb = x.VochNumb,
                    TranDesc = x.TranDesc,
                    BranchID = x.BranchID,
                    AddOn = x.AddOn,
                    IsPosted = _context.LedgerEntries.Any(l => l.ReceivingID == x.AcctTranID)  // ✅ Changed
                }).ToList();

            return result;
        }

        public AcctTranDetailDto? GetVoucherById(int id)
        {
            var header = _context.AcctTran
                .FirstOrDefault(x => x.AcctTranID == id);

            if (header == null) return null;

            var details = _context.AcctTrad
                .Where(x => x.AcctTranID == id && x.IsDeleted != true)
                .Select(x => new AcctTradDto
                {
                    AcctTradID = x.AcctTradID,
                    AcctTranID = x.AcctTranID,
                    TranDate = x.TranDate,
                    TranNatr = x.TranNatr,
                    AcctID = x.AcctID,
                    AcctCode = x.AcctCode,
                    AcctName = _context.tblCOA.Where(c => c.acctID == x.AcctID).Select(c => c.AcctName).FirstOrDefault(),
                    DebtAmnt = x.DebtAmnt,
                    CrdtAmnt = x.CrdtAmnt,
                    Remarks = x.Remarks
                }).ToList();

            var isPosted = _context.LedgerEntries.Any(l => l.ReceivingID == id);  // ✅ Changed

            return new AcctTranDetailDto
            {
                AcctTranID = header.AcctTranID,
                TranDate = header.TranDate,
                VochType = header.VochType,
                TypeAbbr = header.TypeAbbr,
                VochNumb = header.VochNumb,
                TranDesc = header.TranDesc,
                BranchID = header.BranchID,
                AddOn = header.AddOn,
                IsPosted = isPosted,
                Details = details
            };
        }

        // ==================== MANUAL JOURNAL VOUCHER ====================
        public async Task<int> CreateManualJournalVoucher(VoucherCreateDto dto, int userId, int branchId)
        {
            // Validate entries (debit = credit)
            if (!ValidateVoucherEntries(dto.Details))
                throw new Exception("Total Debit must equal Total Credit");

            // Get next voucher number
            int nextVoucherNo = await GetNextVoucherNumber(dto.VochType, branchId);

            // Create header
            var acctTran = new AcctTran
            {
                TranDate = dto.TranDate,
                VochType = dto.VochType,
                TypeAbbr = GetTypeAbbr(dto.VochType),
                VochNumb = nextVoucherNo,
                TranDesc = dto.TranDesc,
                BranchID = branchId,
                IsDeleted = false,
                AddOn = DateTime.UtcNow,
                AddBy = userId
            };

            _context.AcctTran.Add(acctTran);
            await _context.SaveChangesAsync();

            // Create details
            foreach (var detail in dto.Details)
            {
                var acctTrad = new AcctTrad
                {
                    AcctTranID = acctTran.AcctTranID,
                    TranDate = dto.TranDate,
                    TranNatr = detail.TranNatr,
                    AcctID = detail.AcctID,
                    AcctCode = GetAcctCode(detail.AcctID),
                    DebtAmnt = detail.TranNatr == "DR" ? detail.Amount : 0,
                    CrdtAmnt = detail.TranNatr == "CR" ? detail.Amount : 0,
                    IsDeleted = false,
                    Remarks = detail.Remarks
                };
                _context.AcctTrad.Add(acctTrad);
            }

            await _context.SaveChangesAsync();
            return acctTran.AcctTranID;
        }

        // ==================== AUTO-CREATE FROM SALE ====================

        public async Task<int> CreateFromSaleAsync(int tranNumb, int userId, int branchId)
        {
            try
            {
                var sale = await _context.SaleFiles.FirstOrDefaultAsync(x => x.TranNumb == tranNumb);
                if (sale == null) throw new Exception("Sale not found");

                int nextVoucherNo = await GetNextVoucherNumber("SA", branchId);

                // ✅ ZERO HARDCODE - Get accounts from COA
                var salesAccount = await GetSalesRevenueAccountAsync(branchId);
                var cashAccount = await GetCashAccountAsync(branchId);

                // Customer account from sale
                int customerAcctId = cashAccount.acctID;
                string customerAcctCode = cashAccount.AcctCode;
                string customerName = sale.CustName ?? sale.WalkingCustomer ?? "Cash Customer";

                if (sale.CustID != null && sale.CustID > 0)
                {
                    var cust = await _context.tblCOA.FirstOrDefaultAsync(x => x.acctID == sale.CustID);
                    if (cust != null)
                    {
                        customerAcctId = cust.acctID;
                        customerAcctCode = cust.AcctCode;
                        customerName = cust.AcctName ?? customerName;
                    }
                }

                var acctTran = new AcctTran
                {
                    TranDate = sale.TranDate,
                    VochType = "SA",
                    TypeAbbr = "SAL",
                    VochNumb = nextVoucherNo,
                    TranDesc = $"Sale Invoice #{sale.BillNumb} - {customerName}",
                    BranchID = branchId,
                    IsDeleted = false,
                    AddOn = DateTime.UtcNow,
                    AddBy = userId
                };
                _context.AcctTran.Add(acctTran);
                await _context.SaveChangesAsync();

                double amount = (double)(sale.TotlAmnt ?? 0);

                // DEBIT: Customer or Cash
                _context.AcctTrad.Add(new AcctTrad { AcctTranID = acctTran.AcctTranID, TranDate = sale.TranDate, TranNatr = "DR", AcctID = customerAcctId, AcctCode = customerAcctCode, DebtAmnt = amount, CrdtAmnt = 0, IsDeleted = false, Remarks = $"Sale to {customerName}" });

                // CREDIT: Sales Revenue
                _context.AcctTrad.Add(new AcctTrad { AcctTranID = acctTran.AcctTranID, TranDate = sale.TranDate, TranNatr = "CR", AcctID = salesAccount.acctID, AcctCode = salesAccount.AcctCode, DebtAmnt = 0, CrdtAmnt = amount, IsDeleted = false, Remarks = "Sales revenue" });

                await _context.SaveChangesAsync();
                await PostVoucherToLedger(acctTran.AcctTranID, userId);
                Console.WriteLine($"✅ Sale Voucher #{acctTran.AcctTranID} AUTO-POSTED");
                return acctTran.AcctTranID;
            }
            catch (Exception ex) { Console.WriteLine($"❌ Sale Voucher Error: {ex.Message}"); throw; }
        }
        // ==================== AUTO-CREATE FROM PURCHASE ====================

        
        public async Task<int> CreateFromPurchaseAsync(int tranNumb, int userId, int branchId)
        {
            try
            {
                var purchase = await _context.PurcFile.FirstOrDefaultAsync(x => x.TranNumb == tranNumb);
                if (purchase == null) throw new Exception("Purchase not found");

                int nextVoucherNo = await GetNextVoucherNumber("PU", branchId);

                // ✅ Get Purchase Account (for DEBIT)
                var purchaseAccount = await GetPurchaseAccountAsync(branchId);

                // ✅ Get Cash Account as fallback
                var cashAccount = await GetCashAccountAsync(branchId);

                // ✅ Get Supplier Account (for CREDIT) - Default to Cash if no supplier
                int supplierAcctId = cashAccount.acctID;
                string supplierAcctCode = cashAccount.AcctCode;

                if (purchase.SuppID != null && purchase.SuppID > 0)
                {
                    var supp = await _context.tblCOA.FirstOrDefaultAsync(x => x.acctID == purchase.SuppID);
                    if (supp != null)
                    {
                        supplierAcctId = supp.acctID;
                        supplierAcctCode = supp.AcctCode;
                        Console.WriteLine($"✅ Supplier found: {supp.AcctCode} - {supp.AcctName}");
                    }
                }

                var acctTran = new AcctTran
                {
                    TranDate = purchase.TranDate,
                    VochType = "PU",
                    TypeAbbr = "PUR",
                    VochNumb = nextVoucherNo,
                    TranDesc = $"Purchase Invoice #{purchase.BillNumb}",
                    BranchID = branchId,
                    IsDeleted = false,
                    AddOn = DateTime.UtcNow,
                    AddBy = userId
                };
                _context.AcctTran.Add(acctTran);
                await _context.SaveChangesAsync();

                double amount = purchase.TotlAmnt ?? 0;

                // DEBIT: Purchase Account
                _context.AcctTrad.Add(new AcctTrad
                {
                    AcctTranID = acctTran.AcctTranID,
                    TranDate = purchase.TranDate,
                    TranNatr = "DR",
                    AcctID = purchaseAccount.acctID,
                    AcctCode = purchaseAccount.AcctCode,
                    DebtAmnt = amount,
                    CrdtAmnt = 0,
                    IsDeleted = false,
                    Remarks = "Purchase amount"
                });

                // CREDIT: Supplier Account (or Cash if no supplier)
                _context.AcctTrad.Add(new AcctTrad
                {
                    AcctTranID = acctTran.AcctTranID,
                    TranDate = purchase.TranDate,
                    TranNatr = "CR",
                    AcctID = supplierAcctId,
                    AcctCode = supplierAcctCode,
                    DebtAmnt = 0,
                    CrdtAmnt = amount,
                    IsDeleted = false,
                    Remarks = purchase.SuppID > 0 ? "Supplier credit" : "Cash purchase"
                });

                await _context.SaveChangesAsync();

                // ✅ AUTO-POST TO LEDGER
                await PostVoucherToLedger(acctTran.AcctTranID, userId);
                Console.WriteLine($"✅ Purchase Voucher #{acctTran.AcctTranID} AUTO-POSTED | Dr: {purchaseAccount.AcctCode} | Cr: {supplierAcctCode}");
                return acctTran.AcctTranID;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Purchase Voucher Error: {ex.Message}");
                throw;
            }
        }
        // ==================== AUTO-CREATE FROM RECEIVING ====================
        //public async Task<int> CreateFromReceivingAsync(int receivingId, int userId, int branchId)
        //{
        //    try
        //    {
        //        var receiving = await _context.ReceivingFiles.Include(x => x.CashList).Include(x => x.ChequeList).FirstOrDefaultAsync(x => x.Id == receivingId);
        //        if (receiving == null) throw new Exception("Receiving not found");

        //        int nextVoucherNo = await GetNextVoucherNumber("RV", branchId);
        //        var cashAccount = await GetCashAccountAsync(branchId);

        //        int partyAcctId = receiving.PartyId ?? cashAccount.acctID;
        //        string partyName = receiving.PartyName ?? receiving.WalkingCustomer ?? "Party";

        //        var acctTran = new AcctTran
        //        {
        //            TranDate = receiving.ReceiveDate,
        //            VochType = "RV",
        //            TypeAbbr = "RCV",
        //            VochNumb = nextVoucherNo,
        //            TranDesc = $"Receiving #{receiving.VoucherNumb} - {partyName}",
        //            BranchID = branchId,
        //            IsDeleted = false,
        //            AddOn = DateTime.UtcNow,
        //            AddBy = userId
        //        };
        //        _context.AcctTran.Add(acctTran);
        //        await _context.SaveChangesAsync();

        //        double amount = (double)receiving.TotalAmount;

        //        _context.AcctTrad.Add(new AcctTrad { AcctTranID = acctTran.AcctTranID, TranDate = receiving.ReceiveDate, TranNatr = "DR", AcctID = cashAccount.acctID, AcctCode = cashAccount.AcctCode, DebtAmnt = amount, CrdtAmnt = 0, IsDeleted = false, Remarks = "Amount received" });
        //        _context.AcctTrad.Add(new AcctTrad { AcctTranID = acctTran.AcctTranID, TranDate = receiving.ReceiveDate, TranNatr = "CR", AcctID = partyAcctId, AcctCode = "PARTY", DebtAmnt = 0, CrdtAmnt = amount, IsDeleted = false, Remarks = "Party credit" });

        //        await _context.SaveChangesAsync();
        //        await PostVoucherToLedger(acctTran.AcctTranID, userId);
        //        Console.WriteLine($"✅ Receiving Voucher #{acctTran.AcctTranID} AUTO-POSTED");
        //        return acctTran.AcctTranID;
        //    }
        //    catch (Exception ex) { Console.WriteLine($"❌ Receiving Voucher Error: {ex.Message}"); throw; }
        //}
        public async Task<int> CreateFromReceivingAsync(int receivingId, int userId, int branchId)
        {
            try
            {
                var receiving = await _context.ReceivingFiles
                    .Include(x => x.CashList)
                    .Include(x => x.ChequeList)
                    .FirstOrDefaultAsync(x => x.Id == receivingId);

                if (receiving == null) throw new Exception("Receiving not found");

                int nextVoucherNo = await GetNextVoucherNumber("RV", branchId);
                var cashAccount = await GetCashAccountAsync(branchId);

                int partyAcctId = receiving.PartyId ?? cashAccount.acctID;
                string partyName = receiving.PartyName ?? receiving.WalkingCustomer ?? "Party";

                // ============================================================
                // VOUCHER HEADER
                // ============================================================
                var acctTran = new AcctTran
                {
                    TranDate = receiving.ReceiveDate,
                    VochType = "RV",
                    TypeAbbr = "RCV",
                    VochNumb = nextVoucherNo,
                    TranDesc = $"Receiving #{receiving.VoucherNumb} - {partyName}",
                    BranchID = branchId,
                    IsDeleted = false,
                    AddOn = DateTime.UtcNow,
                    AddBy = userId
                };
                _context.AcctTran.Add(acctTran);
                await _context.SaveChangesAsync();

                decimal totalAmount = receiving.TotalAmount;

                // ============================================================
                // VOUCHER DETAILS — Cash + Cheque ALAG-ALAG
                // ============================================================

                // Cash voucher detail
                if (receiving.CashList.Any(c => c.Amount > 0))
                {
                    decimal cashTotal = receiving.CashList.Sum(c => c.Amount);
                    _context.AcctTrad.Add(new AcctTrad
                    {
                        AcctTranID = acctTran.AcctTranID,
                        TranDate = receiving.ReceiveDate,
                        TranNatr = "DR",
                        AcctID = cashAccount.acctID,
                        AcctCode = cashAccount.AcctCode,
                        DebtAmnt = (double)cashTotal,
                        CrdtAmnt = 0,
                        IsDeleted = false,
                        Remarks = $"Cash received from {partyName}"
                    });
                }

                // Cheque voucher details (one per cheque)
                foreach (var cheque in receiving.ChequeList.Where(c => c.Amount > 0))
                {
                    _context.AcctTrad.Add(new AcctTrad
                    {
                        AcctTranID = acctTran.AcctTranID,
                        TranDate = receiving.ReceiveDate,
                        TranNatr = "DR",
                        AcctID = cashAccount.acctID,
                        AcctCode = cashAccount.AcctCode,
                        DebtAmnt = (double)cheque.Amount,
                        CrdtAmnt = 0,
                        IsDeleted = false,
                        Remarks = $"Cheque #{cheque.ChequeNumber} {cheque.BankName} from {partyName}"
                    });
                }

                // CREDIT: Party Account (combined in voucher)
                _context.AcctTrad.Add(new AcctTrad
                {
                    AcctTranID = acctTran.AcctTranID,
                    TranDate = receiving.ReceiveDate,
                    TranNatr = "CR",
                    AcctID = partyAcctId,
                    AcctCode = "PARTY",
                    DebtAmnt = 0,
                    CrdtAmnt = (double)totalAmount,
                    IsDeleted = false,
                    Remarks = $"Receipt #{receiving.VoucherNumb}"
                });

                await _context.SaveChangesAsync();

                // ============================================================
                // LEDGER: Bank Account — Debit entries (Cash + Cheque ALAG)
                // ============================================================
                foreach (var cash in receiving.CashList.Where(c => c.Amount > 0))
                {
                    _context.LedgerEntries.Add(new LedgerEntry
                    {
                        BranchID = branchId,
                        ReceivingID = acctTran.AcctTranID,
                        AccountID = cashAccount.acctID,
                        EntryDate = receiving.ReceiveDate,
                        Debit = (decimal)cash.Amount,
                        Credit = 0,
                        Description = $"Receiving #{receiving.VoucherNumb} - Cash from {partyName}",
                        AddBy = userId,
                        AddOn = DateTime.Now
                    });
                }

                foreach (var cheque in receiving.ChequeList.Where(c => c.Amount > 0))
                {
                    _context.LedgerEntries.Add(new LedgerEntry
                    {
                        BranchID = branchId,
                        ReceivingID = acctTran.AcctTranID,
                        AccountID = cashAccount.acctID,
                        EntryDate = receiving.ReceiveDate,
                        Debit = (decimal)cheque.Amount,
                        Credit = 0,
                        Description = $"Receiving #{receiving.VoucherNumb} - Cheque #{cheque.ChequeNumber} {cheque.BankName} from {partyName}",
                        AddBy = userId,
                        AddOn = DateTime.Now
                    });
                }

                // ============================================================
                // LEDGER: Party Account — Credit entries (Cash + Cheque ALAG)
                // ============================================================
                foreach (var cash in receiving.CashList.Where(c => c.Amount > 0))
                {
                    _context.LedgerEntries.Add(new LedgerEntry
                    {
                        BranchID = branchId,
                        ReceivingID = acctTran.AcctTranID,
                        AccountID = partyAcctId,
                        EntryDate = receiving.ReceiveDate,
                        Debit = 0,
                        Credit = (decimal)cash.Amount,
                        Description = $"Receiving #{receiving.VoucherNumb} - Cash from {partyName}",
                        AddBy = userId,
                        AddOn = DateTime.Now
                    });
                }

                foreach (var cheque in receiving.ChequeList.Where(c => c.Amount > 0))
                {
                    _context.LedgerEntries.Add(new LedgerEntry
                    {
                        BranchID = branchId,
                        ReceivingID = acctTran.AcctTranID,
                        AccountID = partyAcctId,
                        EntryDate = receiving.ReceiveDate,
                        Debit = 0,
                        Credit = (decimal)cheque.Amount,
                        Description = $"Receiving #{receiving.VoucherNumb} - Cheque #{cheque.ChequeNumber} {cheque.BankName} from {partyName}",
                        AddBy = userId,
                        AddOn = DateTime.Now
                    });
                }

                await _context.SaveChangesAsync();
                Console.WriteLine($"✅ Receiving Voucher #{acctTran.AcctTranID} POSTED | Cash: {receiving.CashList.Sum(c => c.Amount)} | Cheque: {receiving.ChequeList.Sum(c => c.Amount)}");
                return acctTran.AcctTranID;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Receiving Voucher Error: {ex.Message}");
                throw;
            }
        }
        // ==================== AUTO-CREATE FROM PAYMENT ====================


        //public async Task<int> CreateFromPaymentAsync(int paymentId, int userId, int branchId)
        //{
        //    try
        //    {
        //        var payment = await _context.PaymentFiles.FirstOrDefaultAsync(x => x.PaymentID == paymentId);
        //        if (payment == null) throw new Exception("Payment not found");

        //        var paymentDetails = await _context.PaymentDetails.Where(x => x.PaymentID == paymentId).ToListAsync();
        //        int nextVoucherNo = await GetNextVoucherNumber("PV", branchId);
        //        var cashAccount = await GetCashAccountAsync(branchId);

        //        int referenceAcctId = payment.ReferenceID;
        //        string referenceName = payment.ReferenceName ?? "Supplier";

        //        var acctTran = new AcctTran
        //        {
        //            TranDate = payment.PaymentDate,
        //            VochType = "PV",
        //            TypeAbbr = "PAY",
        //            VochNumb = nextVoucherNo,
        //            TranDesc = $"Payment #{payment.VoucherNumb} - {referenceName}",
        //            BranchID = branchId,
        //            IsDeleted = false,
        //            AddOn = DateTime.UtcNow,
        //            AddBy = userId
        //        };
        //        _context.AcctTran.Add(acctTran);
        //        await _context.SaveChangesAsync();

        //        double totalAmount = (double)payment.Amount;

        //        // DEBIT: Reference Account (Supplier/Party)
        //        _context.AcctTrad.Add(new AcctTrad { AcctTranID = acctTran.AcctTranID, TranDate = payment.PaymentDate, TranNatr = "DR", AcctID = referenceAcctId, AcctCode = "PARTY", DebtAmnt = totalAmount, CrdtAmnt = 0, IsDeleted = false, Remarks = $"Payment to {referenceName}" });

        //        // CREDIT: From each payment detail
        //        if (paymentDetails.Any())
        //        {
        //            foreach (var d in paymentDetails)
        //            {
        //                int creditAcctId = cashAccount.acctID;
        //                string creditAcctCode = cashAccount.AcctCode;

        //                if ((d.PaymentMode.ToUpper() == "CHEQUE" || d.PaymentMode.ToUpper() == "BANK") && d.BankAccountID > 0)
        //                {
        //                    var bank = await _context.tblCOA.FirstOrDefaultAsync(x => x.acctID == d.BankAccountID);
        //                    if (bank != null) { creditAcctId = bank.acctID; creditAcctCode = bank.AcctCode; }
        //                }

        //                _context.AcctTrad.Add(new AcctTrad { AcctTranID = acctTran.AcctTranID, TranDate = payment.PaymentDate, TranNatr = "CR", AcctID = creditAcctId, AcctCode = creditAcctCode, DebtAmnt = 0, CrdtAmnt = (double)d.Amount, IsDeleted = false, Remarks = d.PaymentMode });
        //            }
        //        }
        //        else
        //        {
        //            _context.AcctTrad.Add(new AcctTrad { AcctTranID = acctTran.AcctTranID, TranDate = payment.PaymentDate, TranNatr = "CR", AcctID = cashAccount.acctID, AcctCode = cashAccount.AcctCode, DebtAmnt = 0, CrdtAmnt = totalAmount, IsDeleted = false, Remarks = "Cash payment" });
        //        }

        //        await _context.SaveChangesAsync();
        //        await PostVoucherToLedger(acctTran.AcctTranID, userId);
        //        Console.WriteLine($"✅ Payment Voucher #{acctTran.AcctTranID} AUTO-POSTED");
        //        return acctTran.AcctTranID;
        //    }
        //    catch (Exception ex) { Console.WriteLine($"❌ Payment Voucher Error: {ex.Message}"); throw; }
        //}
        public async Task<int> CreateFromPaymentAsync(int paymentId, int userId, int branchId)
        {
            try
            {
                var payment = await _context.PaymentFiles.FirstOrDefaultAsync(x => x.PaymentID == paymentId);
                if (payment == null) throw new Exception("Payment not found");

                var paymentDetails = await _context.PaymentDetails.Where(x => x.PaymentID == paymentId).ToListAsync();
                int nextVoucherNo = await GetNextVoucherNumber("PV", branchId);
                var cashAccount = await GetCashAccountAsync(branchId);

                int referenceAcctId = payment.ReferenceID;
                string referenceName = payment.ReferenceName ?? "Supplier";

                // ============================================================
                // VOUCHER HEADER
                // ============================================================
                var acctTran = new AcctTran
                {
                    TranDate = payment.PaymentDate,
                    VochType = "PV",
                    TypeAbbr = "PAY",
                    VochNumb = nextVoucherNo,
                    TranDesc = $"Payment #{payment.VoucherNumb} - {referenceName}",
                    BranchID = branchId,
                    IsDeleted = false,
                    AddOn = DateTime.UtcNow,
                    AddBy = userId
                };
                _context.AcctTran.Add(acctTran);
                await _context.SaveChangesAsync();

                decimal totalAmount = payment.Amount;

                // ============================================================
                // VOUCHER DETAILS — DEBIT: Supplier + CREDIT: Cash/Cheque/Bank ALAG
                // ============================================================

                // DEBIT: Supplier Account (combined in voucher)
                _context.AcctTrad.Add(new AcctTrad
                {
                    AcctTranID = acctTran.AcctTranID,
                    TranDate = payment.PaymentDate,
                    TranNatr = "DR",
                    AcctID = referenceAcctId,
                    AcctCode = "PARTY",
                    DebtAmnt = (double)totalAmount,
                    CrdtAmnt = 0,
                    IsDeleted = false,
                    Remarks = $"Payment to {referenceName}"
                });

                // CREDIT: Cash/Cheque/Bank alag-alag
                if (paymentDetails.Any())
                {
                    foreach (var d in paymentDetails)
                    {
                        int creditAcctId = cashAccount.acctID;
                        string creditAcctCode = cashAccount.AcctCode;

                        if ((d.PaymentMode.ToUpper() == "CHEQUE" || d.PaymentMode.ToUpper() == "BANK") && d.BankAccountID > 0)
                        {
                            var bank = await _context.tblCOA.FirstOrDefaultAsync(x => x.acctID == d.BankAccountID);
                            if (bank != null) { creditAcctId = bank.acctID; creditAcctCode = bank.AcctCode; }
                        }

                        string remarks = d.PaymentMode.ToUpper() switch
                        {
                            "CASH" => $"Cash payment to {referenceName}",
                            "BANK" => $"Bank transfer to {referenceName}",
                            "CHEQUE" => $"Cheque #{d.ChequeNo} to {referenceName}",
                            _ => d.PaymentMode
                        };

                        _context.AcctTrad.Add(new AcctTrad
                        {
                            AcctTranID = acctTran.AcctTranID,
                            TranDate = payment.PaymentDate,
                            TranNatr = "CR",
                            AcctID = creditAcctId,
                            AcctCode = creditAcctCode,
                            DebtAmnt = 0,
                            CrdtAmnt = (double)d.Amount,
                            IsDeleted = false,
                            Remarks = remarks
                        });
                    }
                }
                else
                {
                    _context.AcctTrad.Add(new AcctTrad
                    {
                        AcctTranID = acctTran.AcctTranID,
                        TranDate = payment.PaymentDate,
                        TranNatr = "CR",
                        AcctID = cashAccount.acctID,
                        AcctCode = cashAccount.AcctCode,
                        DebtAmnt = 0,
                        CrdtAmnt = (double)totalAmount,
                        IsDeleted = false,
                        Remarks = $"Cash payment to {referenceName}"
                    });
                }

                await _context.SaveChangesAsync();

                // ============================================================
                // LEDGER: Supplier Account — DEBIT entries ALAG-ALAG
                // ============================================================
                if (paymentDetails.Any())
                {
                    foreach (var d in paymentDetails)
                    {
                        string desc = d.PaymentMode.ToUpper() switch
                        {
                            "CASH" => $"Payment #{payment.VoucherNumb} - Cash to {referenceName}",
                            "BANK" => $"Payment #{payment.VoucherNumb} - Bank transfer to {referenceName}",
                            "CHEQUE" => $"Payment #{payment.VoucherNumb} - Cheque #{d.ChequeNo} to {referenceName}",
                            _ => $"Payment #{payment.VoucherNumb} - {d.PaymentMode} to {referenceName}"
                        };

                        _context.LedgerEntries.Add(new LedgerEntry
                        {
                            BranchID = branchId,
                            ReceivingID = acctTran.AcctTranID,
                            AccountID = referenceAcctId,
                            EntryDate = payment.PaymentDate,
                            Debit = (decimal)d.Amount,
                            Credit = 0,
                            Description = desc,
                            AddBy = userId,
                            AddOn = DateTime.Now
                        });
                    }
                }
                else
                {
                    _context.LedgerEntries.Add(new LedgerEntry
                    {
                        BranchID = branchId,
                        ReceivingID = acctTran.AcctTranID,
                        AccountID = referenceAcctId,
                        EntryDate = payment.PaymentDate,
                        Debit = (decimal)totalAmount,
                        Credit = 0,
                        Description = $"Payment #{payment.VoucherNumb} - Cash to {referenceName}",
                        AddBy = userId,
                        AddOn = DateTime.Now
                    });
                }

                // ============================================================
                // LEDGER: Cash/Bank Account — CREDIT entries ALAG-ALAG
                // ============================================================
                if (paymentDetails.Any())
                {
                    foreach (var d in paymentDetails)
                    {
                        int creditAcctId = cashAccount.acctID;

                        if ((d.PaymentMode.ToUpper() == "CHEQUE" || d.PaymentMode.ToUpper() == "BANK") && d.BankAccountID > 0)
                        {
                            creditAcctId = d.BankAccountID.Value;
                        }

                        string desc = d.PaymentMode.ToUpper() switch
                        {
                            "CASH" => $"Payment #{payment.VoucherNumb} - Cash paid to {referenceName}",
                            "BANK" => $"Payment #{payment.VoucherNumb} - Bank transfer to {referenceName}",
                            "CHEQUE" => $"Payment #{payment.VoucherNumb} - Cheque #{d.ChequeNo} paid to {referenceName}",
                            _ => $"Payment #{payment.VoucherNumb} - {d.PaymentMode} to {referenceName}"
                        };

                        _context.LedgerEntries.Add(new LedgerEntry
                        {
                            BranchID = branchId,
                            ReceivingID = acctTran.AcctTranID,
                            AccountID = creditAcctId,
                            EntryDate = payment.PaymentDate,
                            Debit = 0,
                            Credit = (decimal)d.Amount,
                            Description = desc,
                            AddBy = userId,
                            AddOn = DateTime.Now
                        });
                    }
                }
                else
                {
                    _context.LedgerEntries.Add(new LedgerEntry
                    {
                        BranchID = branchId,
                        ReceivingID = acctTran.AcctTranID,
                        AccountID = cashAccount.acctID,
                        EntryDate = payment.PaymentDate,
                        Debit = 0,
                        Credit = (decimal)totalAmount,
                        Description = $"Payment #{payment.VoucherNumb} - Cash paid to {referenceName}",
                        AddBy = userId,
                        AddOn = DateTime.Now
                    });
                }

                await _context.SaveChangesAsync();
                Console.WriteLine($"✅ Payment Voucher #{acctTran.AcctTranID} POSTED with breakup (no duplicate)");
                return acctTran.AcctTranID;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Payment Voucher Error: {ex.Message}");
                throw;
            }
        }


        // ==================== POSTING TO LEDGER ====================

        //public async Task<bool> PostVoucherToLedger(int acctTranId, int userId)
        //{
        //    try
        //    {
        //        var voucher = GetVoucherById(acctTranId);
        //        if (voucher == null) throw new Exception("Voucher not found");

        //        // Check if already posted
        //        var existing = await _context.LedgerEntries
        //            .FirstOrDefaultAsync(x => x.ReceivingID == acctTranId);

        //        if (existing != null)
        //            throw new Exception("Voucher already posted");

        //        foreach (var detail in voucher.Details)
        //        {
        //            int accountId = detail.AcctID ?? 0;
        //            if (accountId == 0) continue;

        //            // ✅ Get account details
        //            var account = await _context.tblCOA.FirstOrDefaultAsync(x => x.acctID == accountId);
        //            if (account == null) continue;

        //            string accountType = account.AcctType ?? "";
        //            string tranNatr = detail.TranNatr ?? "";

        //            // ✅ CRITICAL RULE: NEVER post Credit entry to Liability account
        //            if (accountType == "Liability" && tranNatr == "CR")
        //            {
        //                Console.WriteLine($"⏭️ SKIPPING: Credit entry not allowed for Liability account: {account.AcctName} (ID: {accountId})");
        //                continue;
        //            }

        //            // ✅ Also skip if Debit entry is 0 and Credit > 0 for Liability accounts (double safety)
        //            if (accountType == "Liability" && detail.DebtAmnt == 0 && detail.CrdtAmnt > 0)
        //            {
        //                Console.WriteLine($"⏭️ SKIPPING: Zero Debit, Positive Credit for Liability account: {account.AcctName}");
        //                continue;
        //            }

        //            string description = GenerateLedgerDescription(voucher, detail);
        //            string voucherDisplayNo = GetVoucherDisplayNumber(voucher);

        //            var ledgerEntry = new LedgerEntry
        //            {
        //                BranchID = voucher.BranchID ?? 1,
        //                ReceivingID = acctTranId,
        //                PaymentID = null,
        //                AccountID = accountId,
        //                EntryDate = voucher.TranDate ?? DateTime.Now,
        //                Debit = (decimal)(detail.DebtAmnt ?? 0),
        //                Credit = (decimal)(detail.CrdtAmnt ?? 0),
        //                Description = $"{voucherDisplayNo} - {description}",
        //                AddBy = userId,
        //                AddOn = DateTime.Now
        //            };

        //            Console.WriteLine($"✅ POSTING: {account.AcctName} ({accountType}) | {tranNatr} | Dr:{ledgerEntry.Debit} Cr:{ledgerEntry.Credit}");
        //            _context.LedgerEntries.Add(ledgerEntry);
        //        }

        //        await _context.SaveChangesAsync();
        //        Console.WriteLine($"✅ Voucher {acctTranId} posted to ledger");
        //        return true;
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"PostVoucherToLedger Error: {ex.Message}");
        //        throw;
        //    }
        //}
        public async Task<bool> PostVoucherToLedger(int acctTranId, int userId)
        {
            try
            {
                var voucher = GetVoucherById(acctTranId);
                if (voucher == null) throw new Exception("Voucher not found");

                // Check if already posted
                var existing = await _context.LedgerEntries
                    .FirstOrDefaultAsync(x => x.ReceivingID == acctTranId);

                if (existing != null)
                    throw new Exception("Voucher already posted");

                foreach (var detail in voucher.Details)
                {
                    int accountId = detail.AcctID ?? 0;
                    if (accountId == 0) continue;

                    var account = await _context.tblCOA.FirstOrDefaultAsync(x => x.acctID == accountId);
                    if (account == null) continue;

                    string description = GenerateLedgerDescription(voucher, detail);
                    string voucherDisplayNo = GetVoucherDisplayNumber(voucher);

                    var ledgerEntry = new LedgerEntry
                    {
                        BranchID = voucher.BranchID ?? 1,
                        ReceivingID = acctTranId,
                        PaymentID = null,
                        AccountID = accountId,
                        EntryDate = voucher.TranDate ?? DateTime.Now,
                        Debit = (decimal)(detail.DebtAmnt ?? 0),
                        Credit = (decimal)(detail.CrdtAmnt ?? 0),
                        Description = $"{voucherDisplayNo} - {description}",
                        AddBy = userId,
                        AddOn = DateTime.Now
                    };

                    Console.WriteLine($"✅ POSTING: {account.AcctName} ({account.AcctType}) | {detail.TranNatr} | Dr:{ledgerEntry.Debit} Cr:{ledgerEntry.Credit}");
                    _context.LedgerEntries.Add(ledgerEntry);
                }

                await _context.SaveChangesAsync();
                Console.WriteLine($"✅ Voucher {acctTranId} posted to ledger successfully");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ PostVoucherToLedger Error: {ex.Message}");
                throw;
            }
        }
        public async Task<bool> ReversePosting(int acctTranId, int userId)
        {
            var entries = await _context.LedgerEntries
                .Where(x => x.ReceivingID == acctTranId)  // ✅ Changed from PaymentID to ReceivingID
                .ToListAsync();

            if (!entries.Any())
                throw new Exception("No posting found to reverse");

            foreach (var entry in entries)
            {
                var reverseEntry = new LedgerEntry
                {
                    BranchID = entry.BranchID,
                    ReceivingID = acctTranId,  // ✅ Use ReceivingID
                    PaymentID = null,
                    AccountID = entry.AccountID,
                    EntryDate = DateTime.Now,
                    Debit = entry.Credit,
                    Credit = entry.Debit,
                    Description = $"REVERSAL: {entry.Description}",
                    AddBy = userId,
                    AddOn = DateTime.Now
                };
                _context.LedgerEntries.Add(reverseEntry);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // ==================== PRINT VOUCHER ====================
        public async Task<byte[]> PrintVoucher(int acctTranId)
        {
            var voucher = GetVoucherById(acctTranId);
            if (voucher == null) throw new Exception("Voucher not found");

            string html = GenerateVoucherHtml(voucher);
            return System.Text.Encoding.UTF8.GetBytes(html);
        }

        // ==================== VALIDATION ====================
        public bool ValidateVoucherEntries(List<VoucherDetailDto> details)
        {
            double totalDebit = details.Where(x => x.TranNatr == "DR").Sum(x => x.Amount);
            double totalCredit = details.Where(x => x.TranNatr == "CR").Sum(x => x.Amount);
            return Math.Abs(totalDebit - totalCredit) < 0.01;
        }

        // ==================== HELPER METHODS ====================
        private async Task<int> GetNextVoucherNumber(string vochType, int branchId)
        {
            var lastVoucher = await _context.AcctTran
                .Where(x => x.VochType == vochType && x.BranchID == branchId)
                .OrderByDescending(x => x.VochNumb)
                .FirstOrDefaultAsync();

            return (lastVoucher?.VochNumb ?? 0) + 1;
        }

        private string GetTypeAbbr(string vochType)
        {
            var voucherType = _context.VochType
                .FirstOrDefault(x => x.VochTypeCode == vochType);

            return voucherType?.TypeAbbr ?? vochType;
        }

        private string? GetAcctCode(int acctId)
        {
            var coa = _context.tblCOA.FirstOrDefault(x => x.acctID == acctId);
            return coa?.AcctCode;
        }

        private string GenerateVoucherHtml(AcctTranDetailDto voucher)
        {
            double totalDebit = voucher.Details.Sum(d => d.DebtAmnt ?? 0);
            double totalCredit = voucher.Details.Sum(d => d.CrdtAmnt ?? 0);

            return $@"
            <!DOCTYPE html>
            <html>
            <head>
                <title>Voucher #{voucher.VochNumb}</title>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 20px; }}
                    .voucher-container {{ max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px; }}
                    .header {{ text-align: center; margin-bottom: 20px; }}
                    .title {{ font-size: 24px; font-weight: bold; }}
                    .info-row {{ display: flex; margin-bottom: 10px; }}
                    .info-label {{ width: 120px; font-weight: bold; }}
                    .info-value {{ flex: 1; }}
                    table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
                    th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                    th {{ background-color: #f2f2f2; }}
                    .amount {{ text-align: right; }}
                    .footer {{ margin-top: 30px; text-align: center; font-size: 12px; color: #666; }}
                </style>
            </head>
            <body>
                <div class='voucher-container'>
                    <div class='header'>
                        <div class='title'>VOUCHER</div>
                        <div>#{voucher.VochNumb}</div>
                    </div>
                    
                    <div class='info-row'>
                        <div class='info-label'>Date:</div>
                        <div class='info-value'>{(voucher.TranDate?.ToString("yyyy-MM-dd") ?? "")}</div>
                    </div>
                    <div class='info-row'>
                        <div class='info-label'>Type:</div>
                        <div class='info-value'>{voucher.VochType} ({voucher.TypeAbbr})</div>
                    </div>
                    <div class='info-row'>
                        <div class='info-label'>Description:</div>
                        <div class='info-value'>{voucher.TranDesc}</div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Account Code</th>
                                <th>Account Name</th>
                                <th>Debit</th>
                                <th>Credit</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {string.Join("", voucher.Details.Select(d => $@"
                            <tr>
                                <td>{d.AcctCode}</td>
                                <td>{d.AcctName}</td>
                                <td class='amount'>{d.DebtAmnt:F2}</td>
                                <td class='amount'>{d.CrdtAmnt:F2}</td>
                                <td>{d.Remarks}</td>
                            </td>"))}
                        </tbody>
                        <tfoot>
                            <tr style='font-weight: bold;'>
                                <td colspan='2'>Total</td>
                                <td class='amount'>{totalDebit:F2}</td>
                                <td class='amount'>{totalCredit:F2}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    <div class='footer'>
                        Generated on: {DateTime.Now:yyyy-MM-dd HH:mm:ss}
                    </div>
                </div>
            </body>
            </html>";
        }

        // ==================== ACCOUNT DROPDOWN FOR VOUCHER ====================
        public async Task<List<AccountDropdownDto>> GetAccountsForVoucherDropdown(int branchId)
        {
            try
            {
                var accounts = await _context.tblCOA
                    .Where(x => x.Active == true
                                && x.AcctLast == true
                                && (x.BranchID == null || x.BranchID == branchId))
                    .OrderBy(x => x.AcctCode)
                    .Select(x => new AccountDropdownDto
                    {
                        Value = x.acctID,
                        Label = $"{x.AcctCode} - {x.AcctName}",
                        Code = x.AcctCode,
                        Name = x.AcctName
                    })
                    .ToListAsync();

                return accounts;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetAccountsForVoucherDropdown Error: {ex.Message}");
                return new List<AccountDropdownDto>();
            }
        }


        public async Task<int> CreateFromSaleReturnAsync(int returnTranNumb, int userId, int branchId)
        {
            try
            {
                Console.WriteLine($"🔄 Creating voucher for Sale Return #{returnTranNumb}");

                var saleReturn = await _context.SaleReturnFiles
                    .FirstOrDefaultAsync(x => x.ReturnTranNumb == returnTranNumb);

                if (saleReturn == null)
                {
                    Console.WriteLine($"❌ Sale Return #{returnTranNumb} not found!");
                    throw new Exception("Sale Return not found");
                }

                Console.WriteLine($"✅ Sale Return found: {saleReturn.BillNumb}, Amount: {saleReturn.TotlAmnt}, CustID: {saleReturn.CustID}");

                int nextVoucherNo = await GetNextVoucherNumber("SR", branchId);
                Console.WriteLine($"📋 Next voucher number: {nextVoucherNo}");

                // ✅ Get accounts from COA by NAME (ZERO HARDCODE)
                var salesReturnAccount = await _context.tblCOA
                    .FirstOrDefaultAsync(x => x.AcctName == "Sales Return" && x.AcctLast == true && x.BranchID == branchId)
                    ?? await _context.tblCOA.FirstOrDefaultAsync(x => x.AcctCode == "04005" && x.BranchID == branchId);

                if (salesReturnAccount == null)
                {
                    Console.WriteLine("❌ Sales Return account not found in COA!");
                    throw new Exception("Sales Return account (04005) not found in COA");
                }
                Console.WriteLine($"✅ Sales Return Account: {salesReturnAccount.AcctCode} - {salesReturnAccount.AcctName}");

                var cashAccount = await GetCashAccountAsync(branchId);
                Console.WriteLine($"✅ Cash Account: {cashAccount.AcctCode} - {cashAccount.AcctName}");

                // Customer account from sale return
                int customerAcctId = cashAccount.acctID;
                string customerAcctCode = cashAccount.AcctCode;
                string customerName = saleReturn.CustName ?? saleReturn.WalkingCustomer ?? "Cash Customer";

                if (saleReturn.CustID != null && saleReturn.CustID > 0)
                {
                    var cust = await _context.tblCOA.FirstOrDefaultAsync(x => x.acctID == saleReturn.CustID);
                    if (cust != null)
                    {
                        customerAcctId = cust.acctID;
                        customerAcctCode = cust.AcctCode;
                        customerName = cust.AcctName ?? customerName;
                        Console.WriteLine($"✅ Customer Account: {cust.AcctCode} - {cust.AcctName}");
                    }
                }

                // Create voucher header
                var acctTran = new AcctTran
                {
                    TranDate = saleReturn.TranDate ?? DateTime.Now,
                    VochType = "SR",
                    TypeAbbr = "SRT",
                    VochNumb = nextVoucherNo,
                    TranDesc = $"Sale Return #{saleReturn.BillNumb} - {customerName}",
                    BranchID = branchId,
                    IsDeleted = false,
                    AddOn = DateTime.UtcNow,
                    AddBy = userId
                };

                _context.AcctTran.Add(acctTran);
                await _context.SaveChangesAsync();
                Console.WriteLine($"✅ Voucher header created: ID={acctTran.AcctTranID}");

                double amount = (double)saleReturn.TotlAmnt;
                Console.WriteLine($"💰 Amount: {amount}");

                // DEBIT: Sales Return Account
                _context.AcctTrad.Add(new AcctTrad
                {
                    AcctTranID = acctTran.AcctTranID,
                    TranDate = saleReturn.TranDate ?? DateTime.Now,
                    TranNatr = "DR",
                    AcctID = salesReturnAccount.acctID,
                    AcctCode = salesReturnAccount.AcctCode,
                    DebtAmnt = amount,
                    CrdtAmnt = 0,
                    IsDeleted = false,
                    Remarks = $"Sales return - {customerName}"
                });
                Console.WriteLine($"✅ DEBIT entry: {salesReturnAccount.AcctCode} = {amount}");

                // CREDIT: Customer or Cash Account
                _context.AcctTrad.Add(new AcctTrad
                {
                    AcctTranID = acctTran.AcctTranID,
                    TranDate = saleReturn.TranDate ?? DateTime.Now,
                    TranNatr = "CR",
                    AcctID = customerAcctId,
                    AcctCode = customerAcctCode,
                    DebtAmnt = 0,
                    CrdtAmnt = amount,
                    IsDeleted = false,
                    Remarks = $"Credit to {customerName}"
                });
                Console.WriteLine($"✅ CREDIT entry: {customerAcctCode} = {amount}");

                await _context.SaveChangesAsync();
                Console.WriteLine($"✅ Voucher details saved");

                // ✅ AUTO-POST TO LEDGER
                await PostVoucherToLedger(acctTran.AcctTranID, userId);
                Console.WriteLine($"✅ Voucher #{acctTran.AcctTranID} AUTO-POSTED for Sale Return #{returnTranNumb}");

                return acctTran.AcctTranID;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Sale Return Voucher Error: {ex.Message}");
                Console.WriteLine($"❌ Stack: {ex.StackTrace}");
                throw;
            }
        }

        //public async Task<int> CreateFromPurchaseReturnAsync(int returnId, int userId, int branchId)
        //{
        //    try
        //    {
        //        var purchaseReturn = await _context.PurchaseReturn.FirstOrDefaultAsync(x => x.ReturnID == returnId);
        //        if (purchaseReturn == null) throw new Exception("Purchase Return not found");

        //        int nextVoucherNo = await GetNextVoucherNumber("PR", branchId);

        //        var purchaseReturnAccount = await GetPurchaseReturnAccountAsync(branchId);
        //        var cashAccount = await GetCashAccountAsync(branchId);

        //        int supplierAcctId = cashAccount.acctID;
        //        string supplierAcctCode = cashAccount.AcctCode;

        //        if (purchaseReturn.SuppID > 0)
        //        {
        //            var supp = await _context.tblCOA.FirstOrDefaultAsync(x => x.acctID == purchaseReturn.SuppID);
        //            if (supp != null) { supplierAcctId = supp.acctID; supplierAcctCode = supp.AcctCode; }
        //        }

        //        var items = await _context.PurchaseReturnItems.Where(x => x.ReturnID == returnId).ToListAsync();
        //        double amount = items.Sum(x => (double)(x.ReturnQty * x.PurcRate));

        //        var acctTran = new AcctTran
        //        {
        //            TranDate = purchaseReturn.TranDate,
        //            VochType = "PR",
        //            TypeAbbr = "PRT",
        //            VochNumb = nextVoucherNo,
        //            TranDesc = $"Purchase Return #{purchaseReturn.BillNumb}",
        //            BranchID = branchId,
        //            IsDeleted = false,
        //            AddOn = DateTime.UtcNow,
        //            AddBy = userId
        //        };
        //        _context.AcctTran.Add(acctTran);
        //        await _context.SaveChangesAsync();

        //        _context.AcctTrad.Add(new AcctTrad { AcctTranID = acctTran.AcctTranID, TranDate = purchaseReturn.TranDate, TranNatr = "DR", AcctID = supplierAcctId, AcctCode = supplierAcctCode, DebtAmnt = amount, CrdtAmnt = 0, IsDeleted = false, Remarks = "Supplier debit" });
        //        _context.AcctTrad.Add(new AcctTrad { AcctTranID = acctTran.AcctTranID, TranDate = purchaseReturn.TranDate, TranNatr = "CR", AcctID = purchaseReturnAccount.acctID, AcctCode = purchaseReturnAccount.AcctCode, DebtAmnt = 0, CrdtAmnt = amount, IsDeleted = false, Remarks = "Purchase return credit" });

        //        await _context.SaveChangesAsync();
        //        // ✅ AUTO-POST
        //        await PostVoucherToLedger(acctTran.AcctTranID, userId);
        //        Console.WriteLine($"✅ Purchase Return Voucher #{acctTran.AcctTranID} AUTO-POSTED");
        //        return acctTran.AcctTranID;
        //    }
        //    catch (Exception ex) { Console.WriteLine($"❌ Purchase Return Voucher Error: {ex.Message}"); throw; }
        //}
        public async Task<int> CreateFromPurchaseReturnAsync(int returnId, int userId, int branchId)
        {
            try
            {
                var purchaseReturn = await _context.PurchaseReturn.FirstOrDefaultAsync(x => x.ReturnID == returnId);
                if (purchaseReturn == null) throw new Exception("Purchase Return not found");

                int nextVoucherNo = await GetNextVoucherNumber("PR", branchId);

                // ✅ Get Purchase Return Account (for CREDIT)
                var purchaseReturnAccount = await GetPurchaseReturnAccountAsync(branchId);

                // ✅ Get Cash Account as fallback
                var cashAccount = await GetCashAccountAsync(branchId);

                // ✅ Get Supplier Account (for DEBIT) - Default to Cash if no supplier
                int supplierAcctId = cashAccount.acctID;
                string supplierAcctCode = cashAccount.AcctCode;

                if (purchaseReturn.SuppID > 0)
                {
                    var supp = await _context.tblCOA.FirstOrDefaultAsync(x => x.acctID == purchaseReturn.SuppID);
                    if (supp != null)
                    {
                        supplierAcctId = supp.acctID;
                        supplierAcctCode = supp.AcctCode;
                        Console.WriteLine($"✅ Supplier found: {supp.AcctCode} - {supp.AcctName}");
                    }
                }

                var items = await _context.PurchaseReturnItems.Where(x => x.ReturnID == returnId).ToListAsync();
                double amount = items.Sum(x => (double)(x.ReturnQty * x.PurcRate));

                var acctTran = new AcctTran
                {
                    TranDate = purchaseReturn.TranDate,
                    VochType = "PR",
                    TypeAbbr = "PRT",
                    VochNumb = nextVoucherNo,
                    TranDesc = $"Purchase Return #{purchaseReturn.BillNumb}",
                    BranchID = branchId,
                    IsDeleted = false,
                    AddOn = DateTime.UtcNow,
                    AddBy = userId
                };
                _context.AcctTran.Add(acctTran);
                await _context.SaveChangesAsync();

                // DEBIT: Supplier Account (or Cash)
                _context.AcctTrad.Add(new AcctTrad
                {
                    AcctTranID = acctTran.AcctTranID,
                    TranDate = purchaseReturn.TranDate,
                    TranNatr = "DR",
                    AcctID = supplierAcctId,
                    AcctCode = supplierAcctCode,
                    DebtAmnt = amount,
                    CrdtAmnt = 0,
                    IsDeleted = false,
                    Remarks = purchaseReturn.SuppID > 0 ? "Supplier debit" : "Cash refund"
                });

                // CREDIT: Purchase Return Account
                _context.AcctTrad.Add(new AcctTrad
                {
                    AcctTranID = acctTran.AcctTranID,
                    TranDate = purchaseReturn.TranDate,
                    TranNatr = "CR",
                    AcctID = purchaseReturnAccount.acctID,
                    AcctCode = purchaseReturnAccount.AcctCode,
                    DebtAmnt = 0,
                    CrdtAmnt = amount,
                    IsDeleted = false,
                    Remarks = "Purchase return credit"
                });

                await _context.SaveChangesAsync();

                // ✅ AUTO-POST TO LEDGER
                await PostVoucherToLedger(acctTran.AcctTranID, userId);
                Console.WriteLine($"✅ Purchase Return Voucher #{acctTran.AcctTranID} AUTO-POSTED | Dr: {supplierAcctCode} | Cr: {purchaseReturnAccount.AcctCode}");
                return acctTran.AcctTranID;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Purchase Return Voucher Error: {ex.Message}");
                throw;
            }
        }
        // ==================== HELPER METHODS ====================
        private string GenerateLedgerDescription(AcctTranDetailDto voucher, AcctTradDto detail)
        {
            string voucherType = voucher.VochType;
            string accountName = detail.AcctName ?? "";

            switch (voucherType)
            {
                case "SA": // Sale
                    if (detail.TranNatr == "DR")
                        return $"Sale to {accountName}";
                    else
                        return "Sales revenue";

                case "SR": // Sale Return
                    if (detail.TranNatr == "DR")
                        return "Sales return";
                    else
                        return $"Credit to {accountName}";

                case "PU": // Purchase
                    if (detail.TranNatr == "DR")
                        return "Purchase amount";
                    else
                        return $"Credit to {accountName}";

                case "PR": // Purchase Return
                    if (detail.TranNatr == "DR")
                        return $"Debit to {accountName}";
                    else
                        return "Purchase return credit";

                case "RV": // Receiving
                    if (detail.TranNatr == "DR")
                        return $"Amount received - {accountName}";
                    else
                        return $"Receiving credit - {accountName}";

                case "PV": // Payment
                    if (detail.TranNatr == "DR")
                        return $"Payment to {accountName}";
                    else
                        return $"Payment from {accountName}";

                default:
                    return detail.Remarks ?? voucher.TranDesc ?? "Transaction";
            }
        }

        // ==================== DELETE VOUCHER METHODS ====================
        public async Task<bool> DeleteLedgerEntries(int acctTranId)
        {
            var entries = await _context.LedgerEntries
                .Where(x => x.ReceivingID == acctTranId)
                .ToListAsync();

            if (entries.Any())
            {
                _context.LedgerEntries.RemoveRange(entries);
                await _context.SaveChangesAsync();
            }
            return true;
        }

        public async Task<bool> DeleteVoucherDetails(int acctTranId)
        {
            var details = await _context.AcctTrad
                .Where(x => x.AcctTranID == acctTranId)
                .ToListAsync();

            if (details.Any())
            {
                _context.AcctTrad.RemoveRange(details);
                await _context.SaveChangesAsync();
            }
            return true;
        }

        public async Task<bool> DeleteVoucherHeader(int acctTranId)
        {
            var header = await _context.AcctTran
                .FirstOrDefaultAsync(x => x.AcctTranID == acctTranId);

            if (header != null)
            {
                header.IsDeleted = true;
                await _context.SaveChangesAsync();
            }
            return true;
        }

        // ✅ Add this helper method
        private string GetVoucherDisplayNumber(AcctTranDetailDto voucher)
        {
            string voucherType = voucher.VochType;
            string typeName = "";

            switch (voucherType)
            {
                case "SA": typeName = "Sale"; break;
                case "SR": typeName = "Sale Return"; break;
                case "PU": typeName = "Purchase"; break;
                case "PR": typeName = "Purchase Return"; break;
                case "RV": typeName = "Receiving"; break;
                case "PV": typeName = "Payment"; break;
                case "JV": typeName = "Journal"; break;
                default: typeName = "Voucher"; break;
            }

            return $"{typeName} #{voucher.VochNumb}";
        }


        // ==================== COA HELPER METHODS ====================
        private async Task<COA?> GetAccountByCategoryAsync(string category, int branchId)
        {
            return await _context.tblCOA
                .FirstOrDefaultAsync(x => x.AccountCategory == category
                                       && x.AcctLast == true
                                       && x.Active == true
                                       && x.BranchID == branchId);
        }

        private async Task<COA?> GetControlAccountByCategoryAsync(string category, int branchId)
        {
            return await _context.tblCOA
                .FirstOrDefaultAsync(x => x.AccountCategory == category
                                       && x.IsControlAccount == true
                                       && x.Active == true
                                       && x.BranchID == branchId);
        }

        private async Task<COA> GetCashAccountAsync(int branchId)
        {
            var cash = await _context.tblCOA
                .FirstOrDefaultAsync(x => x.AcctName == "Cash" && x.AccountCategory == "Bank" && x.BranchID == branchId)
                ?? await _context.tblCOA.FirstOrDefaultAsync(x => x.AcctCode == "01001001001" && x.BranchID == branchId);

            if (cash == null)
                throw new Exception("Cash account (01001001001) not found in COA");

            return cash;
        }

        private async Task<COA> GetSalesRevenueAccountAsync(int branchId)
        {
            return await _context.tblCOA
                .FirstOrDefaultAsync(x => x.AcctName == "Sales Revenue" && x.AcctLast == true && x.BranchID == branchId)
                ?? await _context.tblCOA.FirstOrDefaultAsync(x => x.AcctCode == "04001" && x.BranchID == branchId)
                ?? throw new Exception("Sales Revenue account not found in COA");
        }

        private async Task<COA> GetSalesReturnAccountAsync(int branchId)
        {
            return await _context.tblCOA
                .FirstOrDefaultAsync(x => x.AcctName == "Sales Return" && x.AcctLast == true && x.BranchID == branchId)
                ?? await _context.tblCOA.FirstOrDefaultAsync(x => x.AcctCode == "04005" && x.BranchID == branchId)
                ?? throw new Exception("Sales Return account not found in COA");
        }


        private async Task<COA> GetPurchaseAccountAsync(int branchId)
        {
            return await _context.tblCOA
                .FirstOrDefaultAsync(x => x.AcctName == "Purchase Account" && x.AcctLast == true && x.BranchID == branchId)
                ?? await _context.tblCOA.FirstOrDefaultAsync(x => x.AcctCode == "05002" && x.BranchID == branchId)
                ?? throw new Exception("Purchase Account not found in COA");
        }


        private async Task<COA> GetPurchaseReturnAccountAsync(int branchId)
        {
            return await _context.tblCOA
                .FirstOrDefaultAsync(x => x.AcctName == "Purchase Return" && x.AcctLast == true && x.BranchID == branchId)
                ?? await _context.tblCOA.FirstOrDefaultAsync(x => x.AcctCode == "05003" && x.BranchID == branchId)
                ?? throw new Exception("Purchase Return account not found in COA");
        }


    }
}