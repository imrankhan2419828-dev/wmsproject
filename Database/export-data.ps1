# Simple Database Export Script
$server = "DESKTOP-S81D9B0\SQLEXPRESS2017"
$db = "Wms_new"
$outputDir = "E:\dotnet\WMS\Database\Data"

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

Write-Host "Server: $server" -ForegroundColor Green
Write-Host "Database: $db" -ForegroundColor Green
Write-Host "Output: $outputDir" -ForegroundColor Green
Write-Host "========================================"

# Get tables using SQL connection
$connString = "Server=$server;Database=$db;Trusted_Connection=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connString)

try {
    $conn.Open()
    Write-Host "Connected to SQL Server!" -ForegroundColor Green
    
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE' ORDER BY TABLE_SCHEMA, TABLE_NAME"
    $reader = $cmd.ExecuteReader()
    
    $tables = @()
    while ($reader.Read()) {
        $tables += [PSCustomObject]@{
            SchemaName = $reader["TABLE_SCHEMA"]
            TableName = $reader["TABLE_NAME"]
        }
    }
    $reader.Close()
    $conn.Close()
    
    Write-Host "Found $($tables.Count) tables" -ForegroundColor Green
    Write-Host "========================================"
    
    $bcpPath = "C:\Program Files\Microsoft SQL Server\Client SDK\ODBC\170\Tools\Binn\bcp.exe"
    $current = 0
    
    foreach ($table in $tables) {
        $current++
        $fullName = "[$($table.SchemaName)].[$($table.TableName)]"
        $outputFile = "$outputDir\$($table.TableName).txt"
        
        Write-Host "[$current/$($tables.Count)] $fullName ... " -NoNewline
        
        & $bcpPath "$db.$fullName" out "$outputFile" -S $server -T -c -t"|" 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            $size = (Get-Item $outputFile).Length
            Write-Host "OK ($size bytes)" -ForegroundColor Green
        } else {
            Write-Host "Empty (no data)" -ForegroundColor Yellow
        }
    }
    
    Write-Host "========================================"
    Write-Host "EXPORT COMPLETE!" -ForegroundColor Green
    Write-Host "Files saved in: $outputDir" -ForegroundColor Green
    
} catch {
    Write-Host "Connection Error: $_" -ForegroundColor Red
    Write-Host "Try this server name instead:" -ForegroundColor Yellow
    Write-Host "  DESKTOP-S81D9B0\SQLEXPRESS2017" -ForegroundColor Yellow
    Write-Host "  .\SQLEXPRESS2017" -ForegroundColor Yellow
    Write-Host "  (local)\SQLEXPRESS2017" -ForegroundColor Yellow
}