# 06. ĐẶC TẢ BỘ KIỂM SOÁT VÀ KIỂM TRA TỰ ĐỘNG (VALIDATION ENGINE SPECIFICATION)
**Dự án:** EXAM MIXER ENGINE  
**Thành phần:** `ExamValidationEngine`  
**Vai trò:** Cổng kiểm soát chất lượng tự động (Quality Gatekeeper) - Chặn xuất file nếu có bất kỳ sai sót nào  
**Tác giả:** Senior Software Architect + DOCX Processing Engineer  

---

## 1. NGUYÊN TẮC HOẠT ĐỘNG CỦA VALIDATION ENGINE (ZERO-TOLERANCE POLICY)

Đề thi là tài liệu mang tính pháp lý và học thuật cao. Một lỗi nhỏ như mất câu hỏi, sai đáp án hay lộ gạch chân đáp án trong đề học sinh có thể làm hỏng toàn bộ kỳ thi.

Do đó, `ExamValidationEngine` áp dụng chính sách **Zero-Tolerance Gatekeeping (Không dung thứ sai sót)**:
- Chia quy trình kiểm thử làm 3 vòng độc lập:
  1. **Phase 1: Pre-Parse & IR Validation (Kiểm tra Đề gốc và Mô hình IR)**
  2. **Phase 2: Post-Mixing Validation (Kiểm tra Tính toàn vẹn sau khi Trộn)**
  3. **Phase 3: Post-Render OpenXML Validation (Kiểm tra File DOCX trước khi ghi đĩa)**
- **Nếu phát hiện bất kỳ lỗi cấp độ `CRITICAL` hoặc `ERROR`: Dừng ngay lập tức toàn bộ quá trình, hủy file tạm và xuất báo cáo lỗi chi tiết cho giáo viên.**

---

## 2. MA TRẬN LUẬT KIỂM THỬ (VALIDATION RULES MATRIX)

```mermaid
flowchart TD
    subgraph Phase 1: Pre-Parse
        A1[Kiểm tra đủ 3 Phần] --> A2[Kiểm tra số lượng câu 18 + 4 + 6]
        A2 --> A3[Kiểm tra gạch chân đáp án Part I]
        A3 --> A4[Kiểm tra đủ 4 ý a,b,c,d Part II]
        A4 --> A5[Kiểm tra đáp án số Part III]
    end
    subgraph Phase 2: Post-Mixing
        B1[Bảo toàn Song ánh Bijective Mapping] --> B2[Không mất câu, không trùng câu]
        B2 --> B3[Kiểm tra ánh xạ đáp án đúng sau hoán vị]
        B3 --> B4[Bảo toàn định dạng Subscript/Superscript]
    end
    subgraph Phase 3: Post-Render
        C1[Kiểm tra rò rỉ đáp án Leak Detection] --> C2[Kiểm tra tính hợp lệ OpenXML Packaging]
        C2 --> C3[Kiểm tra Header Mã đề & Dynamic Footer]
        C3 --> C4[Kiểm tra dung lượng và khả năng mở file]
    end
    Phase 1 --> Phase 2 --> Phase 3 --> D[Cho phép Xuất File]
```

---

## 3. CHI TIẾT TỪNG GIAI ĐOẠN KIỂM THỬ

### 3.1. Phase 1: Pre-Parse & IR Validation (Kiểm thử Đề gốc)

| Mã luật | Tên luật | Mức độ | Điều kiện kiểm tra & Hành động |
| :--- | :--- | :--- | :--- |
| **VAL-PRE-01** | `SECTION_COUNT_CHECK` | **CRITICAL** | Đề gốc phải có đủ 3 phần chuẩn: Phần I (18 câu), Phần II (4 câu), Phần III (6 câu). Tổng cộng đúng 28 câu. Nếu thiếu phần $\rightarrow$ Báo lỗi cấu trúc. |
| **VAL-PRE-02** | `OPTIONS_CARDINALITY` | **CRITICAL** | Mỗi câu hỏi trong Phần I bắt buộc phải có đủ đúng 4 phương án $A, B, C, D$. Không chấp nhận câu chỉ có 3 hoặc 5 phương án. |
| **VAL-PRE-03** | `CORRECT_ANSWER_EXISTS` | **CRITICAL** | Trong Phần I, mỗi câu hỏi bắt buộc phải có **đúng 1 phương án có gạch chân** (`w:u="single"`). Nếu không có gạch chân hoặc có $\ge 2$ gạch chân $\rightarrow$ Báo lỗi câu hỏi mơ hồ. |
| **VAL-PRE-04** | `TF_SUBITEMS_CARDINALITY` | **CRITICAL** | Mỗi câu hỏi Phần II bắt buộc có đủ 4 ý $a), b), c), d)$. |
| **VAL-PRE-05** | `SHORT_ANSWER_KEY_EXISTS`| **HIGH** | Mỗi câu hỏi Phần III phải có dòng `A. <giá trị>` kèm màu chữ hoặc gạch chân để bóc tách đáp án số. |
| **VAL-PRE-06** | `DUPLICATE_QUESTION_CHECK` | **MEDIUM** | So sánh độ tương đồng chuỗi (Levenshtein distance hoặc SHA256 văn bản) giữa các câu hỏi để cảnh báo giáo viên nếu vô tình copy trùng câu. |

---

### 3.2. Phase 2: Post-Mixing Validation (Kiểm thử Sau khi Trộn)

