# SỔ TAY HƯỚNG DẪN SỬ DỤNG PHẦN MỀM EXAM MIXER
### Dành cho Giáo viên & Cán bộ Khảo thí (Đầy đủ Tính Năng & Hướng Dẫn Cho Người Mới)

---

## 🌟 LỜI NÓI ĐẦU & CÁC TÍNH NĂNG VƯỢT TRỘI

**EXAM MIXER** là giải pháp phần mềm chuyên biệt hỗ trợ giáo viên THPT tạo nhanh nhiều mã đề kiểm tra từ một đề Microsoft Word gốc (`.docx`). Ứng dụng giải quyết triệt để các khó khăn cố hữu khi trộn đề thủ công:

| Tính Năng Vượt Trội | Lợi Ích Thực Tế Cho Giáo Viên |
| :--- | :--- |
| **🛡️ Khử rò rỉ đáp án tuyệt đối (Gate 3)** | Đề học sinh được tự động xóa 100% gạch chân, in nghiêng, bôi đậm hoặc đổi màu đáp án. Học sinh không thể "soi" đáp án qua định dạng. |
| **🧪 Bảo toàn 100% công thức Hóa học & Toán** | Giữ nguyên vẹn các chỉ số dưới ($H_2SO_4, CH_3COOH, C_nH_{2n}O_2$), chỉ số trên ($x^2, 10^{-3}$) và ký hiệu đặc biệt. |
| **📐 Dàn trang thông minh chuẩn A4 2 trang** | Tự động tính độ dài phương án để dàn 4 cột, 2 cột hoặc 1 cột, giúp đề thi vừa vặn 2 trang A4 gọn gàng, tiết kiệm tối đa giấy in. |
| **🎲 Hoán vị tất định với Mã Hạt Giống (Seed)** | Sử dụng thuật toán PRNG LCG Deterministic: cùng một mã Seed sẽ luôn cho ra kết quả xáo đề và đáp án giống nhau 100% ở bất kỳ đâu. |
| **📄 Tự động hóa Tiêu đề & Chân trang** | Tự động điền mã đề vào khung thông tin góc trên bên phải và chân trang. Chân trang hiển thị số trang động tự động dạng: *Mã đề 101 - Trang 1/2*. |
| **📦 Xuất trọn gói ZIP & Ma trận đáp án** | Tải xuống 1 tệp ZIP duy nhất chứa toàn bộ các file Word đề thi con, kèm bảng ma trận đáp án JSON và TXT để phục vụ chấm thi. |
| **⚡ Thử nghiệm 1-Click với Đề mẫu** | Người dùng mới không cần chuẩn bị file vẫn có thể bấm "Thử ngay với Đề mẫu" để trải nghiệm toàn bộ quy trình chỉ trong 10 giây. |

---

## 🚀 HƯỚNG DẪN 30 GIÂY DÀNH CHO NGƯỜI MỚI BẮT ĐẦU

Nếu đây là lần đầu tiên thầy/cô sử dụng phần mềm, hãy thực hiện theo 3 thao tác nhanh sau:

