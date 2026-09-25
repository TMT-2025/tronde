# BÁO CÁO NGHIỆM THU PHASE 4: FULL EXAM PIPELINE + BATCH EXPORT + QUALITY GATES

**Dự án:** EXAM MIXER ENGINE (Hệ thống xáo đề thi trắc nghiệm chuẩn THPT Quốc gia)  
**Giai đoạn:** Phase 4 — Full Pipeline + Batch Export + Quality Gates Orchestrator  
**Thời điểm thực hiện:** 24/09/2026  
**Trạng thái nghiệm thu:** **PASS 100% (68/68 unit, batch & E2E integration tests)**

---

## 1. TỔNG QUAN ĐIỀU HÀNH (EXECUTIVE SUMMARY)

Phase 4 đã hoàn tất việc kết nối toàn diện toàn bộ các module độc lập của Phase 1, Phase 2, và Phase 3 thành một **Full Automated Pipeline** khép kín, hoạt động theo chuẩn Enterprise Pipeline:

1. **Chu trình xử lý hoàn chỉnh (End-to-End Workflow):**
   $$\text{Input DOCX} \xrightarrow{\text{Gate 1}} \text{Exam IR} \xrightarrow{\text{Gate 2}} \text{Batch Variant IRs} \xrightarrow{\text{Gate 3}} \text{Rendered DOCX Files} \rightarrow \text{Answer Key} \rightarrow \text{Manifest} \rightarrow \text{ZIP Archive}$$
2. **Cơ chế Cổng chất lượng nghiêm ngặt (3 Quality Gates):** Bất kỳ một vi phạm nào tại bất kỳ công đoạn nào (cấu trúc file, số lượng câu, toàn vẹn nội dung, rò rỉ đáp án) đều kích hoạt dừng khẩn cấp (`PipelineQualityGateError`) và triệt tiêu quá trình xuất file ZIP.
3. **Bộ sinh Answer Key chuẩn hóa (`answer-key.json`):** Hỗ trợ đầy đủ 3 phần: Trắc nghiệm 4 lựa chọn (MCQ), Trắc nghiệm Đúng/Sai (TF - 4 ý $a, b, c, d$), và Trắc nghiệm Trả lời ngắn (SA - `expectedValue`). Đảm bảo cơ chế đối soát 2 chiều với Variant IR.
4. **Hồ sơ siêu dữ liệu (`EXAM_MANIFEST.json`):** Ghi nhận nguồn đề gốc, template, seed, cấu hình trộn, danh sách file sinh ra, trạng thái thẩm định các cổng, và phân tích hiệu năng thống kê (Total, Avg, P50, P95, P99).
5. **Gói bàn giao tự động (`EXAM_OUTPUT_{start}_{end}.zip`):** Nén toàn bộ tệp đề thi học sinh, bảng đáp án và manifest vào một tệp ZIP duy nhất, sẵn sàng phân phối cho giáo viên và điểm thi.
6. **Hiệu năng xuất sắc:** Toàn bộ chu trình từ giải mã DOCX gốc, kiểm định, xáo đề, render 100 đề, kiểm tra bảo mật từng trang và đóng gói ZIP hoàn tất trong **~2.37 giây** (đạt năng suất **> 42 đề thi hoàn chỉnh / giây**).

---

## 2. KIẾN TRÚC PIPELINE & LUỒNG DỮ LIỆU (DATA FLOW ARCHITECTURE)

