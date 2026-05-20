# Convert exported data files to INSERT statements
$dataDir = "E:\dotnet\WMS\Database\Data"
$outputFile = "E:\dotnet\WMS\Database\data.sql"

Write-Host "Converting data files to SQL..." -ForegroundColor Green

# Header
@"
-- ============================================
-- WMS Database Data - INSERT Statements
-- Generated: $(Get-Date -Format 'dd MMM yyyy HH:mm:ss')
-- ============================================

"@ | Set-Content $outputFile

$files = Get-ChildItem $dataDir -Filter "*.txt" | Sort-Object Name
$total = $files.Count
$current = 0

foreach ($file in $files) {
    $current++
    $tableName = $file.BaseName
    $filePath = $file.FullName
    
    Write-Host "[$current/$total] Processing: $tableName ... " -NoNewline
    
    # Skip empty files
    if ($file.Length -eq 0) {
        "-- Table: $tableName (No data)" | Add-Content $outputFile
        Write-Host "Empty" -ForegroundColor Yellow
        continue
    }
    
    # Read first line for column count
    $firstLine = Get-Content $filePath -First 1
    $colCount = ($firstLine -split '\|').Count
    
    if ($colCount -le 1) {
        "-- Table: $tableName (Skipped - single column)" | Add-Content $outputFile
        Write-Host "Skipped" -ForegroundColor Yellow
        continue
    }
    
    # Generate INSERT statements
    $lines = Get-Content $filePath
    $rowCount = $lines.Count
    
    "-- Table: $tableName ($rowCount rows)" | Add-Content $outputFile
    
    foreach ($line in $lines) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        
        $values = $line -split '\|'
        $escapedValues = @()
        
        foreach ($val in $values) {
            $trimmed = $val.Trim()
            if ($trimmed -eq '' -or $trimmed -eq 'NULL') {
                $escapedValues += 'NULL'
            } else {
                # Escape single quotes
                $escaped = $trimmed -replace "'", "''"
                $escapedValues += "'$escaped'"
            }
        }
        
        $valueStr = $escapedValues -join ', '
        "INSERT INTO [$tableName] VALUES ($valueStr);" | Add-Content $outputFile
    }
    
    "GO" | Add-Content $outputFile
    "" | Add-Content $outputFile
    
    Write-Host "OK ($rowCount rows)" -ForegroundColor Green
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "Conversion Complete!" -ForegroundColor Green
Write-Host "Output: $outputFile" -ForegroundColor Green
Write-Host "Total tables: $total" -ForegroundColor Green