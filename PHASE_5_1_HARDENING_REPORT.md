# BÁO CÁO KIỂM THỬ THỰC TẾ & TỐI ƯU HÓA SẢN XUẤT (PHASE 5.1 HARDENING & REAL-WORLD QA)

**Dự án:** EXAM MIXER ENGINE (Hệ thống xáo đề thi trắc nghiệm chuẩn THPT Quốc gia)  
**Giai đoạn:** Phase 5.1 — Production Hardening & Real-World QA  
**Thời điểm thực hiện:** 25/09/2026  
**Trạng thái kiểm thử:** **PASS 100% (120/120 tests trên 35 test suites)**

---

## 1. RUNTIME QA (KIỂM ĐỊNH CHU TRÌNH VẬN HÀNH THỰC TẾ)

Đã thẩm định thành công luồng nghiệp vụ thực tế từ đầu đến cuối thông qua máy chủ HTTP và tệp đề thi thực tế [`DeGocTron.docx`](file:///e:/.%20UNG%20DUNG%20MOI/TRON%20DE/DeGocTron.docx):
1. **Khởi chạy máy chủ Web:** Máy chủ HTTP khởi tạo thành công trên cổng ngẫu nhiên và `http://localhost:3000`. Phục vụ giao diện người dùng đơn trang hoàn chỉnh với mã trạng thái `200 OK`.
2. **Nạp & Bóc tách Đề gốc (`DeGocTron.docx`):** Endpoint `POST /api/upload/source` phân tích nhị phân OpenXML trong 6.6 ms, phát hiện chính xác tiêu đề `"KIỂM TRA CHƯƠNG ESTER - LIPID"`, cấu trúc 3 phần ($18 + 4 + 6 = 28$ câu hỏi), kiểm định Gate 1 đạt `isValid: true`, không có lỗi.
3. **Cấu hình & Khởi tạo Tiến trình (Job Creation):** Endpoint `POST /api/jobs` tiếp nhận thông số (4 mã đề: 101, 102, 103, 104; seed: 20260925), khởi tạo thực thể `ExamGenerationJob` ở trạng thái `QUEUED`.
4. **Theo dõi Tiến trình Thời gian Thực (Live Polling):** Giao diện định kỳ polling `GET /api/jobs/:id`, cập nhật tỷ lệ phần trăm từ 0% qua 10%, 20%, 40%, 65%, 80%, 95% đến 100% kèm thông điệp nghiệp vụ tương ứng của từng công đoạn.
5. **Tải xuống & Giải nén Tệp ZIP:** Endpoint `GET /api/jobs/:id/download/zip` trả về tệp `EXAM_OUTPUT_101_104.zip`. Giải nén nhị phân qua JSZip xác thực chứa đủ 4 tệp DOCX học sinh (`MA_DE_101.docx` đến `MA_DE_104.docx`), bảng đáp án `answer-key.json` và hồ sơ `EXAM_MANIFEST.json`.
6. **Mở tệp Word thành phẩm:** Tất cả các tệp DOCX trích xuất đều mở sạch, hợp lệ chuẩn OpenXML ISO/IEC 29500-1, mã đề đồng bộ và không chứa bất kỳ dấu vết rò rỉ đáp án nào.

---

## 2. SECURITY QA (THẨM ĐỊNH BẢO MẬT & PHÒNG VỆ ĐẦU VÀO)

Đã thực hiện kiểm thử fuzzing và phòng vệ tấn công đối với tệp tải lên (12 kịch bản kiểm thử tại `tests/hardening/security-hardening.test.ts`):

| Kịch bản tấn công / Dữ liệu bất thường | Hành vi mong đợi | Kết quả kiểm thử | Mã lỗi / Biện pháp xử lý |
| :--- | :--- | :---: | :--- |
| **Path Traversal tương đối (`../evil.docx`)** | Khử độc tên file, không lưu ngoài thư mục | **PASS** | Tên tệp chuyển thành `evil.docx` |
| **Windows Path Traversal (`..\evil.docx`)** | Khử dấu gạch chéo ngược Windows | **PASS** | Tên tệp chuyển thành `evil.docx` |
| **Nested Traversal (`....//evil.docx`)** | Loại bỏ chuỗi chấm lặp và gạch chéo kép | **PASS** | Tên tệp chuyển thành `evil.docx` |
| **Tấn công Null Byte (`exploit\0.docx`)** | Cắt bỏ ký tự `\0` và ký tự điều khiển ASCII | **PASS** | Tên tệp chuyển thành `exploit.docx` |
| **Thoát vùng Sandbox (`../../../../boot.ini`)** | Chặn đứng hành vi truy xuất ngoài root sandbox | **PASS** | Ném lỗi `ERR_PATH_TRAVERSAL` |
| **Giả mạo DOCX (File văn bản đổi đuôi .docx)** | Kiểm tra chữ ký số học (Magic Bytes) | **PASS** | Từ chối với lỗi `ERR_NOT_A_ZIP` |
| **Tệp ZIP đổi tên (Thiếu `word/document.xml`)** | Kiểm tra cấu trúc gói OpenXML | **PASS** | Từ chối với lỗi `ERR_MISSING_DOCUMENT_XML` |
| **Tệp ZIP bị hỏng (Corrupted ZIP header)** | Bắt lỗi giải nén nhị phân | **PASS** | Ném lỗi `ERR_CORRUPT_ARCHIVE` an toàn |
| **Tệp quá tải dung lượng (> 50 MB)** | Kiểm tra dung lượng trước khi đọc sâu | **PASS** | Từ chối ngay với lỗi `ERR_FILE_TOO_LARGE` |
| **MIME type không hợp lệ (`.exe`, `.msi`)** | Kiểm tra Header Content-Type | **PASS** | Từ chối với lỗi `ERR_INVALID_MIME` |
| **Tệp rỗng (0 bytes)** | Kiểm tra kích thước tối thiểu | **PASS** | Từ chối với lỗi `ERR_EMPTY_FILE` |
| **XML trong DOCX bị hỏng cú pháp thẻ** | Ngắt tại Gate 1, không gây crash máy chủ | **PASS** | Bắt ngoại lệ và ghi nhận vào lỗi tiến trình |

*Không có bất kỳ trường hợp nào gây sập máy chủ (Server Crash) hoặc rò rỉ dữ liệu ngoài sandbox.*

---

## 3. DOCX VISUAL QA (KIỂM ĐỊNH TRỰC QUAN & ĐỊNH DẠNG TÀI LIỆU WORD)

Kiểm tra chi tiết từng thuộc tính trong cây XML của tài liệu DOCX xuất xưởng (`tests/hardening/docx-visual-qa.test.ts`):
1. **Mã đề (Exam Code):** Hiển thị chuẩn xác tại ô thứ 3 của Bảng thông tin thí sinh (`Mã đề 101`, in đậm, căn giữa) và tại Chân trang (`word/footer1.xml`). Giá trị trùng khớp 100%.
2. **Khung tiêu đề & Bảng học sinh:** Cấu trúc 3 cột có độ rộng `6123` dxa, `2041` dxa, `2041` dxa; nét gạch chân bảng `w:sz="12"` nét đơn đen 1.5 pt.
3. **Chân trang & Trường số trang động:** Chứa cấu trúc OpenXML `w:fldChar` hoàn chỉnh với `Page` và `NUMPAGES` tại vị trí tab căn phải `pos="10489"`. Word tự động tính toán tổng số trang (`Trang 1/2`, `Trang 2/2`) mà không bị cố định tĩnh.
4. **Khổ giấy & Căn lề A4:** Khổ giấy A4 (`11906` x `16838` dxa); Lề trái 2.0 cm (`1134` dxa) phục vụ đóng ghim thi; Lề trên, dưới, phải chuẩn 1.0 cm (`567` dxa).
5. **Hệ thống dồn dòng phương án (Layout Engine):**
   - **Bố cục 4 cột (1 dòng):** Áp dụng cho câu ngắn (<= 18 ký tự) với 4 tab stops `283`, `2906`, `5528`, `8150`.
   - **Bố cục 2 cột (2 dòng):** Áp dụng cho câu trung bình (<= 45 ký tự) với 2 tab stops `283`, `5528`.
   - **Bố cục 1 cột (4 dòng):** Áp dụng cho câu dài (> 45 ký tự) với thụt lề `283` dxa.
6. **Bảo tồn chỉ số hóa học (Subscript/Superscript):** Toàn bộ hơn 50 thẻ `<w:vertAlign w:val="subscript"/>` cho $CH_3COOC_2H_5$, $(C_{17}H_{35}COO)_3C_3H_5$, $C_n H_{2n} O_2$, $C_n H_{2n-2} O_2$, $CO_2$, $H_2O$ được giữ nguyên vẹn.
7. **Định dạng câu hỏi Đúng/Sai:** Các ý con $a), b), c), d)$ có style `YoungMixChar`, nhãn in đậm, thụt lề tab `283` dxa.
8. **Định dạng câu hỏi Trả lời ngắn:** Toàn bộ dòng đáp án của giáo viên trong đề gốc bị loại bỏ triệt để trong tài liệu học sinh.
9. **Khử rò rỉ đáp án (Zero Answer Leakage):** Hoàn toàn không còn bất kỳ thẻ `<w:u w:val="single"/>` nào trong các phương án hay ý con.

