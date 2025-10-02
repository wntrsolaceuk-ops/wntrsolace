@echo off
echo Creating backup of WinterSolace project...

REM Create backup directory with timestamp
set timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%
set backup_dir=WinterSolace_Backup_%timestamp%

REM Create backup directory
mkdir "%backup_dir%"

REM Copy all files and folders except .git
echo Copying files...
xcopy /E /I /H /Y /EXCLUDE:backup-exclude.txt . "%backup_dir%"

REM Create a zip file
echo Creating zip file...
powershell -command "Compress-Archive -Path '%backup_dir%' -DestinationPath '%backup_dir%.zip' -Force"

REM Remove the folder after zipping
rmdir /S /Q "%backup_dir%"

echo Backup completed: %backup_dir%.zip
echo Location: %cd%\%backup_dir%.zip
pause
