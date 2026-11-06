#requires -Version 5.1
<#
 Copia de seguridad local cifrada de Pesse.
 Requiere: Supabase CLI + Docker, Node.js, tar y age.
 Configurar PESSE_DB_URL, PESSE_SUPABASE_URL, PESSE_SERVICE_ROLE_KEY y PESSE_AGE_RECIPIENT
 directamente en la sesión de terminal. Nunca guardar esas claves en GitHub.
#>
param(
 [string]$OutputDirectory = (Join-Path $PSScriptRoot "..\backups")
)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Require-Command([string]$Name) {
 if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
  throw "No está instalado '$Name'. Consultá docs/RESPALDOS-PESSE.md."
 }
}
function Assert-Exit([string]$Description) {
 if ($LASTEXITCODE -ne 0) { throw "$Description falló. No se generó un respaldo válido." }
}
foreach ($name in @("supabase","docker","node","tar","age")) { Require-Command $name }
foreach ($variable in @("PESSE_DB_URL","PESSE_SUPABASE_URL","PESSE_SERVICE_ROLE_KEY","PESSE_AGE_RECIPIENT")) {
 if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($variable))) {
  throw "Falta la variable de entorno $variable. No pegues contraseñas en chats ni en archivos del repositorio."
 }
}
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyyMMdd-HHmmss")
$work = Join-Path ([System.IO.Path]::GetTempPath()) ("pesse-backup-"+[guid]::NewGuid().ToString("N"))
$destination = [System.IO.Path]::GetFullPath((Join-Path $OutputDirectory ("pesse-"+$timestamp+".tar.gz.age")))
$temporaryArchive = Join-Path ([System.IO.Path]::GetTempPath()) ("pesse-"+[guid]::NewGuid().ToString("N")+".tar.gz")
$completed = $false
try {
 [void](New-Item -ItemType Directory -Path $work -Force)
 [void](New-Item -ItemType Directory -Path (Split-Path $destination -Parent) -Force)
 Write-Host "Generando respaldo de base de datos y Storage de Pesse (sin imprimir credenciales)..."
 & supabase db dump --db-url $env:PESSE_DB_URL -f (Join-Path $work "roles.sql") --role-only
 Assert-Exit "Respaldo de roles"
 & supabase db dump --db-url $env:PESSE_DB_URL -f (Join-Path $work "schema.sql")
 Assert-Exit "Respaldo de esquema"
 & supabase db dump --db-url $env:PESSE_DB_URL -f (Join-Path $work "data.sql") --use-copy --data-only -x "storage.buckets_vectors" -x "storage.vector_indexes"
 Assert-Exit "Respaldo de datos"
 & node (Join-Path $projectRoot "scripts\backup-storage.mjs") (Join-Path $work "storage") (Join-Path $work "storage-manifest.json")
 Assert-Exit "Respaldo de Storage"
 $files = @("roles.sql","schema.sql","data.sql","storage-manifest.json")
 foreach ($file in $files) {
  if (-not (Test-Path (Join-Path $work $file))) { throw "Falta ${file}: respaldo incompleto." }
 }
 $metadata = @{
  project = "Pesse"
  created_utc = (Get-Date).ToUniversalTime().ToString("o")
  pg_dump = "Supabase CLI, por separado roles / esquema / datos"
  encrypted_with = "age"
 }
 $metadata | ConvertTo-Json | Set-Content -Path (Join-Path $work "backup-info.json") -Encoding UTF8
 & tar -czf $temporaryArchive -C $work .
 Assert-Exit "Empaquetado"
 if ((Get-Item $temporaryArchive).Length -eq 0) { throw "Archivo comprimido vacío." }
 & age -r $env:PESSE_AGE_RECIPIENT -o $destination $temporaryArchive
 Assert-Exit "Cifrado"
 if (-not (Test-Path $destination) -or (Get-Item $destination).Length -eq 0) {
  throw "El archivo cifrado no se creó correctamente."
 }
 $hash = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash.ToLowerInvariant()
 ("$hash  "+[System.IO.Path]::GetFileName($destination)) | Set-Content -Path ($destination+".sha256") -Encoding ascii
 $completed = $true
 Write-Host "Copia cifrada creada: $destination"
 Write-Host "SHA-256: $hash"
 Write-Host "Verificá que puedas descifrar el archivo en una ubicación aislada. No lo restaures sobre producción."
} finally {
 if (Test-Path $work) { Remove-Item -LiteralPath $work -Recurse -Force -ErrorAction SilentlyContinue }
 if (Test-Path $temporaryArchive) { Remove-Item -LiteralPath $temporaryArchive -Force -ErrorAction SilentlyContinue }
 if (-not $completed -and (Test-Path $destination)) {
  Remove-Item -LiteralPath $destination -Force -ErrorAction SilentlyContinue
  Write-Warning "Respaldo incompleto: se eliminó el archivo cifrado parcial."
 }
}
