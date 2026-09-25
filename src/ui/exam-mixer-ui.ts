/**
 * Generates the full HTML/CSS/JS Single-Page Application for EXAM MIXER UI
 * Styled with Tailwind CSS, shadcn/ui aesthetic, and Lucide icons.
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
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
          Core Engine v1.0 Ready
        </span>
      </div>
    </div>
  </header>

  <!-- Main Content Container -->
  <main class="max-w-6xl mx-auto px-4 py-8">
    <!-- Notice / Alert Banner -->
    <div class="mb-8 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-sm flex items-start gap-3 shadow-sm">
      <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <div>
        <p class="font-semibold text-blue-950">Quy chuẩn in ấn 2 trang &amp; Kiểm định bảo mật (Gate 3)</p>
        <p class="text-blue-800 text-xs mt-0.5">Tự động nén phương án 4 cột/2 cột, khử hoàn toàn dấu vết gạch chân đáp án trong đề học sinh qua kiểm định Gate 3, bảo toàn công thức hóa học và ký tự đặc biệt.</p>
      </div>
    </div>

    <!-- 6 Primary Workflow Sections Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Left Column: Step 1 (Source File) & Step 2 (Template File) -->
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
              <label class="block mb-1 font-semibold text-slate-800">Mã đề bắt đầu</label>
              <input type="text" id="cfg-exam-code-start" value="101" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              <p class="text-[11px] text-slate-400 mt-1">Ví dụ: 101, 201, 301,...</p>
            </div>

            <div>
              <label class="block mb-1 font-semibold text-slate-800">Mã hạt giống tất định (Seed)</label>
              <input type="number" id="cfg-seed" value="20260924" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              <p class="text-[11px] text-slate-400 mt-1">Cùng seed sẽ sinh ra mã đề giống nhau 100%</p>
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

              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="cfg-shuffle-tf" class="w-4 h-4 text-blue-600 rounded" />
                <span>Xáo ý a, b, c, d của câu Đúng/Sai (Phần II)</span>
              </label>
            </div>
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
            Vui lòng chọn tệp đề thi gốc (.docx) ở Bước 1 để hệ thống tự động bóc tách cấu trúc.
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

          <!-- Error Alert Banner (Hidden by default) -->
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

          <!-- Result metrics -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-6">
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <p class="text-[11px] text-slate-500">Số mã đề</p>
              <p id="res-variant-count" class="text-lg font-bold text-slate-800"></p>
            </div>
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <p class="text-[11px] text-slate-500">Số tệp DOCX</p>
              <p id="res-docx-count" class="text-lg font-bold text-slate-800"></p>
            </div>
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <p class="text-[11px] text-slate-500">Kiểm định bảo mật</p>
              <p class="text-lg font-bold text-emerald-600">PASS (Gate 3)</p>
            </div>
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <p class="text-[11px] text-slate-500">Dung lượng gói</p>
              <p id="res-zip-size" class="text-lg font-bold text-slate-800"></p>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex flex-col sm:flex-row gap-3">
            <button id="download-zip-btn" class="flex-1 py-3 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              <span>TẢI GÓI ĐỀ THI (.ZIP)</span>
            </button>

            <button id="download-key-btn" class="py-3 px-4 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition border border-slate-300 flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <span>TẢI ĐÁP ÁN (JSON)</span>
            </button>

            <button id="view-manifest-btn" class="py-3 px-4 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition border border-slate-300 flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>XEM MANIFEST</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </main>

  <!-- Modal for Manifest Viewer -->
  <div id="manifest-modal" class="hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] flex flex-col border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="font-bold text-slate-900 text-sm">Hồ sơ thông số EXAM_MANIFEST.json</h3>
        <button id="close-manifest-modal" class="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
      </div>
      <div class="overflow-y-auto my-4 flex-1">
        <pre id="manifest-json-content" class="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto"></pre>
      </div>
      <div class="text-right pt-2 border-t border-slate-100">
        <button id="close-manifest-modal-btn" class="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-200">Đóng</button>
      </div>
    </div>
  </div>

  <!-- Client-side Application Script -->
  <script>
    let currentSourceFile = null;
    let currentTemplateFile = null;
    let currentJobId = null;
    let pollingInterval = null;

    // Elements
    const sourceDropzone = document.getElementById('source-dropzone');
    const sourceFileInput = document.getElementById('source-file-input');
    const sourceFileInfo = document.getElementById('source-file-info');
    const sourceFilename = document.getElementById('source-filename');
    const sourceFilesize = document.getElementById('source-filesize');
    const sourceRemoveBtn = document.getElementById('source-remove-btn');
    const sourceBadge = document.getElementById('source-badge');

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
    const downloadKeyBtn = document.getElementById('download-key-btn');
    const viewManifestBtn = document.getElementById('view-manifest-btn');

    const manifestModal = document.getElementById('manifest-modal');
    const manifestJsonContent = document.getElementById('manifest-json-content');
    const closeManifestModal = document.getElementById('close-manifest-modal');
    const closeManifestModalBtn = document.getElementById('close-manifest-modal-btn');

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
        alert('Lỗi: ' + err.message);
        document.getElementById('analysis-status-pill').textContent = 'Lỗi phân tích';
      }
    }

    function renderAnalysis(data) {
      document.getElementById('analysis-placeholder').classList.add('hidden');
      document.getElementById('analysis-content').classList.remove('hidden');
      document.getElementById('analysis-status-pill').textContent = 'Cấu trúc hợp lệ';
      document.getElementById('analysis-status-pill').className = 'text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800';

      document.getElementById('preview-exam-title').textContent = data.title;
      document.getElementById('preview-total-count').textContent = data.totalQuestions + ' câu';
      document.getElementById('preview-part1-count').textContent = data.part1Count + ' câu';
      document.getElementById('preview-part2-count').textContent = data.part2Count + ' câu';
      document.getElementById('preview-part3-count').textContent = data.part3Count + ' câu';

      const warningsContainer = document.getElementById('preview-warnings-container');
      const warningsList = document.getElementById('preview-warnings-list');
      if (data.warnings && data.warnings.length > 0) {
        warningsList.innerHTML = data.warnings.map(w => '<li>' + w.message + '</li>').join('');
        warningsContainer.classList.remove('hidden');
      } else {
        warningsContainer.classList.add('hidden');
      }
    }

    // 2. Template file upload
    templateDropzone.addEventListener('click', () => templateFileInput.click());
    templateFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        currentTemplateFile = file;
        templateLabel.textContent = '✓ ' + file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
        templateLabel.className = 'text-emerald-700 font-bold';
      }
    });

    // 3. Start Mix & Progress Tracking
    startMixBtn.addEventListener('click', async () => {
      if (!currentSourceFile) return;

      startMixBtn.disabled = true;
      progressContainer.classList.remove('hidden');
      errorContainer.classList.add('hidden');
      resultBox.classList.add('hidden');

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
      }, 300);
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
      downloadKeyBtn.onclick = () => window.location.href = '/api/jobs/' + result.jobId + '/download/answer-key';
      viewManifestBtn.onclick = async () => {
        const mRes = await fetch('/api/jobs/' + result.jobId + '/manifest');
        const manifest = await mRes.json();
        manifestJsonContent.textContent = JSON.stringify(manifest, null, 2);
        manifestModal.classList.remove('hidden');
      };
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

    closeManifestModal.addEventListener('click', () => manifestModal.classList.add('hidden'));
    closeManifestModalBtn.addEventListener('click', () => manifestModal.classList.add('hidden'));
  </script>
</body>
</html>`;
}
