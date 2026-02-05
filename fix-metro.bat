@echo off
echo ===================================================
echo      FIXING METRO BUNDLER & ANDROID BUILD
echo ===================================================

echo [1/3] Stopping existing Metro Bundler (Port 8081)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8081" ^| find "LISTENING"') do taskkill /f /pid %%a

echo [2/3] Cleaning Android Project...
cd android
call gradlew clean
cd ..

echo [3/3] Starting Metro Bundler with Reset Cache...
echo NOTE: Please leave this window open!
npx react-native start --reset-cache
pause
