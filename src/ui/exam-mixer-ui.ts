/**
 * Generates the full HTML/CSS/JS Single-Page Application for EXAM MIXER UI
 * Styled with Tailwind CSS, modern aesthetic, and user-friendly onboarding guide.
 */
export function getExamMixerUiHtml(): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EXAM MIXER — Phần Mềm Xáo Đề Thi Chuẩn THPT</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top: 3px solid #ffffff;
      width: 20px;
      height: 20px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .tab-btn.active {
      border-bottom-color: #2563eb;
      color: #1d4ed8;
      font-weight: 700;
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen">
  <!-- Top Navigation Bar -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20">
          EM
        </div>
        <div>
          <h1 class="text-lg font-bold text-slate-900 leading-tight">EXAM MIXER</h1>
          <p class="text-xs text-slate-500 font-medium">Hệ thống tạo đề trắc nghiệm chuẩn THPT Quốc gia</p>
        </div>
      </div>
      <div class="flex items-center gap-2 sm:gap-3">
        <a href="/api/sample-exam" download="DeThiMau_ChuongEsterLipid.docx" class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors" title="Tải tệp đề thi mẫu Word (.docx) để tham khảo">
          <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          <span>Tải đề mẫu (.docx)</span>
        </a>
        <button id="open-guide-modal-btn-header" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors">
          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          <span>Hướng dẫn &amp; Tính năng</span>
        </button>
        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
          v1.0 Ready
        </span>
      </div>
    </div>
  </header>

  <!-- Main Content Container -->
  <main class="max-w-6xl mx-auto px-4 py-8">
    
    <!-- Onboarding Guide Banner (Dành cho người mới sử dụng) -->
    <div class="mb-8 p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200 rounded-2xl shadow-sm">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white uppercase tracking-wider">Chào mừng thầy/cô</span>
            <h2 class="text-base font-bold text-slate-900">4 bước đơn giản để tạo các mã đề thi chuẩn in ấn</h2>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-slate-600 mt-2">
            <div class="p-2 bg-white/80 rounded-lg border border-blue-100">
              <span class="font-bold text-blue-700">1. Chuẩn bị đề gốc:</span> Gạch chân (<u>Ctrl+U</u>) đáp án đúng trong đề Word (.docx).
            </div>
            <div class="p-2 bg-white/80 rounded-lg border border-blue-100">
              <span class="font-bold text-blue-700">2. Nạp đề thi:</span> Kéo thả tệp vào ô hoặc chọn đề mẫu để hệ thống phân tích.
            </div>
            <div class="p-2 bg-white/80 rounded-lg border border-blue-100">
              <span class="font-bold text-blue-700">3. Cấu hình:</span> Nhập số lượng đề con cần sinh (ví dụ: 4 mã: 101, 102, 103, 104).
            </div>
            <div class="p-2 bg-white/80 rounded-lg border border-blue-100">
              <span class="font-bold text-blue-700">4. Trộn đề &amp; Tải về:</span> Bấm trộn và tải ngay gói ZIP chứa file Word + Bảng đáp án.
            </div>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0 w-full md:w-auto">
          <button id="quick-try-sample-btn" class="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            <span>Thử ngay với Đề mẫu</span>
          </button>
          <button id="open-guide-modal-btn" class="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-sm flex items-center justify-center gap-1.5 transition-all">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>Xem cẩm nang hướng dẫn</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 6 Primary Workflow Sections Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Left Column: Step 1 (Source File) & Step 2 (Template File) & Step 3 (Config) -->
      <div class="lg:col-span-1 space-y-6">
        <!-- 1. ĐỀ GỐC (SOURCE DOCX) -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
              Đề thi gốc (.docx)
            </h2>
            <span id="source-badge" class="hidden px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-800">Đã nạp</span>
          </div>

          <div id="source-dropzone" class="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50/50">
            <input type="file" id="source-file-input" accept=".docx" class="hidden" />
            <svg class="w-10 h-10 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            <p class="text-sm font-semibold text-slate-700">Chọn hoặc kéo thả tệp DOCX đề gốc</p>
            <p class="text-xs text-slate-400 mt-1">Chỉ chấp nhận tệp Microsoft Word .docx (&lt; 50MB)</p>
          </div>

          <!-- Quick Try Sample Link -->
          <div class="mt-3 text-center">
            <button id="source-sample-quicklink" class="text-xs text-blue-600 hover:text-blue-800 font-semibold underline inline-flex items-center gap-1">
              <span>⚡ Chưa có đề sẵn? Bấm vào đây để thử với Đề Hóa học 28 câu mẫu</span>
            </button>
          </div>

          <div id="source-file-info" class="hidden mt-4 p-3 bg-slate-100 rounded-lg text-xs flex items-center justify-between border border-slate-200">
            <div class="truncate mr-2">
              <p id="source-filename" class="font-bold text-slate-800 truncate"></p>
              <p id="source-filesize" class="text-slate-500"></p>
            </div>
            <button id="source-remove-btn" class="text-rose-600 hover:text-rose-800 font-semibold p-1">Xóa</button>
          </div>
        </div>

        <!-- 2. FILE MẪU (TEMPLATE DOCX) -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">2</span>
              Mẫu định dạng (Template)
            </h2>
            <span class="text-xs text-slate-400">Tùy chọn</span>
          </div>

          <p class="text-xs text-slate-500 mb-3">Mặc định hệ thống dùng <strong class="text-slate-700 font-medium">Chuẩn thể thức THPT Quốc gia (A4 - 2 trang)</strong>.</p>
          
          <div id="template-dropzone" class="border border-slate-200 hover:border-blue-400 rounded-lg p-3 text-center cursor-pointer transition-colors bg-slate-50 text-xs">
            <input type="file" id="template-file-input" accept=".docx" class="hidden" />
            <span id="template-label" class="text-slate-600 font-medium">+ Tải mẫu Word tùy chỉnh (.docx)</span>
          </div>
        </div>

        <!-- 3. CẤU HÌNH (CONFIGURATION) -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
            <span class="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">3</span>
            Cấu hình tạo đề
          </h2>

          <div class="space-y-4 text-xs font-medium text-slate-700">
            <div>
              <label class="block mb-1 font-semibold text-slate-800">Số lượng mã đề cần sinh</label>
              <input type="number" id="cfg-variant-count" value="4" min="1" max="100" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              <p class="text-[11px] text-slate-400 mt-1">Ví dụ: 4, 8, 20, 40 mã đề</p>
            </div>

            <div>
              <label class="block mb-1 font-semibold text-slate-800">Mã đề bắt đầu (4 chữ số)</label>
              <input type="text" id="cfg-exam-code-start" value="1001" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono font-bold text-slate-900" />
              <p class="text-[11px] text-slate-400 mt-1">Mặc định 4 chữ số: 1001, 1002, 2001,...</p>
            </div>

            <div class="pt-2 border-t border-slate-100 space-y-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="cfg-shuffle-questions" checked class="w-4 h-4 text-blue-600 rounded" />
                <span>Xáo thứ tự câu hỏi trong từng phần</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="cfg-shuffle-options" checked class="w-4 h-4 text-blue-600 rounded" />
                <span>Xáo thứ tự phương án A, B, C, D (Phần I)</span>
              </label>
            </div>

            <!-- Tùy chọn nâng cao (Collapsible Details) -->
            <details class="pt-2 border-t border-slate-100 group">
              <summary class="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-between py-1.5 select-none">
                <span class="flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 transition-transform group-open:rotate-90 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                  <span>Tùy chọn nâng cao</span>
                </span>
                <span class="text-[10px] text-slate-400 font-normal group-open:hidden">Hạt giống Seed &amp; Ý Đúng/Sai</span>
              </summary>
              <div class="mt-3 space-y-3 pl-3 border-l-2 border-blue-100 text-xs">
                <div>
                  <label class="block mb-1 font-semibold text-slate-700">Mã hạt giống tất định (Seed)</label>
                  <input type="number" id="cfg-seed" value="20260925" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  <p class="text-[10px] text-slate-400 mt-1">Cùng seed sẽ sinh ra kết quả xáo đề giống hệt nhau 100%.</p>
                </div>

                <div>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" id="cfg-shuffle-tf" class="w-4 h-4 text-blue-600 rounded" />
                    <span>Xáo ý a, b, c, d của câu Đúng/Sai (Phần II)</span>
                  </label>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>

      <!-- Right Column: Step 4 (Analysis Preview), Step 5 (Generation), Step 6 (Results) -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- 4. PHÂN TÍCH ĐỀ GỐC (ANALYSIS PREVIEW) -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">4</span>
              Kết quả phân tích đề gốc
            </h2>
            <span id="analysis-status-pill" class="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600">Chờ tệp tải lên</span>
          </div>

          <div id="analysis-placeholder" class="py-12 text-center text-slate-400 text-xs">
            <svg class="w-12 h-12 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Vui lòng chọn tệp đề thi gốc (.docx) ở Bước 1 hoặc bấm <strong>"Thử ngay với Đề mẫu"</strong> để hệ thống tự động bóc tách cấu trúc.
          </div>

          <div id="analysis-content" class="hidden space-y-4">
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs text-slate-500">Tiêu đề đề thi</p>
                  <h3 id="preview-exam-title" class="text-base font-bold text-slate-900"></h3>
                </div>
                <div class="text-right">
                  <p class="text-xs text-slate-500">Tổng số câu hỏi</p>
                  <p id="preview-total-count" class="text-xl font-bold text-blue-600">28 câu</p>
                </div>
              </div>
            </div>

            <!-- Structure Breakdown Cards -->
            <div class="grid grid-cols-3 gap-3 text-center">
              <div class="p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
                <p class="text-[11px] font-semibold text-blue-700 uppercase">Phần I: Trắc nghiệm</p>
                <p id="preview-part1-count" class="text-lg font-bold text-blue-900 mt-1">18 câu</p>
                <p class="text-[10px] text-blue-600">4 phương án A,B,C,D</p>
              </div>

              <div class="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl">
                <p class="text-[11px] font-semibold text-indigo-700 uppercase">Phần II: Đúng/Sai</p>
                <p id="preview-part2-count" class="text-lg font-bold text-indigo-900 mt-1">4 câu</p>
                <p class="text-[10px] text-indigo-600">Mỗi câu 4 ý a,b,c,d</p>
              </div>

              <div class="p-3 bg-teal-50/60 border border-teal-200 rounded-xl">
                <p class="text-[11px] font-semibold text-teal-700 uppercase">Phần III: Trả lời ngắn</p>
                <p id="preview-part3-count" class="text-lg font-bold text-teal-900 mt-1">6 câu</p>
                <p class="text-[10px] text-teal-600">Điền số hoặc từ</p>
              </div>
            </div>

            <!-- Warning Box (if any) -->
            <div id="preview-warnings-container" class="hidden p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
              <div class="font-bold flex items-center gap-1.5 text-amber-950">
                <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Lưu ý định dạng tự động:
              </div>
              <ul id="preview-warnings-list" class="list-disc pl-5 space-y-1 text-amber-800 text-[11px]"></ul>
            </div>
          </div>
        </div>

        <!-- 5. TIẾN HÀNH SINH ĐỀ (ACTION & PROGRESS SCREEN) -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">5</span>
              Thực hiện trộn đề
            </h2>
            <span id="job-status-badge" class="hidden text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600"></span>
          </div>

          <!-- Trigger Button -->
          <div id="action-container" class="space-y-3">
            <button id="start-mix-btn" disabled class="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2">
              <span>BẮT ĐẦU TRỘN ĐỀ THI</span>
            </button>
            <p id="action-hint" class="text-center text-xs text-slate-400">Vui lòng nạp đề gốc trước khi trộn</p>
          </div>

          <!-- Progress Bar & Active Status -->
          <div id="progress-container" class="hidden mt-6 space-y-3">
            <div class="flex items-center justify-between text-xs font-medium">
              <span id="progress-stage-text" class="text-slate-700 font-semibold flex items-center gap-2">
                <span class="spinner"></span>
                <span>Đang xử lý...</span>
              </span>
              <span id="progress-percent" class="text-blue-600 font-bold">0%</span>
            </div>

            <div class="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div id="progress-bar-fill" class="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out" style="width: 0%"></div>
            </div>

            <p id="progress-detail-text" class="text-[11px] text-slate-500"></p>
          </div>

          <!-- Error Alert Banner -->
          <div id="error-container" class="hidden mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold flex items-center gap-1.5 text-rose-950">
                <svg class="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span id="error-stage-title">Lỗi kiểm định chất lượng (Quality Gate)</span>
              </span>
              <span id="error-code-badge" class="px-1.5 py-0.5 rounded bg-rose-100 font-mono text-[10px] text-rose-800"></span>
            </div>
            <p id="error-friendly-message" class="text-rose-800 text-xs font-medium"></p>
            
            <div class="pt-2">
              <button id="toggle-tech-details-btn" class="text-rose-700 hover:text-rose-900 font-semibold underline text-[11px]">Xem chi tiết kỹ thuật</button>
              <pre id="technical-details-content" class="hidden mt-2 p-2.5 bg-rose-100 rounded text-[10px] text-rose-950 overflow-x-auto font-mono whitespace-pre-wrap max-h-48"></pre>
            </div>
          </div>
        </div>

        <!-- 6. KẾT QUẢ XUẤT XƯỞNG (RESULTS & DOWNLOADS) -->
        <div id="result-box" class="hidden bg-white p-6 rounded-2xl border-2 border-emerald-500 shadow-md">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">✓</span>
              Kết quả tạo đề thi
            </h2>
            <span class="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Sẵn sàng in ấn</span>
          </div>

          <!-- Result metrics (3 clean cards, removing Gate 3 technical jargon) -->
          <div class="grid grid-cols-3 gap-3 text-center mb-6">
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <p class="text-[11px] text-slate-500">Số mã đề</p>
              <p id="res-variant-count" class="text-lg font-bold text-slate-800"></p>
            </div>
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <p class="text-[11px] text-slate-500">Số tệp Word (.docx)</p>
              <p id="res-docx-count" class="text-lg font-bold text-slate-800"></p>
            </div>
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <p class="text-[11px] text-slate-500">Dung lượng gói (.zip)</p>
              <p id="res-zip-size" class="text-lg font-bold text-slate-800"></p>
            </div>
          </div>

          <!-- Download Action Buttons -->
          <div class="space-y-3">
            <button id="download-zip-btn" class="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              <span>TẢI TRỌN GÓI KẾT QUẢ (.ZIP)</span>
            </button>

            <div class="grid grid-cols-2 gap-3">
              <button id="download-excel-btn" class="py-2.5 px-3 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 font-bold text-xs text-emerald-800 flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span>Tải Đáp Án (Excel .xlsx)</span>
              </button>

              <button id="download-key-btn" class="py-2.5 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 font-semibold text-xs text-slate-700 flex items-center justify-center gap-1.5 transition-colors">
                <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span>Tải Đáp Án (JSON)</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </main>

  <!-- Comprehensive Guide & Features Modal (Cẩm nang hướng dẫn) -->
  <div id="guide-modal" class="hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
      <!-- Modal Header -->
      <div class="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            📖
          </div>
          <div>
            <h3 class="font-bold text-base text-slate-900">Cẩm Nang Hướng Dẫn &amp; Tính Năng Vượt Trội</h3>
            <p class="text-xs text-slate-500">Dành cho giáo viên và cán bộ khảo thí THPT</p>
          </div>
        </div>
        <button id="close-guide-modal-x" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Modal Tabs -->
      <div class="flex border-b border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 gap-6">
        <button class="tab-btn py-3 border-b-2 border-transparent hover:text-blue-600 active" data-tab="tab-workflow">
          🚀 Quy trình 4 bước
        </button>
        <button class="tab-btn py-3 border-b-2 border-transparent hover:text-blue-600" data-tab="tab-formatting">
          📝 Quy tắc soạn đề gốc
        </button>
        <button class="tab-btn py-3 border-b-2 border-transparent hover:text-blue-600" data-tab="tab-features">
          ⭐ 6 Tính năng độc quyền
        </button>
        <button class="tab-btn py-3 border-b-2 border-transparent hover:text-blue-600" data-tab="tab-faq">
          ❓ Câu hỏi thường gặp
        </button>
      </div>

      <!-- Modal Body Content -->
      <div class="p-6 overflow-y-auto space-y-6 text-sm flex-1">
        
        <!-- Tab 1: Workflow -->
        <div id="tab-workflow" class="tab-content space-y-4">
          <h4 class="font-bold text-slate-900 text-base">Quy trình làm việc chuẩn từ A đến Z</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
              <div class="flex items-center gap-2 font-bold text-blue-900 text-sm">
                <span class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                Chuẩn bị đề gốc trên Microsoft Word
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Soạn đề thi bằng Microsoft Word chuẩn đuôi <code class="bg-blue-100 text-blue-800 px-1 rounded">.docx</code>. Đáp án đúng được quy ước bằng cách <strong>gạch chân (Underline - Ctrl+U)</strong>. Hệ thống sẽ tự nhận diện đáp án này để lập ma trận chấm thi và tự động xóa dấu vết gạch chân khi xuất đề cho học sinh.
              </p>
            </div>

            <div class="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
              <div class="flex items-center gap-2 font-bold text-blue-900 text-sm">
                <span class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
                Nạp đề &amp; Kiểm tra bóc tách
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Kéo thả file vào ô <strong>"Đề thi gốc (.docx)"</strong>. Hệ thống mất khoảng 0.05 giây để quét OpenXML và hiển thị bảng phân loại: số câu Phần I (4 lựa chọn), Phần II (Đúng/Sai), Phần III (Trả lời ngắn).
              </p>
            </div>

            <div class="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
              <div class="flex items-center gap-2 font-bold text-blue-900 text-sm">
                <span class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">3</span>
                Cấu hình số lượng mã đề
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Nhập số mã đề cần tạo (ví dụ: 4 đề), mã bắt đầu (1001 - 4 chữ số). Chọn hoán vị câu hỏi, hoán vị các phương án A, B, C, D hoặc mở Tùy chọn nâng cao theo ý muốn.
              </p>
            </div>

            <div class="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
              <div class="flex items-center gap-2 font-bold text-blue-900 text-sm">
                <span class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">4</span>
                Trộn đề, Tải ZIP &amp; In ấn
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Nhấn <strong>"Bắt đầu trộn đề thi"</strong>. Sau khoảng 0.3s, nhấn nút <strong>"Tải gói kết quả (.zip)"</strong> để nhận toàn bộ file Word của các mã đề (đã cập nhật số trang, mã đề chân trang, không sót đáp án) cùng file ma trận đáp án.
              </p>
            </div>
          </div>
        </div>

        <!-- Tab 2: Formatting Rules -->
        <div id="tab-formatting" class="tab-content hidden space-y-4">
          <h4 class="font-bold text-slate-900 text-base">Quy ước soạn thảo đề thi gốc trong Microsoft Word</h4>
          <p class="text-xs text-slate-500">Ứng dụng hoạt động dựa trên định dạng trực quan thông thường của giáo viên, không cần chèn các ký hiệu lạ:</p>

          <div class="space-y-4">
            <!-- Part I -->
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-blue-700 text-xs uppercase tracking-wide">Phần I: Câu hỏi trắc nghiệm nhiều phương án lựa chọn</span>
                <span class="text-[11px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">Gạch chân đáp án đúng</span>
              </div>
              <div class="bg-white p-3 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 space-y-1">
                <p><strong>Câu 1.</strong> Hợp chất nào sau đây thuộc loại ester?</p>
                <p>A. CH<sub>3</sub>COOH</p>
                <p>B. CH<sub>3</sub>CHO</p>
                <p class="text-emerald-700 font-bold bg-emerald-50 px-1 rounded inline-block"><span class="underline">C. CH<sub>3</sub>COOC<sub>2</sub>H<sub>5</sub></span> &nbsp;&larr; (Gạch chân đáp án đúng)</p>
                <p>D. CH<sub>3</sub>CH<sub>2</sub>OH</p>
              </div>
            </div>

            <!-- Part II -->
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-indigo-700 text-xs uppercase tracking-wide">Phần II: Câu trắc nghiệm Đúng / Sai</span>
                <span class="text-[11px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold">Gạch chân ý đúng</span>
              </div>
              <div class="bg-white p-3 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 space-y-1">
                <p><strong>Câu 1.</strong> Cho các phát biểu sau về lipid:</p>
                <p class="text-emerald-700 font-bold bg-emerald-50 px-1 rounded inline-block"><span class="underline">a) Chất béo nhẹ hơn nước và không tan trong nước.</span> &nbsp;&larr; (Ý này Đúng thì gạch chân)</p>
                <p>b) Mỡ lợn chứa chủ yếu các gốc acid béo chưa no. &nbsp;&larr; (Ý này Sai thì để nguyên)</p>
                <p class="text-emerald-700 font-bold bg-emerald-50 px-1 rounded inline-block"><span class="underline">c) Dầu cọ, dầu đậu nành có nguồn gốc từ thực vật.</span> &nbsp;&larr; (Đúng: gạch chân)</p>
                <p>d) Phản ứng thủy phân chất béo trong môi trường kiềm là phản ứng thuận nghịch.</p>
              </div>
            </div>

            <!-- Part III -->
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-teal-700 text-xs uppercase tracking-wide">Phần III: Câu trắc nghiệm trả lời ngắn</span>
                <span class="text-[11px] px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold">Ghi đáp số dòng dưới</span>
              </div>
              <div class="bg-white p-3 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 space-y-1">
                <p><strong>Câu 1.</strong> Đun nóng 6,0 gam Acetic acid với 6,9 gam Ethanol (xúc tác H<sub>2</sub>SO<sub>4</sub> đặc), hiệu suất 60%. Khối lượng Ethyl acetate thu được là bao nhiêu gam?</p>
                <p class="text-emerald-700 font-bold bg-emerald-50 px-1 rounded inline-block"><span class="underline">A. 5.28</span> &nbsp;&larr; (Ghi đáp án ở dòng kế tiếp)</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 3: Key Features -->
        <div id="tab-features" class="tab-content hidden space-y-4">
          <h4 class="font-bold text-slate-900 text-base">6 Tính năng vượt trội chuẩn hóa Giáo dục THPT</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-1.5">
              <div class="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <span class="text-lg">🛡️</span> Khử rò rỉ đáp án tuyệt đối (Gate 3)
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Đề thi xuất cho học sinh được thanh lọc 100% các thuộc tính gạch chân, in nghiêng, bôi đậm hoặc đổi màu đáp án. Học sinh không thể dò tìm đáp án qua định dạng ngầm.
              </p>
            </div>

            <div class="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-1.5">
              <div class="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <span class="text-lg">🧪</span> Bảo toàn công thức hóa học &amp; toán
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Bóc tách nguyên trạng các thẻ XML chỉ số trên (superscript), chỉ số dưới (subscript) như $H_2SO_4, C_nH_{2n}O_2$, số mũ toán học mà không bao giờ bị nhảy thành số thường.
              </p>
            </div>

            <div class="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-1.5">
              <div class="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <span class="text-lg">📐</span> Bố cục dàn trang thông minh A4
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Tự động tính độ dài phương án để xếp 4 cột trên 1 dòng (tiết kiệm giấy), 2 cột hoặc 1 cột, chuẩn mẫu thi tốt nghiệp THPT Quốc gia 2 trang gọn gàng.
              </p>
            </div>

            <div class="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-1.5">
              <div class="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <span class="text-lg">🎲</span> Xáo tất định bằng Hạt giống (Seed)
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Sử dụng thuật toán PRNG LCG Deterministic: cùng một mã hạt giống Seed thì 10 năm sau chạy lại vẫn cho ra kết quả xáo đề và bảng đáp án chính xác từng ký tự.
              </p>
            </div>

            <div class="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-1.5">
              <div class="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <span class="text-lg">📄</span> Đồng bộ Mã đề &amp; Đánh số trang động
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Tự động điền mã đề vào khung thông tin góc trên bên phải và chân trang. Chân trang hiển thị số trang động tự động dạng: <em>Mã đề 1001 - Trang 1/2</em>.
              </p>
            </div>

            <div class="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-1.5">
              <div class="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <span class="text-lg">📦</span> Xuất trọn gói ZIP &amp; Ma trận Excel
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Tải xuống 1 tệp ZIP chứa đầy đủ các file Word đề thi từng mã, bảng ma trận đáp án chuẩn Excel (.xlsx), JSON và TXT để phục vụ chấm thi thủ công hoặc chấm máy quét.
              </p>
            </div>
          </div>
        </div>

        <!-- Tab 4: FAQ -->
        <div id="tab-faq" class="tab-content hidden space-y-4">
          <h4 class="font-bold text-slate-900 text-base">Câu hỏi thường gặp của giáo viên</h4>
          <div class="space-y-3">
            <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p class="font-bold text-slate-900 text-xs">Hỏi: Đề thi của tôi có hình ảnh và bảng số liệu thì có bị mất không?</p>
              <p class="text-xs text-slate-600 leading-relaxed">Trả lời: Hệ thống lưu giữ toàn vẹn cây XML gốc của Microsoft Word nên các hình vẽ, biểu đồ và bảng dữ liệu trong câu hỏi đều được giữ nguyên 100%.</p>
            </div>

            <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p class="font-bold text-slate-900 text-xs">Hỏi: Tôi muốn áp dụng khung tiêu đề (Header) mang tên trường tôi có được không?</p>
              <p class="text-xs text-slate-600 leading-relaxed">Trả lời: Rất đơn giản! Tại Bước 2 (Mẫu định dạng), thầy/cô tải lên tệp Word mẫu của trường. Hệ thống sẽ áp dụng khung tiêu đề và quy cách của trường cho toàn bộ các đề con.</p>
            </div>

            <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p class="font-bold text-slate-900 text-xs">Hỏi: Đề thi tôi tải lên có bị lộ ra ngoài Internet không?</p>
              <p class="text-xs text-slate-600 leading-relaxed">Trả lời: Tuyệt đối không. Ứng dụng xử lý đề thi trong bộ nhớ đệm tạm thời (RAM) và xóa sạch sau phiên làm việc, không lưu trữ đề thi của thầy/cô vào bất kỳ cơ sở dữ liệu nào.</p>
            </div>

            <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p class="font-bold text-slate-900 text-xs">Hỏi: Làm sao để cùng một đề thi mà tạo ra các bộ mã đề khác nhau giữa các lớp?</p>
              <p class="text-xs text-slate-600 leading-relaxed">Trả lời: Thầy/cô chỉ cần thay đổi số "Mã hạt giống (Seed)" ở Bước 3 (ví dụ: lớp 12A1 dùng seed 111, lớp 12A2 dùng seed 222). Mỗi seed sẽ tạo ra cách xáo trộn hoàn toàn khác nhau.</p>
            </div>
          </div>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <a href="/api/sample-exam" download="DeThiMau_ChuongEsterLipid.docx" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors">
          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          <span>Tải file Word mẫu (.docx)</span>
        </a>
        <div class="flex items-center gap-2">
          <button id="modal-try-sample-btn" class="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors">
            Thử nghiệm ngay
          </button>
          <button id="close-guide-modal-btn" class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors">
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Application Logic JavaScript -->
  <script>
    let currentSourceFile = null;
    let currentTemplateFile = null;
    let currentJobId = null;
    let pollingInterval = null;

    // DOM Elements
    const sourceDropzone = document.getElementById('source-dropzone');
    const sourceFileInput = document.getElementById('source-file-input');
    const sourceFileInfo = document.getElementById('source-file-info');
    const sourceFilename = document.getElementById('source-filename');
    const sourceFilesize = document.getElementById('source-filesize');
    const sourceRemoveBtn = document.getElementById('source-remove-btn');
    const sourceBadge = document.getElementById('source-badge');
    const sourceSampleQuicklink = document.getElementById('source-sample-quicklink');

    const templateDropzone = document.getElementById('template-dropzone');
    const templateFileInput = document.getElementById('template-file-input');
    const templateLabel = document.getElementById('template-label');

    const startMixBtn = document.getElementById('start-mix-btn');
    const actionHint = document.getElementById('action-hint');
    const progressContainer = document.getElementById('progress-container');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressPercent = document.getElementById('progress-percent');
    const progressStageText = document.getElementById('progress-stage-text');
    const progressDetailText = document.getElementById('progress-detail-text');

    const errorContainer = document.getElementById('error-container');
    const errorStageTitle = document.getElementById('error-stage-title');
    const errorCodeBadge = document.getElementById('error-code-badge');
    const errorFriendlyMessage = document.getElementById('error-friendly-message');
    const toggleTechDetailsBtn = document.getElementById('toggle-tech-details-btn');
    const technicalDetailsContent = document.getElementById('technical-details-content');

    const resultBox = document.getElementById('result-box');
    const resVariantCount = document.getElementById('res-variant-count');
    const resDocxCount = document.getElementById('res-docx-count');
    const resZipSize = document.getElementById('res-zip-size');
    const downloadZipBtn = document.getElementById('download-zip-btn');
    const downloadExcelBtn = document.getElementById('download-excel-btn');
    const downloadKeyBtn = document.getElementById('download-key-btn');

    // Guide Modal Elements
    const guideModal = document.getElementById('guide-modal');
    const openGuideModalBtnHeader = document.getElementById('open-guide-modal-btn-header');
    const openGuideModalBtn = document.getElementById('open-guide-modal-btn');
    const closeGuideModalX = document.getElementById('close-guide-modal-x');
    const closeGuideModalBtn = document.getElementById('close-guide-modal-btn');
    const quickTrySampleBtn = document.getElementById('quick-try-sample-btn');
    const modalTrySampleBtn = document.getElementById('modal-try-sample-btn');

    // Tab switching in Guide Modal
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.add('hidden'));

        btn.classList.add('active');
        const content = document.getElementById(targetTab);
        if (content) content.classList.remove('hidden');
      });
    });

    function openGuideModal() {
      guideModal.classList.remove('hidden');
    }

    function closeGuideModal() {
      guideModal.classList.add('hidden');
    }

    if (openGuideModalBtnHeader) openGuideModalBtnHeader.addEventListener('click', openGuideModal);
    if (openGuideModalBtn) openGuideModalBtn.addEventListener('click', openGuideModal);
    if (closeGuideModalX) closeGuideModalX.addEventListener('click', closeGuideModal);
    if (closeGuideModalBtn) closeGuideModalBtn.addEventListener('click', closeGuideModal);

    // 1-Click Load Sample Exam
    async function loadSampleExam() {
      try {
        if (quickTrySampleBtn) {
          quickTrySampleBtn.disabled = true;
          quickTrySampleBtn.innerHTML = '<span class="spinner"></span> Đang nạp đề mẫu...';
        }
        closeGuideModal();

        const res = await fetch('/api/sample-exam');
        if (!res.ok) throw new Error('Không thể tải tệp đề mẫu từ máy chủ.');
        const blob = await res.blob();
        const file = new File([blob], 'DeThiMau_ChuongEsterLipid.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });

        await handleSourceFile(file);
      } catch (err) {
        alert('Lỗi nạp đề mẫu: ' + err.message);
      } finally {
        if (quickTrySampleBtn) {
          quickTrySampleBtn.disabled = false;
          quickTrySampleBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> <span>Thử ngay với Đề mẫu</span>';
        }
      }
    }

    if (quickTrySampleBtn) quickTrySampleBtn.addEventListener('click', loadSampleExam);
    if (modalTrySampleBtn) modalTrySampleBtn.addEventListener('click', loadSampleExam);
    if (sourceSampleQuicklink) sourceSampleQuicklink.addEventListener('click', (e) => { e.preventDefault(); loadSampleExam(); });

    // 1. Source file upload & analysis
    sourceDropzone.addEventListener('click', () => sourceFileInput.click());
    sourceFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      await handleSourceFile(file);
    });

    sourceDropzone.addEventListener('dragover', (e) => { e.preventDefault(); sourceDropzone.classList.add('border-blue-500'); });
    sourceDropzone.addEventListener('dragleave', () => sourceDropzone.classList.remove('border-blue-500'));
    sourceDropzone.addEventListener('drop', async (e) => {
      e.preventDefault();
      sourceDropzone.classList.remove('border-blue-500');
      const file = e.dataTransfer.files[0];
      if (file) await handleSourceFile(file);
    });

    sourceRemoveBtn.addEventListener('click', () => {
      currentSourceFile = null;
      sourceFileInput.value = '';
      sourceFileInfo.classList.add('hidden');
      sourceDropzone.classList.remove('hidden');
      sourceBadge.classList.add('hidden');
      document.getElementById('analysis-placeholder').classList.remove('hidden');
      document.getElementById('analysis-content').classList.add('hidden');
      document.getElementById('analysis-status-pill').textContent = 'Chờ tệp tải lên';
      startMixBtn.disabled = true;
      actionHint.textContent = 'Vui lòng nạp đề gốc trước khi trộn';
      resultBox.classList.add('hidden');
      errorContainer.classList.add('hidden');
    });

    async function handleSourceFile(file) {
      if (!file.name.toLowerCase().endsWith('.docx')) {
        alert('Chỉ chấp nhận tệp định dạng .docx của Microsoft Word.');
        return;
      }

      currentSourceFile = file;
      sourceFilename.textContent = file.name;
      sourceFilesize.textContent = (file.size / 1024).toFixed(1) + ' KB';
      sourceDropzone.classList.add('hidden');
      sourceFileInfo.classList.remove('hidden');
      sourceBadge.classList.remove('hidden');

      // Request server-side analysis
      document.getElementById('analysis-status-pill').textContent = 'Đang phân tích...';
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload/source', { method: 'POST', body: formData });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Lỗi khi phân tích đề gốc');
        }

        renderAnalysis(data);
        startMixBtn.disabled = false;
        actionHint.textContent = 'Sẵn sàng sinh mã đề thi';
      } catch (err) {
        alert('Lỗi phân tích đề thi: ' + err.message);
        sourceRemoveBtn.click();
      }
    }

    function renderAnalysis(data) {
      document.getElementById('analysis-status-pill').textContent = 'Hợp lệ (Gate 1 PASS)';
      document.getElementById('analysis-status-pill').className = 'text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800';
      document.getElementById('analysis-placeholder').classList.add('hidden');
      document.getElementById('analysis-content').classList.remove('hidden');

      document.getElementById('preview-exam-title').textContent = data.title || 'Đề thi trắc nghiệm';
      document.getElementById('preview-total-count').textContent = data.totalQuestions + ' câu';
      document.getElementById('preview-part1-count').textContent = data.part1Count + ' câu';
      document.getElementById('preview-part2-count').textContent = data.part2Count + ' câu';
      document.getElementById('preview-part3-count').textContent = data.part3Count + ' câu';

      const warningsList = document.getElementById('preview-warnings-list');
      const warningsContainer = document.getElementById('preview-warnings-container');
      warningsList.innerHTML = '';

      if (data.validation && data.validation.warnings && data.validation.warnings.length > 0) {
        data.validation.warnings.forEach(w => {
          const li = document.createElement('li');
          li.textContent = w;
          warningsList.appendChild(li);
        });
        warningsContainer.classList.remove('hidden');
      } else {
        warningsContainer.classList.add('hidden');
      }
    }

    // 2. Template file upload (optional)
    templateDropzone.addEventListener('click', () => templateFileInput.click());
    templateFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.name.toLowerCase().endsWith('.docx')) {
        alert('Mẫu định dạng phải là tệp .docx');
        return;
      }
      currentTemplateFile = file;
      templateLabel.textContent = '✓ Đã chọn mẫu: ' + file.name;
      templateLabel.className = 'text-emerald-700 font-bold';
    });

    // 3. Execution & Progress
    startMixBtn.addEventListener('click', async () => {
      if (!currentSourceFile) return;

      // Reset states
      resultBox.classList.add('hidden');
      errorContainer.classList.add('hidden');
      progressContainer.classList.remove('hidden');
      startMixBtn.disabled = true;

      const config = {
        variantCount: parseInt(document.getElementById('cfg-variant-count').value, 10),
        examCodeStart: document.getElementById('cfg-exam-code-start').value.trim(),
        seed: parseInt(document.getElementById('cfg-seed').value, 10),
        shuffleQuestions: document.getElementById('cfg-shuffle-questions').checked,
        shuffleOptions: document.getElementById('cfg-shuffle-options').checked,
        shuffleTrueFalseSubItems: document.getElementById('cfg-shuffle-tf').checked
      };

      const formData = new FormData();
      formData.append('sourceFile', currentSourceFile);
      if (currentTemplateFile) {
        formData.append('templateFile', currentTemplateFile);
      }
      formData.append('configuration', JSON.stringify(config));

      try {
        const createRes = await fetch('/api/jobs', { method: 'POST', body: formData });
        const jobData = await createRes.json();
        if (!createRes.ok) throw new Error(jobData.message || 'Lỗi khi khởi tạo tiến trình');

        currentJobId = jobData.id;

        // Start job
        await fetch('/api/jobs/' + currentJobId + '/start', { method: 'POST' });

        // Start polling
        startPolling(currentJobId);
      } catch (err) {
        showError('ERR_INIT', err.message);
        startMixBtn.disabled = false;
        progressContainer.classList.add('hidden');
      }
    });

    function startPolling(jobId) {
      if (pollingInterval) clearInterval(pollingInterval);

      pollingInterval = setInterval(async () => {
        try {
          const res = await fetch('/api/jobs/' + jobId);
          const job = await res.json();

          updateProgressUi(job);

          if (job.status === 'COMPLETED') {
            clearInterval(pollingInterval);
            renderCompletedResult(job.result);
            startMixBtn.disabled = false;
          } else if (job.status === 'FAILED') {
            clearInterval(pollingInterval);
            const err = (job.errors && job.errors[0]) || { code: 'ERR_FAILED', message: 'Tiến trình thất bại' };
            showError(err.code, err.message, err.technicalDetails, err.stage);
            startMixBtn.disabled = false;
          }
        } catch (pollErr) {
          console.error('Polling error:', pollErr);
        }
      }, 250);
    }

    function updateProgressUi(job) {
      const pct = job.progress?.percentage || 0;
      progressBarFill.style.width = pct + '%';
      progressPercent.textContent = pct + '%';
      progressStageText.innerHTML = '<span class="spinner"></span> <span>' + (job.currentStage || 'Đang xử lý...') + '</span>';
      progressDetailText.textContent = job.progress?.message || '';
    }

    function renderCompletedResult(result) {
      progressContainer.classList.add('hidden');
      resultBox.classList.remove('hidden');

      resVariantCount.textContent = result.totalVariants + ' đề';
      resDocxCount.textContent = result.generatedDocxCount + ' file';
      resZipSize.textContent = (result.zipFileSize / 1024).toFixed(1) + ' KB';

      downloadZipBtn.onclick = () => window.location.href = '/api/jobs/' + result.jobId + '/download/zip';
      if (downloadExcelBtn) {
        downloadExcelBtn.onclick = () => window.location.href = '/api/jobs/' + result.jobId + '/download/excel';
      }
      downloadKeyBtn.onclick = () => window.location.href = '/api/jobs/' + result.jobId + '/download/answer-key';
    }

    function showError(code, message, techDetails, stage) {
      errorContainer.classList.remove('hidden');
      errorCodeBadge.textContent = code || 'ERR';
      errorFriendlyMessage.textContent = message || 'Đã xảy ra lỗi.';
      if (stage) errorStageTitle.textContent = stage;

      if (techDetails) {
        technicalDetailsContent.textContent = techDetails;
        toggleTechDetailsBtn.classList.remove('hidden');
      } else {
        toggleTechDetailsBtn.classList.add('hidden');
      }
    }

    toggleTechDetailsBtn.addEventListener('click', () => {
      technicalDetailsContent.classList.toggle('hidden');
    });
  </script>
</body>
</html>`;
}
