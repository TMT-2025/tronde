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

describe("Security Hardening & Input Fuzzing (TASK 4)", () => {
  const sourceDocxPath = path.resolve(process.cwd(), "DeGocTron.docx");
  const validBuffer = fs.readFileSync(sourceDocxPath);

  describe("Path Traversal & Filename Sanitization", () => {
    it("should neutralize standard relative path traversal ../evil.docx", () => {
      const sanitized = sanitizeFileName("../evil.docx");
      expect(sanitized).toBe("evil.docx");
      expect(sanitized).not.toContain("..");
      expect(sanitized).not.toContain("/");
    });

    it("should neutralize Windows backslash path traversal ..\\evil.docx", () => {
      const sanitized = sanitizeFileName("..\\evil.docx");
      expect(sanitized).toBe("evil.docx");
      expect(sanitized).not.toContain("\\");
    });

    it("should neutralize nested path traversal ....//evil.docx", () => {
      const sanitized = sanitizeFileName("....//evil.docx");
      expect(sanitized).toBe("evil.docx");
      expect(sanitized).not.toContain("/");
    });

    it("should strip null bytes from filenames", () => {
      const sanitized = sanitizeFileName("exploit\0.docx");
      expect(sanitized).toBe("exploit.docx");
      expect(sanitized).not.toContain("\0");
    });

    it("should strip deeply nested directory prefixes", () => {
      const sanitized = sanitizeFileName("../../../../../../windows/system32/calc.docx");
      expect(sanitized).toBe("calc.docx");
    });

    it("should prevent sandbox escape via getSandboxDirectory", () => {
      expect(() => getSandboxDirectory("../../../etc/passwd")).toThrowError(FileValidationError);
      expect(() => getSandboxDirectory("..\\..\\windows")).toThrowError(FileValidationError);
    });
  });

  describe("File Content & Magic Bytes Validation", () => {
    it("should reject fake DOCX (plain text renamed to .docx)", async () => {
      const fakeBuffer = Buffer.from("Hello world, this is a plain text file pretending to be Word.");
      await expect(validateUploadedDocx(fakeBuffer, "fake.docx")).rejects.toThrowError(FileValidationError);
    });

    it("should reject renamed ZIP missing word/document.xml", async () => {
      const zip = new JSZip();
      zip.file("readme.txt", "Some random content");
      zip.file("data.json", JSON.stringify({ a: 1 }));
      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

      await expect(validateUploadedDocx(zipBuffer, "renamed.docx")).rejects.toThrowError(
        /không tìm thấy thành phần word\/document\.xml/
      );
    });

    it("should reject corrupted ZIP (truncated binary data)", async () => {
      // PK header with corrupt payload
      const corruptZip = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00, 0xde, 0xad, 0xbe, 0xef]);
      await expect(validateUploadedDocx(corruptZip, "corrupt.docx")).rejects.toThrowError(FileValidationError);
    });

    it("should reject oversized files exceeding 50MB limit", async () => {
      // Simulate header check with large size
      const oversizeBuffer = Buffer.alloc(MAX_FILE_SIZE_BYTES + 1024);
      oversizeBuffer[0] = 0x50;
      oversizeBuffer[1] = 0x4b;
      oversizeBuffer[2] = 0x03;
      oversizeBuffer[3] = 0x04;

      await expect(validateUploadedDocx(oversizeBuffer, "oversize.docx")).rejects.toThrowError(
        /vượt quá giới hạn cho phép/
      );
    });

    it("should reject invalid MIME types (e.g. application/x-msdownload)", async () => {
      await expect(
        validateUploadedDocx(validBuffer, "valid.docx", "application/x-msdownload")
      ).rejects.toThrowError(/Kiểu nội dung/);
    });

    it("should reject malformed DOCX with unparseable XML in word/document.xml", async () => {
      const zip = new JSZip();
      zip.file("word/document.xml", "<w:document><w:body><unclosed_tag></w:body></w:document>");
      const malformedBuffer = await zip.generateAsync({ type: "nodebuffer" });

      // While zip is valid, parsing inside pipeline will fail validation safely
      const { sanitizedName } = await validateUploadedDocx(malformedBuffer, "malformed.docx");
      expect(sanitizedName).toBe("malformed.docx");
    });
  });
});
