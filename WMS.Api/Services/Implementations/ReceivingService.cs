using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Receiving;
using WMS.Api.Models;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class ReceivingService : IReceivingService
    {
        private readonly WmsDbContext _context;
        private readonly ILedgerService _ledgerService;
        private readonly IVoucherService _voucherService;  // ✅ ADDED

        // ✅ UPDATE CONSTRUCTOR
        public ReceivingService(WmsDbContext context, ILedgerService ledgerService, IVoucherService voucherService)
        {
            _context = context;
            _ledgerService = ledgerService;
            _voucherService = voucherService;  // ✅ ADDED
        }

        // ================= GET ALL =================
        public List<ReceivingListDto> GetAll(int branchId)
        {
            return _context.ReceivingFiles
                .Where(r => r.BranchId == branchId)
                .Include(r => r.Account)
                .OrderByDescending(r => r.ReceiveDate)
                .Select(r => new ReceivingListDto
                {
                    Id = r.Id,
                    VoucherNumb = r.VoucherNumb,
                    ReceiveDate = r.ReceiveDate,
                    TotalCash = r.TotalCash,
                    TotalCheque = r.TotalCheque,
                    TotalAmount = r.TotalAmount,
                    Remarks = r.Remarks,
                    AccountName = r.Account != null ? r.Account.AcctName : "",
                    AccountCode = r.Account != null ? r.Account.AcctCode : "",
                    PartyId = r.PartyId,
                    PartyName = r.PartyName,
                    PartyType = r.PartyType,
                    WalkingCustomer = r.WalkingCustomer
                })
                .ToList();
        }

        // ================= GET BY ID =================
        public async Task<ReceivingCreateDto?> GetById(int id)
        {
            var receiving = await _context.ReceivingFiles
                .Include(r => r.CashList)
                .Include(r => r.ChequeList)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (receiving == null) return null;

            var entries = new List<ReceivingEntryDto>();

            if (receiving.CashList != null && receiving.CashList.Any())
            {
                foreach (var cash in receiving.CashList)
                {
                    entries.Add(new ReceivingEntryDto
                    {
                        Type = "CASH",
                        Amount = cash.Amount
                    });
                }
            }

            if (receiving.ChequeList != null && receiving.ChequeList.Any())
            {
                foreach (var cheque in receiving.ChequeList)
                {
                    entries.Add(new ReceivingEntryDto
                    {
                        Type = "CHEQUE",
                        Amount = cheque.Amount,
                        BankName = cheque.BankName,
                        ChequeNumber = cheque.ChequeNumber,
                        ChequeDate = cheque.ChequeDate
                    });
                }
            }

            if (entries.Count == 0)
            {
                entries.Add(new ReceivingEntryDto { Type = "CASH", Amount = 0 });
            }

            return new ReceivingCreateDto
            {
                Id = receiving.Id,
                ReceiveDate = receiving.ReceiveDate,
                ReceivingType = receiving.PartyType ?? "CUSTOMER",
                PartyId = receiving.PartyId,
                PartyName = receiving.PartyName,
                WalkingCustomer = receiving.WalkingCustomer,
                ReceiptRefNumb = receiving.ReceiptRefNumb,
                Remarks = receiving.Remarks,
                AccountId = receiving.AccountId,
                CashList = receiving.CashList?.Select(c => new CashDto { Amount = c.Amount }).ToList(),
                ChequeList = receiving.ChequeList?.Select(c => new ChequeDto
                {
                    BankName = c.BankName,
                    ChequeNumber = c.ChequeNumber,
                    ChequeDate = c.ChequeDate,
                    Amount = c.Amount
                }).ToList(),
                Entries = entries
            };
        }

        // ================= CREATE =================
       
        // ================= CREATE =================
        public async Task<int> CreateAsync(ReceivingCreateDto dto, int userId, int branchId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var voucherNumber = await GenerateVoucherNumberAsync(branchId);
                Console.WriteLine($"Generated voucher: {voucherNumber}");

                decimal totalCash = 0;
                decimal totalCheque = 0;

                if (dto.CashList != null && dto.CashList.Any())
                {
                    totalCash = dto.CashList.Sum(c => c.Amount);
                }

                if (dto.ChequeList != null && dto.ChequeList.Any())
                {
                    totalCheque = dto.ChequeList.Sum(c => c.Amount);
                }

                if (dto.PartyEntries != null && dto.PartyEntries.Any())
                {
                    foreach (var party in dto.PartyEntries)
                    {
                        totalCash += party.CashAmount;
                        if (party.ChequeList != null && party.ChequeList.Any())
                        {
                            totalCheque += party.ChequeList.Sum(c => c.Amount);
                        }
                    }
                }

                decimal totalAmount = totalCash + totalCheque;

                string partyName = null;
                if (dto.PartyId > 0)
                {
                    var party = await _context.tblCOA.FindAsync(dto.PartyId);
                    partyName = party?.AcctName;
                }
                if (string.IsNullOrEmpty(partyName) && !string.IsNullOrEmpty(dto.WalkingCustomer))
                {
                    partyName = dto.WalkingCustomer;
                }

                int accountId = dto.AccountId > 0 ? dto.AccountId : 7;

                var receiving = new ReceivingFile
                {
                    ReceiveDate = dto.ReceiveDate,
                    BranchId = branchId,
                    UserId = userId,
                    AccountId = accountId,
                    Remarks = dto.Remarks,
                    TotalCash = totalCash,
                    TotalCheque = totalCheque,
                    TotalAmount = totalAmount,
                    VoucherNumb = voucherNumber,
                    WalkingCustomer = dto.WalkingCustomer,
                    ReceiptRefNumb = dto.ReceiptRefNumb,
                    PartyId = dto.PartyId,
                    PartyName = partyName,
                    PartyType = dto.ReceivingType,
                    CashList = new List<ReceivingCash>(),
                    ChequeList = new List<ReceivingCheque>()
                };

                if (dto.CashList != null && dto.CashList.Any())
                {
                    foreach (var cash in dto.CashList.Where(c => c.Amount > 0))
                    {
                        receiving.CashList.Add(new ReceivingCash { Amount = cash.Amount });
                    }
                }

                if (dto.ChequeList != null && dto.ChequeList.Any())
                {
                    foreach (var cheque in dto.ChequeList.Where(c => c.Amount > 0))
                    {
                        receiving.ChequeList.Add(new ReceivingCheque
                        {
                            BankName = cheque.BankName,
                            ChequeNumber = cheque.ChequeNumber,
                            ChequeDate = cheque.ChequeDate,
                            Amount = cheque.Amount
                        });
                    }
                }

                if (dto.PartyEntries != null && dto.PartyEntries.Any())
                {
                    foreach (var party in dto.PartyEntries)
                    {
                        if (party.CashAmount > 0)
                        {
                            receiving.CashList.Add(new ReceivingCash { Amount = party.CashAmount });
                        }
                        if (party.ChequeList != null && party.ChequeList.Any())
                        {
                            foreach (var cheque in party.ChequeList.Where(c => c.Amount > 0))
                            {
                                receiving.ChequeList.Add(new ReceivingCheque
                                {
                                    BankName = cheque.BankName,
                                    ChequeNumber = cheque.ChequeNumber,
                                    ChequeDate = cheque.ChequeDate,
                                    Amount = cheque.Amount
                                });
                            }
                        }
                    }
                }

                _context.ReceivingFiles.Add(receiving);
                await _context.SaveChangesAsync();

                // ❌ REMOVE THIS LINE - VoucherService will handle ledger
                // await CreateReceivingLedgerAsync(receiving, userId, branchId);

                // ✅ Create voucher for this receiving (this will also post to ledger)
                try
                {
                    int voucherId = await _voucherService.CreateFromReceivingAsync(receiving.Id, userId, branchId);
                    Console.WriteLine($"✅ Voucher created and posted for Receiving #{receiving.Id}. Voucher ID: {voucherId}");
                }
                catch (Exception voucherEx)
                {
                    Console.WriteLine($"⚠️ VOUCHER CREATION FAILED for Receiving #{receiving.Id}: {voucherEx.Message}");
                }

                await transaction.CommitAsync();
                return receiving.Id;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"Error in CreateAsync: {ex.Message}");
                throw new Exception($"Receiving creation failed: {ex.Message}");
            }
        }
        // ================= UPDATE =================
        public async Task<bool> UpdateAsync(int id, ReceivingCreateDto dto, int userId, int branchId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var existingReceiving = await _context.ReceivingFiles
                    .Include(r => r.CashList)
                    .Include(r => r.ChequeList)
                    .FirstOrDefaultAsync(r => r.Id == id && r.BranchId == branchId);

                if (existingReceiving == null)
                    return false;

                await DeleteReceivingLedgerAsync(id);

                decimal totalCash = 0;
                decimal totalCheque = 0;

                if (dto.CashList != null && dto.CashList.Any())
                {
                    totalCash = dto.CashList.Sum(c => c.Amount);
                }

                if (dto.ChequeList != null && dto.ChequeList.Any())
                {
                    totalCheque = dto.ChequeList.Sum(c => c.Amount);
                }

                if (dto.PartyEntries != null && dto.PartyEntries.Any())
                {
                    foreach (var party in dto.PartyEntries)
                    {
                        totalCash += party.CashAmount;
                        if (party.ChequeList != null && party.ChequeList.Any())
                        {
                            totalCheque += party.ChequeList.Sum(c => c.Amount);
                        }
                    }
                }

                decimal totalAmount = totalCash + totalCheque;

                string partyName = null;
                if (dto.PartyId > 0)
                {
                    var party = await _context.tblCOA.FindAsync(dto.PartyId);
                    partyName = party?.AcctName;
                }
                if (string.IsNullOrEmpty(partyName) && !string.IsNullOrEmpty(dto.WalkingCustomer))
                {
                    partyName = dto.WalkingCustomer;
                }

                existingReceiving.ReceiveDate = dto.ReceiveDate;
                existingReceiving.Remarks = dto.Remarks;
                existingReceiving.TotalCash = totalCash;
                existingReceiving.TotalCheque = totalCheque;
                existingReceiving.TotalAmount = totalAmount;
                existingReceiving.WalkingCustomer = dto.WalkingCustomer;
                existingReceiving.ReceiptRefNumb = dto.ReceiptRefNumb;
                existingReceiving.PartyId = dto.PartyId;
                existingReceiving.PartyName = partyName;
                existingReceiving.PartyType = dto.ReceivingType;

                _context.ReceivingCash.RemoveRange(existingReceiving.CashList);
                _context.ReceivingCheque.RemoveRange(existingReceiving.ChequeList);
                existingReceiving.CashList.Clear();
                existingReceiving.ChequeList.Clear();

                if (dto.CashList != null && dto.CashList.Any())
                {
                    foreach (var cash in dto.CashList.Where(c => c.Amount > 0))
                    {
                        existingReceiving.CashList.Add(new ReceivingCash { ReceivingFileId = id, Amount = cash.Amount });
                    }
                }

                if (dto.ChequeList != null && dto.ChequeList.Any())
                {
                    foreach (var cheque in dto.ChequeList.Where(c => c.Amount > 0))
                    {
                        existingReceiving.ChequeList.Add(new ReceivingCheque
                        {
                            ReceivingFileId = id,
                            BankName = cheque.BankName,
                            ChequeNumber = cheque.ChequeNumber,
                            ChequeDate = cheque.ChequeDate,
                            Amount = cheque.Amount
                        });
                    }
                }

                if (dto.PartyEntries != null && dto.PartyEntries.Any())
                {
                    foreach (var party in dto.PartyEntries)
                    {
                        if (party.CashAmount > 0)
                        {
                            existingReceiving.CashList.Add(new ReceivingCash { ReceivingFileId = id, Amount = party.CashAmount });
                        }
                        if (party.ChequeList != null && party.ChequeList.Any())
                        {
                            foreach (var cheque in party.ChequeList.Where(c => c.Amount > 0))
                            {
                                existingReceiving.ChequeList.Add(new ReceivingCheque
                                {
                                    ReceivingFileId = id,
                                    BankName = cheque.BankName,
                                    ChequeNumber = cheque.ChequeNumber,
                                    ChequeDate = cheque.ChequeDate,
                                    Amount = cheque.Amount
                                });
                            }
                        }
                    }
                }

                await _context.SaveChangesAsync();
                await CreateReceivingLedgerAsync(existingReceiving, userId, branchId);

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"Error in UpdateAsync: {ex.Message}");
                throw new Exception($"Receiving update failed: {ex.Message}");
            }
        }

        // ================= DELETE =================
        public async Task<bool> DeleteAsync(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                await DeleteReceivingLedgerAsync(id);

                var receiving = await _context.ReceivingFiles
                    .Include(r => r.CashList)
                    .Include(r => r.ChequeList)
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (receiving == null)
                    return false;

                _context.ReceivingCash.RemoveRange(receiving.CashList);
                _context.ReceivingCheque.RemoveRange(receiving.ChequeList);
                _context.ReceivingFiles.Remove(receiving);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"Error in DeleteAsync: {ex.Message}");
                throw new Exception($"Receiving deletion failed: {ex.Message}");
            }
        }

        // ================= LEDGER METHODS =================
        private async Task CreateReceivingLedgerAsync(ReceivingFile receiving, int userId, int branchId)
        {
            var cashBankAccount = await _context.tblCOA
                .FirstOrDefaultAsync(x => x.BranchID == branchId && x.AcctCode == "1000-01-01");

            int cashBankAccountId = cashBankAccount?.acctID ?? 7;

            _context.LedgerEntries.Add(new LedgerEntry
            {
                BranchID = branchId,
                ReceivingID = receiving.Id,
                AccountID = cashBankAccountId,
                EntryDate = receiving.ReceiveDate,
                Debit = receiving.TotalAmount,
                Credit = 0,
                Description = receiving.Remarks ?? $"Receipt #{receiving.VoucherNumb}",
                AddBy = userId,
                AddOn = DateTime.Now
            });

            int partyAccountId = receiving.PartyId ?? receiving.AccountId;

            _context.LedgerEntries.Add(new LedgerEntry
            {
                BranchID = branchId,
                ReceivingID = receiving.Id,
                AccountID = partyAccountId,
                EntryDate = receiving.ReceiveDate,
                Debit = 0,
                Credit = receiving.TotalAmount,
                Description = receiving.Remarks ?? $"Receipt #{receiving.VoucherNumb}",
                AddBy = userId,
                AddOn = DateTime.Now
            });

            await _context.SaveChangesAsync();
        }

        private async Task DeleteReceivingLedgerAsync(int receivingId)
        {
            var ledgerEntries = await _context.LedgerEntries
                .Where(x => x.ReceivingID == receivingId)
                .ToListAsync();

            if (ledgerEntries.Any())
            {
                _context.LedgerEntries.RemoveRange(ledgerEntries);
                await _context.SaveChangesAsync();
            }
        }

        // ================= GET ACCOUNTS BY TYPE =================
        public async Task<List<COAAccountDto>> GetAccountsByType(int branchId, string type)
        {
            IQueryable<COA> query = _context.tblCOA
                .Where(a => a.BranchID == branchId && a.Active == true && a.AcctLast == true);

            switch (type.ToUpper())
            {
                case "CUSTOMER":
                    query = query.Where(a => a.AccountCategory == "Customer");
                    break;

                case "BANK":
                    query = query.Where(a => a.AccountCategory == "Bank" || a.AccountCategory == "Cash & Bank");
                    break;

                case "INCOME":
                    query = query.Where(a => a.AcctType == "Revenue");
                    break;

                case "OTHER":
                    query = query.Where(a => a.AccountCategory != "Customer"
                                          && a.AccountCategory != "Bank"
                                          && a.AccountCategory != "Cash & Bank"
                                          && a.AcctType != "Revenue");
                    break;

                default:
                    return new List<COAAccountDto>();
            }

            var result = await query
                .OrderBy(a => a.AcctName)
                .Select(a => new COAAccountDto
                {
                    acctID = a.acctID,
                    AcctCode = a.AcctCode ?? "",
                    AcctName = a.AcctName ?? ""
                })
                .ToListAsync();

            return result;
        }

        // ================= GENERATE VOUCHER NUMBER =================
        public async Task<string> GenerateVoucherNumberAsync(int branchId)
        {
            var year = DateTime.Now.Year;
            var month = DateTime.Now.ToString("MM");
            var branchCode = $"BR{branchId:D3}";

            var count = await _context.ReceivingFiles
                .Where(x => x.ReceiveDate.Year == year && x.ReceiveDate.Month == int.Parse(month))
                .CountAsync();

            int nextSequence = count + 1;
            var newVoucher = $"{branchCode}/REC/{year}{month}/{nextSequence:D5}";

            return newVoucher;
        }

        // ================= GET CUSTOMERS =================
        public async Task<List<CustomerDropdownDto>> GetCustomersAsync(int branchId)
        {
            var customers = await _context.tblCOA
                .Where(x => x.AccountCategory == "Customer"
                       && x.AcctLast == true
                       && x.Active == true
                       && x.BranchID == branchId)
                .Select(x => new CustomerDropdownDto
                {
                    acctID = x.acctID,
                    AcctCode = x.AcctCode ?? "",
                    AcctName = x.AcctName ?? "",
                    NTNNo = x.NTNNo,
                    STRNo = x.STRNo
                })
                .OrderBy(x => x.AcctName)
                .ToListAsync();

            return customers;
        }

        // ================= GET BANK/CASH ACCOUNTS =================
        public async Task<List<COAAccountDto>> GetBankCashAccountsAsync(int branchId)
        {
            var banks = await _context.tblCOA
                .Where(x => x.BranchID == branchId
                       && x.Active == true
                       && x.AcctLast == true
                       && (x.AccountCategory == "Bank" || x.AccountCategory == "Cash & Bank"))
                .OrderBy(x => x.AcctName)
                .Select(x => new COAAccountDto
                {
                    acctID = x.acctID,
                    AcctCode = x.AcctCode ?? "",
                    AcctName = x.AcctName ?? ""
                })
                .ToListAsync();

            return banks;
        }
    }
}