# HƯỚNG DẪN SỬ DỤNG PHẦN MỀM EXAM MIXER
### Dành cho Giáo viên & Cán bộ Khảo thí

---

## LỜI NÓI ĐẦU
**EXAM MIXER** là công cụ hỗ trợ giáo viên tạo nhanh các mã đề thi trắc nghiệm từ một đề gốc Microsoft Word (`.docx`). Toàn bộ quy trình từ khâu xáo trộn câu hỏi, xáo phương án đến khi kết xuất tệp Word được thực hiện hoàn toàn tự động, đảm bảo:
- Chuẩn hóa theo thể thức đề thi trắc nghiệm của Bộ Giáo dục & Đào tạo.
- Giữ nguyên công thức toán, ký hiệu hóa học ($H_2O$, $CH_3COOH$, v.v.), hình ảnh và bảng biểu.
- Không để sót dấu hiệu đáp án (gạch chân/in nghiêng) trong đề của học sinh.
- Cung cấp ma trận đáp án đầy đủ phục vụ chấm thi.

---

## QUY TRÌNH 7 BƯỚC THỰC HIỆN TRÊN PHẦN MỀM

```text
[1. Khởi động] ➔ [2. Mở Web] ➔ [3. Tải đề gốc] ➔ [4. Cấu hình đề] ➔ [5. Trộn đề] ➔ [6. Tải tệp] ➔ [7. In ấn]
```

---

