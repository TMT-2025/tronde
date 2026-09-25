# 08. HỒ SƠ PHÔI MẪU TÀI LIỆU (TEMPLATE PROFILE SPECIFICATION)
**Dự án:** EXAM MIXER ENGINE  
**Đối tượng phân tích:** `DeSauTron.docx` (Golden Template Reference)  
**Tác giả:** Senior Software Architect + DOCX Processing Engineer  
**Ngày thực hiện:** 24/09/2026  

---

## 1. MỤC ĐÍCH CỦA HỒ SƠ PHÔI MẪU (TEMPLATE PROFILE)

`TemplateProfile` là cấu trúc cấu hình độc lập hoàn toàn với nội dung câu hỏi học thuật. Mục đích nhằm tách rời:
- **Thiết lập giao diện, bố cục, hình học trang, phông chữ, định dạng đoạn, bảng và chân trang** (Template Configuration)
- **Nội dung câu hỏi, phương án, công thức hóa học** (Variant Exam IR Content).

Bằng cách này, `DocxExamRenderer` có thể kết xuất bất kỳ môn học nào (Toán, Lý, Hóa, Sinh, Sử, Địa, Tiếng Anh) mà không phụ thuộc cứng vào nội dung cụ thể của đề kiểm tra Ester - Lipid.

---

## 2. BẢNG THÔNG SỐ KỸ THUẬT HÌNH HỌC VÀ TRANG IN (PAGE GEOMETRY)

Tất cả các thông số khoảng cách trong OpenXML sử dụng đơn vị **dxa** ($1\text{ inch} = 1440\text{ dxa}$, $1\text{ cm} = 567\text{ dxa}$, $1\text{ pt} = 20\text{ dxa}$).

| Thuộc tính | Giá trị OpenXML | Giá trị thực tế | Mục đích kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Khổ giấy (`w:pgSz`)** | `w="11906" h="16838"` | $210 \times 297\text{ mm}$ | Chuẩn khổ giấy A4 quốc tế |
| **Lề trên (`w:top`)** | `567 dxa` | $1.00\text{ cm}$ | Tối ưu hóa chiều cao trang để vừa khít 2 trang |
| **Lề dưới (`w:bottom`)** | `567 dxa` | $1.00\text{ cm}$ | Chừa khoảng cách đáy trang hợp lý |
| **Lề trái (`w:left`)** | `1134 dxa` | $2.00\text{ cm}$ | Chuẩn thể thức văn bản Việt Nam (đóng ghim / bấm lỗ) |
| **Lề phải (`w:right`)** | `567 dxa` | $1.00\text{ cm}$ | Tối đa hóa bề rộng dòng khả dụng |
| **Lề Header (`w:header`)**| `283 dxa` | $0.50\text{ cm}$ | Khoảng cách đỉnh trang |
| **Lề Footer (`w:footer`)**| `567 dxa` | $1.00\text{ cm}$ | Đặt chân trang phân cách đáy trang |
| **Bề rộng nội dung ($W$)**| **$10,205\text{ dxa}$** | **$17.99\text{ cm}$** | $11906 - (1134 + 567) = 10,205\text{ dxa}$ |
| **Khoảng cách cột (`w:cols`)**| `space="720"` | $1.27\text{ cm}$ | Khoảng cách cột mặc định |
| **Độ cao lưới dòng (`w:docGrid`)**| `linePitch="360"`| $18\text{ pt}$ | Bước lưới chuẩn Word |

---

## 3. THIẾT LẬP PHÔNG CHỮ VÀ KIỂU DÁNG (STYLES & TYPOGRAPHY)

### 3.1. Phông chữ mặc định (`w:docDefaults`)
- **Tên phông (`w:rFonts`):** `Times New Roman` (áp dụng cho cả `ascii`, `hAnsi`, `cs`, `eastAsia`).
- **Cỡ chữ mặc định (`w:sz`):** `24` half-points = **$12\text{ pt}$**.
- **Màu chữ mặc định (`w:color`):** `000000` (Đen chuẩn).

