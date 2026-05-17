using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.Models;
using WMS.Api.Services.Interfaces;

namespace WMS.Api.Services.Implementations
{
    public class LedgerService : ILedgerService
    {
        private readonly WmsDbContext _context;

        public LedgerService(WmsDbContext context)
        {
            _context = context;
        }

        public async Task CreateReceivingLedgerAsync(ReceivingFile receiving)
        {
            if (receiving == null)
                throw new ArgumentNullException(nameof(receiving));

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. DEBIT Entry - Customer Account
                var debitEntry = new LedgerEntry
                {
                    BranchID = receiving.BranchId,
                    AccountID = receiving.AccountId,
                    EntryDate = receiving.ReceiveDate,
                    Debit = receiving.TotalAmount,
                    Credit = 0,
                    Description = $"Receiving # {receiving.Id} - Amount Received",
                    AddBy = receiving.UserId,
                    AddOn = DateTime.Now
                };

                // 2. CREDIT Entry - Cash Account
                var cashAccountId = await GetCashAccountId(receiving.BranchId);

                var creditEntry = new LedgerEntry
                {
                    BranchID = receiving.BranchId,
                    AccountID = cashAccountId,
                    EntryDate = receiving.ReceiveDate,
                    Debit = 0,
                    Credit = receiving.TotalAmount,
                    Description = $"Receiving # {receiving.Id} - Cash/Cheque Received",
                    AddBy = receiving.UserId,
                    AddOn = DateTime.Now
                };

                _context.LedgerEntries.Add(debitEntry);
                _context.LedgerEntries.Add(creditEntry);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception($"Ledger creation failed: {ex.Message}");
            }
        }

        private async Task<int> GetCashAccountId(int branchId)
        {
            var cashAccount = await _context.tblCOA
                .Where(a => a.BranchID == branchId
                    && a.Active == true
                    && a.AcctCode != null
                    && a.AcctCode.StartsWith("1000-01-01")
                    && a.AcctCode.Length > "1000-01-01".Length)
                .FirstOrDefaultAsync();

            if (cashAccount == null)
                throw new Exception("No cash account found for branch " + branchId);

            return cashAccount.acctID;
        }

        public async Task DeleteReceivingLedgerAsync(int receivingId)
        {
            var ledgerEntries = await _context.LedgerEntries
                .Where(l => l.Description != null && l.Description.Contains($"Receiving # {receivingId}"))
                .ToListAsync();

            if (ledgerEntries.Any())
            {
                _context.LedgerEntries.RemoveRange(ledgerEntries);
                await _context.SaveChangesAsync();
            }
        }

        
    }
}