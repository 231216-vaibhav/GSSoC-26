@echo off
set GIT="C:\Git\cmd\git.exe"
set REPO_URL=https://github.com/hemantxsharma22/11pm-round.git
set WORK_DIR=C:\Users\heman\OneDrive\Desktop\final try

cd /d "%WORK_DIR%"

echo === Setting up Git ===
%GIT% config --global user.email "hemantxsharma22@github.com"
%GIT% config --global user.name "Hemant Sharma"
%GIT% config --global init.defaultBranch main

echo === Initializing repo ===
%GIT% init

echo === Adding remote ===
%GIT% remote remove origin 2>nul
%GIT% remote add origin %REPO_URL%

echo === Staging all files ===
%GIT% add .

echo === Committing ===
%GIT% commit -m "feat: SkillBridge full project — frontend + NLP backend + Google Auth"

echo === Pushing to GitHub ===
%GIT% branch -M main
%GIT% push -u origin main --force

echo === Done ===
