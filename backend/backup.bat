@echo off
setlocal

:: === CONFIGURAÇÃO ===
set SOURCE_DIR=%cd%
set BACKUP_DIR=%cd%\backups
set DATESTAMP=%DATE:~6,4%-%DATE:~3,2%-%DATE:~0,2%

:: === CRIA PASTA DE BACKUP ===
if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
)

:: === NOME DO ARQUIVO ZIP ===
set ZIP_NAME=backup-%DATESTAMP%.zip

echo Criando ponto de recuperação: %ZIP_NAME%

:: === CRIA O ZIP COM TODOS OS ARQUIVOS IMPORTANTES ===
powershell -command "Compress-Archive -Path '%SOURCE_DIR%\server.js','%SOURCE_DIR%\.env','%SOURCE_DIR%\package.json','%SOURCE_DIR%\package-lock.json' -DestinationPath '%BACKUP_DIR%\%ZIP_NAME%'"

echo Backup criado em: %BACKUP_DIR%\%ZIP_NAME%
echo Ponto de recuperação concluído.

pause