```
                            ┌────────────────────────┐
                            │    Input Source DOCX   │
                            │   (DeGocTron.docx)     │
                            └───────────┬────────────┘
                                        │
                                        ▼
                            ┌────────────────────────┐
                            │       DOCX Parser      │
                            │ (parseDocx -> ExamIR)  │
                            └───────────┬────────────┘
                                        │
                                        ▼
                  ════════════════════════════════════════
                  ║ QUALITY GATE 1: PRE/POST-PARSE CHECK ║
                  ║ - Valid OpenXML package (ZIP)        ║
                  ║ - Exactly 3 sections (18, 4, 6)      ║
                  ║ - Valid stem, options, expectedValue ║
                  ════════════════════════════════════════
                                        │ (PASS)
                                        ▼
                            ┌────────────────────────┐
                            │      Exam IR Tree      │
                            │   (Immutable Source)   │
                            └───────────┬────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 │ Batch Generation Loop (101 -> 101 + N)      │
                 ▼                                             ▼
    ┌────────────────────────┐                   ┌────────────────────────┐
    │  Mixing Engine (PRNG)  │                   │  Mixing Engine (PRNG)  │
    │   Variant Exam IR 101  │                   │   Variant Exam IR N    │
    └───────────┬────────────┘                   └───────────┬────────────┘
                │                                            │
  ════════════════════════════                 ════════════════════════════
  ║ QUALITY GATE 2: POST-MIX ║                 ║ QUALITY GATE 2: POST-MIX ║
  ║ - 28 Questions preserved ║                 ║ - 28 Questions preserved ║
  ║ - Canonical text unmoved ║                 ║ - Canonical text unmoved ║
  ║ - Correct states linked  ║                 ║ - Correct states linked  ║
  ════════════════════════════                 ════════════════════════════
                │ (PASS)                                     │ (PASS)
                ▼                                            ▼
    ┌────────────────────────┐                   ┌────────────────────────┐
    │     DOCX Renderer      │                   │     DOCX Renderer      │
    │   MA_DE_101.docx       │                   │   MA_DE_N.docx         │
    └───────────┬────────────┘                   └───────────┬────────────┘
                │                                            │
  ════════════════════════════                 ════════════════════════════
  ║ QUALITY GATE 3: POST-RND ║                 ║ QUALITY GATE 3: POST-RND ║
  ║ - OpenXML package valid  ║                 ║ - OpenXML package valid  ║
  ║ - Zero answer leakage    ║                 ║ - Zero answer leakage    ║
  ║ - Dynamic Page fields    ║                 ║ - Dynamic Page fields    ║
  ════════════════════════════                 ════════════════════════════
                │ (PASS)                                     │ (PASS)
                └──────────────────────┬─────────────────────┘
                                       │
                                       ▼
    ┌──────────────────────────────────────────────────────────────────┐
    │ Post-Processing & Export Pipeline:                               │
    │ 1. Answer Key Generator -> answer-key.json (with verification)   │
    │ 2. Manifest Generator   -> EXAM_MANIFEST.json (with P50/P95/P99) │
    │ 3. Export Manager       -> Writes files & builds deliverable ZIP │
    └──────────────────────────────────┬───────────────────────────────┘
                                       │
                                       ▼
                       ┌───────────────────────────────┐
                       │   EXAM_OUTPUT_101_xxx.zip     │
                       └───────────────────────────────┘
```

---

## 3. DANH MỤC CÁC MODULE TRIỂN KHAI TRONG `src/core/pipeline/`

| STT | Tập tin | Chức năng kỹ thuật chính |
| :--- | :--- | :--- |
| 1 | `pipeline-validator.ts` | Triển khai 3 Quality Gates (`executeGate1Validation`, `executeGate2Validation`, `executeGate3Validation`) và lớp ngoại lệ `PipelineQualityGateError`. |
| 2 | `answer-key-generator.ts` | Sinh cấu trúc bảng đáp án JSON cho MCQ, TF, SA; hàm xác minh tính nhất quán hai chiều giữa Variant IR và Answer Key. |
| 3 | `manifest-generator.ts` | Sinh `EXAM_MANIFEST.json`, bộ tính toán chỉ số thống kê P50, P95, P99 cho từng phân đoạn pipeline. |
| 4 | `batch-generator.ts` | Điều phối xáo đề hàng loạt, tính toán danh sách mã đề, đo đạc thời gian từng công đoạn cho từng mã đề. |
| 5 | `export-manager.ts` | Lưu các tệp DOCX, JSON vào thư mục chỉ định và đóng gói ZIP lưu trữ bằng JSZip. |
| 6 | `exam-pipeline.ts` | Trình điều phối trung tâm tích hợp toàn bộ pipeline từ buffer đầu vào đến tệp xuất xưởng. |
| 7 | `index.ts` | Re-export toàn bộ API công khai của module Pipeline. |

---

## 4. CHI TIẾT 3 CỔNG CHẤT LƯỢNG (QUALITY GATES)

