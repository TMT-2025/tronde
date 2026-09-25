# 01. BÁO CÁO PHÂN TÍCH KỸ THUẬT DOCX (REVERSE ENGINEERING REPORT)
**Dự án:** EXAM MIXER ENGINE  
**Đối tượng phân tích:** `DeGocTron.docx` (Đề gốc trước xử lý) vs `DeSauTron.docx` (Đề thực tế sau khi tạo đề thi)  
**Tác giả:** Senior Software Architect + DOCX Processing Engineer  
**Ngày thực hiện:** 24/09/2026  

---

## 1. TỔNG QUAN PHÂN TÍCH DOCX & GÓI TẬP TIN (PACKAGE STRUCTURE)

Tập tin DOCX tuân thủ chuẩn ISO/IEC 29500-1 (Open Packaging Conventions - OPC và WordprocessingML). Qua việc giải nén nhị phân hai file mẫu, cấu trúc vật lý được xác định như sau:

| Thành phần OPC | `DeGocTron.docx` | `DeSauTron.docx` | Ghi chú kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Kích thước file** | 17,026 bytes | 20,382 bytes | File sau trộn tăng kích thước do bổ sung Footer, Footnotes, Endnotes, Styles |
| **`[Content_Types].xml`** | 1,445 bytes | 1,837 bytes | DeSau khai báo thêm kiểu MIME cho footer (`word/footer1.xml`) |
| **`word/document.xml`** | 42,213 bytes | 52,008 bytes | Cấu trúc tài liệu chính |
| **`word/styles.xml`** | 31,737 bytes | 32,316 bytes | DeSau thêm 2 style tùy biến: `YoungMixTable`, `YoungMixChar` |
| **`word/footer1.xml`** | *Không tồn tại* | 2,231 bytes | Chứa footer hiển thị Mã đề và trường số trang `{PAGE}/{NUMPAGES}` |
| **`word/_rels/document.xml.rels`** | 6 relationships | 9 relationships | DeSau thêm quan hệ với `footer1.xml` (Id: `rId7`), footnotes, endnotes |
| **`docProps/core.xml`** | Creator: Un-named | Creator: `youngmix.vn`, Keywords: `youngmix,cham thi trac nghiem,quizmaker` | Xác thực file mẫu được kết xuất từ engine chuẩn YoungMix |
| **`docProps/app.xml`** | Pages: **3**, Words: 1016 | Pages: **2**, Words: 1039 | **Số trang giảm từ 3 trang xuống 2 trang (tiết kiệm 33.3% diện tích giấy)** |

---

## 2. PHÂN TÍCH ĐỊNH DẠNG CHI TIẾT (RUN, PARAGRAPH, STYLES)

### 2.1. Cấu trúc Paragraph (`w:p`) và Bảng (`w:tbl`)
- **`DeGocTron.docx`**:
  - Tổng số `w:p` trong `w:body`: **129 paragraph**.
  - Tổng số `w:tbl` trong `w:body`: **0 bảng**.
  - Mỗi phương án trắc nghiệm A, B, C, D nằm trên **một paragraph độc lập** (18 câu x 4 phương án = 72 paragraphs).
  - Phần trả lời ngắn có thêm 1 paragraph đáp án (`A. 200`, `A. 0.92`,...) ngay dưới câu hỏi (6 paragraphs).
  - Tồn tại các thẻ kỹ thuật đánh dấu nhóm: `<g0#1>`, `<g0#2>`, `<g0#3>` (3 paragraphs).
- **`DeSauTron.docx`**:
  - Tổng số `w:p` trong `w:body`: **80 paragraph** (giảm 49 paragraphs!).
  - Tổng số `w:tbl` trong `w:body`: **1 bảng** (Bảng thông tin học sinh: Họ và tên, SBD, Mã đề).
  - Các phương án trắc nghiệm A, B, C, D được **dồn dòng thông minh bằng tab stops** (xem chi tiết ở Mục 3).
  - Loại bỏ hoàn toàn các thẻ nhóm `<g0#1>`, `<g0#2>`, `<g0#3>`.
  - Loại bỏ hoàn toàn các paragraph chứa đáp án phần trả lời ngắn.
  - Thêm dòng kết thúc đề thi: `------ HẾT ------` tại paragraph áp chót.

