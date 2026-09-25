import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import { getExamMixerUiHtml } from "../ui/exam-mixer-ui.js";
import { validateUploadedDocx, FileValidationError } from "../application/file-service.js";
import { analyzeSourceDocx } from "../application/exam-generation-service.js";
import { examJobService, JobValidationError } from "../application/exam-job-service.js";
import { getJobZipBuffer, getJobAnswerKey, getJobManifest, ResultNotFoundError } from "../application/result-service.js";
/**
 * Parses request body (supporting both JSON and Multipart Form-Data)
 */
export async function parseRequestBody(req) {
    const files = new Map();
    const fields = new Map();
    // If serverless environment (e.g. Vercel) already parsed the body
    if (req.body) {
        const rawBody = req.body;
        if (typeof rawBody === "object" && !Buffer.isBuffer(rawBody)) {
            return { files, fields, jsonBody: rawBody };
        }
        if (typeof rawBody === "string") {
            try {
                const json = JSON.parse(rawBody);
                return { files, fields, jsonBody: json };
            }
            catch {
                // continue
            }
        }
    }
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    const bodyBuffer = Buffer.concat(chunks);
    const contentType = req.headers["content-type"] || "";
    if (contentType.includes("application/json")) {
        try {
            const json = JSON.parse(bodyBuffer.toString("utf8"));
            return { files, fields, jsonBody: json };
        }
        catch {
            return { files, fields };
        }
    }
    // Handle multipart/form-data
    if (contentType.includes("multipart/form-data")) {
        const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
        if (boundaryMatch) {
            const boundary = boundaryMatch[1] || boundaryMatch[2];
            const parts = splitBufferByBoundary(bodyBuffer, boundary);
            for (const part of parts) {
                const headerEnd = part.indexOf("\r\n\r\n");
                if (headerEnd === -1)
                    continue;
                const headerStr = part.subarray(0, headerEnd).toString("utf8");
                const body = part.subarray(headerEnd + 4);
                const nameMatch = headerStr.match(/name="([^"]+)"/i);
                if (!nameMatch)
                    continue;
                const fieldName = nameMatch[1];
                const filenameMatch = headerStr.match(/filename="([^"]+)"/i);
                if (filenameMatch) {
                    const fileName = filenameMatch[1];
                    const typeMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i);
                    const mimeType = typeMatch ? typeMatch[1].trim() : "application/octet-stream";
                    files.set(fieldName, { fileName, mimeType, data: body });
                }
                else {
                    fields.set(fieldName, body.toString("utf8").trim());
                }
            }
        }
    }
    return { files, fields };
}
function splitBufferByBoundary(buf, boundary) {
    const sep = Buffer.from(`--${boundary}`);
    const parts = [];
    let start = 0;
    while (start < buf.length) {
        const idx = buf.indexOf(sep, start);
        if (idx === -1)
            break;
        if (start > 0) {
            // slice part, trimming trailing \r\n if present
            let part = buf.subarray(start, idx);
            if (part.length >= 2 && part[part.length - 2] === 0x0d && part[part.length - 1] === 0x0a) {
                part = part.subarray(0, part.length - 2);
            }
            parts.push(part);
        }
        start = idx + sep.length;
        // Check if end boundary --boundary--
        if (buf[start] === 0x2d && buf[start + 1] === 0x2d) {
            break;
        }
        // Skip \r\n after boundary
        if (buf[start] === 0x0d && buf[start + 1] === 0x0a) {
            start += 2;
        }
    }
    return parts;
}
/**
 * Main request listener for Exam Mixer (handles both standalone HTTP and Serverless/Vercel)
 */