### 3.2. Kiểu dáng ký tự (`YoungMixChar`)
- Đăng ký trong `word/styles.xml`:
  ```xml
  <w:style w:type="character" w:customStyle="1" w:styleId="YoungMixChar">
    <w:name w:val="YoungMix_Char"/>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
      <w:sz w:val="24"/>
    </w:rPr>
  </w:style>
  ```
- **Phạm vi áp dụng:** Toàn bộ nhãn phương án `A. `, `B. `, `C. `, `D. ` và nhãn ý Đúng/Sai `a) `, `b) `, `c) `, `d) `.

### 3.3. Kiểu dáng bảng (`YoungMixTable`)
- Triệt tiêu hoàn toàn lề ô bảng (`w:tblCellMar` bằng 0 ở cả 4 cạnh: `top=0`, `left=0`, `bottom=0`, `right=0`).
- Giúp nội dung trong ô bảng canh sát mép lề trang, đảm bảo thẩm mỹ tối đa.

---

## 4. HỆ THỐNG ĐIỂM DỪNG TAB VÀ BỐ CỤC DỒN DÒNG (TAB STOPS MATRIX)

Khung nội dung có bề rộng $W = 10,205\text{ dxa}$.

| Bố cục (Layout Mode) | Số dòng | Điểm dừng Tab (`w:tabs`) | Tọa độ OpenXML | Khoảng cách khả dụng |
| :--- | :---: | :--- | :--- | :--- |
| **4 Cột (4 Columns)** | 1 dòng | Tab 1: Cột A<br>Tab 2: Cột B<br>Tab 3: Cột C<br>Tab 4: Cột D | `pos="283"` ($0.50\text{ cm}$)<br>`pos="2906"` ($5.12\text{ cm}$)<br>`pos="5528"` ($9.75\text{ cm}$)<br>`pos="8150"` ($14.37\text{ cm}$)| $\approx 2,622\text{ dxa}$ / cột<br>($\approx 15 - 20$ ký tự) |
| **2 Cột (2 Columns)** | 2 dòng | Dòng 1: Tab A & Tab B<br>Dòng 2: Tab C & Tab D | `pos="283"` ($0.50\text{ cm}$)<br>`pos="5528"` ($9.75\text{ cm}$)| $\approx 5,245\text{ dxa}$ / cột<br>($\approx 20 - 45$ ký tự) |
| **1 Cột (1 Column)** | 4 dòng | Mỗi dòng 1 Tab | `pos="283"` ($0.50\text{ cm}$)| Toàn bộ dòng ($10,205\text{ dxa}$)<br>($> 45$ ký tự) |
| **Đúng / Sai (Part II)** | 4 dòng | Mỗi ý con $a, b, c, d$ 1 dòng | `pos="283"` ($0.50\text{ cm}$)| Thụt lề $0.50\text{ cm}$ |

---

## 5. KHUNG TIÊU ĐỀ VÀ BẢNG THÔNG TIN THÍ SINH (HEADER SPECIFICATION)

1. **Dòng 1: Tiêu đề Đề kiểm tra**
   - Đoạn văn căn giữa: `<w:pPr><w:jc w:val="center"/><w:rPr><w:b/></w:rPr></w:pPr>`
   - Nội dung in đậm: `KIỂM TRA CHƯƠNG ESTER - LIPID` (lấy từ `ExamIR.header.examTitle`).

2. **Dòng 2: Bảng thông tin thí sinh (`w:tbl`)**
   - Hàng gồm 3 ô với đường viền đáy duy nhất (`w:bottom w:val="single" w:sz="12" w:space="0" w:color="000000"` - dày $1.5\text{ pt}$):
     - **Ô 1 (Bề rộng $6,123\text{ dxa} \approx 10.79\text{ cm}$):**  
       `Họ và tên: ............................................................................`
     - **Ô 2 (Bề rộng $2,041\text{ dxa} \approx 3.60\text{ cm}$):**  
       `Số báo danh: .......`
     - **Ô 3 (Bề rộng $2,041\text{ dxa} \approx 3.60\text{ cm}$):**  
       Căn giữa, In đậm: `Mã đề {examCode}` (Ví dụ: `Mã đề 101`, `Mã đề 102`...).
   - Tổng bề rộng: $6123 + 2041 + 2041 = 10,205\text{ dxa}$ (Khớp chính xác 100% với bề rộng trang in).

