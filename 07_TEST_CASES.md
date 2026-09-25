# 07. TẬP KIỂM THỬ KỸ THUẬT (ENGINEERING TEST CASES & VERIFICATION)
**Dự án:** EXAM MIXER ENGINE  
**Tập dữ liệu kiểm thử thực tế:** `DeGocTron.docx` và `DeSauTron.docx`  
**Tác giả:** Senior Software Architect + DOCX Processing Engineer  

---

## 1. MỤC TIÊU KIỂM THỬ (TEST OBJECTIVES)

Bộ kiểm thử này được thiết kế để xác minh toàn diện chu trình xử lý:
$$\text{DeGocTron.docx} \xrightarrow{\text{Parser}} \text{ExamIR} \xrightarrow{\text{Mixing Engine}} \text{Shuffled IR} \xrightarrow{\text{Renderer}} \text{DeSauTron.docx}$$

Mọi ca kiểm thử đều sử dụng dữ liệu trích xuất thực tế từ 2 file gốc do người dùng cung cấp.

---

## 2. CÁC CA KIỂM THỬ TRỌNG YẾU (CORE MANDATORY TEST CASES)

### TEST-001: Cập nhật vị trí đáp án đúng sau khi hoán vị phương án (Multiple Choice Shuffle & Key Remapping)
- **Mô tả:** Trong đề gốc `DeGocTron.docx`, Câu 1 thuộc Phần I có nội dung:
  - Thân câu: *"Hợp chất nào sau đây thuộc loại ester?"*
  - Phương án A: $CH_3COOH$ (`isCorrect = false`)
  - Phương án B: $CH_3CHO$ (`isCorrect = false`)
  - Phương án C: $CH_3COOC_2H_5$ (Có gạch chân `w:u="single"`, `isCorrect = true`) $\rightarrow$ **Đáp án đúng gốc: C**.
  - Phương án D: $CH_3CH_2OH$ (`isCorrect = false`)
- **Điều kiện kiểm thử:**
  - Khởi tạo `seed = 20260924`.
  - Giả sử thuật toán xáo trộn đưa phương án gốc C sang vị trí đầu tiên (Index 0).
- **Kết quả kỳ vọng (Assertions):**
  1. Phương án tại vị trí mới `A.` phải mang nội dung $CH_3COOC_2H_5$.
  2. Cờ `isCorrect` của phương án mới `A.` phải bằng `true`.
  3. Bảng đáp án chấm thi của mã đề này tại Câu 1 phải được ghi nhận là: **`AnswerKey[1] = "A"`** (hoặc chữ cái tương ứng với vị trí sau hoán vị).
  4. File DOCX xuất ra cho học sinh KHÔNG ĐƯỢC chứa gạch chân dưới phương án $CH_3COOC_2H_5$.

---

### TEST-002: Bảo toàn trạng thái học thuật của từng ý trong câu hỏi Đúng / Sai (True / False Conservation)
- **Mô tả:** Trong `DeGocTron.docx`, Câu 1 Phần II mô tả thí nghiệm ester hóa:
  - Ý a) *"Sulfuric acid đặc đóng vai trò vừa là chất xúc tác vừa là chất hút nước để chuyển dịch cân bằng."* (Có `w:u` $\rightarrow$ **ĐÚNG**).
  - Ý b) *"Sản phẩm hữu cơ thu được sau phản ứng có tên gọi là Methyl acetate."* (Không có `w:u` $\rightarrow$ **SAI**).
  - Ý c) *"Việc sử dụng dung dịch Sodium chloride bão hòa giúp ester tách ra khỏi hỗn hợp tốt hơn."* (Có `w:u` $\rightarrow$ **ĐÚNG**).
  - Ý d) *"Nếu thay Ethanol bằng Methanol, sản phẩm thu được vẫn là Ethyl acetate."* (Không có `w:u` $\rightarrow$ **SAI**).
- **Điều kiện kiểm thử:**
  - Bật tùy chọn xáo trộn ý con: `shuffleTrueFalseSubItems = true`.
  - Giả sử thứ tự hoán vị mới là: `[c, a, d, b]`.
- **Kết quả kỳ vọng (Assertions):**
  1. Ý mới `a)` mang nội dung của ý `c` gốc $\rightarrow$ Trạng thái đúng/sai phải là **ĐÚNG**.
  2. Ý mới `b)` mang nội dung của ý `a` gốc $\rightarrow$ Trạng thái đúng/sai phải là **ĐÚNG**.
  3. Ý mới `c)` mang nội dung của ý `d` gốc $\rightarrow$ Trạng thái đúng/sai phải là **SAI**.
  4. Ý mới `d)` mang nội dung của ý `b` gốc $\rightarrow$ Trạng thái đúng/sai phải là **SAI**.
  5. Vector đáp án đối soát của câu này được cập nhật chính xác thành: **`[Đ, Đ, S, S]`**.
  6. Trong file học sinh, toàn bộ các ý `a)`, `b)`, `c)`, `d)` đều hiển thị dạng văn bản thường (chỉ in đậm nhãn), không có dấu gạch chân.