export async function handleExamMixerRequest(req, res) {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }
    const rawUrl = req.headers["x-forwarded-url"] || req.url || "/";
    const parsedUrl = new URL(rawUrl, `http://${req.headers.host || "localhost"}`);
    let pathname = parsedUrl.pathname;
    // Handle Vercel rewrite mapping if any
    if (pathname === "/api" || pathname === "/api/") {
        const orig = req.headers["x-matched-path"];
        if (orig && orig !== "/api") {
            pathname = orig;
        }
        else {
            pathname = "/";
        }
    }
    try {
        // 1. Health check
        if (req.method === "GET" && pathname === "/api/health") {
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ status: "ok", version: "1.0.0", timestamp: new Date().toISOString() }));
            return;
        }
        // 1.1 Sample Exam Download (for first-time users)
        if (req.method === "GET" && pathname === "/api/sample-exam") {
            const candidatePaths = [
                path.resolve(process.cwd(), "DeGocTron.docx"),
                path.resolve(process.cwd(), "tests/fixtures/DeGocTron.docx")
            ];
            let sampleBuf = null;
            for (const p of candidatePaths) {
                if (fs.existsSync(p)) {
                    sampleBuf = fs.readFileSync(p);
                    break;
                }
            }
            if (sampleBuf) {
                res.writeHead(200, {
                    "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "Content-Disposition": 'attachment; filename="DeThiMau_ChuongEsterLipid.docx"',
                    "Content-Length": sampleBuf.byteLength
                });
                res.end(sampleBuf);
            }
            else {
                res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ error: "ERR_SAMPLE_NOT_FOUND", message: "Tệp đề mẫu không tồn tại." }));
            }
            return;
        }
        // 2. Main Web UI
        if (req.method === "GET" && (pathname === "/" || pathname === "/index.html")) {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(getExamMixerUiHtml());
            return;
        }
        // 3. Upload & Analyze Source DOCX
        if (req.method === "POST" && pathname === "/api/upload/source") {
            const { files, jsonBody } = await parseRequestBody(req);
            let buffer;
            let fileName;
            let mimeType;
            if (files.has("file")) {
                const f = files.get("file");
                buffer = f.data;
                fileName = f.fileName;
                mimeType = f.mimeType;
            }
            else if (jsonBody?.fileBase64 && jsonBody?.fileName) {
                buffer = Buffer.from(jsonBody.fileBase64, "base64");
                fileName = jsonBody.fileName;
                mimeType = jsonBody.mimeType;
            }
            else {
                res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ error: "ERR_NO_FILE", message: "Vui lòng đính kèm tệp đề thi." }));
                return;
            }
            const validated = await validateUploadedDocx(buffer, fileName, mimeType);
            const analysis = await analyzeSourceDocx(buffer, validated.sanitizedName);
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify(analysis));
            return;
        }
        // 4. Create Job
        if (req.method === "POST" && pathname === "/api/jobs") {
            const { files, fields, jsonBody } = await parseRequestBody(req);
            let sourceFile;
            let templateFile;
            let configuration = {};
            if (jsonBody) {
                if (!jsonBody.sourceFile?.bufferBase64) {
                    res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                    res.end(JSON.stringify({ error: "ERR_NO_SOURCE", message: "Tệp nguồn không được cung cấp." }));
                    return;
                }
                const srcBuf = Buffer.from(jsonBody.sourceFile.bufferBase64, "base64");
                sourceFile = {
                    name: jsonBody.sourceFile.name || "source.docx",
                    size: srcBuf.byteLength,
                    mimeType: jsonBody.sourceFile.mimeType || "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    buffer: srcBuf
                };
                if (jsonBody.templateFile?.bufferBase64) {
                    const tmplBuf = Buffer.from(jsonBody.templateFile.bufferBase64, "base64");
                    templateFile = {
                        name: jsonBody.templateFile.name || "template.docx",
                        size: tmplBuf.byteLength,
                        mimeType: jsonBody.templateFile.mimeType || "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        buffer: tmplBuf
                    };
                }
                configuration = jsonBody.configuration || {};
            }
            else {
                // Form-data
                const src = files.get("sourceFile");
                if (!src) {
                    res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
                    res.end(JSON.stringify({ error: "ERR_NO_SOURCE", message: "Tệp đề gốc (sourceFile) là bắt buộc." }));
                    return;
                }
                sourceFile = {
                    name: src.fileName,
                    size: src.data.byteLength,
                    mimeType: src.mimeType,
                    buffer: src.data
                };
                const tmpl = files.get("templateFile");
                if (tmpl && tmpl.data.byteLength > 0) {
                    templateFile = {
                        name: tmpl.fileName,
                        size: tmpl.data.byteLength,
                        mimeType: tmpl.mimeType,
                        buffer: tmpl.data
                    };
                }
                const rawConfig = fields.get("configuration");
                if (rawConfig) {
                    try {
                        configuration = JSON.parse(rawConfig);
                    }
                    catch { }
                }
            }
            const job = examJobService.createJob({
                sourceFile,
                templateFile,
                configuration
            });
            res.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify(job));
            return;
        }
        // 5. Start Job
        const startMatch = pathname.match(/^\/api\/jobs\/([a-zA-Z0-9_-]+)\/start$/);
        if (req.method === "POST" && startMatch) {
            const jobId = startMatch[1];
            const job = await examJobService.startJob(jobId);
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify(job));
            return;
        }
        // 6. Get Job Status & Progress
        const jobMatch = pathname.match(/^\/api\/jobs\/([a-zA-Z0-9_-]+)$/);
        if (req.method === "GET" && jobMatch) {
            const jobId = jobMatch[1];
            const job = examJobService.getJob(jobId);
            if (!job) {
                res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
                res.end(JSON.stringify({ error: "ERR_JOB_NOT_FOUND", message: `Không tìm thấy tiến trình '${jobId}'.` }));
                return;
            }
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify(job));
            return;
        }
        // 7. Download ZIP
        const zipMatch = pathname.match(/^\/api\/jobs\/([a-zA-Z0-9_-]+)\/download\/zip$/);
        if (req.method === "GET" && zipMatch) {
            const jobId = zipMatch[1];
            const { buffer, fileName } = getJobZipBuffer(jobId);
            res.writeHead(200, {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="${fileName}"`,
                "Content-Length": buffer.length
            });
            res.end(buffer);
            return;
        }
        // 8. Download Answer Key
        const keyMatch = pathname.match(/^\/api\/jobs\/([a-zA-Z0-9_-]+)\/download\/answer-key$/);
        if (req.method === "GET" && keyMatch) {
            const jobId = keyMatch[1];
            const keyData = getJobAnswerKey(jobId);
            res.writeHead(200, {
                "Content-Type": "application/json; charset=utf-8",
                "Content-Disposition": 'attachment; filename="answer-key.json"'
            });
            res.end(JSON.stringify(keyData, null, 2));
            return;
        }
        // 9. View Manifest
        const manifestMatch = pathname.match(/^\/api\/jobs\/([a-zA-Z0-9_-]+)\/manifest$/);
        if (req.method === "GET" && manifestMatch) {
            const jobId = manifestMatch[1];
            const manifestData = getJobManifest(jobId);
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify(manifestData, null, 2));
            return;
        }
        // 404 Fallback
        res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: "NOT_FOUND", message: "Đường dẫn không tồn tại." }));
    }
    catch (err) {
        console.error("[ServerError]", err);
        let status = 500;
        let code = "ERR_INTERNAL_SERVER";
        if (err instanceof FileValidationError) {
            status = 400;
            code = err.code;
        }
        else if (err instanceof JobValidationError) {
            status = 400;
            code = "ERR_VALIDATION";
        }
        else if (err instanceof ResultNotFoundError) {
            status = 404;
            code = "ERR_NOT_FOUND";
        }
        res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: code, message: err.message, stack: err.stack }));
    }
}
/**
 * Creates the standalone Node.js HTTP server instance
 */
export function createExamMixerServer() {
    return http.createServer(handleExamMixerRequest);
}