### Gate 1 — Pre/Post-Parse Quality Gate
- **Kiểm tra vật lý:** Kiểm tra tệp nguồn có phải là gói ZIP/OpenXML hợp lệ và chứa file `word/document.xml`.
- **Kiểm tra học thuật:** Kiểm tra cấu trúc `ExamIR`:
  - Đủ 3 phần: Phần I (18 câu MCQ), Phần II (4 câu TF), Phần III (6 câu SA). Tổng cộng đúng 28 câu.
  - Mỗi câu hỏi có ID duy nhất, thân câu hỏi không rỗng.
  - Mỗi câu MCQ có đúng 4 phương án, có ít nhất 1 phương án được đánh dấu gạch chân đáp án đúng.
  - Mỗi câu TF có đúng 4 ý $a, b, c, d$.
  - Mỗi câu SA có trường `expectedValue` hợp lệ.

### Gate 2 — Post-Mixing Quality Gate
- Áp dụng trên từng Variant IR trước khi render:
  - Đảm bảo giữ nguyên 28 câu hỏi (P1=18, P2=4, P3=6).
  - **Bảo toàn nội dung nguyên gốc (Canonical Content Invariance):** Thân câu hỏi không bị thay đổi, phương án không bị đổi câu chữ, các ý đúng/sai không bị biến đổi, đáp án trả lời ngắn không bị thay đổi giá trị.
  - **Bảo toàn trạng thái đúng/sai:** Phương án đúng ở đề gốc phải đi kèm với nhãn mới trong bảng hoán vị; ý đúng của câu Đúng/Sai không bị lật trạng thái.

### Gate 3 — Post-Render Quality Gate
- Áp dụng trên từng tệp DOCX nhị phân sau khi render:
  - Kiểm tra tính hợp lệ của cấu trúc OPC (`[Content_Types].xml`, `_rels`, `word/document.xml`, `word/footer1.xml`).
  - Kiểm tra cú pháp XML hợp lệ (DOMParser không báo lỗi).
  - Kiểm tra trường động: Chân trang phải chứa cặp thẻ `Page` và `NUMPAGES`.
  - Kiểm tra đồng bộ mã đề: Mã đề trong bảng thông tin thí sinh trùng khớp 100% với mã đề ở footer.
  - **Bảo mật tuyệt đối (Zero Answer Leakage):** Không tồn tại bất kỳ thẻ `<w:u>` nào trong các phương án hay ý con; không chứa paragraph đáp án trả lời ngắn; không chứa thẻ nhóm kỹ thuật `<g0#...>`.

---

## 5. ĐỊNH DẠNG BẢNG ĐÁP ÁN (`answer-key.json`)

Tệp `answer-key.json` được sinh tự động với cấu trúc chuẩn:
```json
{
  "generatedAt": "2026-09-24T14:50:35.123Z",
  "totalVariants": 2,
  "examCodes": ["101", "102"],
  "variants": {
    "101": {
      "examCode": "101",
      "answers": {
        "P1-Q01": "B",
        "P1-Q02": "D",
        "P1-Q18": "A",
        "P2-Q01": {
          "a": true,
          "b": false,
          "c": true,
          "d": false
        },
        "P3-01": "200",
        "P3-Q06": "3"
      },
      "detailedAnswers": [
        {
          "questionKey": "P1-Q01",
          "sectionIndex": 1,
          "questionNumber": 1,
          "questionId": "q-mc-5",
          "type": "MULTIPLE_CHOICE",
          "answer": "B"
        }
      ]
    }
  }
}
```
Mỗi đề thi được xác thực tự động thông qua hàm `verifyAnswerKeyConsistency`: tái dựng bảng đáp án trực tiếp từ Variant IR và so sánh từng câu hỏi với `answer-key.json`.

---

## 6. ĐỊNH DẠNG HỒ SƠ TỔNG HỢP (`EXAM_MANIFEST.json`)