### 2.2. Font chữ và Kích thước (Run Properties - `w:rPr`)
- **Font mặc định (`w:docDefaults` và `Normal`)**:
  - `w:rFonts`: `w:ascii="Times New Roman"`, `w:hAnsi="Times New Roman"`, `w:cs="Times New Roman"`.
  - Cỡ chữ chuẩn: `w:sz w:val="24"` (24 half-points = **12 pt**).
  - Màu chữ: `w:color w:val="000000"` (Automatic/Black).
- **Style tùy biến trong DeSauTron**:
  - `YoungMixChar` (Character Style): Font `Times New Roman`, `w:sz w:val="24"`. Được áp dụng cho toàn bộ các nhãn phương án `A. `, `B. `, `C. `, `D. ` và nhãn ý đúng/sai `a) `, `b) `, `c) `, `d) `.
  - `YoungMixTable` (Table Style): Căn chỉnh lề ô bảng `w:tblCellMar` bằng 0 (`top=0`, `left=0`, `bottom=0`, `right=0`).

### 2.3. Khoảng cách dòng và Đoạn (Paragraph Properties - `w:pPr`)
- Trong `DeGocTron.docx`:
  - Thân câu hỏi có: `<w:spacing w:before="60" />` (60 dxa = 3pt giãn cách phía trên câu hỏi để tách biệt các câu).
- Trong `DeSauTron.docx`:
  - Sử dụng cơ chế mặc định của style Normal, các nhãn phương án có độ thụt lề đầu dòng thông qua tab.

---

## 3. CƠ CHẾ NÉN TRANG VÀ HỆ THỐNG CĂN TAB (TAB STOPS)

### 3.1. Hình học trang và Căn lề (`w:sectPr` / `w:pgMar`)
Đơn vị tính trong OpenXML là **dxa** (1/20 của một point, 1 inch = 1440 dxa, 1 cm = 567 dxa).

| Thuộc tính lề | `DeGocTron.docx` | `DeSauTron.docx` | Ý nghĩa kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Kích thước trang (`w:pgSz`)** | `w=11906, h=16838` | `w=11906, h=16838` | Khổ A4 chuẩn (210mm x 297mm) |
| **Lề trên (`w:top`)** | 720 dxa (1.27 cm) | **567 dxa (1.00 cm)** | Thu hẹp lề để tăng diện tích in |
| **Lề dưới (`w:bottom`)** | 720 dxa (1.27 cm) | **567 dxa (1.00 cm)** | Thu hẹp lề để tăng diện tích in |
| **Lề trái (`w:left`)** | 720 dxa (1.27 cm) | **1134 dxa (2.00 cm)** | Đạt chuẩn thể thức văn bản VN (lề trái để đóng ghim) |
| **Lề phải (`w:right`)** | 720 dxa (1.27 cm) | **567 dxa (1.00 cm)** | Thu hẹp lề phải |
| **Lề Header (`w:header`)** | 708 dxa | 283 dxa (0.50 cm) | Tối ưu khoảng trống đỉnh trang |
| **Lề Footer (`w:footer`)** | 708 dxa | 567 dxa (1.00 cm) | Chừa không gian cho Footer |
| **Bề rộng vùng nội dung (W)** | **10,466 dxa** | **10,205 dxa (17.99 cm)** | Khung trang khả dụng cho văn bản |

### 3.2. Quy tắc dồn dòng phương án trắc nghiệm (Tab Layout Rules)
Trong `DeSauTron.docx`, engine tự động tính toán chiều dài các phương án và chọn 1 trong 3 layout:

#### Layout 1: Cột 4 phương án trên 1 dòng (4-Columns Layout)
- **Áp dụng cho:** Các câu hỏi có 4 phương án ngắn (<= 15-20 ký tự).
- **Các câu trong đề mẫu:** Câu 1, 2, 3, 4, 5, 6, 9, 11, 13, 18 (Tổng cộng 10 câu).
- **Khai báo Tab trong XML (`w:tabs`):**
  ```xml
  <w:tabs>
    <w:tab w:val="left" w:pos="283" />  <!-- Vị trí A. (~0.5 cm) -->
    <w:tab w:val="left" w:pos="2906" /> <!-- Vị trí B. (~5.1 cm) -->
    <w:tab w:val="left" w:pos="5528" /> <!-- Vị trí C. (~9.7 cm) -->
    <w:tab w:val="left" w:pos="8150" /> <!-- Vị trí D. (~14.4 cm) -->
  </w:tabs>
  ```
- **Cấu trúc Run:**
  `<w:tab/><w:t>A. </w:t><content A><w:tab/><w:t>B. </w:t><content B><w:tab/><w:t>C. </w:t><content C><w:tab/><w:t>D. </w:t><content D>`