---

## 4. DETERMINISM QA (KIỂM ĐỊNH TÍNH TẤT ĐỊNH CỦA ĐỘNG CƠ)

Thực hiện kiểm thử đối chứng hai chu trình độc lập hoàn toàn với cùng tham số:
- **Đề gốc:** `DeGocTron.docx` | **File mẫu:** `DeSauTron.docx`
- **Seed:** `888888` | **Mã bắt đầu:** `101` | **Số lượng:** 5 mã đề

**Kết quả đối soát:**
- Tệp `answer-key.json` của Run A và Run B: **Trùng khớp 100% từng byte (Byte-for-byte identical).**
- Nội dung `word/document.xml` của cả 5 mã đề: **Trùng khớp 100% từng ký tự XML.**
- Chân trang `word/footer1.xml` của cả 5 mã đề: **Trùng khớp 100% từng ký tự XML.**
- Cấu hình manifest và bảng ánh xạ hoán vị: **Trùng khớp tuyệt đối.**

---

## 5. STRESS BENCHMARK (ĐO LƯỜNG HIỆU NĂNG TẢI THỰC TẾ)

Đo lường năng lực xử lý thực tế trên môi trường máy chủ (`tests/hardening/stress-benchmark.test.ts`):

| Quy mô kiểm thử | Tổng thời gian (ms) | Tốc độ TB (ms/đề) | Mức tăng RAM (Heap Delta) | Dung lượng ZIP | Tỷ lệ lỗi / Vi phạm Gate |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **10 Mã đề** | 320.4 ms | 32.04 ms | 10.60 MB | 161.0 KB | 0 lỗi / 0 gate fail |
| **100 Mã đề** | 1,691.3 ms | 16.91 ms | 24.74 MB | 1.59 MB | 0 lỗi / 0 gate fail |
| **500 Mã đề** | 5,698.2 ms | 11.40 ms | 41.74 MB | 7.78 MB | 0 lỗi / 0 gate fail |