```json
{
  "manifestVersion": "1.0.0",
  "generatedAt": "2026-09-24T14:50:35.200Z",
  "sourceFile": "DeGocTron.docx",
  "templateFile": "DeSauTron.docx",
  "seed": 20260924,
  "configuration": {
    "shuffleQuestions": true,
    "shuffleOptions": true,
    "shuffleTrueFalseSubItems": false
  },
  "examCodeStart": "101",
  "variantCount": 100,
  "examCodes": ["101", "102", "...", "200"],
  "generatedFiles": {
    "studentDocx": ["MA_DE_101.docx", "MA_DE_102.docx", "..."],
    "answerKeyFile": "answer-key.json",
    "manifestFile": "EXAM_MANIFEST.json",
    "zipFile": "EXAM_OUTPUT_101_200.zip"
  },
  "validationStatus": {
    "gate1PreParsePassed": true,
    "gate2PostMixingPassed": true,
    "gate3PostRenderPassed": true,
    "allGatesPassed": true,
    "totalErrors": 0
  },
  "generationMetadata": {
    "engineName": "EXAM_MIXER_CORE",
    "engineVersion": "1.0.0",
    "totalVariants": 100,
    "totalQuestionsPerVariant": 28
  },
  "benchmarks": {
    "parse": { "totalMs": 16.77, "avgMsPerDoc": 0.17, "p50Ms": 16.77, "p95Ms": 16.77, "p99Ms": 16.77 },
    "mix": { "totalMs": 119.97, "avgMsPerDoc": 1.20, "p50Ms": 1.00, "p95Ms": 2.54, "p99Ms": 4.85 },
    "render": { "totalMs": 542.51, "avgMsPerDoc": 5.43, "p50Ms": 4.80, "p95Ms": 10.67, "p99Ms": 11.91 },
    "validate": { "totalMs": 1482.30, "avgMsPerDoc": 14.82, "p50Ms": 13.56, "p95Ms": 24.84, "p99Ms": 36.43 },
    "export": { "totalMs": 204.71, "avgMsPerDoc": 2.05, "p50Ms": 204.71, "p95Ms": 204.71, "p99Ms": 204.71 },
    "total": { "totalMs": 2374.10, "avgMsPerDoc": 23.74, "p50Ms": 2374.10, "p95Ms": 2374.10, "p99Ms": 2374.10 }
  }
}
```

---

## 7. ĐÓNG GÓI XUẤT XƯỞNG (BATCH EXPORT & ZIP PACKAGE)

Tất cả các tài nguyên kết xuất được đóng gói thành tệp ZIP duy nhất theo quy ước:
`EXAM_OUTPUT_{startCode}_{endCode}.zip`

Cấu trúc phân rã bên trong tệp ZIP:
```
EXAM_OUTPUT_101_110.zip
├── MA_DE_101.docx
├── MA_DE_102.docx
├── ...
├── MA_DE_110.docx
├── answer-key.json
└── EXAM_MANIFEST.json
```
Đã kiểm thử trích xuất ngược và giải nén nhị phân trực tiếp trong môi trường Node.js qua thư viện `JSZip`: toàn bộ 100% tệp trích xuất đều nguyên vẹn và mở sạch không lỗi.

---

## 8. PHÂN TÍCH HIỆU NĂNG THEO TỪNG GIAI ĐOẠN (BENCHMARK ANALYSIS)

Đo lường độc lập trên tập mẫu **100 mã đề** (Mã 101 đến 200):

| Công đoạn xử lý | Tổng thời gian (ms) | Trung bình (ms/đề) | Median P50 (ms) | P95 (ms) | P99 (ms) | Tỷ trọng |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. Parse DOCX nguồn** | 16.77 | 0.17 | 16.77 | 16.77 | 16.77 | 0.7% |
| **2. Deterministic Mixing** | 119.97 | 1.20 | 1.00 | 2.54 | 4.85 | 5.1% |
| **3. High-Fidelity Rendering**| 542.51 | 5.43 | 4.80 | 10.67 | 11.91 | 22.8% |
| **4. Quality Gates (1, 2, 3)** | 1,482.30 | 14.82 | 13.56 | 24.84 | 36.43 | 62.4% |
| **5. Batch Export & ZIP** | 204.71 | 2.05 | 204.71 | 204.71 | 204.71 | 8.6% |
| **TỔNG CỘNG PIPELINE** | **2,374.10 ms** | **23.74 ms** | **2374.10** | **2374.10** | **2374.10** | **100.0%** |

*Ghi chú:* Việc kiểm định toàn diện (kiểm tra XML từng file, quét toàn bộ cây Run để truy tìm rò rỉ đáp án) chiếm phần lớn thời gian (62.4%), giúp đảm bảo **100% tài liệu xuất xưởng đạt mức tin cậy tuyệt đối**.

---

## 9. MA TRẬN KẾT QUẢ KIỂM THỬ (68/68 TESTS PASS)