### BƯỚC 1: KHỞI ĐỘNG PHẦN MỀM
1. Mở thư mục ứng dụng **EXAM MIXER** trên máy vi tính.
2. Nhấp đúp chuột vào tệp [`START.bat`](file:///e:/.%20UNG%20DUNG%20MOI/TRON%20DE/START.bat).
3. Màn hình màu đen (cửa sổ dòng lệnh) sẽ hiển thị thông báo máy chủ đã sẵn sàng:
   ```text
   🚀 HỆ THỐNG ĐÃ SẴN SÀNG!
   📍 Vui lòng mở trình duyệt và truy cập: http://localhost:3000
   ```
> [!NOTE]
> Thầy/cô **không tắt** cửa sổ màu đen này trong suốt thời gian trộn đề. Có thể thu nhỏ cửa sổ xuống thanh Taskbar.

---

### BƯỚC 2: TRUY CẬP GIAO DIỆN
1. Mở trình duyệt web (Google Chrome, Cốc Cốc, Microsoft Edge).
2. Nhập địa chỉ: **`http://localhost:3000`** và nhấn **Enter**.
3. Giao diện trực quan của phần mềm sẽ xuất hiện ngay lập tức.

---

### BƯỚC 3: TẢI ĐỀ GỐC LÊN HỆ THỐNG
1. Tại khu vực **"1. Chọn đề thi gốc (.docx)"**, nhấn nút **Chọn tệp** (hoặc kéo thả tệp Word của thầy/cô vào ô).
2. **Quy ước định dạng đề gốc:**
   - **Phần I (Trắc nghiệm 4 lựa chọn):** Gạch chân đáp án đúng của từng câu (ví dụ: phương án đúng là C thì gạch chân `C. CH3COOC2H5` hoặc chữ `C.`).
   - **Phần II (Trắc nghiệm Đúng/Sai):** Gạch chân ý nào có kết quả là Đúng.
   - **Phần III (Trả lời ngắn):** Điền đáp số trực tiếp phía dưới câu hỏi (ví dụ: `A. 5.28`).
3. Sau khi chọn tệp, hệ thống sẽ tự động quét và phân tích cấu trúc đề thi.
4. Bảng thông tin sẽ hiển thị tổng số câu phát hiện được (Ví dụ: Phần I: 18 câu, Phần II: 4 câu, Phần III: 6 câu — Tổng cộng 28 câu).

---

### BƯỚC 4: CHỌN MẪU ĐỊNH DẠNG (TÙY CHỌN)
- Tại mục **"2. Tệp mẫu định dạng (Template DOCX)"**:
  - **Mặc định:** Hệ thống đã tích hợp sẵn mẫu chuẩn thể thức thi tốt nghiệp THPT Quốc gia (khổ giấy A4, font Times New Roman cỡ 12, bảng thông tin học sinh, số báo danh, mã đề thi, chân trang đánh số trang tự động dạng `Trang X/Y`).
  - Nếu trường học có khung tiêu đề hoặc quy chuẩn riêng, thầy/cô có thể nhấn tải lên tệp mẫu Word tương ứng.

---

### BƯỚC 5: THIẾT LẬP THÔNG SỐ TRỘN ĐỀ
Thầy/cô điều chỉnh các thông số trong ô cấu hình:
- **Số lượng mã đề cần tạo:** Nhập số lượng đề muốn sinh ra (Ví dụ: `4` mã đề).
- **Mã đề bắt đầu:** Nhập mã đề xuất phát (Ví dụ: `101` $\rightarrow$ hệ thống sẽ tạo các mã `101`, `102`, `103`, `104`).
- **Mã hạt giống (Seed):** Nhập số nguyên tùy ý (Ví dụ: `20260925`) hoặc để trống để hệ thống tự lấy ngẫu nhiên.
  *(Lưu ý: Nếu cùng đề gốc và cùng mã Seed, hệ thống sẽ luôn sinh ra các đề thi giống nhau 100%).*
- **Tùy chọn xáo trộn:**
  - ☑ **Xáo thứ tự câu hỏi trong từng phần:** Các câu hỏi trong Phần I, II, III được đổi vị trí cho nhau một cách khoa học.
  - ☑ **Xáo thứ tự các phương án A, B, C, D:** Hoán vị vị trí các đáp án lựa chọn trong Phần I.
  - ☐ **Xáo thứ tự các ý con (a, b, c, d) trong câu Đúng/Sai:** Tùy chọn (thường bỏ chọn để giữ nguyên mạch nội dung bài đọc).

---

### BƯỚC 6: BẮT ĐẦU TRỘN ĐỀ & THEO DÕI
1. Nhấn nút xanh **"BẮT ĐẦU TRỘN ĐỀ"**.
2. Thanh tiến trình thông minh sẽ cập nhật liên tục qua 7 giai đoạn:
   - `Đang kiểm tra tính hợp lệ của đề thi...`
   - `Đang xáo trộn câu hỏi và phương án...`
   - `Đang kết xuất tệp Word cho học sinh...`
   - `Đang kiểm tra tính toàn vẹn và chống lộ đáp án...`
   - `Đang đóng gói tệp ZIP hoàn tất!`
3. Quá trình xử lý đối với 4 đề thi chỉ mất khoảng **0.3 giây**.

---

### BƯỚC 7: TẢI VỀ & KIỂM TRA ĐỀ THI
Khi màn hình hiển thị **"TRỘN ĐỀ THÀNH CÔNG!"**:
1. Nhấn **"TẢI GÓI KẾT QUẢ (.ZIP)"**:
   - Tệp tải về chứa đầy đủ các file Word học sinh (`MA_DE_101.docx`, `MA_DE_102.docx`, ...) cùng bảng ma trận đáp án định dạng chuẩn.
2. Thầy/cô cũng có thể nhấn **"TẢI BẢNG ĐÁP ÁN (JSON)"** nếu cần tích hợp vào các phần mềm chấm trắc nghiệm điện tử.
3. **Mở tệp Word để in:**
   - Mở các tệp đề thi bằng Microsoft Word.
   - Kiểm tra mã đề tại bảng thông tin góc trên bên phải.
   - Kiểm tra chân trang: Mã đề và số trang tự động cập nhật khớp từng trang.
   - Đáp án học sinh hoàn toàn sạch sẽ, không có bất kỳ dấu vết gạch chân hay đổi màu.

---

## BẢNG GIẢI ĐÁP THẮC MẮC THƯỜNG GẶP (FAQ)

**Hỏi: Đề thi của tôi có nhiều công thức hóa học có số nhỏ ở chân như $C_2H_5OH$, $CH_3COOH$ thì có bị mất định dạng không?**  
*Trả lời:* Hoàn toàn không. EXAM MIXER bóc tách trực tiếp cây thẻ XML nhị phân của Microsoft Word nên toàn bộ chỉ số trên/dưới, ký hiệu toán học đều được bảo toàn trọn vẹn.

**Hỏi: Tôi muốn in đề thi 2 cột hoặc khổ giấy khác có được không?**  
*Trả lời:* Được. Thầy/cô chỉ cần tải tệp mẫu định dạng theo mẫu của trường vào ô "Tệp mẫu định dạng (Template DOCX)", hệ thống sẽ tự động áp dụng khung định dạng đó cho tất cả các đề con.

**Hỏi: Tôi có cần kết nối mạng Internet khi sử dụng phần mềm không?**  
*Trả lời:* Không. EXAM MIXER chạy hoàn toàn cục bộ (offline) trên máy tính của thầy/cô, không gửi dữ liệu ra bên ngoài, đảm bảo bí mật tuyệt đối nội dung đề thi của nhà trường.
