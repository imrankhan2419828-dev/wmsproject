using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using WMS.API.Modules.Reports.SupplierBalancing.DTOs;
using WMS.API.Modules.Reports.SupplierBalancing.Interfaces;

namespace WMS.API.Modules.Reports.SupplierBalancing.Services
{
    public class SupplierBalancingService : ISupplierBalancingService
    {
        private readonly IConfiguration _configuration;

        public SupplierBalancingService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<SupplierBalancingResponseDto> GetSupplierBalancingAsync(
            DateTime fromDate,
            DateTime toDate,
            int supplierId,
            int branchId)
        {
            var response = new SupplierBalancingResponseDto
            {
                Transactions = new List<SupplierBalancingDto>()
            };

            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                using (SqlCommand cmd = new SqlCommand("rptSupplierBalancing", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.Add("@FromDate", SqlDbType.Date).Value = fromDate.Date;
                    cmd.Parameters.Add("@ToDate", SqlDbType.Date).Value = toDate.Date;
                    cmd.Parameters.Add("@SupplierId", SqlDbType.Int).Value = supplierId;
                    cmd.Parameters.Add("@BranchId", SqlDbType.Int).Value = branchId;

                    await conn.OpenAsync();

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        // First result set: Transactions
                        while (await reader.ReadAsync())
                        {
                            var dto = new SupplierBalancingDto();

                            // Map all properties explicitly
                            dto.TranDate = reader["TranDate"] != DBNull.Value ? reader["TranDate"].ToString() : "";
                            dto.TranType = reader["TranType"] != DBNull.Value ? reader["TranType"].ToString() : "";
                            dto.VoucherNo = reader["VoucherNo"] != DBNull.Value ? reader["VoucherNo"].ToString() : "";
                            dto.Reference = reader["Reference"] != DBNull.Value ? reader["Reference"].ToString() : "";

                            // ✅ CRITICAL FIX: Map Quantity explicitly
                            if (reader["Quantity"] != DBNull.Value)
                            {
                                dto.Quantity = Convert.ToDecimal(reader["Quantity"]);
                                Console.WriteLine($"Quantity found: {dto.Quantity}"); // Debug log
                            }
                            else
                            {
                                dto.Quantity = 0;
                                Console.WriteLine("Quantity is NULL");
                            }

                            // Map Debit
                            if (reader["Debit"] != DBNull.Value)
                                dto.Debit = Convert.ToDecimal(reader["Debit"]);
                            else
                                dto.Debit = 0;

                            // Map Credit
                            if (reader["Credit"] != DBNull.Value)
                                dto.Credit = Convert.ToDecimal(reader["Credit"]);
                            else
                                dto.Credit = 0;

                            // Map RunningBalance
                            if (reader["RunningBalance"] != DBNull.Value)
                                dto.RunningBalance = Convert.ToDecimal(reader["RunningBalance"]);
                            else
                                dto.RunningBalance = 0;

                            response.Transactions.Add(dto);
                        }

                        // Second result set: Opening Balance
                        if (await reader.NextResultAsync() && await reader.ReadAsync())
                        {
                            if (reader["OpeningBalance"] != DBNull.Value)
                                response.OpeningBalance = Convert.ToDecimal(reader["OpeningBalance"]);
                        }
                    }
                }
            }

            return response;
        }

        public async Task<List<SupplierDropdownDto>> GetSuppliersAsync(int branchId)
        {
            var list = new List<SupplierDropdownDto>();

            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
            {
                string query = @"
                    SELECT DISTINCT 
                        pf.SuppID AS Id,
                        coa.AcctName AS Name
                    FROM PurcFile pf
                    INNER JOIN tblCOA coa ON coa.acctID = pf.SuppID
                    WHERE pf.BranchID = @BranchID
                        AND pf.IsDeleted = 0
                        AND pf.CancStat = 0
                    UNION
                    SELECT DISTINCT 
                        pr.SuppID AS Id,
                        coa.AcctName AS Name
                    FROM PurchaseReturn pr
                    INNER JOIN tblCOA coa ON coa.acctID = pr.SuppID
                    WHERE pr.BranchID = @BranchID
                    ORDER BY Name";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.Add("@BranchID", SqlDbType.Int).Value = branchId;

                    await conn.OpenAsync();

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            list.Add(new SupplierDropdownDto
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