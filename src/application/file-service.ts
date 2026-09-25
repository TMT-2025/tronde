import * as fs from "fs";
import * as path from "path";
import JSZip from "jszip";
import { ExamJobFile } from "./types.js";

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
export const ALLOWED_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "application/octet-stream",
  "application/x-zip-compressed"
]);

export class FileValidationError extends Error {
  public readonly code: string;
  constructor(code: string, message: string) {
    super(`[FileValidationError - ${code}] ${message}`);
    this.name = "FileValidationError";
    this.code = code;
  }
}

/**
 * Sanitizes a file name to prevent path traversal or unsafe characters
 */
export function sanitizeFileName(rawName: string): string {
  if (!rawName || typeof rawName !== "string") {
    return "document.docx";
  }

  // Strip null bytes and control characters
  let clean = rawName.replace(/[\x00-\x1F\x7F]/g, "");

  // Extract basename to eliminate any leading directories
  clean = path.basename(clean);

  // Eliminate path traversal patterns: .., \, /
  clean = clean.replace(/\.{2,}/g, ".");
  clean = clean.replace(/[/\\]/g, "");

  // Trim whitespace
  clean = clean.trim();

  // If empty or purely dots, fallback
  if (!clean || /^[\.]+$/.test(clean)) {
    return "document.docx";
  }

  // Truncate if overly long
  if (clean.length > 120) {
    const ext = path.extname(clean);
    clean = clean.substring(0, 110) + ext;
  }

  return clean;
}

/**
 * Validates file buffer, MIME type, extension, size, and OpenXML integrity
 */
export async function validateUploadedDocx(
  buffer: Buffer | Uint8Array,
  fileName: string,
  mimeType?: string
): Promise<{ sanitizedName: string; size: number }> {
  const sanitizedName = sanitizeFileName(fileName);

  // 1. Extension check
  const ext = path.extname(sanitizedName).toLowerCase();
  if (ext !== ".docx") {
    throw new FileValidationError(
      "ERR_INVALID_EXTENSION",
      `Định dạng file không hợp lệ (${ext || "không có phần mở rộng"}). Hệ thống chỉ chấp nhận tệp Microsoft Word (.docx).`
    );
  }

  // 2. MIME type check (if provided)
  if (mimeType && mimeType.trim().length > 0) {
    const normMime = mimeType.toLowerCase().split(";")[0].trim();
    if (!ALLOWED_MIME_TYPES.has(normMime)) {
      throw new FileValidationError(
        "ERR_INVALID_MIME",
        `Kiểu nội dung (MIME type: ${normMime}) không được hỗ trợ. Vui lòng tải lên tệp .docx hợp lệ.`
      );
    }
  }

  // 3. File size check
  const size = buffer.byteLength;
  if (size === 0) {
    throw new FileValidationError("ERR_EMPTY_FILE", "Tệp tải lên rỗng (0 bytes).");
  }
  if (size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (size / (1024 * 1024)).toFixed(2);
    throw new FileValidationError(
      "ERR_FILE_TOO_LARGE",
      `Dung lượng tệp vượt quá giới hạn cho phép (${sizeMb} MB > 50 MB).`
    );
  }

  // 4. Magic bytes check (ZIP header PK\x03\x04 = 0x50, 0x4B, 0x03, 0x04)
  const isZip =
    buffer[0] === 0x50 &&
    buffer[1] === 0x4B &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04;

  if (!isZip) {
    throw new FileValidationError(
      "ERR_NOT_A_ZIP",
      "Tệp không đúng định dạng nhị phân OpenXML (thiếu chữ ký ZIP hợp lệ)."
    );
  }

  // 5. Structure check: must contain word/document.xml
  try {
    const zip = await JSZip.loadAsync(buffer);
    if (!zip.file("word/document.xml")) {
      throw new FileValidationError(
        "ERR_MISSING_DOCUMENT_XML",
        "Tệp .docx bị lỗi cấu trúc: không tìm thấy thành phần word/document.xml bên trong tài liệu."
      );
    }
  } catch (err: any) {
    if (err instanceof FileValidationError) throw err;
    throw new FileValidationError(
      "ERR_CORRUPT_ARCHIVE",
      `Không thể giải nén tài liệu .docx: ${err.message}`
    );
  }

  return { sanitizedName, size };
}

/**
 * Resolves a safe path inside the workspace sandbox
 */
export function getSandboxDirectory(...subPaths: string[]): string {
  const baseSandbox = process.env.SANDBOX_DIR
    ? path.resolve(process.env.SANDBOX_DIR)
    : (process.env.VERCEL ? path.resolve("/tmp", "output", "sandbox") : path.resolve(process.cwd(), "output", "sandbox"));
  const fullPath = path.resolve(baseSandbox, ...subPaths);

  // Security: prevent directory escape
  if (!fullPath.startsWith(baseSandbox)) {
    throw new FileValidationError("ERR_PATH_TRAVERSAL", "Truy cập đường dẫn nằm ngoài sandbox bị từ chối.");
  }

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  return fullPath;
}

/**
 * Saves uploaded file securely in the sandbox for a job
 */
export async function saveUploadedFileToSandbox(
  jobId: string,
  buffer: Buffer | Uint8Array,
  fileName: string,
  mimeType?: string
): Promise<ExamJobFile> {
  const { sanitizedName, size } = await validateUploadedDocx(buffer, fileName, mimeType);
  const jobDir = getSandboxDirectory(jobId);
  const targetPath = path.join(jobDir, sanitizedName);

  fs.writeFileSync(targetPath, buffer);

  return {
    name: sanitizedName,
    size,
    mimeType: mimeType || "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    path: targetPath,
    buffer
  };
}
