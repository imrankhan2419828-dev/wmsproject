using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using WMS.Api.DTOs.Permissions;
using WMS.Api.Services.Interfaces;
using Microsoft.Data.SqlClient;
using Dapper;
using System.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace WMS.Api.Services.Implementations
{
    public class RolePermissionService : IRolePermissionService
    {
        private readonly string _connectionString;
        private readonly ILogger<RolePermissionService> _logger;

        public RolePermissionService(IConfiguration configuration, ILogger<RolePermissionService> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _logger = logger;
        }

        private IDbConnection CreateConnection()
        {
            return new SqlConnection(_connectionString);
        }

        public async Task<IEnumerable<RolePermissionDto>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("GetAllAsync called");

                using (var connection = CreateConnection())
                {
                    var sql = @"
                        SELECT 
                            rp.RolePermissionID, 
                            rp.RoleID, 
                            rp.MenuID, 
                            rp.BranchID, 
                            rp.CanView, 
                            rp.CanAdd, 
                            rp.CanEdit, 
                            rp.CanDelete,
                            ISNULL(rm.RoleName, '') as RoleName,
                            ISNULL(fd.FormName, '') as FormName,
                            ISNULL(fd.FormTitle, '') as FormTitle
                        FROM RolePermission rp
                        INNER JOIN RoleMaster rm ON rp.RoleID = rm.RoleID
                        INNER JOIN FormDetail fd ON rp.MenuID = fd.FormID";

                    var permissions = await connection.QueryAsync<RolePermissionDto>(sql);

                    _logger.LogInformation($"GetAllAsync returned {permissions.Count()} records");
                    return permissions;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw new Exception($"Error loading permissions: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<RolePermissionDto>> GetByRoleAsync(int roleId, int branchId = 1)
        {
            try
            {
                _logger.LogInformation($"========== GET BY ROLE START ==========");
                _logger.LogInformation($"RoleID: {roleId}, BranchID: {branchId}");

                using (var connection = CreateConnection())
                {
                    // Check connection
                    _logger.LogInformation($"Database connection opened");

                    // Direct Dapper query - NO DbContext at all
                    var sql = @"
                        SELECT 
                            rp.RolePermissionID, 
                            rp.RoleID, 
                            rp.MenuID, 
                            rp.BranchID, 
                            rp.CanView, 
                            rp.CanAdd, 
                            rp.CanEdit, 
                            rp.CanDelete,
                            ISNULL(rm.RoleName, '') as RoleName,
                            ISNULL(fd.FormName, '') as FormName,
                            ISNULL(fd.FormTitle, '') as FormTitle
                        FROM RolePermission rp
                        INNER JOIN RoleMaster rm ON rp.RoleID = rm.RoleID
                        INNER JOIN FormDetail fd ON rp.MenuID = fd.FormID
                        WHERE rp.RoleID = @RoleID AND rp.BranchID = @BranchID";

                    var permissions = await connection.QueryAsync<RolePermissionDto>(sql,
                        new { RoleID = roleId, BranchID = branchId });

                    _logger.LogInformation($"Query returned {permissions.Count()} records");
                    _logger.LogInformation($"========== GET BY ROLE END ==========");

                    return permissions;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByRoleAsync");
                _logger.LogError($"Exception Type: {ex.GetType().Name}");
                _logger.LogError($"Message: {ex.Message}");
                _logger.LogError($"Inner Exception: {ex.InnerException?.Message}");
                _logger.LogError($"Stack Trace: {ex.StackTrace}");

                throw new Exception($"Error loading permissions for role {roleId}: {ex.Message}", ex);
            }
        }

        public async Task SavePermissionsAsync(RolePermissionBulkSaveDto dto)
        {
            _logger.LogInformation("========== SAVE PERMISSIONS START ==========");
            _logger.LogInformation($"RoleID: {dto?.RoleID}, BranchID: {dto?.BranchID}");

            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            using (var connection = CreateConnection())
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        // First, delete all existing permissions for this role and branch
                        var deleteSql = "DELETE FROM RolePermission WHERE RoleID = @RoleID AND BranchID = @BranchID";
                        var deleteCount = await connection.ExecuteAsync(deleteSql,
                            new { RoleID = dto.RoleID, BranchID = dto.BranchID },
                            transaction);

                        _logger.LogInformation($"Deleted {deleteCount} existing permissions");

                        // Then insert new permissions
                        int insertCount = 0;
                        foreach (var item in dto.Permissions)
                        {
                            // Only insert if at least one permission is true
                            if (item.CanView || item.CanAdd || item.CanEdit || item.CanDelete)
                            {
                                var insertSql = @"
                                    INSERT INTO RolePermission (RoleID, MenuID, BranchID, CanView, CanAdd, CanEdit, CanDelete)
                                    VALUES (@RoleID, @MenuID, @BranchID, @CanView, @CanAdd, @CanEdit, @CanDelete)";

                                await connection.ExecuteAsync(insertSql, new
                                {
                                    RoleID = dto.RoleID,
                                    MenuID = item.MenuID,
                                    BranchID = dto.BranchID,
                                    CanView = item.CanView,
                                    CanAdd = item.CanAdd,
                                    CanEdit = item.CanEdit,
                                    CanDelete = item.CanDelete
                                }, transaction);

                                insertCount++;
                            }
                        }

                        _logger.LogInformation($"Inserted {insertCount} new permissions");

                        transaction.Commit();
                        _logger.LogInformation("Transaction committed successfully");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error saving permissions");
                        transaction.Rollback();
                        throw new Exception($"Error saving permissions: {ex.Message}", ex);
                    }
                }
            }

            _logger.LogInformation("========== SAVE PERMISSIONS END ==========");
        }

        public async Task CreateOrUpdateAsync(RolePermissionCreateDto dto)
        {
            try
            {
                _logger.LogInformation($"CreateOrUpdateAsync called for RoleID: {dto.RoleID}, MenuID: {dto.MenuID}");

                using (var connection = CreateConnection())
                {
                    // Check if exists
                    var checkSql = "SELECT COUNT(*) FROM RolePermission WHERE RoleID = @RoleID AND MenuID = @MenuID AND BranchID = @BranchID";
                    var exists = await connection.ExecuteScalarAsync<int>(checkSql,
                        new { RoleID = dto.RoleID, MenuID = dto.MenuID, BranchID = dto.BranchID }) > 0;

                    if (exists)
                    {
                        // Update
                        var updateSql = @"
                            UPDATE RolePermission 
                            SET CanView = @CanView, CanAdd = @CanAdd, CanEdit = @CanEdit, CanDelete = @CanDelete
                            WHERE RoleID = @RoleID AND MenuID = @MenuID AND BranchID = @BranchID";

                        await connection.ExecuteAsync(updateSql, new
                        {
                            RoleID = dto.RoleID,
                            MenuID = dto.MenuID,
                            BranchID = dto.BranchID,
                            CanView = dto.CanView,
                            CanAdd = dto.CanAdd,
                            CanEdit = dto.CanEdit,
                            CanDelete = dto.CanDelete
                        });

                        _logger.LogInformation("Updated existing permission");
                    }
                    else
                    {
                        // Insert
                        var insertSql = @"
                            INSERT INTO RolePermission (RoleID, MenuID, BranchID, CanView, CanAdd, CanEdit, CanDelete)
                            VALUES (@RoleID, @MenuID, @BranchID, @CanView, @CanAdd, @CanEdit, @CanDelete)";

                        await connection.ExecuteAsync(insertSql, new
                        {
                            RoleID = dto.RoleID,
                            MenuID = dto.MenuID,
                            BranchID = dto.BranchID,
                            CanView = dto.CanView,
                            CanAdd = dto.CanAdd,
                            CanEdit = dto.CanEdit,
                            CanDelete = dto.CanDelete
                        });

                        _logger.LogInformation("Created new permission");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateOrUpdateAsync");
                throw new Exception($"Error saving permission: {ex.Message}", ex);
            }
        }
    }
}