- **Hiệu quả:** Giảm từ 4 paragraph xuống còn **1 paragraph duy nhất**!

#### Layout 2: Cột 2 phương án x 2 dòng (2-Columns Layout)
- **Áp dụng cho:** Các phương án có độ dài trung bình (từ 20 - 45 ký tự).
- **Các câu trong đề mẫu:** Câu 7, 8, 10, 14, 15, 16, 17 (Tổng cộng 7 câu).
- **Khai báo Tab trong XML (`w:tabs`):**
  ```xml
  <w:tabs>
    <w:tab w:val="left" w:pos="283" />  <!-- Cột 1: A. hoặc C. (~0.5 cm) -->
    <w:tab w:val="left" w:pos="5528" /> <!-- Cột 2: B. hoặc D. (~9.7 cm) -->
  </w:tabs>
  ```
- **Cấu trúc:**
  - Dòng 1 (Paragraph 1): `<w:tab/><w:t>A. </w:t><content A><w:tab/><w:t>B. </w:t><content B>`
  - Dòng 2 (Paragraph 2): `<w:tab/><w:t>C. </w:t><content C><w:tab/><w:t>D. </w:t><content D>`
- **Hiệu quả:** Giảm từ 4 paragraph xuống còn **2 paragraph**.

#### Layout 3: Cột 1 phương án x 4 dòng (1-Column Layout)
- **Áp dụng cho:** Khi có ít nhất 1 phương án quá dài (> 45 ký tự) không thể xếp 2 cột.
- **Các câu trong đề mẫu:** Câu 12 (Phương án C dài: *"Có nhiệt độ sôi cao hơn alcohol có cùng số nguyên tử carbon"*).
- **Khai báo Tab trong XML (`w:tabs`):**
  ```xml
  <w:tabs>
    <w:tab w:val="left" w:pos="283" />
  </w:tabs>
  ```
- **Mỗi phương án nằm trên 1 paragraph riêng biệt với thụt lề 283 dxa.**

#### Layout cho Câu hỏi Đúng/Sai (Part II)
- Mỗi ý `a)`, `b)`, `c)`, `d)` nằm trên **1 dòng độc lập**.
- Có tab thụt đầu dòng: `<w:tab w:val="left" w:pos="283" />`.
- Cấu trúc: `<w:tab/><w:t>a) </w:t><Nội dung ý>`.

---

## 4. CƠ CHẾ BIỂU DIỄN VÀ BÓC TÁCH ĐÁP ÁN ĐÚNG TRONG FILE GỐC

Qua phân tích chi tiết cấp độ Run XML trong `DeGocTron.docx`, **đáp án đúng KHÔNG được lưu trữ dưới dạng text mà được mã hóa qua định dạng (Formatting Markers):**

### 4.1. Phần I: Câu trắc nghiệm nhiều phương án lựa chọn
- **Dấu hiệu định danh:** Run chứa thuộc tính gạch chân:
  `<w:u w:val="single" />`
- **Chi tiết XML:**
  - Trong phương án sai (ví dụ Câu 1 - A):
    `<w:r><w:t>A. CH</w:t></w:r><w:r><w:rPr><w:vertAlign w:val="subscript"/></w:rPr><w:t>3</w:t></w:r><w:r><w:t>COOH</w:t></w:r>`
    *(Hoàn toàn không có thuộc tính `w:u`)*
  - Trong phương án ĐÚNG (ví dụ Câu 1 - C):
    `<w:r><w:rPr><w:b/><w:i/><w:u w:val="single"/></w:rPr><w:t>C. </w:t></w:r>`
    `<w:r><w:rPr><w:i/><w:u w:val="single"/></w:rPr><w:t>CH</w:t></w:r>`
    `<w:r><w:rPr><w:i/><w:u w:val="single"/><w:vertAlign w:val="subscript"/></w:rPr><w:t>3</w:t></w:r>...`
- **Kết luận kiến trúc:** Engine Parser phải quét qua các Run của phương án. Nếu phát hiện thẻ `<w:u w:val="single" />` thì phương án đó được đánh dấu là `isCorrect = true`.

