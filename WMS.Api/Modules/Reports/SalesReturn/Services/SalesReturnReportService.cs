using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using WMS.API.Modules.Reports.SalesReturn.DTOs;
using WMS.API.Modules.Reports.SalesReturn.Interfaces;

namespace WMS.API.Modules.Reports.SalesReturn.Services
{
    public class SalesReturnReportService : ISalesReturnReportService
    {
        private readonly IConfiguration _configuration;
        private readonly int _defaultBranchId = 1;

        public SalesReturnReportService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<SalesReturnReportResponseDto> GetSalesReturnReportAsync(
            DateTime fromDate,
            DateTime toDate,
            int? customerId,
            int? itemId)
        {
            var response = new SalesReturnReportResponseDto
            {
                Transactions = new List<SalesReturnReportDto>(),
                Summary = new SalesReturnSummaryDto()
            };

            var transactions = new List<SalesReturnReportDto>();

            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                using (SqlCommand cmd = new SqlCommand("rptSalesReturnReport", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.Add("@FromDate", SqlDbType.Date).Value = fromDate.Date;
                    cmd.Parameters.Add("@ToDate", SqlDbType.Date).Value = toDate.Date;
                    cmd.Parameters.Add("@BranchId", SqlDbType.Int).Value = _defaultBranchId;
                    cmd.Parameters.Add("@CustomerId", SqlDbType.Int).Value = customerId ?? (object)DBNull.Value;
                    cmd.Parameters.Add("@ItemId", SqlDbType.Int).Value = itemId ?? (object)DBNull.Value;

                    await conn.OpenAsync();

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var dto = new SalesReturnReportDto
                            {
                                ReturnDate = reader["ReturnDate"]?.ToString(),
                                ReturnID = reader["ReturnID"] != DBNull.Value ? Convert.ToInt32(reader["ReturnID"]) : 0,
                                ReturnBillNo = reader["ReturnBillNo"]?.ToString(),
                                CustomerName = reader["CustomerName"]?.ToString(),
                                OriginalBillNo = reader["OriginalBillNo"]?.ToString(),
                                ItemName = reader["ItemName"]?.ToString(),
                                ModlNumb = reader["ModlNumb"]?.ToString(),
                                Quantity = reader["Quantity"] != DBNull.Value ? Convert.ToDecimal(reader["Quantity"]) : (decimal?)null,
                                Rate = reader["Rate"] != DBNull.Value ? Convert.ToDecimal(reader["Rate"]) : (decimal?)null,
                                Amount = reader["Amount"] != DBNull.Value ? Convert.ToDecimal(reader["Amount"]) : (decimal?)null,
                                BillTotal = reader["BillTotal"] != DBNull.Value ? Convert.ToDecimal(reader["BillTotal"]) : (decimal?)null,
                                Description = reader["Description"]?.ToString()
                            };
                            transactions.Add(dto);
                        }
                    }
                }
            }

            response.Transactions = transactions;

            // Calculate summary
            var distinctReturns = new HashSet<int>();
            decimal totalQty = 0;
            decimal totalAmt = 0;

            foreach (var t in transactions)
            {
                if (t.ReturnID > 0)
                    distinctReturns.Add(t.ReturnID);

                totalQty += t.Quantity ?? 0;
                totalAmt += t.Amount ?? 0;
            }

            response.Summary.TotalReturns = distinctReturns.Count;
            response.Summary.TotalQuantity = totalQty;
            response.Summary.TotalAmount = totalAmt;
            response.Summary.AverageReturnAmount = distinctReturns.Count > 0 ? totalAmt / distinctReturns.Count : 0;

            return response;
        }

        //public async Task<List<DropdownDto>> GetCustomersAsync()
        //{
        //    var list = new List<DropdownDto>();

        //    using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
        //    {
        //        string query = @"
        //            SELECT DISTINCT
        //                ISNULL(srf.CustID, 0) AS Id,
        //                ISNULL(coa.AcctName, srf.CustName) AS Name,
        //                ISNULL(coa.AcctName, srf.CustName) AS SortName
        //            FROM SaleReturnFile srf
        //            LEFT JOIN tblCOA coa ON srf.CustID = coa.acctID
        //            WHERE srf.BranchID = @BranchId
        //                AND (srf.CancStat IS NULL OR srf.CancStat = 0)
        //                AND (srf.CustID IS NOT NULL OR srf.CustName IS NOT NULL)
        //            ORDER BY SortName";

        //        using (SqlCommand cmd = new SqlCommand(query, conn))
        //        {
        //            cmd.Parameters.AddWithValue("@BranchId", _defaultBranchId);

        //            await conn.OpenAsync();
        //            using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
        //            {
        //                while (await reader.ReadAsync())
        //                {
        //                    list.Add(new DropdownDto
        //                    {
        //                        Id = Convert.ToInt32(reader["Id"]),
        //                        Name = reader["Name"].ToString()
        //                    });
        //                }
        //            }
        //        }
        //    }

        //    return list;
        //}
        public async Task<List<DropdownDto>> GetCustomersAsync()
        {
            var list = new List<DropdownDto>();

            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                // Alternative query with COALESCE and NULL handling
                string query = @"
            SELECT 
                COALESCE(srf.CustID, 0) AS Id,
                COALESCE(coa.AcctName, srf.CustName, 'Unknown Customer') AS Name
            FROM SaleReturnFile srf
            LEFT JOIN tblCOA coa ON srf.CustID = coa.acctID
            WHERE srf.BranchID = @BranchId
                AND (srf.CancStat IS NULL OR srf.CancStat = 0)
                AND (srf.CustID IS NOT NULL OR (srf.CustName IS NOT NULL AND srf.CustName != ''))
            GROUP BY COALESCE(srf.CustID, 0), COALESCE(coa.AcctName, srf.CustName, 'Unknown Customer')
            ORDER BY Name";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@BranchId", _defaultBranchId);

                    await conn.OpenAsync();
                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            list.Add(new DropdownDto
                            {
                                Id = Convert.ToInt32(reader["Id"]),
                                Name = reader["Name"].ToString()
                            });
                        }
                    }
                }
            }

            return list;
        }
        public async Task<List<DropdownDto>> GetItemsAsync()
        {
            var list = new List<DropdownDto>();

            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                string query = @"
                    SELECT 
                        i.ItemID AS Id,
                        MAX(i.ItemName + ' (' + ISNULL(i.ModlNumb, '') + ')') AS Name
                    FROM SaleReturnItem sri
                    INNER JOIN SaleReturnFile srf ON sri.ReturnTranNumb = srf.ReturnTranNumb
                    INNER JOIN ItemFile i ON sri.ItemID = i.ItemID
                    WHERE srf.BranchID = @BranchId
                        AND (srf.CancStat IS NULL OR srf.CancStat = 0)
                    GROUP BY i.ItemID, i.ItemName
                    ORDER BY i.ItemName";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@BranchId", _defaultBranchId);

                    await conn.OpenAsync();
                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            list.Add(new DropdownDto
                            {
                                Id = Convert.ToInt32(reader["Id"]),
                                Name = reader["Name"].ToString()
                            });
                        }
                    }
                }
            }

            return list;
        }
    }
}