import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as http from "http";
import * as path from "path";
import * as fs from "fs";
import JSZip from "jszip";
import { createExamMixerServer } from "../../src/server/app-server.js";
import { validateRenderedDocx } from "../../src/core/validation/render-validator.js";

describe("Real Runtime End-to-End QA (TASK 1)", () => {
  let server: http.Server;
  let baseUrl: string;

  const sourceDocxPath = path.resolve(process.cwd(), "DeGocTron.docx");
  const templateDocxPath = path.resolve(process.cwd(), "tests/fixtures/DeSauTron.docx");

  const sourceBuffer = fs.readFileSync(sourceDocxPath);
  const templateBuffer = fs.readFileSync(templateDocxPath);

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

  it("should simulate complete teacher workflow from upload to extracted DOCX verification", async () => {
    // 1. Upload & analyze real DeGocTron.docx
    const uploadRes = await fetch(`${baseUrl}/api/upload/source`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: "DeGocTron.docx",
        fileBase64: sourceBuffer.toString("base64")
      })
    });
    expect(uploadRes.status).toBe(200);
    const analysis = await uploadRes.json();

    expect(analysis.title).toBe("KIỂM TRA CHƯƠNG ESTER - LIPID");
    expect(analysis.totalQuestions).toBe(28);
    expect(analysis.part1Count).toBe(18);
    expect(analysis.part2Count).toBe(4);
    expect(analysis.part3Count).toBe(6);
    expect(analysis.validation.isValid).toBe(true);

    // 2. Configure & create generation job
    const createRes = await fetch(`${baseUrl}/api/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceFile: {
          name: "DeGocTron.docx",
          bufferBase64: sourceBuffer.toString("base64")
        },
        templateFile: {
          name: "DeSauTron.docx",
          bufferBase64: templateBuffer.toString("base64")
        },
        configuration: {
          variantCount: 4,
          examCodeStart: 101,
          seed: 20260925,
          shuffleQuestions: true,
          shuffleOptions: true,
          shuffleTrueFalseSubItems: false
        }
      })
    });
    expect(createRes.status).toBe(201);
    const job = await createRes.json();
    expect(job.id).toBeDefined();

    // 3. Start job
    const startRes = await fetch(`${baseUrl}/api/jobs/${job.id}/start`, { method: "POST" });
    expect(startRes.status).toBe(200);

    // 4. Poll and observe progress
    let isCompleted = false;
    let attempts = 0;
    let finalJob: any;

    while (!isCompleted && attempts < 50) {
      await new Promise(r => setTimeout(r, 150));
      const pollRes = await fetch(`${baseUrl}/api/jobs/${job.id}`);
      finalJob = await pollRes.json();

      if (finalJob.status === "COMPLETED") {
        isCompleted = true;
      } else if (finalJob.status === "FAILED") {
        throw new Error(`Job unexpectedly failed: ${JSON.stringify(finalJob.errors)}`);
      }
      attempts++;
    }

    expect(isCompleted).toBe(true);
    expect(finalJob.result.totalVariants).toBe(4);

    // 5. Download ZIP
    const zipRes = await fetch(`${baseUrl}/api/jobs/${job.id}/download/zip`);
    expect(zipRes.status).toBe(200);
    const zipBuffer = await zipRes.arrayBuffer();

    // 6. Extract ZIP package
    const zip = await JSZip.loadAsync(zipBuffer);
    expect(zip.file("answer-key.json")).not.toBeNull();
    expect(zip.file("EXAM_MANIFEST.json")).not.toBeNull();

    for (let code = 101; code <= 104; code++) {
      expect(zip.file(`MA_DE_${code}.docx`)).not.toBeNull();
    }

    // 7. Open and verify each generated DOCX
    for (let code = 101; code <= 104; code++) {
      const docxBytes = await zip.file(`MA_DE_${code}.docx`)!.async("uint8array");
      expect(docxBytes.byteLength).toBeGreaterThan(15000);

      // Verify OpenXML package internally
      const docxZip = await JSZip.loadAsync(docxBytes);
      const documentXml = await docxZip.file("word/document.xml")!.async("string");
      const footerXml = await docxZip.file("word/footer1.xml")!.async("string");

      expect(documentXml).toContain(`Mã đề ${code}`);
      expect(footerXml).toContain(`Mã đề ${code}`);
      expect(documentXml).not.toMatch(/<w:u\s+w:val="single"\s*\/>/);
    }
  });
});