---

### TEST-003: Phân lập định dạng câu Trả lời ngắn, không bị biến thành Trắc nghiệm (Short Answer Isolation)
- **Mô tả:** Trong `DeGocTron.docx`, Phần III Câu 1 có bài toán tính thể tích $V$ xà phòng hóa 17,6 gam Ethyl acetate. Bên dưới có dòng `A. 200` (In nghiêng, gạch chân, màu xanh `0000FF`).
- **Điều kiện kiểm thử:**
  - Parser xử lý Phần III.
  - Renderer sinh đề thi học sinh và bảng đáp án.
- **Kết quả kỳ vọng (Assertions):**
  1. Loại câu hỏi trong IR bắt buộc phải là `QuestionType.SHORT_ANSWER`, **TUYỆT ĐỐI KHÔNG ĐƯỢC CHUYỂN THÀNH `MULTIPLE_CHOICE`**.
  2. `question.options` phải là `null` hoặc mảng rỗng `[]`.
  3. `question.shortAnswer.expectedValue` được bóc tách đúng giá trị chuỗi `"200"`.
  4. Trong file DOCX xuất ra cho học sinh (`DeSauTron.docx`):
     - Dòng `A. 200` **BỊ LOẠI BỎ HOÀN TOÀN**.
     - Câu hỏi chỉ gồm thân bài toán, kết thúc bằng dấu chấm hỏi hoặc yêu cầu tính giá trị.
  5. Bảng đáp án đối soát giáo viên ghi nhận: `Part_III[1] = "200"`.

---

### TEST-004: Bảo toàn cấu trúc chỉ số hóa học Subscript / Superscript (Chemical Notation Fidelity)
- **Mô tả:** Đề thi Hóa học chứa hàng loạt công thức:
  - $CH_3COOH$: chứa chỉ số dưới `3`.
  - $C_n H_{2n} O_2$: chứa chỉ số dưới `2`.
  - $C_n H_{2n-2} O_2$: chứa chỉ số dưới `2`, chỉ số trên `-` (superscript), chỉ số dưới `2`.
  - $(C_{17}H_{35}COO)_3C_3H_5$: chứa các chỉ số dưới `17`, `35`, `3`, `3`, `5`.
  - $trans-fat$: chứa chỉ số trên `-`.
- **Điều kiện kiểm thử:**
  - Quét qua toàn bộ pipeline: Parser $\rightarrow$ Mixing $\rightarrow$ Renderer.
- **Kết quả kỳ vọng (Assertions):**
  1. Với phương án Câu 6 gốc B ($C_n H_{2n} O_2$):
     - Phải gồm các Run:
       - Run 1: Text = `CnH`
       - Run 2: Text = `2`, `vertAlign = subscript`
       - Run 3: Text = `nO`
       - Run 4: Text = `2`, `vertAlign = subscript`
  2. Với phương án Câu 6 gốc C ($C_n H_{2n-2} O_2$):
     - Phải chứa Run có Text = `-` và thuộc tính `vertAlign = superscript`.
  3. Trong file DOCX kết quả, các thẻ `<w:vertAlign w:val="subscript"/>` và `<w:vertAlign w:val="superscript"/>` phải xuất hiện đầy đủ trong `w:rPr` tương ứng.
  4. Tuyệt đối không xảy ra hiện tượng chữ số bị tụt xuống dòng hoặc biến thành ký tự bình thường cùng cỡ với chữ cái.

---

### TEST-005: Khung tiêu đề, Mã đề và Chân trang được cập nhật đồng bộ (Header/Footer Consistency)
- **Mô tả:** Đề thi cần sinh ra 4 mã đề: `101`, `102`, `103`, `104`.
- **Điều kiện kiểm thử:**
  - Kết xuất file cho mã đề `102`.
- **Kết quả kỳ vọng (Assertions):**
  1. Trong `word/document.xml`:
     - Bảng thông tin thí sinh tại ô thứ 3 (cột 3) phải hiển thị văn bản in đậm: **`Mã đề 102`**.
  2. Trong `word/footer1.xml`:
     - Đoạn văn footer ở phía bên trái phải hiển thị văn bản: **`Mã đề 102`**.
  3. Giá trị mã đề ở 2 vị trí trên phải hoàn toàn trùng khớp với nhau.

