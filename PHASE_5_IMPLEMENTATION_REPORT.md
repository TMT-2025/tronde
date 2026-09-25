# BÁO CÁO NGHIỆM THU PHASE 5: EXAM MIXER APPLICATION UI + APPLICATION SERVICE

**Dự án:** EXAM MIXER ENGINE (Hệ thống xáo đề thi trắc nghiệm chuẩn THPT Quốc gia)  
**Giai đoạn:** Phase 5 — Application Layer + Teacher-Friendly Web UI + Job Service  
**Thời điểm thực hiện:** 25/09/2026  
**Trạng thái nghiệm thu:** **PASS 100% (93/93 unit, service, integration & HTTP E2E tests)**

---

## 1. TỔNG QUAN ĐIỀU HÀNH (EXECUTIVE SUMMARY)

Phase 5 đã xây dựng hoàn chỉnh **Application Layer & Web Interface** kết nối trực tiếp với Core Engine (Phase 1 → 4), tuân thủ tuyệt đối các nguyên tắc kiến trúc:

1. **Phân tách trách nhiệm (Separation of Concerns):**
   $$\text{Browser Web UI} \xrightarrow{\text{REST API}} \text{Application Service Layer} \xrightarrow{\text{Pipeline}} \text{Stable Core Engine}$$
   Giao diện người dùng (UI) hoàn toàn không truy cập trực tiếp OpenXML, DOCX internals, Mixing internals hay Renderer internals.
2. **Xử lý DOCX 100% Server-Side:** Toàn bộ quá trình giải mã OpenXML, phân tích cú pháp, trích xuất thuộc tính Run, hoán vị ma trận và render tệp Word đều diễn ra trên máy chủ nội bộ an toàn; trình duyệt chỉ nhận siêu dữ liệu phân tích và tệp thành phẩm.
3. **Mô hình Quản lý Tiến trình (ExamGenerationJob State Machine):** Quản lý chu trình sinh đề bất đồng bộ qua 9 trạng thái: `QUEUED`, `PARSING`, `VALIDATING`, `MIXING`, `RENDERING`, `VALIDATING_OUTPUT`, `PACKAGING`, `COMPLETED`, `FAILED`. Cập nhật thanh tiến trình theo thời gian thực (0% → 100%).
4. **Giao diện Trực quan Sư phạm (6 Khu vực Thao tác):**
   - Khu vực 1: Đề thi gốc (.docx) — Kéo thả, kiểm tra dung lượng và cấu trúc.
   - Khu vực 2: Mẫu định dạng (Template .docx) — Hỗ trợ mẫu mặc định chuẩn quốc gia A4 hoặc mẫu tùy chọn.
   - Khu vực 3: Cấu hình tạo đề — Số lượng mã đề, mã bắt đầu, seed tất định, tùy chọn xáo câu/phương án/ý Đúng-Sai.
   - Khu vực 4: Kết quả phân tích đề gốc (Analysis Preview) — Hiển thị tức thì 3 phần thi (18 câu MCQ, 4 câu TF, 6 câu SA = 28 câu) kèm hệ thống cảnh báo sư phạm.
   - Khu vực 5: Thực hiện trộn đề & Tiến độ thời gian thực — Thanh trạng thái từng bước.
   - Khu vực 6: Kết quả xuất xưởng — Hiển thị số đề đã tạo, tỷ lệ bảo mật 100% và 3 nút hành động: [TẢI GÓI ĐỀ THI (.ZIP)], [TẢI ĐÁP ÁN (JSON)], [XEM MANIFEST].
