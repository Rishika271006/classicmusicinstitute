@echo off
title Push Classic Music Institute to GitHub
cd /d "%~dp0"
echo ======================================================================
echo   Classic Music Institute - Push to GitHub
echo   Target: https://github.com/Rishika271006/classicmusicinstitute.git
echo ======================================================================
echo.
echo Attempting to push to GitHub...
git push -u origin main
if %ERRORLEVEL% EQU 0 goto success

echo.
echo ----------------------------------------------------------------------
echo GitHub requires authentication to write to the repository.
echo GitHub no longer accepts account passwords; it requires a Personal Access Token.
echo.
echo Quick Steps to Create a Token:
echo 1. Open in browser: https://github.com/settings/tokens/new
echo 2. Note: "Classic Music Institute Push"
echo 3. Check the "repo" checkbox (full repository access)
echo 4. Click "Generate token" at bottom and copy it (starts with ghp_...)
echo ----------------------------------------------------------------------
echo.
set /p GITHUB_TOKEN="Enter / Paste your GitHub Personal Access Token: "
if "%GITHUB_TOKEN%"=="" goto end

echo.
echo Authenticating and pushing to GitHub...
git push https://%GITHUB_TOKEN%@github.com/Rishika271006/classicmusicinstitute.git main
if %ERRORLEVEL% EQU 0 goto success
goto error

:success
echo.
echo ======================================================================
echo [SUCCESS] Your repository has been pushed to GitHub successfully!
echo Repository URL: https://github.com/Rishika271006/classicmusicinstitute
echo ======================================================================
goto end

:error
echo.
echo [ERROR] Push failed. Please check your token and repo permissions.

:end
echo.
pause