### Phân tích ngưỡng tải (Scalability Boundary):
- **Khả năng chịu tải đã kiểm chứng:** Hệ thống xử lý an toàn mượt mà tới **500 mã đề** trong ~5.7 giây với mức tiêu thụ RAM bổ sung chỉ ~42 MB.
- **Giới hạn an toàn khuyến nghị:** Trong Phase 5, giới hạn cấu hình ở mức **500 mã đề / lượt xử lý** là tối ưu để đảm bảo không vượt quá giới hạn bộ nhớ của tiến trình Node.js đơn luồng.

---

## 6. ERROR RECOVERY (KHẢ NĂNG PHỤC HỒI & XỬ LÝ LỖI)

Kiểm tra khả năng tự phục hồi và phản hồi lỗi nghiệp vụ (`tests/hardening/error-recovery.test.ts`):
1. **Lỗi cấu hình người dùng:** Nhập số mã đề $\le 0$, số mã đề $> 500$, mã bắt đầu để trống, seed không phải số: Hệ thống bắt lỗi tại tầng Application Service và trả về thông báo lỗi cụ thể qua trường input mà không gọi đến Core Engine.
2. **Lỗi tệp nguồn hỏng:** Khi đưa tệp giả mạo hoặc cấu trúc không hợp lệ: Pipeline ngắt tại Quality Gate 1, trạng thái job chuyển sang `FAILED`, không tạo tệp ZIP rác.
3. **Cố gắng tải file khi chưa hoàn thành:** Gửi request tải ZIP khi job đang ở trạng thái `QUEUED` hoặc `MIXING`: Máy chủ phản hồi mã lỗi `404 Not Found` kèm thông điệp `"Tiến trình chưa hoàn thành"`.
4. **Mã tiến trình không tồn tại:** Yêu cầu job ID không hợp lệ: Phản hồi `404 Not Found` kèm thông điệp `"Mã tiến trình không tồn tại"`.
5. **Khả năng sống sót của máy chủ:** Sau chuỗi các request lỗi liên tục, máy chủ vẫn giữ vững trạng thái hoạt động bình thường, không xảy ra rò rỉ bộ nhớ hoặc Unhandled Rejection.