5. **Bảo mật & Phòng vệ Đa lớp (Sandboxing & Security):** Kiểm tra chữ ký ZIP magic bytes `PK\x03\x04`, xác thực MIME type, kiểm tra đuôi `.docx`, giới hạn dung lượng 50MB, khử độc tên tệp (ngăn chặn triệt để Path Traversal `../`, `..\`) và cô lập tệp đầu ra trong thư mục sandbox.
6. **Xử lý Lỗi Thân thiện (Error Handling):** Dịch các lỗi kỹ thuật thành thông điệp tiếng Việt dễ hiểu cho giáo viên, nêu rõ công đoạn phát sinh lỗi và câu hỏi bị ảnh hưởng; đồng thời cung cấp nút [Xem chi tiết kỹ thuật] cho quản trị viên.

---

## 2. KIẾN TRÚC TỔNG THỂ HỆ THỐNG

```
┌────────────────────────────────────────────────────────────────────────┐
│                   BROWSER WEB UI (Single-Page App)                     │
│  - Thiết kế Tailwind CSS + shadcn/ui aesthetic                         │
│  - Kéo thả file, xem phân tích 28 câu, cấu hình đề, theo dõi tiến độ   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP REST API (Fetch / Polling)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    APPLICATION HTTP SERVER (app-server.ts)             │
│  - GET  /                                (Phục vụ Web UI)              │
│  - POST /api/upload/source               (Tải & Phân tích đề gốc)      │
│  - POST /api/upload/template             (Tải & Xác thực mẫu)          │
│  - POST /api/jobs                        (Khởi tạo tiến trình)         │
│  - POST /api/jobs/:id/start              (Bắt đầu thực thi)            │
│  - GET  /api/jobs/:id                    (Lấy tiến độ thời gian thực)  │
│  - GET  /api/jobs/:id/download/zip       (Tải tệp ZIP thành phẩm)      │
│  - GET  /api/jobs/:id/download/answer-key(Tải bảng đáp án JSON)        │
│  - GET  /api/jobs/:id/manifest           (Xem hồ sơ thông số manifest) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION SERVICE LAYER                       │
│  ├── FileService            : Kiểm định MIME, Magic bytes, Sandbox     │
│  ├── ExamGenerationService  : Phân tích đề gốc & điều phối Pipeline    │
│  ├── ExamJobService         : Quản lý vòng đời tiến trình (In-Memory)  │
│  └── ResultService          : Cung cấp buffer ZIP, đáp án, manifest    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  STABLE CORE ENGINE (Phases 1 → 4)                     │
│  - DOCX Parser (run-parser, xml-utils)                                 │
│  - Exam IR (immutable tree structure)                                  │
│  - Deterministic Mixing Engine (PRNG, permutation, answer-mapper)      │
│  - High-Fidelity DOCX Renderer (layout-engine, dynamic-fields, cloner) │
│  - Quality Gates (Gate 1 Pre-Parse, Gate 2 Post-Mix, Gate 3 Post-Rnd)  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. DANH MỤC MODULE TRIỂN KHAI TRONG `src/application/` & `src/server/`

| STT | Tập tin | Trách nhiệm kỹ thuật |
| :--- | :--- | :--- |
| 1 | `src/application/types.ts` | Định nghĩa toàn bộ schema: `ExamGenerationJob`, `ExamJobStatus`, `ExamJobConfiguration`, `ExamJobProgress`, `ExamJobResult`, `ExamJobError`, `ExamAnalysisPreview`. |
| 2 | `src/application/file-service.ts` | Thẩm định tệp tải lên: extension `.docx`, MIME type, kích thước (<50MB), chữ ký magic bytes `0x50 0x4B 0x03 0x04`, thành phần `word/document.xml`, khử độc tên file và sandbox an toàn. |
| 3 | `src/application/exam-generation-service.ts` | Phân tích đề thi gốc, phát hiện cảnh báo định dạng (phương án dài, thân câu dài), kích hoạt Full Pipeline và cập nhật tiến độ (0% → 100%). |
| 4 | `src/application/exam-job-service.ts` | Quản lý tiến trình (Job Service): khởi tạo job `QUEUED`, kiểm tra tính hợp lệ cấu hình, khởi chạy bất đồng bộ, tra cứu và liệt kê job. |
| 5 | `src/application/result-service.ts` | Đọc và trích xuất tài nguyên xuất xưởng: tệp ZIP nhị phân, bảng đáp án `answer-key.json`, hồ sơ `EXAM_MANIFEST.json`. |
| 6 | `src/application/index.ts` | Re-export API công khai của Application Layer. |
| 7 | `src/ui/exam-mixer-ui.ts` | Mã nguồn giao diện Single-Page Application (HTML/Tailwind CSS/Inter Font/JavaScript) tối ưu cho giáo viên. |
| 8 | `src/server/app-server.ts` | HTTP Server cung cấp đầy đủ các REST API và phục vụ Web UI. |
| 9 | `src/server/cli.ts` | Điểm vào khởi chạy server qua lệnh `npm start`. |

---

## 4. CHI TIẾT MÔ HÌNH TIẾN TRÌNH (JOB STATE MACHINE)

Vòng đời của một yêu cầu sinh đề thi được quản lý chặt chẽ:
```
           [ Khởi tạo Job ]
                  │
                  ▼
              [ QUEUED ] (0%)
                  │
                  ▼ (startJob)
             [ PARSING ] (10%)
                  │
                  ▼
            [ VALIDATING ] (20%) ──(Lỗi Gate 1)──► [ FAILED ]
                  │ (Hợp lệ)
                  ▼
              [ MIXING ] (40%) ───(Lỗi Gate 2)──► [ FAILED ]
                  │ (Hợp lệ)
                  ▼
            [ RENDERING ] (65%) ──(Lỗi Gate 3)──► [ FAILED ]
                  │ (Hợp lệ)
                  ▼
        [ VALIDATING_OUTPUT ] (80%)
                  │
                  ▼
            [ PACKAGING ] (95%)
                  │
                  ▼
            [ COMPLETED ] (100%)
```

---

## 5. THIẾT KẾ GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (UI/UX)

Giao diện được bố trí khoa học, tinh tế và tập trung vào giáo viên:
- **Khu vực 1 — Đề thi gốc (.docx):** Vùng kéo thả hiện đại với biểu tượng rõ ràng. Khi chọn tệp, hệ thống tự động gửi yêu cầu phân tích và hiển thị thông tin tệp.
- **Khu vực 2 — Mẫu định dạng (Template):** Tùy chọn giữ nguyên mẫu A4 chuẩn Bộ GD&ĐT (2 trang in) hoặc nạp mẫu của trường/sở.
- **Khu vực 3 — Cấu hình:** Nhập số mã đề, mã bắt đầu, seed tất định, 3 tùy chọn xáo trộn độc lập với giải thích dễ hiểu.
- **Khu vực 4 — Phân tích đề gốc:** Trực quan hóa 3 thẻ thông tin: Phần I (18 câu trắc nghiệm), Phần II (4 câu đúng/sai), Phần III (6 câu ngắn). Tổng: 28 câu. Hộp cảnh báo màu hổ phách cảnh báo tự động khi có câu hỏi/phương án dài sẽ được tự động dồn 1 cột.
- **Khu vực 5 — Thực hiện trộn đề:** Nút bấm nổi bật; khi bắt đầu, thanh tiến trình hiển thị tỷ lệ % và dòng trạng thái chi tiết theo từng bước xử lý.
- **Khu vực 6 — Kết quả xuất xưởng:** Khung viền xanh lá trang trọng, hiển thị 4 chỉ số (Số mã đề, Số DOCX, Bảo mật đáp án 100%, Dung lượng ZIP) cùng 3 nút tải xuống tức thì.
- **Cửa sổ xem Manifest:** Modal hiển thị toàn bộ thông số chi tiết cấu hình và thời gian xử lý (P50, P95, P99).

---

## 6. BẢO MẬT & KIỂM ĐỊNH TỆP (SECURITY & SANDBOXING)

Hệ thống triển khai 5 lớp kiểm soát bảo mật:
1. **Kiểm tra đuôi tệp:** Chỉ chấp nhận `.docx` (case-insensitive).
2. **Kiểm tra định dạng nội dung:** Chỉ chấp nhận MIME types hợp lệ của tài liệu Word và ZIP.
3. **Kiểm tra chữ ký số học (Magic Bytes):** 4 bytes đầu tiên phải là `0x50 0x4B 0x03 0x04` (PK header).
4. **Kiểm tra gói nội bộ:** Bắt buộc phải chứa `word/document.xml`.
5. **Khử độc tên tệp & Ngăn chặn Path Traversal:** Loại bỏ toàn bộ ký tự `..`, `/`, `\`, null bytes `\0`, ký tự điều khiển ASCII; cô lập mọi tệp tải lên và tệp đầu ra trong thư mục `output/sandbox/`.

---

## 7. MA TRẬN KẾT QUẢ KIỂM THỬ (93/93 TESTS PASS)

Hệ thống đã trải qua quy trình kiểm thử tự động toàn diện với **93 tests** trên **28 test files**:

### Bộ kiểm thử Application & UI mới (25 tests):
1. `tests/application/file-service.test.ts` (8 tests): **PASS**
   - Chấp nhận DOCX hợp lệ; từ chối file `.txt`, `.pdf`, `.exe`, file rỗng, file không có chữ ký ZIP, file thiếu `document.xml`.
   - Khử độc tên file chống Path Traversal (`../../etc/passwd.docx` -> `passwd.docx`).
   - Kiểm soát sandbox an toàn.
2. `tests/application/generation-service.test.ts` (3 tests): **PASS**
   - Phân tích cấu trúc đề gốc: 18 câu Phần I, 4 câu Phần II, 6 câu Phần III, tổng 28 câu.
   - Phát hiện cảnh báo bố cục phương án dài.
   - Chạy tiến trình job với theo dõi tiến độ (10%, 20%, 40%, 65%, 80%, 95%, 100%).
   - Bắt và chuyển ngữ lỗi kỹ thuật sang giao diện giáo viên.
3. `tests/application/job-service.test.ts` (6 tests): **PASS**
   - Kiểm định tham số cấu hình: từ chối số mã đề < 1, float, > 500, mã đề rỗng, seed NaN.
   - Vòng đời job: tạo, lấy, liệt kê và dọn dẹp job.
4. `tests/application/result-service.test.ts` (2 tests): **PASS**
   - Báo lỗi `ResultNotFoundError` khi truy cập job không tồn tại hoặc chưa xong.
   - Trích xuất thành công ZIP buffer, Answer Key JSON, Manifest JSON của job hoàn thành.
5. `tests/ui/server-integration.test.ts` (6 tests): **PASS**
   - Phục vụ Web UI với HTTP 200 tại `GET /`.
   - Kiểm tra sức khỏe `GET /api/health`.
   - Tải lên và phân tích đề gốc qua REST API.
   - Từ chối tệp không hợp lệ với mã 400.
   - Tạo job, kích hoạt, polling tiến độ đến khi hoàn tất và tải về tệp ZIP, Answer Key, Manifest.
   - Xử lý 404 cho các tài nguyên không tồn tại.

### Tính ổn định của Core Engine (68 tests):
- Toàn bộ 68 tests của Phase 1, 2, 3, 4 tiếp tục **PASS 100%**, không xảy ra bất kỳ hồi quy (regression) nào.

---

## 8. BẢNG KIỂM TRA TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)

- [x] **`npm test` PASS:** 93/93 tests vượt qua trên 28 test files.
- [x] **`typecheck` PASS:** `tsc --noEmit` hoàn thành với 0 lỗi.
- [x] **`lint` PASS:** 0 cảnh báo lint.
- [x] **Core 68 tests vẫn PASS:** Không có hồi quy mã nguồn lõi.
- [x] **Upload source DOCX:** Kéo thả & duyệt file, hiển thị tên, kích thước, kiểm tra hợp lệ.
- [x] **Upload template DOCX:** Hỗ trợ nạp template tùy chọn hoặc dùng chuẩn A4 mặc định.
- [x] **Preview 28 questions:** Hiển thị tức thì 18 MCQ, 4 TF, 6 SA, tổng 28 câu.
- [x] **Configuration:** Cấu hình số mã đề, mã bắt đầu, seed, 3 tùy chọn xáo trộn.
- [x] **Generate variants:** Sinh đề tất định qua Application Service.
- [x] **Progress:** Thanh tiến trình trực quan cập nhật theo thời gian thực (0% → 100%).
- [x] **Result:** Khung kết quả hiển thị thông số và trạng thái sẵn sàng in ấn.
- [x] **Download ZIP:** Tải gói đề thi đầy đủ chỉ với 1 cú click.
- [x] **Download Answer Key:** Tải bảng đáp án `answer-key.json` chuẩn hóa.
- [x] **Error handling:** Thông điệp tiếng Việt thân thiện kèm nút xem chi tiết kỹ thuật.
- [x] **No core regression:** Mã nguồn `src/core/` được bảo vệ bất biến.

---

## KẾT LUẬN & DỪNG BƯỚC

Theo đúng chỉ đạo tối cao của dự án:
- **KHÔNG kết nối database.**
- **KHÔNG cài đặt authentication.**
- **KHÔNG tích hợp AI.**
- **KHÔNG xây dựng ngân hàng câu hỏi (question bank).**
- **DỪNG LẠI tại đây và kính trình báo cáo nghiệm thu Phase 5.**