### 4.2. Phần II: Câu trắc nghiệm Đúng / Sai
- Mỗi câu hỏi gồm 4 ý: `a)`, `b)`, `c)`, `d)`.
- **Dấu hiệu định danh:**
  - **Ý ĐÚNG (True):** Có thuộc tính gạch chân `<w:u w:val="single" />` trên nhãn ý và/hoặc nội dung. Run nhãn thường đi kèm `<w:b/>` và `<w:i/>`.
  - **Ý SAI (False):** CHỈ CÓ in đậm `<w:b/>` trên nhãn `b) `, nội dung là văn bản thường, **KHÔNG CÓ `<w:u>`**.
- **Minh chứng XML từ Đề Gốc:**
  - Câu 1:
    - `a)`: Có `[B,I,U(single)]` -> **ĐÚNG**
    - `b)`: Chỉ có `[B]` -> **SAI**
    - `c)`: Có `[B,I,U(single)]` -> **ĐÚNG**
    - `d)`: Chỉ có `[B]` -> **SAI**
  - Câu 2: Cả 4 ý `a)`, `b)`, `c)`, `d)` đều có `[B,I,U(single)]` -> **CẢ 4 Ý ĐỀU ĐÚNG**.
  - Câu 3: `a)` (Đúng), `b)` (Đúng), `c)` (Đúng), `d)` (Sai).
  - Câu 4: `a)` (Đúng), `b)` (Đúng), `c)` (Sai), `d)` (Đúng).

### 4.3. Phần III: Câu trắc nghiệm trả lời ngắn
- Trong đề gốc, ngay sau câu hỏi là một paragraph chứa đáp án mẫu dưới dạng:
  `<w:p><w:r><w:rPr><w:b/><w:i/><w:u w:val="single"/></w:rPr><w:t>A. </w:t></w:r><w:r><w:rPr><w:b/><w:i/><w:u w:val="single"/><w:color w:val="0000FF"/></w:rPr><w:t>200</w:t></w:r></w:p>`
- **Đặc trưng:** Bắt đầu bằng `A. `, có `w:u="single"`, `w:color="0000FF"` (màu xanh dương).
- Giá trị đáp án mong đợi: Là chuỗi số/chữ sau tiền tố `A. ` (ví dụ: `200`, `0.92`, `3`, `5.28`, `88.4`, `1170`).
- **Xử lý khi Render:** **Paragraph này PHẢI BỊ BỎ HOÀN TOÀN** trong tài liệu phát cho học sinh (`DeSauTron.docx`).

---

## 5. BẢO TOÀN CÔNG THỨC HÓA HỌC VÀ ĐỊNH DẠNG ĐẶC BIỆT

Tài liệu Hóa học chứa mật độ rất cao các chỉ số trên và dưới:
- **Chỉ số dưới (`subscript`):** `<w:vertAlign w:val="subscript" />`
  - Các công thức: $CH_3COOH$, $C_2H_5OH$, $C_n H_{2n} O_2$, $(C_{17}H_{35}COO)_3C_3H_5$, $H_2SO_4$.
- **Chỉ số trên (`superscript`):** `<w:vertAlign w:val="superscript" />`
  - Dấu liên kết hoặc số mũ: $C_n H_{2n-2} O_2$ (dấu `-` được đưa lên superscript), $trans-fat$ (dấu `-` là superscript).
- **Yêu cầu sống còn đối với Parser & IR:**
  - **TUYỆT ĐỐI KHÔNG chuyển đổi văn bản sang plain text thuần túy.**
  - Nếu chuyển sang plain text, $C_n H_{2n-2} O_2$ sẽ bị mất định dạng phân biệt và trở thành chuỗi phẳng lỗi `CnH2n-2O2`.
  - Phải biểu diễn nội dung câu hỏi và nội dung phương án dưới dạng danh sách các `FormattedRun` giữ nguyên từng thuộc tính XML của OpenXML.

---

## 6. KHUNG TIÊU ĐỀ (HEADER TABLE) VÀ CHÂN TRANG (FOOTER)

