import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as http from "http";
import * as path from "path";
import * as fs from "fs";
import JSZip from "jszip";
import { createExamMixerServer } from "../../src/server/app-server.js";

describe("UI & Server HTTP REST API Integration (TEST-UI-001)", () => {
  let server: http.Server;
  let baseUrl: string;

  const sourceDocxPath = path.resolve(process.cwd(), "DeGocTron.docx");
  const validBuffer = fs.readFileSync(sourceDocxPath);

  beforeAll(async () => {
    server = createExamMixerServer();
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => {
        const addr: any = server.address();
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it("should serve the Main Web UI on GET /", async () => {
    const res = await fetch(`${baseUrl}/`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");

    const html = await res.text();
    expect(html).toContain("EXAM MIXER");
    expect(html).toContain("Đề thi gốc");
    expect(html).toContain("BẮT ĐẦU TRỘN ĐỀ");
  });

  it("should return health status on GET /api/health", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ok");
    expect(data.version).toBe("1.0.0");
  });

  it("should upload and analyze source DOCX on POST /api/upload/source", async () => {
    const res = await fetch(`${baseUrl}/api/upload/source`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: "DeGocTron.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        fileBase64: validBuffer.toString("base64")
      })
    });

    expect(res.status).toBe(200);
    const analysis = await res.json();

    expect(analysis.title).toBe("KIỂM TRA CHƯƠNG ESTER - LIPID");
    expect(analysis.totalQuestions).toBe(28);
    expect(analysis.part1Count).toBe(18);
    expect(analysis.part2Count).toBe(4);
    expect(analysis.part3Count).toBe(6);
    expect(analysis.validation.isValid).toBe(true);
  });

  it("should reject non-DOCX upload on POST /api/upload/source with 400 error", async () => {
    const res = await fetch(`${baseUrl}/api/upload/source`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: "malicious.exe",
        fileBase64: Buffer.from("NOT_A_DOCX").toString("base64")
      })
    });

    expect(res.status).toBe(400);
    const err = await res.json();
    expect(err.error).toBe("ERR_INVALID_EXTENSION");
    expect(err.message).toContain("Microsoft Word (.docx)");
  });

  it("should create job, poll progress to completion, and download ZIP and Answer Key", async () => {
    // 1. Create Job
    const createRes = await fetch(`${baseUrl}/api/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceFile: {
          name: "DeGocTron.docx",
          bufferBase64: validBuffer.toString("base64")
        },
        configuration: {
          variantCount: 2,
          examCodeStart: 101,
          seed: 20260924
        }
      })
    });

    expect(createRes.status).toBe(201);
    const job = await createRes.json();
    expect(job.id).toBeDefined();
    expect(job.status).toBe("QUEUED");

    // 2. Start Job
    const startRes = await fetch(`${baseUrl}/api/jobs/${job.id}/start`, { method: "POST" });
    expect(startRes.status).toBe(200);

    // 3. Poll until COMPLETED
    let isCompleted = false;
    let attempts = 0;
    while (!isCompleted && attempts < 50) {
      await new Promise(r => setTimeout(r, 200));
      const pollRes = await fetch(`${baseUrl}/api/jobs/${job.id}`);
      const pollData = await pollRes.json();

      if (pollData.status === "COMPLETED") {
        isCompleted = true;
        expect(pollData.result.totalVariants).toBe(2);
      } else if (pollData.status === "FAILED") {
        throw new Error(`Job unexpectedly failed: ${JSON.stringify(pollData.errors)}`);
      }
      attempts++;
    }

    expect(isCompleted).toBe(true);

    // 4. Download ZIP
    const zipRes = await fetch(`${baseUrl}/api/jobs/${job.id}/download/zip`);
    expect(zipRes.status).toBe(200);
    expect(zipRes.headers.get("content-type")).toBe("application/zip");

    const zipArrayBuffer = await zipRes.arrayBuffer();
    const zip = await JSZip.loadAsync(zipArrayBuffer);
    expect(zip.file("MA_DE_101.docx")).not.toBeNull();
    expect(zip.file("MA_DE_102.docx")).not.toBeNull();
    expect(zip.file("answer-key.json")).not.toBeNull();
    expect(zip.file("EXAM_MANIFEST.json")).not.toBeNull();
    expect(zip.file("DAP_AN_CAC_MA_DE.xlsx")).not.toBeNull();

    // 4.1 Download Answer Key Excel (.xlsx)
    const excelRes = await fetch(`${baseUrl}/api/jobs/${job.id}/download/excel`);
    expect(excelRes.status).toBe(200);
    expect(excelRes.headers.get("content-type")).toContain("spreadsheetml.sheet");
    const excelBuf = await excelRes.arrayBuffer();
    expect(excelBuf.byteLength).toBeGreaterThan(1000);

    // 5. Download Answer Key
    const keyRes = await fetch(`${baseUrl}/api/jobs/${job.id}/download/answer-key`);
    expect(keyRes.status).toBe(200);
    const keyJson = await keyRes.json();
    expect(keyJson.variants["101"]).toBeDefined();

    // 6. View Manifest
    const manifestRes = await fetch(`${baseUrl}/api/jobs/${job.id}/manifest`);
    expect(manifestRes.status).toBe(200);
    const manifestJson = await manifestRes.json();
    expect(manifestJson.manifestVersion).toBe("1.0.0");
    expect(manifestJson.variantCount).toBe(2);
  });

  it("should return 404 for non-existent job operations", async () => {
    const res = await fetch(`${baseUrl}/api/jobs/non_existent_id`);
    expect(res.status).toBe(404);

    const zipRes = await fetch(`${baseUrl}/api/jobs/non_existent_id/download/zip`);
    expect(zipRes.status).toBe(404);
  });
});