| Mã luật | Tên luật | Mức độ | Điều kiện kiểm tra & Hành động |
| :--- | :--- | :--- | :--- |
| **VAL-MIX-01** | `BIJECTIVE_QUESTION_MAP` | **CRITICAL** | Tập hợp câu hỏi sau trộn phải là một **song ánh (1-to-1 bijection)** với tập câu hỏi đề gốc: $\text{Count}(Q_{\text{shuffled}}) = \text{Count}(Q_{\text{original}})$ và mọi ID câu hỏi đều xuất hiện duy nhất 1 lần. |
| **VAL-MIX-02** | `BIJECTIVE_OPTION_MAP` | **CRITICAL** | Đối với mỗi câu trắc nghiệm: Tập 4 phương án mới phải là hoán vị của 4 phương án gốc. Không được rơi rụng phương án nào. |
| **VAL-MIX-03** | `CORRECT_ANSWER_INTEGRITY`| **CRITICAL** | Phương án được gán cờ `isCorrect = true` trong câu hỏi mới phải mang đúng nội dung của phương án đúng trong câu hỏi gốc. Ma trận đáp án phải ghi nhận chính xác nhãn chữ cái mới ($A, B, C$ hoặc $D$). |
| **VAL-MIX-04** | `TF_STATE_CONSERVATION` | **CRITICAL** | Đối với câu Đúng/Sai: Trạng thái học thuật của từng nội dung ý con (Đúng hay Sai) phải giữ nguyên 100%, không bị đảo ngược. |
| **VAL-MIX-05** | `CHEM_FORMAT_FIDELITY` | **HIGH** | Đếm tổng số `vertAlign="subscript"` và `superscript` trước và sau khi trộn trong toàn bộ đề. Tỷ số phải đạt chính xác 1:1, không được rơi rụng bất kỳ chỉ số hóa học nào. |
| **VAL-MIX-06** | `DETERMINISTIC_SEED_VERIFY`| **CRITICAL** | Khi chạy trộn 2 lần với cùng một Seed (ví dụ `20260924`), toàn bộ mã băm (Hash SHA-256) của cấu trúc IR sinh ra phải khớp nhau từng bit. |

---

### 3.3. Phase 3: Post-Render OpenXML Validation (Kiểm thử File DOCX đầu ra)

| Mã luật | Tên luật | Mức độ | Điều kiện kiểm tra & Hành động |
| :--- | :--- | :--- | :--- |
| **VAL-DOC-01** | `ANSWER_LEAK_ZERO_CHECK` | **BLOCKER** | Quét toàn bộ `word/document.xml` của file học sinh: **Tuyệt đối không được chứa bất kỳ Run nào có `<w:u w:val="single"/>` trong các phương án hoặc ý con.** Không được chứa chuỗi đáp án ngắn `A. 200`. Nếu phát hiện $\rightarrow$ TIÊU HỦY FILE NGAY. |
| **VAL-DOC-02** | `EXAM_CODE_CONSISTENCY` | **CRITICAL** | Mã đề thi (ví dụ: `101`) trong bảng tiêu đề trang 1 và trong `word/footer1.xml` phải khớp nhau hoàn toàn. |
| **VAL-DOC-03** | `PAGE_NUMBER_FIELDS_CHECK`| **HIGH** | File `footer1.xml` bắt buộc phải chứa đúng 2 trường OpenXML dynamic fields: `<w:instrText>Page</w:instrText>` và `<w:instrText>NUMPAGES</w:instrText>`. |
| **VAL-DOC-04** | `XML_WELL_FORMEDNESS` | **BLOCKER** | Kiểm tra toàn bộ các file XML (`document.xml`, `styles.xml`, `footer1.xml`, `[Content_Types].xml`, `.rels`) có đúng chuẩn XML syntax (không thiếu thẻ đóng, ký tự đặc biệt `<`, `>`, `&` được escape đúng thành `&lt;`, `&gt;`, `&amp;`). |
| **VAL-DOC-05** | `PACKAGE_INTEGRITY_CHECK`| **BLOCKER** | Mở thử file ZIP đầu ra bằng trình đọc nhị phân chuẩn, xác thực mọi Relationship ID (`rId`) đều trỏ tới tệp tin tồn tại trong gói. |

---

## 4. BÁO CÁO KIỂM THỬ VÀ MÃ LỖI (DIAGNOSTIC ERROR CODES)

Khi Validation Engine phát hiện sự cố, hệ thống sẽ trả về đối tượng `ValidationResult` có cấu trúc:

```typescript
export interface ValidationIssue {
  code: string;               // Ví dụ: "VAL-PRE-03"
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL" | "BLOCKER";
  sectionIndex?: number;
  questionNumber?: number;
  message: string;
  recommendation: string;     // Hướng dẫn khắc phục cho giáo viên
}

export interface ValidationReport {
  isValid: boolean;
  totalErrors: number;
  totalWarnings: number;
  issues: ValidationIssue[];
}
```

### Ví dụ Báo cáo lỗi khi giáo viên quên gạch chân đáp án:
```json
{
  "isValid": false,
  "totalErrors": 1,
  "totalWarnings": 0,
  "issues": [
    {
      "code": "VAL-PRE-03",
      "severity": "CRITICAL",
      "sectionIndex": 1,
      "questionNumber": 5,
      "message": "Câu 5 trong Phần I không có phương án nào được gạch chân đáp án đúng.",
      "recommendation": "Vui lòng mở file gốc DeGocTron.docx, chọn đáp án đúng của Câu 5 và nhấn Ctrl+U (gạch chân) rồi thử lại."
    }
  ]
}
```
Cơ chế này giúp người dùng dễ dàng khắc phục lỗi ngay tại file Word gốc mà không cần phải hiểu sâu về kỹ thuật lập trình.