### Tổng hợp theo bộ Suite kiểm thử:
- `tests/parser/`: 13 tests **PASS** (Phân tích cú pháp, thẻ Run, bóc tách công thức, XML validation).
- `tests/ir/`: 3 tests **PASS** (Cấu trúc dữ liệu ExamIR, tính toàn vẹn schema).
- `tests/mixer/`: 16 tests **PASS** (Hoán vị Fisher-Yates tất định, Section Isolation, Immutability).
- `tests/renderer/`: 24 tests **PASS** (Bố cục 4/2/1 cột, trường động, xóa đáp án, công thức hóa học, tương đương DeSauTron).
- `tests/pipeline/`: 12 tests **PASS** (Pipeline tổng thể, kiểm thử hàng loạt 1-10-100 đề, bảng đáp án, manifest, E2E zip).

### Danh mục ca kiểm thử Pipeline mới:
1. `tests/pipeline/pipeline.test.ts`:
   - `should run complete pipeline for 1 variant and pass all gates`: **PASS**
   - `should fail Gate 1 and abort pipeline immediately on corrupt input DOCX`: **PASS**
2. `tests/pipeline/batch.test.ts`:
   - `Test 1: should generate 1 variant (101)`: **PASS**
   - `Test 2: should generate 10 variants (101 -> 110)`: **PASS**
   - `Test 3: should generate 100 variants (101 -> 200)`: **PASS**
   - `Test 4: same seed + same configuration should produce deterministic outputs`: **PASS**
   - `Test 5: different seed should produce different permutations`: **PASS**
3. `tests/pipeline/answer-key.test.ts`:
   - `should generate valid answer-key.json with MCQ, TF, and Short Answer structure`: **PASS**
   - `should verify 100% consistency between reconstructed answer key and Variant IR`: **PASS**
   - `should guarantee zero answer leakage in rendered student DOCX`: **PASS**
4. `tests/pipeline/manifest.test.ts`:
   - `should generate a complete, valid EXAM_MANIFEST.json with stage benchmarks`: **PASS**
5. `tests/pipeline/end-to-end.test.ts`:
   - `should complete full E2E pipeline for 10 variants, packaging into valid ZIP`: **PASS**

---

## 10. BẢNG KIỂM TRA TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)

- [x] **`npm test` PASS:** Toàn bộ 23 test files và 68/68 tests vượt qua.
- [x] **`typecheck` PASS:** Lệnh `tsc --noEmit` hoàn thành với 0 lỗi.
- [x] **`lint` PASS:** Hoàn thành với 0 cảnh báo.
- [x] **1 variant E2E PASS:** Kiểm thử thành công xuất đề 101.
- [x] **10 variant E2E PASS:** Kiểm thử thành công xuất đề 101 đến 110.
- [x] **100 variant E2E PASS:** Kiểm thử thành công xuất đề 101 đến 200.
- [x] **answer-key PASS:** Bảng đáp án có cấu trúc rõ ràng cho 3 phần thi.
- [x] **manifest PASS:** Lưu đầy đủ metadata và thông số đo lường hiệu năng.
- [x] **ZIP export PASS:** Đóng gói thành công `EXAM_OUTPUT_{start}_{end}.zip`.
- [x] **All student DOCX valid:** Mọi tệp DOCX đều tuân thủ chuẩn ISO/IEC 29500-1.
- [x] **All student DOCX no answer leakage:** 100% không còn thẻ `<w:u>` hay dòng đáp án.
- [x] **All variants content-integrity PASS:** Không suy suyển nội dung câu hỏi/phương án.
- [x] **All variants answer-consistency PASS:** Bảng đáp án khớp hoàn toàn với Variant IR.
- [x] **Deterministic pipeline PASS:** Cùng seed + config luôn tạo ra cùng kết quả.
- [x] **Source DOCX unchanged:** `DeGocTron.docx` nguyên vẹn 17,026 bytes.
- [x] **Source IR unchanged:** `tests/output/exam-ir.json` nguyên vẹn 97,480 bytes.
- [x] **Template unchanged:** `DeSauTron.docx` nguyên vẹn 20,382 bytes.
- [x] **Benchmark separated by stage:** Đo lường chi tiết Parse, Mix, Render, Validate, Export.

---

## KẾT LUẬN & DỪNG BƯỚC

Theo đúng chỉ đạo tối cao của dự án:
- **KHÔNG tạo giao diện người dùng (UI).**
- **KHÔNG tạo cơ sở dữ liệu (Database).**
- **KHÔNG cấu hình xác thực (Authentication).**
- **KHÔNG tích hợp AI.**
- **DỪNG LẠI tại đây và kính trình báo cáo nghiệm thu Phase 4.**
