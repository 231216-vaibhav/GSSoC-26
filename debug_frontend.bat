@echo off
color 0c
echo ===================================================
echo DIAGNOSTIC SCRIPT: Starting Frontend
echo ===================================================
set "PATH=d:\PROJECTS\Final-Skill-Bridge\Node js;%PATH%"
cd /d "d:\PROJECTS\Final-Skill-Bridge\front"

echo Running npm run dev...
call npm run dev

echo.
echo ===================================================
echo If you see an error above, please copy it or take a screenshot!
echo ===================================================
pause
