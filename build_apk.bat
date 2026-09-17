@echo off
set "JAVA_HOME=C:\Users\maycon.nascimento\AppData\Local\Java\jdk-21\jdk-21.0.6+7"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "ANDROID_HOME=C:\Users\maycon.nascimento\AppData\Local\Android\Sdk"

echo [1/3] Compiling Android APK with Gradle...
cd /d "%~dp0android"
call gradlew.bat assembleDebug

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gradle assembleDebug failed!
    exit /b %ERRORLEVEL%
)

echo [2/3] Copying APK to distribution locations...
cd /d "%~dp0"
copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "mdsync-geotecnia.apk"
copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "public\mdsync-geotecnia.apk"
copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "dist\mdsync-geotecnia.apk"

echo [3/3] Done! APK successfully built and updated.
dir "mdsync-geotecnia.apk"