### 6.1. Header Table trong `DeSauTron.docx`
Nằm ngay sau tiêu đề bài kiểm tra `KIỂM TRA CHƯƠNG ESTER - LIPID`:
```xml
<w:tbl>
  <w:tblPr>
    <w:tblStyle w:val="YoungMixTable"/>
    <w:tblW w:w="0" w:type="auto"/>
    <w:tblInd w:w="0" w:type="dxa"/>
  </w:tblPr>
  <w:tblGrid>
    <w:gridCol w:w="6123"/>
    <w:gridCol w:w="2041"/>
    <w:gridCol w:w="2041"/>
  </w:tblGrid>
  <w:tr>
    <!-- Cột 1 (6123 dxa = 10.79 cm): Họ và tên -->
    <w:tc>
      <w:tcPr><w:tcW w:w="6123" w:type="dxa"/><w:tcBorders><w:bottom w:val="single" w:sz="12" w:space="0" w:color="000000"/></w:tcBorders></w:tcPr>
      <w:p><w:r><w:t>Họ và tên: ............................................................................</w:t></w:r></w:p>
    </w:tc>
    <!-- Cột 2 (2041 dxa = 3.60 cm): Số báo danh -->
    <w:tc>
      <w:tcPr><w:tcW w:w="2041" w:type="dxa"/><w:tcBorders><w:bottom w:val="single" w:sz="12" w:space="0" w:color="000000"/></w:tcBorders></w:tcPr>
      <w:p><w:r><w:t>Số báo danh: .......</w:t></w:r></w:p>
    </w:tc>
    <!-- Cột 3 (2041 dxa = 3.60 cm): Mã đề -->
    <w:tc>
      <w:tcPr><w:tcW w:w="2041" w:type="dxa"/><w:tcBorders><w:bottom w:val="single" w:sz="12" w:space="0" w:color="000000"/></w:tcBorders></w:tcPr>
      <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>Mã đề 101</w:t></w:r></w:p>
    </w:tc>
  </w:tr>
</w:tbl>
```
Tổng bề rộng bảng: $6123 + 2041 + 2041 = 10,205$ dxa — **Khớp chính xác 100% với bề rộng vùng nội dung trang!**

### 6.2. Footer linh hoạt trong `word/footer1.xml`
- Chứa đường kẻ phân cách phía trên (`w:top w:val="single" w:sz="6"`).
- Bên trái: Hiển thị văn bản `Mã đề 101`.
- Phím tab phải căn lề vị trí `10489` dxa.
- Bên phải: Hiển thị trường động `Trang ` + `<w:instrText>Page</w:instrText>` + `/` + `<w:instrText>NUMPAGES</w:instrText>`.
- Cơ chế này đảm bảo khi Microsoft Word hoặc máy in mở file, số trang tự động được đánh số chính xác mà không cần fix cứng trong văn bản.

---

## 7. BẢNG TỔNG HỢP SO SÁNH `DeGocTron.docx` VS `DeSauTron.docx`

| Tiêu chí | `DeGocTron.docx` | `DeSauTron.docx` | Xử lý kiến trúc cần đạt |
| :--- | :--- | :--- | :--- |
| **Thẻ nhóm câu hỏi** | Có `<g0#1>`, `<g0#2>`, `<g0#3>` | Bị loại bỏ hoàn toàn | Parser dùng thẻ để nhận biết section, Renderer loại bỏ |
| **Tiêu đề đề thi** | Không có tiêu đề chung | `KIỂM TRA CHƯƠNG ESTER - LIPID` | Lấy từ cấu hình Exam Metadata hoặc dòng đầu |
| **Khung thông tin học sinh** | Không có | Bảng 1 hàng 3 cột (Họ tên, SBD, Mã đề) | Template-based Renderer tự động sinh bảng |
| **Bố cục phương án trắc nghiệm** | Luôn là 1 phương án / 1 paragraph | Linh hoạt: 4 cột, 2 cột, 1 cột tùy độ dài | Layout Optimizer tính toán độ dài ký tự để gán tab |
| **Đánh dấu đáp án đúng** | Có Underline `w:u` và Italic `w:i` | Đã được xóa sạch (Sanitized) | Parser bóc tách đáp án; Renderer xóa toàn bộ `w:u` |
| **Đáp án phần Trả lời ngắn** | Có dòng `A. <giá trị>` màu xanh | Đã bị xóa hoàn toàn | Parser trích xuất `expectedAnswer`; Renderer xóa dòng này |
| **Mã đề thi** | Không có | Chèn vào ô bảng tiêu đề và Footer | Cập nhật theo từng mã đề sinh ra (101, 102,...) |
| **Chân trang (Footer)** | Không có | Đường kẻ + Mã đề + Trang X/Y | Sinh `footer1.xml` với OpenXML dynamic fields |
| **Căn lề trang** | Trái 1.27cm, Phải 1.27cm, Đỉnh/Đáy 1.27cm | Trái 2.00cm, Phải 1.00cm, Đỉnh/Đáy 1.00cm | Thiết lập `w:sectPr` chuẩn văn bản giáo dục VN |
| **Số trang in** | 3 trang | **2 trang** | Giảm thiểu chi phí in ấn tối đa cho giáo viên |
