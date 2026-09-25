import * as fs from "fs";
import * as path from "path";
import JSZip from "jszip";
import { BatchItemResult } from "./batch-generator.js";
import { BatchAnswerKeyExport } from "./answer-key-generator.js";
import { ExamManifest } from "./manifest-generator.js";
import { generateAnswerKeyExcel } from "./excel-generator.js";

export interface ExportOptions {
  outputDir: string;
  createZip?: boolean;
  skipDiskWrite?: boolean;
}

export interface ExportResult {
  outputDir: string;
  docxFileNames: string[];
  docxPaths: string[];
  answerKeyFileName: string;
  answerKeyPath: string;
  excelFileName?: string;
  excelPath?: string;
  excelBuffer?: Uint8Array;
  manifestFileName: string;
  manifestPath: string;
  zipFileName?: string;
  zipPath?: string;
  zipBuffer?: Uint8Array;
  exportDurationMs: number;
}

/**
 * Exports generated files to disk and packs them into a single deliverable ZIP package
 */
export async function executeExport(
  batchItems: BatchItemResult[],
  answerKeyData: BatchAnswerKeyExport,
  manifestData: ExamManifest,
  options: ExportOptions
): Promise<ExportResult> {
  const tExportStart = performance.now();
  const { outputDir, createZip = true, skipDiskWrite = false } = options;

  if (!skipDiskWrite && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const docxFileNames: string[] = [];
  const docxPaths: string[] = [];

  // 1. Export student DOCX files
  for (const item of batchItems) {
    const fileName = `MA_DE_${item.examCode}.docx`;
    const filePath = path.join(outputDir, fileName);
    docxFileNames.push(fileName);
    docxPaths.push(filePath);

    if (!skipDiskWrite) {
      fs.writeFileSync(filePath, item.docxBytes);
    }
  }

  // 2. Export answer-key.json
  const answerKeyFileName = "answer-key.json";
  const answerKeyPath = path.join(outputDir, answerKeyFileName);
  const answerKeyStr = JSON.stringify(answerKeyData, null, 2);
  if (!skipDiskWrite) {
    fs.writeFileSync(answerKeyPath, answerKeyStr, "utf8");
  }

  // 3. Export Excel Answer Key (.xlsx)
  const excelFileName = "DAP_AN_CAC_MA_DE.xlsx";
  const excelPath = path.join(outputDir, excelFileName);
  const excelBuffer = await generateAnswerKeyExcel(answerKeyData);
  if (!skipDiskWrite) {
    fs.writeFileSync(excelPath, excelBuffer);
  }

  // 4. Export EXAM_MANIFEST.json
  const manifestFileName = "EXAM_MANIFEST.json";
  const manifestPath = path.join(outputDir, manifestFileName);
  const manifestStr = JSON.stringify(manifestData, null, 2);
  if (!skipDiskWrite) {
    fs.writeFileSync(manifestPath, manifestStr, "utf8");
  }

  // 5. Create ZIP package
  let zipFileName: string | undefined;
  let zipPath: string | undefined;
  let zipBuffer: Uint8Array | undefined;

  if (createZip) {
    const firstCode = batchItems[0]?.examCode || "101";
    const lastCode = batchItems[batchItems.length - 1]?.examCode || firstCode;
    zipFileName = `EXAM_OUTPUT_${firstCode}_${lastCode}.zip`;
    zipPath = path.join(outputDir, zipFileName);

    const zip = new JSZip();

    // Add DOCX files
    for (const item of batchItems) {
      zip.file(`MA_DE_${item.examCode}.docx`, item.docxBytes);
    }

    // Add Excel answer key
    zip.file(excelFileName, excelBuffer);

    // Add JSON files
    zip.file(answerKeyFileName, answerKeyStr);
    zip.file(manifestFileName, manifestStr);

    zipBuffer = await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    });

    if (!skipDiskWrite) {
      fs.writeFileSync(zipPath, zipBuffer);
    }
  }

  const exportDurationMs = performance.now() - tExportStart;

  return {
    outputDir,
    docxFileNames,
    docxPaths,
    answerKeyFileName,
    answerKeyPath,
    excelFileName,
    excelPath,
    excelBuffer,
    manifestFileName,
    manifestPath,
    zipFileName,
    zipPath,
    zipBuffer,
    exportDurationMs
  };
}