---

## 7. UX QA (RÀ SOÁT TRẢI NGHIỆM SƯ PHẠM)

Đã rà soát và điều chỉnh giao diện người dùng tiếng Việt:
1. **Loại bỏ phát ngôn thiếu kiểm chứng:** Thay thế dòng chữ *"Bảo mật đáp án: 100% Khử"* và *"Bảo mật tuyệt đối"* bằng phát ngôn dựa trên bằng chứng kỹ thuật: **`Kiểm định bảo mật: PASS (Gate 3)`** và **`Quy chuẩn in ấn 2 trang & Kiểm định bảo mật (Gate 3)`**.
2. **Thuật ngữ sư phạm thân thiện:** Bố trí 6 bước rõ ràng, sử dụng ngôn ngữ quen thuộc với giáo viên THPT (Đề gốc, Mẫu định dạng, Số mã đề, Trộn câu, Trộn phương án, Bảng đáp án).
3. **Trạng thái giao diện tương tác:** Nút *"BẮT ĐẦU TRỘN ĐỀ"* tự động vô hiệu hóa (disabled) khi chưa nạp đề gốc và hiển thị dòng hướng dẫn nhắc nhở; tự động kích hoạt khi đề gốc phân tích hợp lệ.
4. **Hộp thông báo lỗi sư phạm:** Ẩn toàn bộ stack trace kỹ thuật phức tạp đối với giáo viên, chỉ hiển thị thông điệp ngắn gọn dễ hiểu; đồng thời cung cấp nút *"Xem chi tiết kỹ thuật"* để mở rộng khi cần hỗ trợ từ bộ phận IT.

---

## 8. REGRESSION RESULTS (KẾT QUẢ KIỂM THỬ HỒI QUY)

Toàn bộ các lệnh kiểm định chất lượng mã nguồn đều hoàn thành xuất sắc:

