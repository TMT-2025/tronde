import * as fs from "fs";
import * as path from "path";
import JSZip from "jszip";
/**
 * Exports generated files to disk and packs them into a single deliverable ZIP package
 */
export async function executeExport(batchItems, answerKeyData, manifestData, options) {
    const tExportStart = performance.now();
    const { outputDir, createZip = true, skipDiskWrite = false } = options;
    if (!skipDiskWrite && !fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    const docxFileNames = [];
    const docxPaths = [];
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
    // 3. Export EXAM_MANIFEST.json
    const manifestFileName = "EXAM_MANIFEST.json";
    const manifestPath = path.join(outputDir, manifestFileName);
    const manifestStr = JSON.stringify(manifestData, null, 2);
    if (!skipDiskWrite) {
        fs.writeFileSync(manifestPath, manifestStr, "utf8");
    }
    // 4. Create ZIP package
    let zipFileName;
    let zipPath;
    let zipBuffer;
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
        manifestFileName,
        manifestPath,
        zipFileName,
        zipPath,
        zipBuffer,
        exportDurationMs
    };
}
