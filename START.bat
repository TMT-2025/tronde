@echo off
chcp 65001 >nul
title EXAM MIXER - Máy chủ xáo đề thi trắc nghiệm

echo.
echo ======================================================
echo    EXAM MIXER v1.0.0 - HỆ THỐNG XÁO ĐỀ CHUẨN THPT
echo ======================================================
echo.

:: 1. Kiem tra Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [LỖI KHỞI ĐỘNG] Không tìm thấy Node.js trên máy tính của bạn!
    echo.
    echo Ứng dụng EXAM MIXER yêu cầu môi trường Node.js (phiên bản 18 trở lên).
    echo Vui lòng tải và cài đặt Node.js từ trang chủ chính thức:
    echo   https://nodejs.org/
    echo.
    echo Sau khi cài đặt xong Node.js, vui lòng chạy lại tệp START.bat này.
    echo ======================================================
    echo.
    pause
    exit /b 1
)

:: 2. Hien thi phien ban Node.js
echo [1/3] Đã phát hiện Node.js:
node -v
echo.

:: 3. Kiem tra thu muc dist
if not exist "dist\server\cli.js" (
    echo [LỖI] Chưa tìm thấy thư mục biên dịch dist\server\cli.js!
    echo Đang kiểm tra công cụ biên dịch npm...
    where npm >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo Đang tiến hành biên dịch ứng dụng...
        call npm run build
    ) else (
        echo Không tìm thấy lệnh npm để biên dịch.
        pause
        exit /b 1
    )
)

:: 4. Khoi chay may chu Production
echo [2/3] Đang khởi chạy máy chủ EXAM MIXER Production...
echo.
echo [3/3] Trạng thái: ĐANG CHẠY
echo.
echo ======================================================
echo 🚀 HỆ THỐNG ĐÃ SẴN SÀNG!
echo 📍 Vui lòng mở trình duyệt và truy cập:
echo.
echo       http://localhost:3000
echo.
echo [LƯU Ý QUAN TRỌNG]
echo - Giữ nguyên cửa sổ này trong suốt thời gian giáo viên làm việc.
echo - Để dừng máy chủ, nhấn tổ hợp phím Ctrl + C hoặc đóng cửa sổ này.
echo ======================================================
echo.

node dist\server\cli.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [CẢNH BÁO] Máy chủ đã dừng lại với mã lỗi %ERRORLEVEL%.
    pause
)
