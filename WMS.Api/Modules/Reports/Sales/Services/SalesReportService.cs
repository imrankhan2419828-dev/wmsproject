using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using WMS.API.Modules.Reports.Sales.DTOs;
using WMS.API.Modules.Reports.Sales.Interfaces;

namespace WMS.API.Modules.Reports.Sales.Services
{
    public class SalesReportService : ISalesReportService
    {
        private readonly IConfiguration _configuration;
        private readonly int _defaultBranchId = 1;

        public SalesReportService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<SalesReportResponseDto> GetSalesReportAsync(
            DateTime fromDate,
            DateTime toDate,
            int? customerId,
            int? itemId)
        {
            var response = new SalesReportResponseDto
            {
                Transactions = new List<SalesReportDto>(),
                Summary = new SalesSummaryDto()
            };

            var transactions = new List<SalesReportDto>();

            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                using (SqlCommand cmd = new SqlCommand("rptSalesReport", conn))
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
                            var dto = new SalesReportDto
                            {
                                SaleDate = reader["SaleDate"]?.ToString(),
                                SaleID = reader["SaleID"] != DBNull.Value ? Convert.ToInt32(reader["SaleID"]) : 0,
                                BillNo = reader["BillNo"]?.ToString(),
                                CustomerName = reader["CustomerName"]?.ToString(),
                                ItemName = reader["ItemName"]?.ToString(),
                                ModlNumb = reader["ModlNumb"]?.ToString(),
                                Quantity = reader["Quantity"] != DBNull.Value ? Convert.ToDouble(reader["Quantity"]) : (double?)null,
                                Rate = reader["Rate"] != DBNull.Value ? Convert.ToDouble(reader["Rate"]) : (double?)null,
                                Amount = reader["Amount"] != DBNull.Value ? Convert.ToDouble(reader["Amount"]) : (double?)null,
                                BillTotal = reader["BillTotal"] != DBNull.Value ? Convert.ToDouble(reader["BillTotal"]) : (double?)null,
                                Description = reader["Description"]?.ToString()
                            };
                            transactions.Add(dto);
                        }
                    }
                }
            }

            response.Transactions = transactions;

            // Calculate summary
            var distinctBills = new HashSet<int>();
            double totalQty = 0;
            double totalAmt = 0;

            foreach (var t in transactions)
            {
                if (t.SaleID > 0)
                    distinctBills.Add(t.SaleID);

                totalQty += t.Quantity ?? 0;
                totalAmt += t.Amount ?? 0;
            }

            response.Summary.TotalBills = distinctBills.Count;
            response.Summary.TotalQuantity = totalQty;
            response.Summary.TotalAmount = totalAmt;
            response.Summary.AverageBillAmount = distinctBills.Count > 0 ? totalAmt / distinctBills.Count : 0;

            return response;
        }

        public async Task<List<DropdownDto>> GetCustomersAsync()
        {
            var list = new List<DropdownDto>();

            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                string query = @"
                    SELECT DISTINCT
                        ISNULL(sf.CustID, 0) AS Id,
                        ISNULL(coa.AcctName, sf.CustName) AS Name
                    FROM SaleFile sf
                    LEFT JOIN tblCOA coa ON sf.CustID = coa.acctID
                    WHERE sf.BranchID = @BranchId
                        AND (sf.CancStat IS NULL OR sf.CancStat = 0)
                        AND (sf.CustID IS NOT NULL OR sf.CustName IS NOT NULL)
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
                // Simple query without any complications
                string query = @"
            SELECT 
                i.ItemID AS Id,
                i.ItemName AS Name
            FROM ItemFile i
            WHERE EXISTS (
                SELECT 1 
                FROM SaleFild sd 
                WHERE sd.ItemID = i.ItemID
            )
            ORDER BY i.ItemName";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
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
