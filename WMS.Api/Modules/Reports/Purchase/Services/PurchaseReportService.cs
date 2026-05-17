using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using WMS.Api.Modules.Reports.Purchase.DTOs;
using WMS.API.Modules.Reports.Purchase.DTOs;
using WMS.API.Modules.Reports.Purchase.Interfaces;

namespace WMS.API.Modules.Reports.Purchase.Services
{
    public class PurchaseReportService : IPurchaseReportService
    {
        private readonly IConfiguration _configuration;

        public PurchaseReportService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<PurchaseSummaryDto>> GetPurchaseSummaryAsync(
     DateTime fromDate,
     DateTime toDate,
     int? branchId)
        {
            var list = new List<PurchaseSummaryDto>();

            using (SqlConnection conn =
                new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                using (SqlCommand cmd = new SqlCommand("rptPurchaseSummary", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("@FromDate", fromDate);
                    cmd.Parameters.AddWithValue("@ToDate", toDate);
                    cmd.Parameters.AddWithValue("@BranchId", branchId ?? (object)DBNull.Value);

                    await conn.OpenAsync();

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            list.Add(new PurchaseSummaryDto
                            {
                                PurchaseId = Convert.ToInt32(reader["PurchaseId"]),
                                PurchaseNo = reader["PurchaseNo"]?.ToString(),
                                PurchaseDate = reader["PurchaseDate"] as DateTime?,
                                SuppID = reader["SuppID"] as int?,
                                SupplierName = reader["SupplierName"]?.ToString(),
                                BranchName = reader["BranchName"]?.ToString(),
                                BranchID = reader["BranchID"] as int?,
                                TotalAmount = reader["TotalAmount"] as decimal?
                            });
                        }
                    }
                }
            }

            return list;
        }


        public async Task<List<PurchaseDetailDto>> GetPurchaseDetailAsync(
    DateTime fromDate,
    DateTime toDate,
    int? supplierId,
    int? itemId)
        {
            var list = new List<PurchaseDetailDto>();

            using (SqlConnection conn =
                new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                using (SqlCommand cmd = new SqlCommand("rptPurchaseDetail", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("@FromDate", fromDate);
                    cmd.Parameters.AddWithValue("@ToDate", toDate);

                    // 🔥 FIX: REQUIRED PARAMETER
                    cmd.Parameters.AddWithValue("@BranchID", 1); // change to your branch

                    cmd.Parameters.Add("@SupplierID", SqlDbType.Int).Value =
     supplierId.HasValue ? supplierId.Value : DBNull.Value;

                    cmd.Parameters.Add("@ItemID", SqlDbType.Int).Value =
                        itemId.HasValue ? itemId.Value : DBNull.Value;


                    await conn.OpenAsync();

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            list.Add(new PurchaseDetailDto
                            {
                                BillNumb = reader["BillNumb"]?.ToString(),
                                TranDate = reader["TranDate"] as DateTime?,
                                SupplierName = reader["SupplierName"]?.ToString(),
                                ItemName = reader["ItemName"]?.ToString(),
                                ModlNumb = reader["ModlNumb"]?.ToString(),
                                PurcQnty = reader["PurcQnty"] as double?,
                                PurcRate = reader["PurcRate"] as double?,
                                PurcAmnt = reader["PurcAmnt"] as double?
                            });
                        }
                    }
                }
            }

            return list;
        }

        public async Task<List<DropdownDto>> GetSuppliersAsync(int branchId)
        {
            var list = new List<DropdownDto>();

            using (SqlConnection conn =
                new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                string query = @"
            SELECT DISTINCT coa.acctID AS Id, coa.AcctName AS Name
            FROM PurcFile pf
            INNER JOIN tblCOA coa ON coa.acctID = pf.SuppID
            WHERE pf.BranchID = @BranchID
            ORDER BY coa.AcctName";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@BranchID", branchId);

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

        public async Task<List<DropdownDto>> GetItemsAsync(int branchId)
        {
            var list = new List<DropdownDto>();

            using (SqlConnection conn =
                new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                string query = @"
            SELECT DISTINCT i.ItemID AS Id, i.ItemName AS Name
            FROM PurcFild d
            INNER JOIN PurcFile pf ON pf.TranNumb = d.TranNumb
            INNER JOIN ItemFile i ON i.ItemID = d.ItemID
            WHERE pf.BranchID = @BranchID
            ORDER BY i.ItemName";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@BranchID", branchId);

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