---

## 6. CHÂN TRANG ĐỘNG (DYNAMIC FOOTER SPECIFICATION)

Được lưu trữ trong tệp `word/footer1.xml`:
- **Đường viền trên:** `<w:top w:val="single" w:sz="6" w:space="1" w:color="auto"/>` (Đường kẻ ngang mỏng $0.75\text{ pt}$ phân cách chân trang).
- **Tab căn phải:** `<w:tab w:val="right" w:pos="10489"/>` (Đặt sát mép lề phải của nội dung).
- **Văn bản bên trái:** `Mã đề {examCode}` (Khớp với mã đề tại tiêu đề).
- **Văn bản bên phải (Trường động Word):**
  - Run 1: Nhảy tab `<w:tab/>` + Văn bản `Trang `.
  - Run 2: Bắt đầu trường động `<w:fldChar w:fldCharType="begin"/>`.
  - Run 3: Mã trường `<w:instrText>Page</w:instrText>`.
  - Run 4: Ngăn cách `<w:fldChar w:fldCharType="separate"/>`.
  - Run 5: Giá trị dự phòng hiển thị `1`.
  - Run 6: Kết thúc trường `<w:fldChar w:fldCharType="end"/>`.
  - Run 7: Dấu gạch chéo `/`.
  - Run 8: Bắt đầu trường động `<w:fldChar w:fldCharType="begin"/>`.
  - Run 9: Mã trường `<w:instrText>NUMPAGES</w:instrText>`.
  - Run 10: Ngăn cách `<w:fldChar w:fldCharType="separate"/>`.
  - Run 11: Giá trị dự phòng hiển thị `2`.
  - Run 12: Kết thúc trường `<w:fldChar w:fldCharType="end"/>`.

---

## 7. ĐẶC TẢ ĐỐI TƯỢNG `TemplateProfile` TRONG TYPESCRIPT

```typescript
export interface PageGeometryProfile {
  pageWidthDxa: number;       // 11906 (A4 width)
  pageHeightDxa: number;      // 16838 (A4 height)
  marginTopDxa: number;       // 567 (1 cm)
  marginBottomDxa: number;    // 567 (1 cm)
  marginLeftDxa: number;      // 1134 (2 cm)
  marginRightDxa: number;     // 567 (1 cm)
  headerMarginDxa: number;    // 283 (0.5 cm)
  footerMarginDxa: number;    // 567 (1 cm)
  contentWidthDxa: number;    // 10205 (17.99 cm)
}

export interface TabStopProfile {
  fourColumns: number[];      // [283, 2906, 5528, 8150]
  twoColumns: number[];       // [283, 5528]
  oneColumn: number[];        // [283]
  trueFalse: number[];        // [283]
  footerRightTabDxa: number;  // 10489
}

export interface HeaderTableProfile {
  colWidthsDxa: [number, number, number]; // [6123, 2041, 2041]
  borderBottomSize: number;               // 12 (1.5 pt)
  nameFieldPrompt: string;                // "Họ và tên: ............................."
  idFieldPrompt: string;                  // "Số báo danh: ......."
}

export interface TypographyProfile {
  fontName: string;                       // "Times New Roman"
  fontSizeHalfPoints: number;             // 24 (12 pt)
  questionStemSpacingBeforeDxa: number;   // 60 (3 pt)
  endMarkerText: string;                  // "------ HẾT ------"
}

export interface TemplateProfile {
  profileId: string;
  name: string;
  geometry: PageGeometryProfile;
  tabs: TabStopProfile;
  headerTable: HeaderTableProfile;
  typography: TypographyProfile;
}
```
Mô hình này giúp `DocxExamRenderer` đạt tính linh hoạt tối đa, dễ dàng tái sử dụng và tùy biến cho các quy chuẩn trường học khác nhau.