---

### TEST-006: Đánh số trang tự động và tối ưu hóa diện tích in ấn (Page Numbering & 2-Page Budget)
- **Mô tả:** Kiểm tra footer động và mức độ nén trang trong file DOCX kết xuất.
- **Điều kiện kiểm thử:**
  - Kết xuất toàn bộ 28 câu hỏi của đề mẫu sang file DOCX với lề chuẩn (trái 2cm, các lề khác 1cm).
- **Kết quả kỳ vọng (Assertions):**
  1. `word/footer1.xml` chứa chính xác cấu trúc trường động OpenXML:
     ```xml
     <w:r><w:fldChar w:fldCharType="begin"/></w:r>
     <w:r><w:instrText>Page</w:instrText></w:r>
     <w:r><w:fldChar w:fldCharType="separate"/></w:r>
     <w:r><w:fldChar w:fldCharType="end"/></w:r>
     <w:r><w:t>/</w:t></w:r>
     <w:r><w:fldChar w:fldCharType="begin"/></w:r>
     <w:r><w:instrText>NUMPAGES</w:instrText></w:r>
     <w:r><w:fldChar w:fldCharType="separate"/></w:r>
     <w:r><w:fldChar w:fldCharType="end"/></w:r>
     ```
  2. Khi mở file trên Microsoft Word:
     - Số trang hiển thị tại chân trang là `Trang 1/2` và `Trang 2/2`.
     - Tổng số trang của tài liệu bằng đúng **2 trang** (không tràn sang trang 3).

---

## 3. CÁC CA KIỂM THỬ BỐ CỤC DỒN DÒNG (TAB LAYOUT VERIFICATION)

### TEST-007: Kiểm tra Dồn dòng 4 cột (4-Columns Tab Stops)
- **Dữ liệu kiểm tra:** Câu 1 đến Câu 6 trong Phần I.
- **Kỳ vọng:**
  - 4 phương án được dồn vào **1 paragraph duy nhất**.
  - Paragraph có đủ 4 tab stops: `pos="283"`, `2906`, `5528`, `8150`.
  - Mỗi nhãn phương án `A. `, `B. `, `C. `, `D. ` được gán style `YoungMixChar` và thuộc tính in đậm `<w:b/>`.

### TEST-008: Kiểm tra Dồn dòng 2 cột (2-Columns Tab Stops)
- **Dữ liệu kiểm tra:** Câu 7, 8, 10, 14, 15, 16, 17 trong Phần I.
- **Kỳ vọng:**
  - 4 phương án được chia làm **2 paragraph**:
    - Dòng 1 chứa phương án A và B với 2 tab stops: `pos="283"`, `5528`.
    - Dòng 2 chứa phương án C và D với 2 tab stops: `pos="283"`, `5528`.

### TEST-009: Kiểm tra Bố cục 1 cột (1-Column Fallback)
- **Dữ liệu kiểm tra:** Câu 12 trong Phần I (Phương án C dài trên 50 ký tự).
- **Kỳ vọng:**
  - Layout engine tự động phát hiện phương án dài và bố trí thành **4 paragraph riêng biệt**.
  - Mỗi paragraph có 1 tab stop: `pos="283"`.

---

## 4. CA KIỂM THỬ TÍNH TOÀN VẸN GÓI VÀ BẢO MẬT ĐÁP ÁN (SECURITY & INTEGRITY)

### TEST-010: Ngăn chặn rò rỉ đáp án tuyệt đối (Zero Answer Leakage)
- **Mô tả:** Đảm bảo không còn bất kỳ dấu vết định dạng gạch chân đáp án nào sót lại trong file giao cho học sinh.
- **Hành động kiểm tra:**
  - Giải nén `DeSauTron.docx`.
  - Thực hiện XPath query trên `word/document.xml`:
    `//w:body//w:p[not(ancestor::w:tbl)]//w:u`
- **Kết quả kỳ vọng:**
  - Không có bất kỳ thẻ `<w:u w:val="single"/>` nào tồn tại trong các khối phương án lựa chọn và ý con Đúng/Sai.

### TEST-011: Khả năng mở tài liệu không báo lỗi (Clean DOCX Open Test)
- **Hành động kiểm tra:**
  - Mở file đầu ra trên Word/Office Interop hoặc bộ kiểm tra OpenXML SDK Productivity Tool.
- **Kết quả kỳ vọng:**
  - File mở tức thì, không xuất hiện hộp thoại: *"Word found unreadable content in... Do you want to recover the contents of this document?"*.
