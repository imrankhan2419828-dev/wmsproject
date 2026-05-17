using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.PostdatedCheque;
using WMS.Api.DTOs.Receiving;
using WMS.Api.Models;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class PostdatedChequeService : IPostdatedChequeService
    {
        private readonly WmsDbContext _context;
        private readonly ILedgerService _ledgerService;

        public PostdatedChequeService(WmsDbContext context, ILedgerService ledgerService)
        {
            _context = context;
            _ledgerService = ledgerService;
        }

        // CREATE new cheque
        public async Task<int> CreateAsync(PostdatedChequeCreateDto dto, int userId, int branchId)
        {
            // Validation
            if (dto.ChequeDate.Date < DateTime.Now.Date)
                throw new Exception("Cheque date cannot be in the past");

            var cheque = new PostdatedCheque
            {
                ChequeNumber = dto.ChequeNumber,
                BankName = dto.BankName,
                ChequeDate = dto.ChequeDate,
                Amount = dto.Amount,
                SourceType = dto.SourceType,
                SourceId = dto.SourceId,
                ReferenceType = dto.ReferenceType,
                ReferenceId = dto.ReferenceId,
                Status = "PENDING",
                BranchId = branchId,
                CreatedBy = userId,
                CreatedOn = DateTime.Now,
                Logs = new List<PostdatedChequeLog>()
            };

            // Add initial log
            cheque.Logs.Add(new PostdatedChequeLog
            {
                NewStatus = "PENDING",
                ChangedBy = userId,
                ChangedOn = DateTime.Now,
                Remarks = dto.Remarks ?? "Cheque created"
            });

            _context.PostdatedCheques.Add(cheque);
            await _context.SaveChangesAsync();

            return cheque.Id;
        }

        // GET by Id
        public async Task<PostdatedChequeReadDto?> GetByIdAsync(int id)
        {
            var cheque = await _context.PostdatedCheques
                .Include(c => c.Logs)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (cheque == null) return null;

            return new PostdatedChequeReadDto
            {
                Id = cheque.Id,
                ChequeNumber = cheque.ChequeNumber,
                BankName = cheque.BankName,
                ChequeDate = cheque.ChequeDate,
                Amount = cheque.Amount,
                SourceType = cheque.SourceType,
                SourceId = cheque.SourceId,
                SourceName = await GetSourceName(cheque.SourceType, cheque.SourceId),
                ReferenceType = cheque.ReferenceType,
                ReferenceId = cheque.ReferenceId,
                Status = cheque.Status,
                DepositDate = cheque.DepositDate,
                ClearDate = cheque.ClearDate,
                BounceDate = cheque.BounceDate,
                BounceReason = cheque.BounceReason,
                BranchId = cheque.BranchId,
                CreatedBy = cheque.CreatedBy,
                CreatedOn = cheque.CreatedOn,
                Logs = cheque.Logs.Select(l => new ChequeLogDto
                {
                    Id = l.Id,
                    OldStatus = l.OldStatus,
                    NewStatus = l.NewStatus,
                    ChangedBy = l.ChangedBy,
                    ChangedOn = l.ChangedOn,
                    Remarks = l.Remarks
                }).ToList()
            };
        }

        // GET ALL with optional status filter
        public async Task<List<PostdatedChequeListDto>> GetAllAsync(int branchId, string? status = null)
        {
            var query = _context.PostdatedCheques
                .Where(c => c.BranchId == branchId);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(c => c.Status == status);

            var cheques = await query
                .OrderBy(c => c.ChequeDate)
                .ToListAsync();

            var result = new List<PostdatedChequeListDto>();
            foreach (var c in cheques)
            {
                result.Add(new PostdatedChequeListDto
                {
                    Id = c.Id,
                    ChequeNumber = c.ChequeNumber,
                    BankName = c.BankName,
                    ChequeDate = c.ChequeDate,
                    Amount = c.Amount,
                    SourceType = c.SourceType,
                    SourceName = await GetSourceName(c.SourceType, c.SourceId),
                    Status = c.Status,
                    DepositDate = c.DepositDate,
                    ClearDate = c.ClearDate,
                    DaysRemaining = (c.ChequeDate.Date - DateTime.Now.Date).Days
                });
            }

            return result;
        }

        // UPDATE STATUS
        public async Task<bool> UpdateStatusAsync(int id, ChequeStatusUpdateDto dto, int userId)
        {
            var cheque = await _context.PostdatedCheques
                .Include(c => c.Logs)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (cheque == null) return false;

            var oldStatus = cheque.Status;

            // Update fields based on status
            switch (dto.Status)
            {
                case "DEPOSITED":
                    cheque.DepositDate = dto.DepositDate ?? DateTime.Now;
                    break;
                case "CLEARED":
                    cheque.ClearDate = dto.ClearDate ?? DateTime.Now;
                    // Create ledger entry
                    await CreateLedgerForClearedCheque(cheque, userId);
                    break;
                case "BOUNCED":
                    cheque.BounceDate = DateTime.Now;
                    cheque.BounceReason = dto.BounceReason;
                    break;
                case "CANCELLED":
                    cheque.BounceReason = dto.BounceReason;
                    break;
            }

            cheque.Status = dto.Status;
            cheque.UpdatedBy = userId;
            cheque.UpdatedOn = DateTime.Now;

            // Add log
            cheque.Logs.Add(new PostdatedChequeLog
            {
                OldStatus = oldStatus,
                NewStatus = dto.Status,
                ChangedBy = userId,
                ChangedOn = DateTime.Now,
                Remarks = dto.Remarks
            });

            await _context.SaveChangesAsync();
            return true;
        }

        // DEPOSIT CHEQUE
        public async Task<bool> DepositChequeAsync(int id, DateTime depositDate, int userId)
        {
            return await UpdateStatusAsync(id, new ChequeStatusUpdateDto
            {
                Status = "DEPOSITED",
                DepositDate = depositDate,
                Remarks = "Cheque deposited in bank"
            }, userId);
        }

        // CLEAR CHEQUE
        public async Task<bool> ClearChequeAsync(int id, int userId)
        {
            return await UpdateStatusAsync(id, new ChequeStatusUpdateDto
            {
                Status = "CLEARED",
                ClearDate = DateTime.Now,
                Remarks = "Cheque cleared"
            }, userId);
        }

        // BOUNCE CHEQUE
        public async Task<bool> BounceChequeAsync(int id, string reason, int userId)
        {
            return await UpdateStatusAsync(id, new ChequeStatusUpdateDto
            {
                Status = "BOUNCED",
                BounceReason = reason,
                Remarks = $"Cheque bounced: {reason}"
            }, userId);
        }

        // CANCEL CHEQUE
        public async Task<bool> CancelChequeAsync(int id, string reason, int userId)
        {
            return await UpdateStatusAsync(id, new ChequeStatusUpdateDto
            {
                Status = "CANCELLED",
                BounceReason = reason,
                Remarks = $"Cheque cancelled: {reason}"
            }, userId);
        }

        // DELETE
        public async Task<bool> DeleteAsync(int id)
        {
            var cheque = await _context.PostdatedCheques
                .Include(c => c.Logs)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (cheque == null) return false;

            _context.PostdatedCheques.Remove(cheque);
            await _context.SaveChangesAsync();
            return true;
        }

        // PROCESS DUE CHEQUES (Auto-posting)
        public async Task<int> ProcessDueChequesAsync(int branchId)
        {
            var today = DateTime.Now.Date;

            var dueCheques = await _context.PostdatedCheques
                .Where(c => c.BranchId == branchId
                    && c.Status == "PENDING"
                    && c.ChequeDate.Date <= today)
                .ToListAsync();

            foreach (var cheque in dueCheques)
            {
                await UpdateStatusAsync(cheque.Id, new ChequeStatusUpdateDto
                {
                    Status = "CLEARED",
                    ClearDate = today,
                    Remarks = "Auto-cleared on due date"
                }, 0); // System user ID = 0
            }

            return dueCheques.Count;
        }

        // GET SUMMARY
        public async Task<ChequeSummaryDto> GetSummaryAsync(int branchId)
        {
            var cheques = await _context.PostdatedCheques
                .Where(c => c.BranchId == branchId)
                .ToListAsync();

            var today = DateTime.Now.Date;

            return new ChequeSummaryDto
            {
                TotalPending = cheques.Count(c => c.Status == "PENDING"),
                TotalPendingAmount = cheques.Where(c => c.Status == "PENDING").Sum(c => c.Amount),
                TotalDueToday = cheques.Count(c => c.Status == "PENDING" && c.ChequeDate.Date <= today),
                TotalDueTodayAmount = cheques.Where(c => c.Status == "PENDING" && c.ChequeDate.Date <= today).Sum(c => c.Amount),
                TotalCleared = cheques.Count(c => c.Status == "CLEARED"),
                TotalClearedAmount = cheques.Where(c => c.Status == "CLEARED").Sum(c => c.Amount),
                TotalBounced = cheques.Count(c => c.Status == "BOUNCED"),
                TotalBouncedAmount = cheques.Where(c => c.Status == "BOUNCED").Sum(c => c.Amount)
            };
        }

        // GET CHEQUES BY DATE RANGE
        public async Task<List<PostdatedChequeListDto>> GetChequesByDateRangeAsync(int branchId, DateTime fromDate, DateTime toDate)
        {
            var cheques = await _context.PostdatedCheques
                .Where(c => c.BranchId == branchId
                    && c.ChequeDate.Date >= fromDate.Date
                    && c.ChequeDate.Date <= toDate.Date)
                .OrderBy(c => c.ChequeDate)
                .ToListAsync();

            var result = new List<PostdatedChequeListDto>();
            foreach (var c in cheques)
            {
                result.Add(new PostdatedChequeListDto
                {
                    Id = c.Id,
                    ChequeNumber = c.ChequeNumber,
                    BankName = c.BankName,
                    ChequeDate = c.ChequeDate,
                    Amount = c.Amount,
                    SourceType = c.SourceType,
                    SourceName = await GetSourceName(c.SourceType, c.SourceId),
                    Status = c.Status,
                    DaysRemaining = (c.ChequeDate.Date - DateTime.Now.Date).Days
                });
            }

            return result;
        }

        // GET CHEQUES BY SOURCE
        public async Task<List<PostdatedChequeListDto>> GetChequesBySourceAsync(int branchId, string sourceType, int sourceId)
        {
            var cheques = await _context.PostdatedCheques
                .Where(c => c.BranchId == branchId
                    && c.SourceType == sourceType
                    && c.SourceId == sourceId)
                .OrderByDescending(c => c.ChequeDate)
                .ToListAsync();

            var result = new List<PostdatedChequeListDto>();
            foreach (var c in cheques)
            {
                result.Add(new PostdatedChequeListDto
                {
                    Id = c.Id,
                    ChequeNumber = c.ChequeNumber,
                    BankName = c.BankName,
                    ChequeDate = c.ChequeDate,
                    Amount = c.Amount,
                    SourceType = c.SourceType,
                    SourceName = await GetSourceName(c.SourceType, c.SourceId),
                    Status = c.Status,
                    DaysRemaining = (c.ChequeDate.Date - DateTime.Now.Date).Days
                });
            }

            return result;
        }

        // PRIVATE HELPER METHODS

        private async Task<string> GetSourceName(string sourceType, int sourceId)
        {
            switch (sourceType.ToUpper())
            {
                case "CUSTOMER":
                    var customer = await _context.tblCOA.FindAsync(sourceId);
                    return customer?.AcctName ?? "Unknown Customer";

                case "SUPPLIER":
                    var supplier = await _context.tblCOA.FindAsync(sourceId);
                    return supplier?.AcctName ?? "Unknown Supplier";

                case "BANK":
                    var bank = await _context.tblCOA.FindAsync(sourceId);
                    return bank?.AcctName ?? "Unknown Bank";

                default:
                    return "Unknown";
            }
        }

        private async Task CreateLedgerForClearedCheque(PostdatedCheque cheque, int userId)
        {
            // Get cash account
            var cashAccount = await _context.tblCOA
                .Where(a => a.BranchID == cheque.BranchId
                    && a.Active == true
                    && a.AcctCode.StartsWith("1000-01-01")
                    && a.AcctCode.Length > "1000-01-01".Length)
                .FirstOrDefaultAsync();

            if (cashAccount == null)
                throw new Exception("Cash account not found");

            // Create ledger entries based on source type
            if (cheque.SourceType == "CUSTOMER")
            {
                // Customer cheque clear - Debit Cash, Credit Customer
                var debitEntry = new LedgerEntry
                {
                    BranchID = cheque.BranchId,
                    AccountID = cashAccount.acctID,
                    EntryDate = cheque.ClearDate ?? DateTime.Now,
                    Debit = cheque.Amount,
                    Credit = 0,
                    Description = $"Cheque #{cheque.ChequeNumber} cleared from {cheque.SourceType}",
                    AddBy = userId,
                    AddOn = DateTime.Now
                };

                var creditEntry = new LedgerEntry
                {
                    BranchID = cheque.BranchId,
                    AccountID = cheque.SourceId,
                    EntryDate = cheque.ClearDate ?? DateTime.Now,
                    Debit = 0,
                    Credit = cheque.Amount,
                    Description = $"Cheque #{cheque.ChequeNumber} cleared",
                    AddBy = userId,
                    AddOn = DateTime.Now
                };

                _context.LedgerEntries.Add(debitEntry);
                _context.LedgerEntries.Add(creditEntry);
            }
            else if (cheque.SourceType == "SUPPLIER")
            {
                // Supplier cheque clear - Debit Supplier, Credit Cash
                var debitEntry = new LedgerEntry
                {
                    BranchID = cheque.BranchId,
                    AccountID = cheque.SourceId,
                    EntryDate = cheque.ClearDate ?? DateTime.Now,
                    Debit = cheque.Amount,
                    Credit = 0,
                    Description = $"Cheque #{cheque.ChequeNumber} paid to supplier",
                    AddBy = userId,
                    AddOn = DateTime.Now
                };

                var creditEntry = new LedgerEntry
                {
                    BranchID = cheque.BranchId,
                    AccountID = cashAccount.acctID,
                    EntryDate = cheque.ClearDate ?? DateTime.Now,
                    Debit = 0,
                    Credit = cheque.Amount,
                    Description = $"Cheque #{cheque.ChequeNumber} cleared",
                    AddBy = userId,
                    AddOn = DateTime.Now
                };

                _context.LedgerEntries.Add(debitEntry);
                _context.LedgerEntries.Add(creditEntry);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<List<COAAccountDto>> GetAccountsByTypeAsync(int branchId, string type)
        {
            IQueryable<COA> query = _context.tblCOA
                .Where(a => a.BranchID == branchId && a.Active == true);

            switch (type.ToUpper())
            {
                case "CUSTOMER":
                    query = query.Where(a => a.AcctCode != null
                        && a.AcctCode.StartsWith("1000-01-02")
                        && a.AcctCode != "1000-01-02");
                    break;
                case "BANK":
                    query = query.Where(a => a.AcctCode != null
                        && a.AcctCode.StartsWith("1000-01-01")
                        && a.AcctCode != "1000-01-01");
                    break;
                case "SUPPLIER":
                    query = query.Where(a => a.AcctCode != null
                        && a.AcctCode.StartsWith("2000-01-01-01")
                        && a.AcctCode != "2000-01-01-01");
                    break;
                default:
                    return new List<COAAccountDto>();
            }

            return await query
                .OrderBy(a => a.AcctName)
                .Select(a => new COAAccountDto  // 🔥 Receiving module ka DTO
                {
                    acctID = a.acctID,
                    AcctName = a.AcctName ?? "",
                    AcctCode = a.AcctCode ?? ""
                })
                .ToListAsync();
        }


        // UPDATE entire cheque
        public async Task<bool> UpdateAsync(int id, PostdatedChequeCreateDto dto, int userId)
        {
            var cheque = await _context.PostdatedCheques
                .Include(c => c.Logs)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (cheque == null)
                return false;

            // Validation
            if (dto.ChequeDate.Date < DateTime.Now.Date)
                throw new Exception("Cheque date cannot be in the past");

            // Store old values for log
            var oldChequeNumber = cheque.ChequeNumber;
            var oldBankName = cheque.BankName;
            var oldChequeDate = cheque.ChequeDate;
            var oldAmount = cheque.Amount;
            var oldSourceType = cheque.SourceType;
            var oldSourceId = cheque.SourceId;
            var oldReferenceType = cheque.ReferenceType;
            var oldReferenceId = cheque.ReferenceId;

            // Update fields
            cheque.ChequeNumber = dto.ChequeNumber;
            cheque.BankName = dto.BankName;
            cheque.ChequeDate = dto.ChequeDate;
            cheque.Amount = dto.Amount;
            cheque.SourceType = dto.SourceType;
            cheque.SourceId = dto.SourceId;
            cheque.ReferenceType = dto.ReferenceType;
            cheque.ReferenceId = dto.ReferenceId;
            cheque.UpdatedBy = userId;
            cheque.UpdatedOn = DateTime.Now;

            // Add log for update
            cheque.Logs.Add(new PostdatedChequeLog
            {
                OldStatus = cheque.Status,
                NewStatus = cheque.Status,
                ChangedBy = userId,
                ChangedOn = DateTime.Now,
                Remarks = dto.Remarks ?? "Cheque details updated"
            });

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
