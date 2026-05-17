using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Payments;
using WMS.Api.Models;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class PaymentService : IPaymentService
    {
        private readonly WmsDbContext _context;
        private readonly IVoucherService _voucherService;  // ✅ ADDED

        // ✅ UPDATE CONSTRUCTOR
        public PaymentService(WmsDbContext context, IVoucherService voucherService)
        {
            _context = context;
            _voucherService = voucherService;  // ✅ ADDED
        }

        // ================= LIST =================
        public async Task<List<PaymentListDto>> GetAllAsync(int branchId)
        {
            return await _context.PaymentFiles
                .Where(x => x.BranchID == branchId && x.CancStat != true)
                .OrderByDescending(x => x.PaymentID)
                .Select(x => new PaymentListDto
                {
                    PaymentID = x.PaymentID,
                    VoucherNumb = x.VoucherNumb,
                    PaymentDate = x.PaymentDate,
                    PaymentType = x.PaymentType,
                    ReferenceName = x.ReferenceName,
                    WalkingParty = x.WalkingParty,
                    Amount = x.Amount,
                    PaymentMode = x.PaymentMode,
                    ChequeNo = x.ChequeNo
                })
                .ToListAsync();
        }

        // ================= GET BY ID =================
        public async Task<PaymentDetailDto?> GetByIdAsync(int paymentId, int branchId)
        {
            var pay = await _context.PaymentFiles
                .FirstOrDefaultAsync(x =>
                    x.PaymentID == paymentId &&
                    x.BranchID == branchId &&
                    x.CancStat != true);

            if (pay == null)
                return null;

            var details = await _context.PaymentDetails
                .Where(d => d.PaymentID == pay.PaymentID)
                .Select(d => new PaymentDetailDtoItem
                {
                    PaymentDetailID = d.PaymentDetailID,
                    PaymentMode = d.PaymentMode,
                    Amount = d.Amount,
                    BankAccountID = d.BankAccountID,
                    ChequeNo = d.ChequeNo
                })
                .ToListAsync();

            return new PaymentDetailDto
            {
                PaymentID = pay.PaymentID,
                PaymentDate = pay.PaymentDate,
                PaymentType = pay.PaymentType,
                ReferenceID = pay.ReferenceID,
                ReferenceName = pay.ReferenceName,
                Amount = pay.Amount,
                PaymentMode = pay.PaymentMode,
                ChequeNo = pay.ChequeNo,
                Description = pay.Description,
                Details = details
            };
        }

        // ================= CREATE / EDIT =================

        //public async Task<int> CreateAsync(PaymentCreateDto dto, int userId, int branchId)
        //{
        //    using var tx = await _context.Database.BeginTransactionAsync();

        //    try
        //    {
        //        bool hasDetails = dto.Details != null && dto.Details.Any();

        //        if (!hasDetails && dto.Amount <= 0)
        //            throw new ApplicationException("Payment amount must be greater than zero.");

        //        if (dto.ReferenceID <= 0 && string.IsNullOrEmpty(dto.WalkingParty))
        //            throw new ApplicationException("Account not selected or walking party not entered.");

        //        var voucherNumber = await GenerateVoucherNumberAsync(branchId);
        //        Console.WriteLine($"Generated voucher number: {voucherNumber}");

        //        // Handle edit mode
        //        if (dto.PaymentID.HasValue)
        //        {
        //            var oldPayment = await _context.PaymentFiles
        //                .FirstOrDefaultAsync(x => x.PaymentID == dto.PaymentID.Value && x.BranchID == branchId && x.CancStat != true);

        //            if (oldPayment == null)
        //                throw new ApplicationException("Payment not found.");

        //            oldPayment.CancStat = true;

        //            _context.LedgerEntries.RemoveRange(_context.LedgerEntries.Where(x => x.PaymentID == oldPayment.PaymentID));
        //            _context.PaymentDetails.RemoveRange(_context.PaymentDetails.Where(x => x.PaymentID == oldPayment.PaymentID));
        //            _context.PaymentItems.RemoveRange(_context.PaymentItems.Where(x => x.PaymentID == oldPayment.PaymentID));
        //            await _context.SaveChangesAsync();
        //        }

        //        var payment = new PaymentFile
        //        {
        //            BranchID = branchId,
        //            PaymentDate = dto.PaymentDate,
        //            PaymentType = hasDetails ? "MIXED" : dto.PaymentType,
        //            ReferenceID = dto.ReferenceID ?? 0,
        //            ReferenceName = dto.ReferenceName,
        //            WalkingParty = dto.WalkingParty,
        //            PaymentRefNumb = dto.PaymentRefNumb,
        //            VoucherNumb = voucherNumber,
        //            Amount = hasDetails ? dto.Details.Sum(x => x.Amount) : dto.Amount,
        //            PaymentMode = string.IsNullOrEmpty(dto.PaymentMode) ? "CASH" : dto.PaymentMode,
        //            //PaymentMode = dto.PaymentMode,
        //            ChequeNo = dto.ChequeNo,
        //            Description = dto.Description,
        //            AddBy = userId,
        //            AddOn = DateTime.UtcNow,
        //            CancStat = false
        //        };

        //        _context.PaymentFiles.Add(payment);
        //        await _context.SaveChangesAsync();

        //        // ✅ FIX: Always create PaymentDetail entry for CASH payments too
        //        if (!hasDetails && dto.PaymentMode.ToUpper() == "CASH")
        //        {
        //            // Create a PaymentDetail entry for cash payment
        //            var cashDetail = new PaymentDetail
        //            {
        //                PaymentID = payment.PaymentID,
        //                PaymentMode = "CASH",
        //                Amount = dto.Amount,
        //                BankAccountID = null,
        //                ChequeNo = null,
        //                BranchID = branchId,
        //                AddBy = userId,
        //                AddOn = DateTime.UtcNow
        //            };
        //            _context.PaymentDetails.Add(cashDetail);
        //            await _context.SaveChangesAsync();
        //            await PostLedgerDetailAsync(cashDetail, payment, payment.Description ?? "", userId, branchId);
        //        }
        //        else if (hasDetails)
        //        {
        //            foreach (var d in dto.Details)
        //            {
        //                var detail = new PaymentDetail
        //                {
        //                    PaymentID = payment.PaymentID,
        //                    PaymentMode = d.PaymentMode,
        //                    Amount = d.Amount,
        //                    BankAccountID = d.BankAccountID,
        //                    ChequeNo = d.ChequeNo,
        //                    BranchID = branchId,
        //                    AddBy = userId,
        //                    AddOn = DateTime.UtcNow
        //                };

        //                _context.PaymentDetails.Add(detail);
        //                await _context.SaveChangesAsync();
        //                await PostLedgerDetailAsync(detail, payment, payment.Description ?? "", userId, branchId);
        //            }
        //        }

        //        // Add payment items
        //        if (dto.Items != null && dto.Items.Any())
        //        {
        //            foreach (var i in dto.Items)
        //            {
        //                _context.PaymentItems.Add(new PaymentItem
        //                {
        //                    PaymentID = payment.PaymentID,
        //                    BillID = i.BillID,
        //                    ItemID = i.ItemID,
        //                    Amount = i.Amount,
        //                    Description = i.Description
        //                });
        //            }
        //        }

        //        await _context.SaveChangesAsync();

        //        // ✅ Create voucher for this payment
        //        try
        //        {
        //            int voucherId = await _voucherService.CreateFromPaymentAsync(payment.PaymentID, userId, branchId);
        //            Console.WriteLine($"✅ Voucher created for Payment #{payment.PaymentID}. Voucher ID: {voucherId}");
        //        }
        //        catch (Exception voucherEx)
        //        {
        //            Console.WriteLine($"⚠️ VOUCHER CREATION FAILED for Payment #{payment.PaymentID}: {voucherEx.Message}");
        //        }

        //        await tx.CommitAsync();
        //        return payment.PaymentID;
        //    }
        //    catch (Exception ex)
        //    {
        //        await tx.RollbackAsync();
        //        throw new ApplicationException($"Payment creation failed: {ex.Message}");
        //    }
        //}
        public async Task<int> CreateAsync(PaymentCreateDto dto, int userId, int branchId)
        {
            using var tx = await _context.Database.BeginTransactionAsync();

            try
            {
                bool hasDetails = dto.Details != null && dto.Details.Any();

                if (!hasDetails && dto.Amount <= 0)
                    throw new ApplicationException("Payment amount must be greater than zero.");

                if (dto.ReferenceID <= 0 && string.IsNullOrEmpty(dto.WalkingParty))
                    throw new ApplicationException("Account not selected or walking party not entered.");

                var voucherNumber = await GenerateVoucherNumberAsync(branchId);

                // Handle edit mode
                if (dto.PaymentID.HasValue)
                {
                    var oldPayment = await _context.PaymentFiles
                        .FirstOrDefaultAsync(x => x.PaymentID == dto.PaymentID.Value && x.BranchID == branchId && x.CancStat != true);

                    if (oldPayment == null) throw new ApplicationException("Payment not found.");
                    oldPayment.CancStat = true;
                    _context.LedgerEntries.RemoveRange(_context.LedgerEntries.Where(x => x.PaymentID == oldPayment.PaymentID));
                    _context.PaymentDetails.RemoveRange(_context.PaymentDetails.Where(x => x.PaymentID == oldPayment.PaymentID));
                    _context.PaymentItems.RemoveRange(_context.PaymentItems.Where(x => x.PaymentID == oldPayment.PaymentID));
                    await _context.SaveChangesAsync();
                }

                var payment = new PaymentFile
                {
                    BranchID = branchId,
                    PaymentDate = dto.PaymentDate,
                    PaymentType = hasDetails ? "MIXED" : dto.PaymentType,
                    ReferenceID = dto.ReferenceID ?? 0,
                    ReferenceName = dto.ReferenceName,
                    WalkingParty = dto.WalkingParty,
                    PaymentRefNumb = dto.PaymentRefNumb,
                    VoucherNumb = voucherNumber,
                    Amount = hasDetails ? dto.Details.Sum(x => x.Amount) : dto.Amount,
                    PaymentMode = string.IsNullOrEmpty(dto.PaymentMode) ? "CASH" : dto.PaymentMode,
                    ChequeNo = dto.ChequeNo,
                    Description = dto.Description,
                    AddBy = userId,
                    AddOn = DateTime.UtcNow,
                    CancStat = false
                };
                _context.PaymentFiles.Add(payment);
                await _context.SaveChangesAsync();

                // Create PaymentDetail entries (NO LEDGER POSTING)
                if (!hasDetails && dto.PaymentMode.ToUpper() == "CASH")
                {
                    _context.PaymentDetails.Add(new PaymentDetail
                    {
                        PaymentID = payment.PaymentID,
                        PaymentMode = "CASH",
                        Amount = dto.Amount,
                        BankAccountID = null,
                        ChequeNo = null,
                        BranchID = branchId,
                        AddBy = userId,
                        AddOn = DateTime.UtcNow
                    });
                    // ❌ PostLedgerDetailAsync REMOVED - VoucherService handles ledger
                }
                else if (hasDetails)
                {
                    foreach (var d in dto.Details)
                    {
                        _context.PaymentDetails.Add(new PaymentDetail
                        {
                            PaymentID = payment.PaymentID,
                            PaymentMode = d.PaymentMode,
                            Amount = d.Amount,
                            BankAccountID = d.BankAccountID,
                            ChequeNo = d.ChequeNo,
                            BranchID = branchId,
                            AddBy = userId,
                            AddOn = DateTime.UtcNow
                        });
                        // ❌ PostLedgerDetailAsync REMOVED - VoucherService handles ledger
                    }
                }

                if (dto.Items != null && dto.Items.Any())
                {
                    foreach (var i in dto.Items)
                    {
                        _context.PaymentItems.Add(new PaymentItem
                        {
                            PaymentID = payment.PaymentID,
                            BillID = i.BillID,
                            ItemID = i.ItemID,
                            Amount = i.Amount,
                            Description = i.Description
                        });
                    }
                }
                await _context.SaveChangesAsync();

                // ✅ VoucherService handles ALL ledger posting
                try
                {
                    int voucherId = await _voucherService.CreateFromPaymentAsync(payment.PaymentID, userId, branchId);
                    Console.WriteLine($"✅ Voucher created for Payment #{payment.PaymentID}. Voucher ID: {voucherId}");
                }
                catch (Exception voucherEx)
                {
                    Console.WriteLine($"⚠️ VOUCHER CREATION FAILED for Payment #{payment.PaymentID}: {voucherEx.Message}");
                }

                await tx.CommitAsync();
                return payment.PaymentID;
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                throw new ApplicationException($"Payment creation failed: {ex.Message}");
            }
        }




        // ================= DELETE =================
        public async Task<bool> DeleteAsync(int paymentId, int userId, int branchId)
        {
            using var tx = await _context.Database.BeginTransactionAsync();

            try
            {
                var pay = await _context.PaymentFiles
                    .FirstOrDefaultAsync(x => x.PaymentID == paymentId && x.BranchID == branchId && x.CancStat != true);

                if (pay == null) throw new ApplicationException("Payment not found.");

                pay.CancStat = true;

                var ledger = await _context.LedgerEntries
                    .Where(x => x.PaymentID == paymentId)
                    .ToListAsync();
                _context.LedgerEntries.RemoveRange(ledger);

                var details = await _context.PaymentDetails
                    .Where(x => x.PaymentID == paymentId)
                    .ToListAsync();
                _context.PaymentDetails.RemoveRange(details);

                var items = await _context.PaymentItems
                    .Where(x => x.PaymentID == paymentId)
                    .ToListAsync();
                _context.PaymentItems.RemoveRange(items);

                await _context.SaveChangesAsync();
                await tx.CommitAsync();

                return true;
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        // ================= LEDGER =================

        
        private async Task PostLedgerAsync(PaymentFile payment, int userId, int branchId)
        {
            // Get account type for Reference account
            var referenceAccount = await _context.tblCOA
                .FirstOrDefaultAsync(x => x.acctID == payment.ReferenceID);

            string referenceAcctType = referenceAccount?.AcctType ?? "";
            string referenceAcctName = referenceAccount?.AcctName ?? "";

            // ✅ RULE: Only create Credit entry for these account types:
            // - Liability (Suppliers) - Credit entry allowed
            // - Revenue (Sales) - Credit entry allowed
            // - Equity - Credit entry allowed
            // ❌ DO NOT create Credit entry for:
            // - Asset (Cash, Bank, Customers)
            // - Expense (Commission, Salary, Purchase)

            bool shouldCreateCreditEntry = referenceAcctType == "Liability" ||
                                            referenceAcctType == "Revenue" ||
                                            referenceAcctType == "Equity";

            if (shouldCreateCreditEntry)
            {
                _context.LedgerEntries.Add(new LedgerEntry
                {
                    BranchID = branchId,
                    PaymentID = payment.PaymentID,
                    AccountID = payment.ReferenceID,
                    EntryDate = payment.PaymentDate,
                    Credit = payment.Amount,
                    Debit = 0,
                    Description = payment.Description,
                    AddBy = userId,
                    AddOn = DateTime.UtcNow
                });
                Console.WriteLine($"✅ Credit entry created for {referenceAcctName} ({referenceAcctType})");
            }
            else
            {
                Console.WriteLine($"⏭️ SKIPPING Credit entry for {referenceAcctName} ({referenceAcctType})");
            }

            // Debit entry to Cash/Bank (always allowed for all payment types)
            int cashBankAccountId = await GetCashBankControlAccountAsync(branchId);
            _context.LedgerEntries.Add(new LedgerEntry
            {
                BranchID = branchId,
                PaymentID = payment.PaymentID,
                AccountID = cashBankAccountId,
                EntryDate = payment.PaymentDate,
                Debit = payment.Amount,
                Credit = 0,
                Description = payment.Description,
                AddBy = userId,
                AddOn = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
        }



        
        private async Task PostLedgerDetailAsync(PaymentDetail detail, PaymentFile payment, string description, int userId, int branchId)
        {
            // Get account type for Reference account
            var referenceAccount = await _context.tblCOA
                .FirstOrDefaultAsync(x => x.acctID == payment.ReferenceID);
            string referenceAcctType = referenceAccount?.AcctType ?? "";
            string referenceAcctName = referenceAccount?.AcctName ?? "";

            // ✅ RULE: Only create Credit entry for Liability, Revenue, Equity
            bool shouldCreateCreditEntry = referenceAcctType == "Liability" ||
                                            referenceAcctType == "Revenue" ||
                                            referenceAcctType == "Equity";

            if (detail.PaymentMode.ToUpper() == "CASH")
            {
                int cashBankAccountId = await GetCashBankControlAccountAsync(branchId);

                _context.LedgerEntries.Add(new LedgerEntry
                {
                    BranchID = branchId,
                    PaymentID = detail.PaymentID,
                    AccountID = cashBankAccountId,
                    EntryDate = payment.PaymentDate,
                    Debit = detail.Amount,
                    Credit = 0,
                    Description = description,
                    AddBy = userId,
                    AddOn = DateTime.UtcNow
                });

                if (shouldCreateCreditEntry)
                {
                    _context.LedgerEntries.Add(new LedgerEntry
                    {
                        BranchID = branchId,
                        PaymentID = detail.PaymentID,
                        AccountID = payment.ReferenceID,
                        EntryDate = payment.PaymentDate,
                        Debit = 0,
                        Credit = detail.Amount,
                        Description = description,
                        AddBy = userId,
                        AddOn = DateTime.UtcNow
                    });
                    Console.WriteLine($"✅ Credit entry created for {referenceAcctName} ({referenceAcctType})");
                }
                else
                {
                    Console.WriteLine($"⏭️ SKIPPING Credit entry for {referenceAcctName} ({referenceAcctType})");
                }
            }
            else if (detail.PaymentMode.ToUpper() == "BANK" || detail.PaymentMode.ToUpper() == "CHEQUE")
            {
                if (detail.BankAccountID == null)
                    throw new ApplicationException("Bank account missing for BANK/CHEQUE detail");

                _context.LedgerEntries.Add(new LedgerEntry
                {
                    BranchID = branchId,
                    PaymentID = detail.PaymentID,
                    AccountID = detail.BankAccountID.Value,
                    EntryDate = payment.PaymentDate,
                    Debit = detail.Amount,
                    Credit = 0,
                    Description = description,
                    AddBy = userId,
                    AddOn = DateTime.UtcNow
                });

                if (shouldCreateCreditEntry)
                {
                    _context.LedgerEntries.Add(new LedgerEntry
                    {
                        BranchID = branchId,
                        PaymentID = detail.PaymentID,
                        AccountID = payment.ReferenceID,
                        EntryDate = payment.PaymentDate,
                        Debit = 0,
                        Credit = detail.Amount,
                        Description = description,
                        AddBy = userId,
                        AddOn = DateTime.UtcNow
                    });
                    Console.WriteLine($"✅ Credit entry created for {referenceAcctName} ({referenceAcctType})");
                }
                else
                {
                    Console.WriteLine($"⏭️ SKIPPING Credit entry for {referenceAcctName} ({referenceAcctType})");
                }
            }

            await _context.SaveChangesAsync();
        }
        

        // ================= COA BY PAYMENT TYPE =================
        // ================= COA BY PAYMENT TYPE =================
        public async Task<List<CoaLookupDto>> GetAccountsByPaymentTypeAsync(int branchId, string type)
        {
            var q = _context.tblCOA
                .Where(x => x.BranchID == branchId && x.Active == true && x.AcctLast == true);

            switch (type.ToUpper())
            {
                case "SUPPLIER":
                    // ✅ NEW COA: AccountCategory = 'Supplier'
                    q = q.Where(x => x.AccountCategory == "Supplier");
                    break;

                case "BANK":
                    // ✅ NEW COA: AccountCategory = 'Bank' OR 'Cash & Bank'
                    q = q.Where(x => x.AccountCategory == "Bank" || x.AccountCategory == "Cash & Bank");
                    break;

                case "EXPENSE":
                    // ✅ NEW COA: AcctType = 'Expense' AND AcctLast = true
                    q = q.Where(x => x.AcctType == "Expense");
                    break;

                case "OTHER":
                    // All other accounts
                    q = q.Where(x => x.AccountCategory != "Supplier"
                                  && x.AccountCategory != "Bank"
                                  && x.AccountCategory != "Cash & Bank"
                                  && x.AcctType != "Expense");
                    break;

                default:
                    return new List<CoaLookupDto>();
            }

            var result = await q
                .OrderBy(x => x.AcctName)
                .Select(x => new CoaLookupDto
                {
                    acctID = x.acctID,
                    acctName = x.AcctName ?? ""
                })
                .ToListAsync();

            Console.WriteLine($"GetAccountsByPaymentTypeAsync - Type: {type}, Found: {result.Count}");
            return result;
        }

        public async Task<List<CoaLookupDto>> GetBankAccountsAsync(int branchId)
        {
            // ✅ NEW COA: AccountCategory = 'Bank' OR 'Cash & Bank'
            var result = await _context.tblCOA
                .Where(x => x.BranchID == branchId
                       && x.Active == true
                       && x.AcctLast == true
                       && (x.AccountCategory == "Bank" || x.AccountCategory == "Cash & Bank"))
                .OrderBy(x => x.AcctName)
                .Select(x => new CoaLookupDto
                {
                    acctID = x.acctID,
                    acctName = x.AcctName ?? ""
                })
                .ToListAsync();

            Console.WriteLine($"GetBankAccountsAsync - Found: {result.Count} bank accounts");
            return result;
        }

        // ================= GENERATE VOUCHER NUMBER =================

        public async Task<string> GenerateVoucherNumberAsync(int branchId)
        {
            var year = DateTime.Now.Year;
            var month = DateTime.Now.ToString("MM");
            var branchCode = $"BR{branchId:D3}";
            var datePrefix = $"{branchCode}/PAY/{year}{month}/";

            // ✅ FIXED: Only count NON-CANCELLED payments
            var existingVouchers = await _context.PaymentFiles
                .Where(x => x.VoucherNumb != null &&
                            x.VoucherNumb.StartsWith(datePrefix) &&
                            x.CancStat != true)  // ✅ IGNORE CANCELLED
                .Select(x => x.VoucherNumb)
                .ToListAsync();

            int maxSeq = 0;
            foreach (var v in existingVouchers)
            {
                var parts = v.Split('/');
                if (parts.Length >= 5 && int.TryParse(parts[4], out int seq))
                {
                    if (seq > maxSeq) maxSeq = seq;
                }
            }

            // ✅ If no vouchers found, start from 1
            int nextSequence = maxSeq + 1;
            var newVoucher = $"{branchCode}/PAY/{year}{month}/{nextSequence:D5}";

            Console.WriteLine($"✅ Generated: {newVoucher} (Max sequence: {maxSeq}, Existing: {existingVouchers.Count})");

            return newVoucher;
        }
        // ================= GET PARTIES =================
        public async Task<List<PartyDropdownDto>> GetPartiesAsync(int branchId)
        {
            var parties = new List<PartyDropdownDto>();

            // ✅ NEW COA: Suppliers = AccountCategory = 'Supplier'
            var suppliers = await _context.tblCOA
                .Where(x => x.AccountCategory == "Supplier"
                       && x.AcctLast == true
                       && x.Active == true
                       && x.BranchID == branchId)
                .Select(x => new PartyDropdownDto
                {
                    acctID = x.acctID,
                    AcctCode = x.AcctCode ?? "",
                    AcctName = x.AcctName ?? "",
                    PartyType = "Supplier",
                    NTNNo = x.NTNNo,
                    STRNo = x.STRNo
                })
                .ToListAsync();
            parties.AddRange(suppliers);

            // ✅ NEW COA: Customers = AccountCategory = 'Customer'
            var customers = await _context.tblCOA
                .Where(x => x.AccountCategory == "Customer"
                       && x.AcctLast == true
                       && x.Active == true
                       && x.BranchID == branchId)
                .Select(x => new PartyDropdownDto
                {
                    acctID = x.acctID,
                    AcctCode = x.AcctCode ?? "",
                    AcctName = x.AcctName ?? "",
                    PartyType = "Customer",
                    NTNNo = x.NTNNo,
                    STRNo = x.STRNo
                })
                .ToListAsync();
            parties.AddRange(customers);

            Console.WriteLine($"GetPartiesAsync - Found: {parties.Count} parties");
            return parties.OrderBy(x => x.AcctName).ToList();
        }

        // ================= UPDATE PAYMENT =================
        public async Task<PaymentDetailDto?> UpdateAsync(int paymentId, PaymentCreateDto dto, int userId, int branchId)
        {
            using var tx = await _context.Database.BeginTransactionAsync();

            try
            {
                var existing = await _context.PaymentFiles
                    .FirstOrDefaultAsync(x => x.PaymentID == paymentId && x.BranchID == branchId && x.CancStat != true);

                if (existing == null)
                    throw new ApplicationException("Payment not found.");

                var existingVoucherNumber = existing.VoucherNumb;
                Console.WriteLine($"Existing voucher number: {existingVoucherNumber}");

                existing.CancStat = true;

                _context.LedgerEntries.RemoveRange(_context.LedgerEntries.Where(x => x.PaymentID == paymentId));
                _context.PaymentDetails.RemoveRange(_context.PaymentDetails.Where(x => x.PaymentID == paymentId));
                _context.PaymentItems.RemoveRange(_context.PaymentItems.Where(x => x.PaymentID == paymentId));
                await _context.SaveChangesAsync();

                bool hasDetails = dto.Details != null && dto.Details.Any();

                var payment = new PaymentFile
                {
                    BranchID = branchId,
                    PaymentDate = dto.PaymentDate,
                    PaymentType = hasDetails ? "MIXED" : dto.PaymentType,
                    ReferenceID = dto.ReferenceID ?? 0,
                    ReferenceName = dto.ReferenceName,
                    WalkingParty = dto.WalkingParty,
                    PaymentRefNumb = dto.PaymentRefNumb,
                    VoucherNumb = existingVoucherNumber,
                    Amount = hasDetails ? dto.Details.Sum(x => x.Amount) : dto.Amount,
                    PaymentMode = dto.PaymentMode,
                    ChequeNo = dto.ChequeNo,
                    Description = dto.Description,
                    AddBy = userId,
                    AddOn = DateTime.UtcNow,
                    CancStat = false
                };

                _context.PaymentFiles.Add(payment);
                await _context.SaveChangesAsync();

                if (hasDetails)
                {
                    foreach (var d in dto.Details)
                    {
                        var detail = new PaymentDetail
                        {
                            PaymentID = payment.PaymentID,
                            PaymentMode = d.PaymentMode,
                            Amount = d.Amount,
                            BankAccountID = d.BankAccountID,
                            ChequeNo = d.ChequeNo,
                            BranchID = branchId,
                            AddBy = userId,
                            AddOn = DateTime.UtcNow
                        };

                        _context.PaymentDetails.Add(detail);
                        await _context.SaveChangesAsync();
                        await PostLedgerDetailAsync(detail, payment, payment.Description ?? "", userId, branchId);
                    }
                }
                else
                {
                    await PostLedgerAsync(payment, userId, branchId);
                }

                if (dto.Items != null && dto.Items.Any())
                {
                    foreach (var i in dto.Items)
                    {
                        _context.PaymentItems.Add(new PaymentItem
                        {
                            PaymentID = payment.PaymentID,
                            BillID = i.BillID,
                            ItemID = i.ItemID,
                            Amount = i.Amount,
                            Description = i.Description
                        });
                    }
                }

                await _context.SaveChangesAsync();
                await tx.CommitAsync();

                return await GetByIdAsync(payment.PaymentID, branchId);
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                throw new ApplicationException($"Update failed: {ex.Message}");
            }
        }

        private async Task<int> GetCashBankControlAccountAsync(int branchId)
        {
            // ✅ NEW COA: Find Cash & Bank control account
            var acc = await _context.tblCOA.FirstOrDefaultAsync(x =>
                x.AccountCategory == "Cash & Bank"
                && x.IsControlAccount == true
                && x.Active == true
                && x.BranchID == branchId);

            if (acc == null)
                throw new ApplicationException("Cash & Bank control account not found in COA.");

            return acc.acctID;
        }


    }
}
