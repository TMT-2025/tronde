import { describe, it, expect } from "vitest";
import * as path from "path";
import * as fs from "fs";
import JSZip from "jszip";
import {
  validateUploadedDocx,
  sanitizeFileName,
  getSandboxDirectory,
  FileValidationError,
  MAX_FILE_SIZE_BYTES
} from "../../src/application/file-service.js";

describe("File Service & Upload Validation (TEST-APP-001)", () => {
  const sourceDocxPath = path.resolve(process.cwd(), "DeGocTron.docx");
  const validDocxBuffer = fs.readFileSync(sourceDocxPath);

  it("should validate and accept a valid DOCX file", async () => {
    const result = await validateUploadedDocx(
      validDocxBuffer,
      "DeGocTron.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    expect(result.sanitizedName).toBe("DeGocTron.docx");
    expect(result.size).toBe(validDocxBuffer.byteLength);
  });

  it("should reject non-DOCX file extensions", async () => {
    const invalidExtensions = ["test.pdf", "test.txt", "test.exe", "test.docx.exe", "test"];

    for (const name of invalidExtensions) {
      await expect(
        validateUploadedDocx(validDocxBuffer, name)
      ).rejects.toThrowError(FileValidationError);
    }
  });

  it("should reject invalid MIME types when provided", async () => {
    await expect(
      validateUploadedDocx(validDocxBuffer, "test.docx", "application/x-msdownload")
    ).rejects.toThrowError(FileValidationError);
  });

  it("should reject empty buffer (0 bytes)", async () => {
    await expect(
      validateUploadedDocx(Buffer.alloc(0), "empty.docx")
    ).rejects.toThrowError(FileValidationError);
  });

  it("should reject non-ZIP binary data even if named .docx", async () => {
    const fakeBuffer = Buffer.from("NOT_A_REAL_ZIP_FILE_AT_ALL");
    await expect(
      validateUploadedDocx(fakeBuffer, "fake.docx")
    ).rejects.toThrowError(FileValidationError);
  });

  it("should reject ZIP file that does not contain word/document.xml", async () => {
    const zip = new JSZip();
    zip.file("hello.txt", "world");
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    await expect(
      validateUploadedDocx(zipBuffer, "no_doc_xml.docx")
    ).rejects.toThrowError(FileValidationError);
  });

  it("should sanitize dangerous filenames preventing path traversal", () => {
    expect(sanitizeFileName("../../etc/passwd.docx")).toBe("passwd.docx");
    expect(sanitizeFileName("..\\..\\windows\\system32\\cmd.docx")).toBe("cmd.docx");
    expect(sanitizeFileName("foo/bar/test.docx")).toBe("test.docx");
    expect(sanitizeFileName("test\0bad.docx")).toBe("testbad.docx");
    expect(sanitizeFileName("")).toBe("document.docx");
    expect(sanitizeFileName("....")).toBe("document.docx");
  });

  it("should resolve sandbox directory securely and prevent escape", () => {
    const safeDir = getSandboxDirectory("job_123");
    expect(safeDir).toContain("sandbox");
    expect(fs.existsSync(safeDir)).toBe(true);

    expect(() => {
      getSandboxDirectory("..", "..", "outside");
    }).toThrowError(FileValidationError);
  });
});
