# Test script for Task 10: Clean Standalone Production Package Verification
$ErrorActionPreference = "Stop"

$scratchRoot = "C:\Users\ADMIN\.gemini\antigravity\brain\418a0a63-fcab-46a2-9e3b-24fbe7e84d89\scratch"
$cleanTestDir = Join-Path $scratchRoot "standalone-test\EXAM-MIXER"
$workspaceRoot = "E:\. UNG DUNG MOI\TRON DE"
$releaseDir = Join-Path $workspaceRoot "release\EXAM-MIXER"

Write-Host "=== TASK 10: TESTING CLEAN PRODUCTION PACKAGE ==="

# 1. Clean destination and copy package
if (Test-Path $cleanTestDir) {
    Remove-Item -Recurse -Force $cleanTestDir
}
New-Item -ItemType Directory -Force -Path $cleanTestDir | Out-Null
Copy-Item -Recurse -Force "$releaseDir\*" $cleanTestDir

# 2. Run npm install --omit=dev in clean directory
Set-Location $cleanTestDir
Write-Host "Installing production dependencies in clean directory (npm install --omit=dev)..."
& npm install --omit=dev
Set-Location $workspaceRoot

# 3. Create test runner node script in clean directory
$smokeScriptPath = Join-Path $cleanTestDir "smoke-test.js"
@'
import { createExamMixerServer } from "./dist/server/app-server.js";
import * as fs from "fs";
import * as path from "path";
import JSZip from "jszip";

async function runStandaloneSmokeTest() {
  console.log("[Clean Test] Khởi tạo máy chủ từ production package sạch...");
  const server = createExamMixerServer();
  const port = 3888;
  const host = "127.0.0.1";

  await new Promise((resolve) => server.listen(port, host, resolve));
  const baseUrl = `http://${host}:${port}`;
  console.log(`[Clean Test] Máy chủ đang lắng nghe tại: ${baseUrl}`);

  try {
    // 1. GET /
    const uiRes = await fetch(`${baseUrl}/`);
    if (uiRes.status !== 200) throw new Error(`GET / failed with status ${uiRes.status}`);
    const html = await uiRes.text();
    if (!html.includes("EXAM MIXER")) throw new Error("UI HTML does not contain 'EXAM MIXER'");
    console.log("✓ GET / trả về UI thành công (200 OK)");

    // 2. GET /api/health
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const health = await healthRes.json();
    if (health.status !== "ok" || health.version !== "1.0.0") {
      throw new Error(`Health check failed: ${JSON.stringify(health)}`);
    }
    console.log("✓ GET /api/health phản hồi OK, version: " + health.version);

    // 3. POST /api/upload/source with real DeGocTron.docx
    const sourceDocxPath = "E:\\. UNG DUNG MOI\\TRON DE\\DeGocTron.docx";
    const sourceBuffer = fs.readFileSync(sourceDocxPath);
    const uploadRes = await fetch(`${baseUrl}/api/upload/source`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: "DeGocTron.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        fileBase64: sourceBuffer.toString("base64")
      })
    });
    if (uploadRes.status !== 200) {
      const err = await uploadRes.json();
      throw new Error(`Upload failed: ${JSON.stringify(err)}`);
    }
    const uploadData = await uploadRes.json();
    console.log(`✓ Phân tích đề gốc: ${uploadData.title}, Tổng câu hỏi: ${uploadData.totalQuestions}`);
    if (uploadData.totalQuestions !== 28) throw new Error("Expected 28 questions");

    // 4. POST /api/jobs (create job for 2 variants: 101, 102)
    const jobRes = await fetch(`${baseUrl}/api/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceFile: {
          name: "DeGocTron.docx",
          bufferBase64: sourceBuffer.toString("base64")
        },
        configuration: {
          variantCount: 2,
          examCodeStart: 101,
          seed: 20260925,
          shuffleQuestions: true,
          shuffleOptions: true,
          shuffleTrueFalseSubItems: false
        }
      })
    });
    if (jobRes.status !== 201) throw new Error(`Job creation failed with status ${jobRes.status}`);
    const job = await jobRes.json();
    console.log(`✓ Tạo tiến trình trộn đề: Job ID = ${job.id}`);

    // 5. Start Job
    const startRes = await fetch(`${baseUrl}/api/jobs/${job.id}/start`, { method: "POST" });
    if (startRes.status !== 200) throw new Error("Failed to start job");
    console.log("✓ Đã gửi lệnh bắt đầu tiến trình");

    // 6. Poll job status
    let completedJob = null;
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 150));
      const pollRes = await fetch(`${baseUrl}/api/jobs/${job.id}`);
      const pollData = await pollRes.json();
      if (pollData.status === "COMPLETED") {
        completedJob = pollData;
        break;
      }
      if (pollData.status === "FAILED") {
        throw new Error(`Job failed: ${JSON.stringify(pollData.errors)}`);
      }
    }
    if (!completedJob) throw new Error("Job polling timed out");
    const totalMs = completedJob.result?.benchmarks?.total?.totalMs ?? 0;
    console.log(`✓ Tiến trình hoàn tất: Progress 100%, Đã sinh: ${completedJob.result.totalVariants} mã đề (${totalMs.toFixed(1)}ms)`);

    // 6. Download ZIP
    const zipRes = await fetch(`${baseUrl}/api/jobs/${job.id}/download/zip`);
    if (zipRes.status !== 200) throw new Error("Failed to download ZIP");
    const zipBuffer = Buffer.from(await zipRes.arrayBuffer());
    console.log(`✓ Tải gói ZIP thành công: Kích thước = ${zipBuffer.length} bytes`);

    // 7. Verify ZIP entries and DOCX validity
    const zip = await JSZip.loadAsync(zipBuffer);
    const expectedFiles = [
      "MA_DE_101.docx",
      "MA_DE_102.docx",
      "answer-key.json",
      "EXAM_MANIFEST.json"
    ];
    for (const f of expectedFiles) {
      if (!zip.file(f)) throw new Error(`ZIP missing expected file: ${f}`);
    }
    console.log("✓ Gói ZIP chứa đầy đủ tất cả các tệp mong đợi (" + expectedFiles.join(", ") + ")");

    // 8. Open MA_DE_101.docx as DOCX zip and verify word/document.xml
    const docx101Bytes = await zip.file("MA_DE_101.docx").async("nodebuffer");
    const docxZip = await JSZip.loadAsync(docx101Bytes);
    const docXml = await docxZip.file("word/document.xml").async("text");
    if (!docXml.includes("101")) throw new Error("MA_DE_101.docx does not contain exam code 101");
    if (!docXml.includes("PHẦN I")) throw new Error("MA_DE_101.docx missing PHẦN I");
    console.log("✓ Tệp MA_DE_101.docx mở thành công, cấu trúc OpenXML hợp lệ và chứa mã đề 101!");

    console.log("\n=======================================================");
    console.log("🎉 STANDALONE PRODUCTION PACKAGE SMOKE TEST PASSED 100%");
    console.log("=======================================================\n");
  } finally {
    server.close();
  }
}

runStandaloneSmokeTest().catch((err) => {
  console.error("❌ Standalone smoke test failed:", err);
  process.exit(1);
});
'@ | Out-File -FilePath $smokeScriptPath -Encoding utf8

# 4. Run the smoke test from the clean test directory
Set-Location $cleanTestDir
node smoke-test.js
Set-Location $workspaceRoot
