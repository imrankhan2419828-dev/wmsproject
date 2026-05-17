using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Api.Data;
using WMS.Api.DTOs.Dashboard;

namespace WMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : BaseController
    {
        private readonly WmsDbContext _context;

        public DashboardController(WmsDbContext context)
        {
            _context = context;
        }

        // ========== HELPER METHODS ==========
        private DateTime GetSafeDate(DateTime? date)
        {
            return date ?? DateTime.Today;
        }

        // ========== PURCHASE SUMMARY ==========
        [HttpGet("financial/purchase-summary")]
        public async Task<IActionResult> GetPurchaseSummary([FromQuery] int? branchId)
        {
            try
            {
                int branch = branchId ?? GetCurrentBranchId();
                var today = DateTime.Today;

                var purchases = await _context.PurcFile
                    .Include(p => p.Supplier)
                    .Where(p => p.BranchID == branch && !p.IsDeleted)
                    .ToListAsync();

                var todayPurchases = purchases.Where(p => GetSafeDate(p.TranDate).Date == today).ToList();

                var response = new DashboardWidgetDataDto
                {
                    Summary = new DashboardSummaryDto
                    {
                        TotalAmount = (decimal)(purchases.Sum(p => p.NetAmnt ?? 0)),
                        CashAmount = (decimal)(purchases.Where(p => p.TranType == "Cash").Sum(p => p.NetAmnt ?? 0)),
                        CreditAmount = (decimal)(purchases.Where(p => p.TranType == "Credit").Sum(p => p.NetAmnt ?? 0)),
                        TotalCount = purchases.Count,
                        CashCount = purchases.Count(p => p.TranType == "Cash"),
                        CreditCount = purchases.Count(p => p.TranType == "Credit")
                    },
                    Today = new DashboardTodayDto
                    {
                        Date = today,
                        TotalAmount = (decimal)(todayPurchases.Sum(p => p.NetAmnt ?? 0)),
                        CashAmount = (decimal)(todayPurchases.Where(p => p.TranType == "Cash").Sum(p => p.NetAmnt ?? 0)),
                        CreditAmount = (decimal)(todayPurchases.Where(p => p.TranType == "Credit").Sum(p => p.NetAmnt ?? 0)),
                        TotalCount = todayPurchases.Count,
                        CashCount = todayPurchases.Count(p => p.TranType == "Cash"),
                        CreditCount = todayPurchases.Count(p => p.TranType == "Credit")
                    },
                    Recent = purchases.OrderByDescending(p => GetSafeDate(p.TranDate))
                        .Take(10)
                        .Select(p => new DashboardRecentDto
                        {
                            Id = p.TranNumb,
                            VoucherNo = p.BillNumb ?? "",
                            PartyName = p.Supplier != null ? p.Supplier.AcctName : "",
                            Amount = (decimal)(p.NetAmnt ?? 0),
                            Date = GetSafeDate(p.TranDate),
                            Type = p.TranType
                        }).ToList(),
                    MonthlyTrends = purchases.GroupBy(p => new { GetSafeDate(p.TranDate).Year, GetSafeDate(p.TranDate).Month })
                        .Select(g => new DashboardTrendDto
                        {
                            Month = g.Key.Month,
                            Period = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                            Amount = (decimal)(g.Sum(p => p.NetAmnt ?? 0)),
                            Count = g.Count()
                        })
                        .OrderBy(t => t.Month)
                        .ToList(),
                    LastUpdated = DateTime.Now
                };

                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // ========== PURCHASE RETURN SUMMARY ==========
        [HttpGet("financial/purchase-return-summary")]
        public async Task<IActionResult> GetPurchaseReturnSummary([FromQuery] int? branchId)
        {
            try
            {
                int branch = branchId ?? GetCurrentBranchId();
                var today = DateTime.Today;

                var returns = await _context.PurchaseReturn
                    .Include(r => r.Items)
                    .Include(r => r.Supplier)
                    .Where(r => r.BranchID == branch)
                    .ToListAsync();

                var todayReturns = returns.Where(r => r.TranDate.Date == today).ToList();

                var response = new DashboardWidgetDataDto
                {
                    Summary = new DashboardSummaryDto
                    {
                        TotalAmount = (decimal)(returns.Sum(r => r.Items.Sum(i => i.PurcAmnt))),
                        TotalCount = returns.Count
                    },
                    Today = new DashboardTodayDto
                    {
                        Date = today,
                        TotalAmount = (decimal)(todayReturns.Sum(r => r.Items.Sum(i => i.PurcAmnt))),
                        TotalCount = todayReturns.Count
                    },
                    Recent = returns.OrderByDescending(r => r.TranDate)
                        .Take(10)
                        .Select(r => new DashboardRecentDto
                        {
                            Id = r.ReturnID,
                            VoucherNo = r.BillNumb ?? "",
                            PartyName = r.Supplier != null ? r.Supplier.AcctName : "",
                            Amount = (decimal)(r.Items.Sum(i => i.PurcAmnt)),
                            Date = r.TranDate
                        }).ToList(),
                    MonthlyTrends = returns.GroupBy(r => new { r.TranDate.Year, r.TranDate.Month })
                        .Select(g => new DashboardTrendDto
                        {
                            Month = g.Key.Month,
                            Period = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                            Amount = (decimal)(g.Sum(r => r.Items.Sum(i => i.PurcAmnt))),
                            Count = g.Count()
                        })
                        .OrderBy(t => t.Month)
                        .ToList(),
                    LastUpdated = DateTime.Now
                };

                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // ========== SALE SUMMARY ==========
        [HttpGet("financial/sale-summary")]
        public async Task<IActionResult> GetSaleSummary([FromQuery] int? branchId)
        {
            try
            {
                int branch = branchId ?? GetCurrentBranchId();
                var today = DateTime.Today;

                var sales = await _context.SaleFiles
                    .Where(s => s.BranchID == branch && (s.CancStat == null || s.CancStat == false))
                    .ToListAsync();

                var todaySales = sales.Where(s => GetSafeDate(s.TranDate).Date == today).ToList();

                var response = new DashboardWidgetDataDto
                {
                    Summary = new DashboardSummaryDto
                    {
                        TotalAmount = (decimal)(sales.Sum(s => s.TotlAmnt ?? 0)),
                        CashAmount = (decimal)(sales.Where(s => s.TranMode == "Cash").Sum(s => s.TotlAmnt ?? 0)),
                        CreditAmount = (decimal)(sales.Where(s => s.TranMode == "Credit").Sum(s => s.TotlAmnt ?? 0)),
                        TotalCount = sales.Count,
                        CashCount = sales.Count(s => s.TranMode == "Cash"),
                        CreditCount = sales.Count(s => s.TranMode == "Credit")
                    },
                    Today = new DashboardTodayDto
                    {
                        Date = today,
                        TotalAmount = (decimal)(todaySales.Sum(s => s.TotlAmnt ?? 0)),
                        CashAmount = (decimal)(todaySales.Where(s => s.TranMode == "Cash").Sum(s => s.TotlAmnt ?? 0)),
                        CreditAmount = (decimal)(todaySales.Where(s => s.TranMode == "Credit").Sum(s => s.TotlAmnt ?? 0)),
                        TotalCount = todaySales.Count,
                        CashCount = todaySales.Count(s => s.TranMode == "Cash"),
                        CreditCount = todaySales.Count(s => s.TranMode == "Credit")
                    },
                    Recent = sales.OrderByDescending(s => GetSafeDate(s.TranDate))
                        .Take(10)
                        .Select(s => new DashboardRecentDto
                        {
                            Id = s.TranNumb,
                            VoucherNo = s.BillNumb ?? "",
                            PartyName = s.CustName ?? s.WalkingCustomer ?? "",
                            Amount = (decimal)(s.TotlAmnt ?? 0),
                            Date = GetSafeDate(s.TranDate),
                            Type = s.TranMode
                        }).ToList(),
                    MonthlyTrends = sales.GroupBy(s => new { GetSafeDate(s.TranDate).Year, GetSafeDate(s.TranDate).Month })
                        .Select(g => new DashboardTrendDto
                        {
                            Month = g.Key.Month,
                            Period = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                            Amount = (decimal)(g.Sum(s => s.TotlAmnt ?? 0)),
                            Count = g.Count()
                        })
                        .OrderBy(t => t.Month)
                        .ToList(),
                    LastUpdated = DateTime.Now
                };

                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // ========== SALE RETURN SUMMARY ==========
        [HttpGet("financial/sale-return-summary")]
        public async Task<IActionResult> GetSaleReturnSummary([FromQuery] int? branchId)
        {
            try
            {
                int branch = branchId ?? GetCurrentBranchId();
                var today = DateTime.Today;

                var returns = await _context.SaleReturnFiles
                    .Include(r => r.Items)
                    .Where(r => r.BranchID == branch && r.CancStat != true)
                    .ToListAsync();

                var todayReturns = returns.Where(r => GetSafeDate(r.TranDate).Date == today).ToList();

                var response = new DashboardWidgetDataDto
                {
                    Summary = new DashboardSummaryDto
                    {
                        TotalAmount = (decimal)(returns.Sum(r => r.TotlAmnt)),
                        TotalCount = returns.Count
                    },
                    Today = new DashboardTodayDto
                    {
                        Date = today,
                        TotalAmount = (decimal)(todayReturns.Sum(r => r.TotlAmnt)),
                        TotalCount = todayReturns.Count
                    },
                    Recent = returns.OrderByDescending(r => GetSafeDate(r.TranDate))
                        .Take(10)
                        .Select(r => new DashboardRecentDto
                        {
                            Id = r.ReturnTranNumb,
                            VoucherNo = r.BillNumb ?? "",
                            PartyName = r.CustName ?? r.WalkingCustomer ?? "",
                            Amount = (decimal)(r.TotlAmnt),
                            Date = GetSafeDate(r.TranDate)
                        }).ToList(),
                    MonthlyTrends = returns.GroupBy(r => new { GetSafeDate(r.TranDate).Year, GetSafeDate(r.TranDate).Month })
                        .Select(g => new DashboardTrendDto
                        {
                            Month = g.Key.Month,
                            Period = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                            Amount = (decimal)(g.Sum(r => r.TotlAmnt)),
                            Count = g.Count()
                        })
                        .OrderBy(t => t.Month)
                        .ToList(),
                    LastUpdated = DateTime.Now
                };

                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // ========== JOB CARD SUMMARY ==========
        [HttpGet("workshop/jobcard-summary")]
        public async Task<IActionResult> GetJobCardSummary([FromQuery] int? branchId)
        {
            try
            {
                int branch = branchId ?? GetCurrentBranchId();
                var today = DateTime.Today;

                var jobCards = await _context.JobCards
                    .Include(j => j.Vehicle)
                    .Include(j => j.Customer)
                    .Where(j => j.BranchID == branch && !j.IsDeleted)
                    .ToListAsync();

                var todayJobCards = jobCards.Where(j => j.ReceivedDate.Date == today).ToList();

                var response = new DashboardWidgetDataDto
                {
                    Summary = new DashboardSummaryDto
                    {
                        TotalCount = jobCards.Count,
                        Pending = jobCards.Count(j => j.Status == "PENDING"),
                        InProgress = jobCards.Count(j => j.Status == "IN_PROGRESS"),
                        Completed = jobCards.Count(j => j.Status == "COMPLETED"),
                        Delivered = jobCards.Count(j => j.Status == "DELIVERED"),
                        Cancelled = jobCards.Count(j => j.Status == "CANCELLED")
                    },
                    Today = new DashboardTodayDto
                    {
                        Date = today,
                        TotalCount = todayJobCards.Count,
                        Pending = todayJobCards.Count(j => j.Status == "PENDING"),
                        InProgress = todayJobCards.Count(j => j.Status == "IN_PROGRESS"),
                        Completed = todayJobCards.Count(j => j.Status == "COMPLETED")
                    },
                    Recent = jobCards.OrderByDescending(j => j.ReceivedDate)
                        .Take(10)
                        .Select(j => new DashboardRecentDto
                        {
                            Id = j.JobCardID,
                            VoucherNo = j.JobCardNo ?? "",
                            PartyName = j.Customer != null ? j.Customer.AcctName : "",
                            VehicleRegNo = j.Vehicle != null ? j.Vehicle.RegistrationNo : "",
                            Date = j.ReceivedDate,
                            Status = j.Status
                        }).ToList(),
                    MonthlyTrends = jobCards.GroupBy(j => new { j.ReceivedDate.Year, j.ReceivedDate.Month })
                        .Select(g => new DashboardTrendDto
                        {
                            Month = g.Key.Month,
                            Period = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                            Count = g.Count()
                        })
                        .OrderBy(t => t.Month)
                        .ToList(),
                    LastUpdated = DateTime.Now
                };

                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // ========== BOOKING SUMMARY ==========
        [HttpGet("workshop/booking-summary")]
        public async Task<IActionResult> GetBookingSummary([FromQuery] int? branchId)
        {
            try
            {
                int branch = branchId ?? GetCurrentBranchId();
                var today = DateTime.Today;

                var bookings = await _context.Bookings
                    .Include(b => b.Vehicle)
                        .ThenInclude(v => v.Customer)
                    .Where(b => b.BranchID == branch && !b.IsDeleted)
                    .ToListAsync();

                var todayBookings = bookings.Where(b => b.BookingDate.Date == today).ToList();

                var response = new DashboardWidgetDataDto
                {
                    Summary = new DashboardSummaryDto
                    {
                        TotalCount = bookings.Count,
                        Pending = bookings.Count(b => b.Status == "Pending"),
                        Confirmed = bookings.Count(b => b.Status == "Confirmed"),
                        InProgress = bookings.Count(b => b.Status == "InProgress"),
                        Completed = bookings.Count(b => b.Status == "Completed"),
                        Cancelled = bookings.Count(b => b.Status == "Cancelled")
                    },
                    Today = new DashboardTodayDto
                    {
                        Date = today,
                        TotalCount = todayBookings.Count,
                        Pending = todayBookings.Count(b => b.Status == "Pending"),
                        Confirmed = todayBookings.Count(b => b.Status == "Confirmed")
                    },
                    Recent = bookings.OrderByDescending(b => b.BookingDate)
                        .Take(10)
                        .Select(b => new DashboardRecentDto
                        {
                            Id = b.BookingID,
                            VoucherNo = b.BookingNo ?? "",
                            PartyName = b.Vehicle != null && b.Vehicle.Customer != null ? b.Vehicle.Customer.AcctName : "",
                            VehicleRegNo = b.Vehicle != null ? b.Vehicle.RegistrationNo : "",
                            Date = b.BookingDate,
                            Status = b.Status
                        }).ToList(),
                    MonthlyTrends = bookings.GroupBy(b => new { b.BookingDate.Year, b.BookingDate.Month })
                        .Select(g => new DashboardTrendDto
                        {
                            Month = g.Key.Month,
                            Period = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                            Count = g.Count()
                        })
                        .OrderBy(t => t.Month)
                        .ToList(),
                    LastUpdated = DateTime.Now
                };

                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // ========== PAYMENT SUMMARY ==========
        [HttpGet("financial/payment-summary")]
        public async Task<IActionResult> GetPaymentSummary([FromQuery] int? branchId)
        {
            try
            {
                int branch = branchId ?? GetCurrentBranchId();
                var today = DateTime.Today;

                var payments = await _context.PaymentFiles
                    .Include(p => p.PaymentItems)
                    .Where(p => p.BranchID == branch && (p.CancStat == null || p.CancStat == false))
                    .ToListAsync();

                var todayPayments = payments.Where(p => p.PaymentDate.Date == today).ToList();

                var response = new DashboardWidgetDataDto
                {
                    Summary = new DashboardSummaryDto
                    {
                        TotalAmount = (decimal)payments.Sum(p => p.Amount),
                        CashAmount = (decimal)payments.Where(p => p.PaymentMode == "CASH").Sum(p => p.Amount),
                        ChequeAmount = (decimal)payments.Where(p => p.PaymentMode == "CHEQUE").Sum(p => p.Amount),
                        TotalCount = payments.Count,
                        CashCount = payments.Count(p => p.PaymentMode == "CASH"),
                        ChequeCount = payments.Count(p => p.PaymentMode == "CHEQUE")
                    },
                    Today = new DashboardTodayDto
                    {
                        Date = today,
                        TotalAmount = (decimal)todayPayments.Sum(p => p.Amount),
                        CashAmount = (decimal)todayPayments.Where(p => p.PaymentMode == "CASH").Sum(p => p.Amount),
                        ChequeAmount = (decimal)todayPayments.Where(p => p.PaymentMode == "CHEQUE").Sum(p => p.Amount),
                        TotalCount = todayPayments.Count,
                        CashCount = todayPayments.Count(p => p.PaymentMode == "CASH"),
                        ChequeCount = todayPayments.Count(p => p.PaymentMode == "CHEQUE")
                    },
                    Recent = payments.OrderByDescending(p => p.PaymentDate)
                        .Take(10)
                        .Select(p => new DashboardRecentDto
                        {
                            Id = p.PaymentID,
                            VoucherNo = p.VoucherNumb ?? "",
                            PartyName = p.WalkingParty ?? "",
                            Amount = (decimal)p.Amount,
                            Date = p.PaymentDate,
                            PaymentMode = p.PaymentMode,
                            Type = p.PaymentType
                        }).ToList(),
                    MonthlyTrends = payments.GroupBy(p => new { p.PaymentDate.Year, p.PaymentDate.Month })
                        .Select(g => new DashboardTrendDto
                        {
                            Month = g.Key.Month,
                            Period = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                            Amount = (decimal)g.Sum(p => p.Amount),
                            Count = g.Count()
                        })
                        .OrderBy(t => t.Month)
                        .ToList(),
                    LastUpdated = DateTime.Now
                };

                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // ========== RECEIVING SUMMARY ==========
        [HttpGet("financial/receiving-summary")]
        public async Task<IActionResult> GetReceivingSummary([FromQuery] int? branchId)
        {
            try
            {
                int branch = branchId ?? GetCurrentBranchId();
                var today = DateTime.Today;

                var receivings = await _context.ReceivingFiles
                    .Include(r => r.CashList)
                    .Include(r => r.ChequeList)
                    .Where(r => r.BranchId == branch)
                    .ToListAsync();

                var todayReceivings = receivings.Where(r => r.ReceiveDate.Date == today).ToList();

                var response = new DashboardWidgetDataDto
                {
                    Summary = new DashboardSummaryDto
                    {
                        TotalAmount = (decimal)receivings.Sum(r => (r.CashList?.Sum(c => c.Amount) ?? 0) + (r.ChequeList?.Sum(c => c.Amount) ?? 0)),
                        CashAmount = (decimal)receivings.Sum(r => r.CashList?.Sum(c => c.Amount) ?? 0),
                        ChequeAmount = (decimal)receivings.Sum(r => r.ChequeList?.Sum(c => c.Amount) ?? 0),
                        TotalCount = receivings.Count
                    },
                    Today = new DashboardTodayDto
                    {
                        Date = today,
                        TotalAmount = (decimal)todayReceivings.Sum(r => (r.CashList?.Sum(c => c.Amount) ?? 0) + (r.ChequeList?.Sum(c => c.Amount) ?? 0)),
                        CashAmount = (decimal)todayReceivings.Sum(r => r.CashList?.Sum(c => c.Amount) ?? 0),
                        ChequeAmount = (decimal)todayReceivings.Sum(r => r.ChequeList?.Sum(c => c.Amount) ?? 0),
                        TotalCount = todayReceivings.Count
                    },
                    Recent = receivings.OrderByDescending(r => r.ReceiveDate)
                        .Take(10)
                        .Select(r => new DashboardRecentDto
                        {
                            Id = r.Id,
                            VoucherNo = r.VoucherNumb ?? "",
                            PartyName = r.PartyName ?? "",
                            Amount = (decimal)((r.CashList?.Sum(c => c.Amount) ?? 0) + (r.ChequeList?.Sum(c => c.Amount) ?? 0)),
                            Date = r.ReceiveDate
                        }).ToList(),
                    MonthlyTrends = receivings.GroupBy(r => new { r.ReceiveDate.Year, r.ReceiveDate.Month })
                        .Select(g => new DashboardTrendDto
                        {
                            Month = g.Key.Month,
                            Period = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                            Amount = (decimal)g.Sum(r => (r.CashList?.Sum(c => c.Amount) ?? 0) + (r.ChequeList?.Sum(c => c.Amount) ?? 0)),
                            Count = g.Count()
                        })
                        .OrderBy(t => t.Month)
                        .ToList(),
                    LastUpdated = DateTime.Now
                };

                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // ========== TECHNICIAN WORKLOAD ==========
        [HttpGet("workshop/technician-workload")]
        public async Task<IActionResult> GetTechnicianWorkload([FromQuery] int? branchId)
        {
            try
            {
                var technicians = await _context.Technicians
                    .Include(t => t.User)
                    .Where(t => !t.IsDeleted && !t.InActive)
                    .ToListAsync();

                var workloads = new List<object>();

                foreach (var tech in technicians)
                {
                    var activeJobs = await _context.JobServices
                        .CountAsync(js => js.TechnicianID == tech.TechnicianID && js.Status != "COMPLETED");

                    var capacity = tech.DailyCapacity ?? 8;
                    var workloadPercentage = capacity > 0 ? (activeJobs * 100) / capacity : 0;

                    workloads.Add(new
                    {
                        TechnicianID = tech.TechnicianID,
                        TechnicianName = tech.TechnicianName ?? tech.User?.UserFullName,
                        ActiveJobs = activeJobs,
                        DailyCapacity = capacity,
                        WorkloadPercentage = workloadPercentage
                    });
                }

                return Ok(new { success = true, data = workloads });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}