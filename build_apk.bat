@echo off
set "JAVA_HOME=C:\Users\maycon.nascimento\AppData\Local\Java\jdk-21\jdk-21.0.6+7"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "ANDROID_HOME=C:\Users\maycon.nascimento\AppData\Local\Android\Sdk"

echo [1/4] Building web production assets with Vite...
cd /d "%~dp0"
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Web build failed!
    exit /b %ERRORLEVEL%
)

echo [2/4] Syncing web assets to Capacitor Android project...
call npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Capacitor sync failed!
    exit /b %ERRORLEVEL%
)

echo [3/4] Compiling Android APK with Gradle...
cd /d "%~dp0android"
call gradlew.bat assembleRelease assembleDebug

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gradle build failed!
    exit /b %ERRORLEVEL%
)

echo [4/4] Copying APK to output locations...
cd /d "%~dp0"
copy /Y "android\app\build\outputs\apk\release\app-release.apk" "mdsync-geotecnia.apk"
copy /Y "android\app\build\outputs\apk\release\app-release.apk" "app-release.apk"
copy /Y "android\app\build\outputs\apk\release\app-release.apk" "C:\Users\maycon.nascimento\Downloads\app-release.apk"

echo Done! APK successfully built and updated.
dir "mdsync-geotecnia.apk"
dir "C:\Users\maycon.nascimento\Downloads\app-release.apk"