1. **Mở phần mềm:**
   - Trên máy tính cục bộ: Nhấp đúp chuột vào tệp [`START.bat`](file:///e:/.%20UNG%20DUNG%20MOI/TRON%20DE/START.bat) rồi truy cập `http://localhost:3000`.
   - Hoặc truy cập trực tiếp phiên bản trực tuyến: [https://tronde-alpha.vercel.app](https://tronde-alpha.vercel.app).
2. **Bấm nút màu xanh `⚡ Thử ngay với Đề mẫu`:**
   - Hệ thống sẽ tự động nạp đề thi Hóa học 28 câu chuẩn Bộ Giáo dục & Đào tạo.
   - Thầy/cô sẽ thấy ngay kết quả phân loại: Phần I (18 câu), Phần II (4 câu), Phần III (6 câu).
3. **Nhấn `BẮT ĐẦU TRỘN ĐỀ THI`:**
   - Chỉ sau 0.3 giây, màn hình hiển thị kết quả thành công.
   - Nhấn **"TẢI GÓI KẾT QUẢ (.ZIP)"** để nhận toàn bộ 4 mã đề Word và bảng đáp án.

---

## 📝 QUY TẮC SOẠN THẢO ĐỀ GỐC TRÊN MICROSOFT WORD

Thầy/cô chỉ cần soạn thảo đề thi bình thường trên Microsoft Word (`.docx`) theo quy ước trực quan đơn giản sau:

### 1. Phần I — Trắc nghiệm nhiều phương án lựa chọn (A, B, C, D)
- **Quy ước:** **Gạch chân (Underline - phím tắt Ctrl + U)** vào đáp án đúng.
- *Ví dụ trong Word:*
  ```text
  Câu 1. Hợp chất nào sau đây thuộc loại ester?
  A. CH3COOH
  B. CH3CHO
  C. CH3COOC2H5    <--- Gạch chân phương án này (Ctrl+U)
  D. CH3CH2OH
  ```

### 2. Phần II — Trắc nghiệm Đúng / Sai (các ý a, b, c, d)
- **Quy ước:** Ý nào có kết quả là **Đúng** thì **gạch chân (Ctrl + U)** ý đó. Ý nào **Sai** thì để nguyên bình thường.
- *Ví dụ trong Word:*
  ```text
  Câu 1. Cho các phát biểu sau về lipid:
  a) Chất béo nhẹ hơn nước và không tan trong nước.       <--- Ý này Đúng: gạch chân
  b) Mỡ lợn chứa chủ yếu các gốc acid béo chưa no.        <--- Ý này Sai: để nguyên
  c) Dầu cọ, dầu đậu nành có nguồn gốc từ thực vật.      <--- Ý này Đúng: gạch chân
  d) Phản ứng thủy phân chất béo là phản ứng thuận nghịch. <--- Ý này Sai: để nguyên
  ```

### 3. Phần III — Trắc nghiệm Trả lời ngắn
- **Quy ước:** Điền đáp án / đáp số trực tiếp ở dòng ngay bên dưới câu hỏi (đặt sau ký hiệu `A.` hoặc gạch chân).
- *Ví dụ trong Word:*
  ```text
  Câu 1. Đun nóng 6,0 gam Acetic acid với 6,9 gam Ethanol với hiệu suất 60%. Khối lượng Ethyl acetate thu được là bao nhiêu gam?
  A. 5.28
  ```

---

## ⚙️ HƯỚNG DẪN CÁC THIẾT LẬP TÙY CHỌN (BƯỚC 3)

| Mục Cấu Hình | Ý Nghĩa & Khuyến Nghị Sử Dụng |
| :--- | :--- |
| **Số lượng mã đề** | Nhập số mã đề con muốn tạo (ví dụ: `4`, `8`, `16`, `24`). Mặc định là 4. |
| **Mã đề bắt đầu** | Mã số của đề thi đầu tiên (ví dụ: `101` $\rightarrow$ hệ thống tạo: 101, 102, 103, 104; hoặc `201`, `301`). |
| **Mã hạt giống (Seed)** | Số nguyên định danh cách xáo trộn (mặc định lấy theo ngày, ví dụ: `20260925`).<br>*Mẹo:* Khi cần trộn đề cho nhiều lớp khác nhau, hãy đổi số Seed (ví dụ: Lớp A1 dùng Seed `101`, Lớp A2 dùng Seed `202`) để tạo các bộ đề khác nhau. |
| **Xáo thứ tự câu hỏi** | ☑ Khuyên dùng: Đổi thứ tự ngẫu nhiên các câu hỏi trong từng phần. |
| **Xáo thứ tự phương án** | ☑ Khuyên dùng: Đổi ngẫu nhiên vị trí các phương án A, B, C, D trong Phần I. |
| **Xáo ý câu Đúng/Sai** | ☐ Mặc định bỏ chọn để giữ nguyên mạch nội dung bài đọc của câu Đúng/Sai. |

---

## ❓ BẢNG GIẢI ĐÁP CÁC THẮC MẮC THƯỜNG GẶP (FAQ)

**1. Đề thi môn Hóa, Lý, Toán có công thức và hình vẽ thì có bị lỗi khi xáo không?**  
*Trả lời:* Hoàn toàn không. EXAM MIXER bóc tách trực tiếp cây thẻ XML nhị phân gốc của Word, giữ nguyên 100% hình ảnh, đồ thị, bảng biểu và các chỉ số trên/dưới.

**2. Đề thi in ra có bị lộ đáp án không?**  
*Trả lời:* Tuyệt đối không. Hệ thống tích hợp chốt kiểm định bảo mật Gate 3: tự động rà soát và xóa sạch toàn bộ các thuộc tính gạch chân, in nghiêng, tô đậm hoặc đổi màu đáp án trong tất cả các đề con của học sinh.

**3. Tôi muốn dùng khung tiêu đề có tên Trường và Sở GD&ĐT của tôi được không?**  
*Trả lời:* Được. Thầy/cô chỉ cần tải tệp Word tiêu đề mẫu của trường mình vào ô **"2. Mẫu định dạng (Template)"**, phần mềm sẽ tự động gắn nội dung các câu hỏi vào khung định dạng của trường.

**4. Dữ liệu đề thi của tôi có được bảo mật không?**  
*Trả lời:* Tuyệt đối an toàn. Khi chạy qua `START.bat`, phần mềm chạy hoàn toàn offline trên máy tính cá nhân. Khi sử dụng phiên bản web, đề thi chỉ xử lý trong bộ nhớ tạm thời RAM và không lưu vào cơ sở dữ liệu.
