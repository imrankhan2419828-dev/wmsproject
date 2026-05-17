using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using WMS.API.Modules.Reports.PurchaseReturn.DTOs;
using WMS.API.Modules.Reports.PurchaseReturn.Interfaces;

namespace WMS.API.Modules.Reports.PurchaseReturn.Services
{
    public class PurchaseReturnReportService : IPurchaseReturnReportService
    {
        private readonly IConfiguration _configuration;
        private readonly int _defaultBranchId = 1; // Fixed branch

        public PurchaseReturnReportService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<List<PurchaseReturnReportDto>> GetPurchaseReturnReportAsync(
            DateTime fromDate,
            DateTime toDate,
            int? supplierId,
            int? itemId)
        {
            var list = new List<PurchaseReturnReportDto>();

            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                using (SqlCommand cmd = new SqlCommand("rptPurchaseReturn", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.Add("@FromDate", SqlDbType.Date).Value = fromDate.Date;
                    cmd.Parameters.Add("@ToDate", SqlDbType.Date).Value = toDate.Date;
                    cmd.Parameters.Add("@BranchId", SqlDbType.Int).Value = _defaultBranchId;
                    cmd.Parameters.Add("@SupplierId", SqlDbType.Int).Value = supplierId ?? (object)DBNull.Value;
                    cmd.Parameters.Add("@ItemId", SqlDbType.Int).Value = itemId ?? (object)DBNull.Value;

                    await conn.OpenAsync();

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var dto = new PurchaseReturnReportDto
                            {
                                ReturnDate = reader["ReturnDate"]?.ToString(),
                                ReturnBillNo = reader["ReturnBillNo"]?.ToString(),
                                SupplierName = reader["SupplierName"]?.ToString(),
                                ItemName = reader["ItemName"]?.ToString(),
                                ModlNumb = reader["ModlNumb"]?.ToString(),
                                Quantity = reader["Quantity"] != DBNull.Value ? Convert.ToDecimal(reader["Quantity"]) : 0,
                                Rate = reader["Rate"] != DBNull.Value ? Convert.ToDecimal(reader["Rate"]) : 0,
                                Amount = reader["Amount"] != DBNull.Value ? Convert.ToDecimal(reader["Amount"]) : 0,
                                OriginalBillNo = reader["OriginalBillNo"]?.ToString(),
                                Description = reader["Description"]?.ToString()
                            };
                            list.Add(dto);
                        }
                    }
                }
            }

            return list;
        }

        public async Task<List<DropdownDto>> GetSuppliersAsync()
        {
            var list = new List<DropdownDto>();

            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                string query = @"
                    SELECT DISTINCT 
                        pr.SuppID AS Id,
                        coa.AcctName AS Name
                    FROM PurchaseReturn pr
                    INNER JOIN tblCOA coa ON pr.SuppID = coa.acctID
                    WHERE pr.BranchID = 1
                    ORDER BY coa.AcctName";

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

        //public async Task<List<DropdownDto>> GetItemsAsync()
        //{
        //    var list = new List<DropdownDto>();

        //    using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
        //    {
        //        string query = @"
        //            SELECT DISTINCT 
        //                pri.ItemID AS Id,
        //                i.ItemName + ' (' + ISNULL(i.ModlNumb, '') + ')' AS Name
        //            FROM PurchaseReturnItems pri
        //            INNER JOIN PurchaseReturn pr ON pri.ReturnID = pr.ReturnID
        //            INNER JOIN ItemFile i ON pri.ItemID = i.ItemID
        //            WHERE pr.BranchID = 1
        //            ORDER BY i.ItemName";

        //        using (SqlCommand cmd = new SqlCommand(query, conn))
        //        {
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

        public async Task<List<DropdownDto>> GetItemsAsync()
        {
            var list = new List<DropdownDto>();

            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                // Alternative: Use GROUP BY instead of DISTINCT
                string query = @"
            SELECT 
                i.ItemID AS Id,
                MAX(i.ItemName + ' (' + ISNULL(i.ModlNumb, '') + ')') AS Name
            FROM ItemFile i
            WHERE EXISTS (
                SELECT 1 
                FROM PurchaseReturnItems pri 
                INNER JOIN PurchaseReturn pr ON pri.ReturnID = pr.ReturnID
                WHERE pri.ItemID = i.ItemID 
                AND pr.BranchID = 1
            )
            GROUP BY i.ItemID, i.ItemName
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
