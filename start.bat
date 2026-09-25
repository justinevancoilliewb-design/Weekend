@echo off
REM Start De Afrekening en herstart automatisch als het proces onverwacht stopt.
REM Sluit dit venster NIET tijdens het event - dat stopt de server ook.
REM Om echt te stoppen: sluit dit venster of druk op Ctrl+C en bevestig met J/N.

cd /d "%~dp0"

:start
echo [%date% %time%] De Afrekening wordt gestart...
node server.js
echo [%date% %time%] Server is gestopt (afsluitcode %errorlevel%). Herstart in 2 seconden...
"%SystemRoot%\System32\timeout.exe" /t 2 /nobreak >nul
goto start
