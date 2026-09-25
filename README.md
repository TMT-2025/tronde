# EXAM MIXER — HỆ THỐNG XÁO ĐỀ THI TRẮC NGHIỆM CHUẨN THPT

**Phiên bản:** 1.0.0 (Production Release)  
**Tác giả:** Antigravity Engineering

---

## 1. Giới thiệu tổng quan
**EXAM MIXER** là giải pháp phần mềm chuyên dụng hỗ trợ giáo viên THPT và các trường phổ thông xáo trộn, hoán vị và xuất bản tự động các mã đề thi từ một đề gốc Microsoft Word (`.docx`).

Hệ thống tuân thủ nghiêm ngặt định dạng cấu trúc đề thi trắc nghiệm theo chương trình Giáo dục Phổ thông mới:
- **Phần I:** Trắc nghiệm nhiều phương án lựa chọn (A, B, C, D) — xáo cả câu hỏi và thứ tự các phương án.
- **Phần II:** Trắc nghiệm Đúng / Sai (các ý a, b, c, d) — xáo vị trí câu hỏi, cố định hoặc xáo thứ tự các ý con, tính toán chính xác ma trận điểm.
- **Phần III:** Câu hỏi trả lời ngắn — xáo vị trí câu hỏi, bảo toàn giá trị đáp số.
- **Định dạng:** Bảo toàn 100% công thức hóa học (chỉ số dưới $H_2O$, $CH_3COOH$, v.v.), bảng biểu, hình vẽ và triệt tiêu hoàn toàn dấu hiệu rò rỉ đáp án (gạch chân, in nghiêng, đổi màu) trong đề của học sinh.

---

## 2. Yêu cầu hệ thống
- **Hệ điều hành:** Windows 10/11 (khuyến nghị), Windows Server, macOS hoặc Linux.
- **Môi trường thực thi:** [Node.js](https://nodejs.org/) phiên bản LTS **18.x** trở lên (khuyên dùng Node.js 20+ hoặc 22+).
- **Trình duyệt Web:** Google Chrome, Microsoft Edge, Mozilla Firefox hoặc Safari phiên bản mới.
- **Phần mềm văn phòng:** Microsoft Word 2013 trở lên, WPS Office hoặc LibreOffice để mở và in tệp `.docx` xuất bản.

---

## 3. Hướng dẫn cài đặt
Đối với gói phát hành Production Package:

1. Giải nén thư mục gói ứng dụng (ví dụ: `EXAM-MIXER`).
2. Mở cửa sổ dòng lệnh (Terminal / Command Prompt / PowerShell) tại thư mục ứng dụng và cài đặt các thư viện phụ thuộc:
   ```bash
   npm install --omit=dev
   ```
   *(Nếu gói đã được tích hợp sẵn thư mục `node_modules`, bạn có thể bỏ qua bước này).*

---

## 4. Khởi động ứng dụng

### Cách 1: Sử dụng tệp khởi chạy nhanh (Windows)
- Nhấp đúp chuột vào tệp [`START.bat`](file:///e:/.%20UNG%20DUNG%20MOI/TRON%20DE/START.bat).
- Cửa sổ dòng lệnh sẽ tự động kiểm tra Node.js và khởi chạy máy chủ.

### Cách 2: Sử dụng dòng lệnh
```bash
npm start
```
hoặc
```bash
node dist/server/cli.js
```

---

## 5. Địa chỉ truy cập ứng dụng
Sau khi khởi động thành công, mở trình duyệt web và truy cập vào đường dẫn:
```text
http://localhost:3000
```

---

## 6. Cấu trúc thư mục phát hành (Production Package)

```text
EXAM-MIXER/
│
├── dist/                      # Mã nguồn ứng dụng đã biên dịch JavaScript
│   ├── application/           # Lớp điều phối ứng dụng (Job, File, Generation)
│   ├── core/                  # Core Engine bất biến (Parser, Mixer, Renderer, Pipeline)
│   ├── server/                # Máy chủ HTTP REST API
│   └── ui/                    # Giao diện người dùng web đơn trang
│
├── output/                    # Thư mục lưu trữ kết quả tạm thời
│   └── sandbox/               # Vùng đệm cách ly sinh tệp DOCX và ZIP
│
├── templates/                 # Thư mục chứa mẫu Word chuẩn in ấn
│   └── DeSauTron.docx         # Mẫu định dạng chuẩn Bộ GD&ĐT
│
├── DeSauTron.docx             # Mẫu dự phòng trực tiếp tại gốc
├── START.bat                  # Kịch bản khởi động 1-click trên Windows
├── package.json               # Cấu hình dự án và dependencies
├── package-lock.json          # Khóa phiên bản dependencies
├── .env.example               # Tệp mẫu cấu hình môi trường (Port, Host)
├── VERSION                    # Tệp định danh phiên bản phát hành (1.0.0)
├── README.md                  # Hướng dẫn kỹ thuật và quản trị hệ thống
└── USER_GUIDE.md              # Sổ tay hướng dẫn chi tiết dành cho giáo viên
```

---

## 7. Cập nhật phiên bản
Khi có phiên bản mới từ đội ngũ phát triển:
1. Sao lưu thư mục `templates/` (nếu nhà trường có chỉnh sửa biểu mẫu riêng).
2. Xóa các tệp trong thư mục `dist/`.
3. Giải nén nội dung mã nguồn mới vào thư mục `dist/`.
4. Cập nhật dependencies nếu có thay đổi: `npm install --omit=dev`.
5. Khởi động lại ứng dụng qua `START.bat`.

---

## 8. Xử lý lỗi cơ bản (Troubleshooting)

| Tình huống lỗi | Nguyên nhân | Biện pháp xử lý |
| :--- | :--- | :--- |
| **Cửa sổ tắt ngay hoặc báo "Không tìm thấy Node.js"** | Máy tính chưa cài đặt Node.js hoặc chưa thiết lập biến môi trường `PATH`. | Tải bộ cài đặt Node.js LTS từ [nodejs.org](https://nodejs.org), tiến hành cài đặt và khởi động lại máy tính. |
| **Lỗi `EADDRINUSE: address already in use :::3000`** | Cổng 3000 đang bị chiếm dụng bởi một phần mềm khác. | Đổi cổng bằng cách tạo tệp `.env` với nội dung `PORT=3001`, sau đó truy cập qua `http://localhost:3001`. |
| **Trang web không tải được** | Máy chủ chưa được khởi chạy hoặc cửa sổ `START.bat` đã bị đóng. | Chạy lại `START.bat` và giữ nguyên cửa sổ terminal trong suốt quá trình làm việc. |
| **Tệp tải lên báo lỗi "Định dạng không hợp lệ"** | Tệp tải lên không phải là định dạng Word `.docx` chuẩn hoặc bị lỗi cấu trúc nén. | Mở đề thi bằng Microsoft Word, chọn **Save As** $\rightarrow$ chọn định dạng **Word Document (*.docx)** rồi tải lại. |