```
> npx vitest run
Test Files  35 passed (35)
     Tests  120 passed (120)
  Duration  ~14.0s

> npm run typecheck (tsc --noEmit)
Code 0: 0 errors

> npm run lint (tsc --noEmit)
Code 0: 0 errors

> npm run build (tsc)
Code 0: Hoàn tất xuất xưởng sang thư mục dist/
```

- Toàn bộ 68 tests của Phase 1, 2, 3, 4: **100% PASS.**
- Toàn bộ 25 tests của Phase 5: **100% PASS.**
- Toàn bộ 27 tests mới của Phase 5.1 Hardening: **100% PASS.**

---

## 9. KNOWN LIMITATIONS (GIỚI HẠN ĐÃ BIẾT)

1. **Giới hạn số mã đề trong 1 phiên:** Đặt ngưỡng tối đa là 500 mã đề / lượt xử lý để tránh nghẽn luồng sự kiện (Event Loop) của Node.js.
2. **Bộ nhớ lưu trữ tiến trình (In-Memory Job Store):** Do tuân thủ nguyên tắc không tạo Database ở Phase 5, danh sách các job được lưu trữ tạm thời trong RAM máy chủ; khi khởi động lại máy chủ, lịch sử các job cũ sẽ được giải phóng.
3. **Định dạng bảng biểu phức tạp trong câu hỏi:** Hệ thống hiện xử lý tối ưu văn bản, đoạn văn, công thức hóa học có chỉ số trên/dưới. Với các câu hỏi chứa bảng số liệu phức tạp (nested table), hệ thống bảo lưu nguyên vẹn XML nhưng khuyến nghị giáo viên kiểm tra trực quan bố cục trang in.

---

## 10. TECHNICAL DEBT (NỢ KỸ THUẬT CẦN GIẢI QUYẾT)

1. **Worker Threads / Cluster Worker:** Khi người dùng sinh từ 500 mã đề trở lên, việc tính toán PRNG và nén JSZip diễn ra trên Main Event Loop. Cần đưa vào Worker Thread ở các phiên bản sau để giải phóng Event Loop.
2. **Dọn dẹp tự động tệp tạm trong Sandbox:** Thư mục `output/sandbox/` lưu trữ các tệp tải lên và tệp xuất bản; cần bổ sung cơ chế định kỳ (Cron/TTL) tự động xóa tệp tạm sau 24 giờ.
3. **Chunked Streaming cho tệp tải lên lớn:** Hiện tại endpoint `/api/upload/source` gom buffer trong bộ nhớ; nên chuyển sang Stream parser khi triển khai trên hạ tầng cloud phân tán.

---

## 11. KHUYẾN NGHỊ CHO PHASE TIẾP THEO (RECOMMENDED NEXT PHASE)

Sau khi Phase 5.1 hoàn tất xuất sắc quá trình tôi luyện sản phẩm, kiến trúc đã đạt độ chín muồi để chuyển giao:
- **Phase 6 — Production Deployment & Cloud Packaging:** Đóng gói Docker Container nhẹ, cấu hình biến môi trường production, tích hợp reverse proxy Nginx, thiết lập cơ chế dọn dẹp bộ nhớ định kỳ và tài liệu hướng dẫn vận hành cho nhà trường.

---

## KẾT LUẬN

Hệ thống **EXAM MIXER** tại mốc **Phase 5.1** đã vượt qua tất cả các tiêu chí kiểm thử nghiêm ngặt nhất về:
- Tính đúng đắn của đề thi và bảng đáp án.
- Bảo mật khử dấu vết gạch chân.
- Khả năng chịu tải thực tế (500 đề thi trong 5.7s).
- Tính an toàn trước các cuộc tấn công khai thác tệp tin.

Tuân thủ nghiêm ngặt chỉ đạo: **Tôi đã DỪNG LẠI tại đây, không tự ý chuyển sang Phase 6. Kính trình toàn bộ Báo cáo Kiểm thử Thực tế Phase 5.1 để bạn phê duyệt!**
