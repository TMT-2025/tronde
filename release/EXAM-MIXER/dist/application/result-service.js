import * as fs from "fs";
import { examJobService } from "./exam-job-service.js";
export class ResultNotFoundError extends Error {
    constructor(message) {
        super(`[ResultNotFoundError] ${message}`);
        this.name = "ResultNotFoundError";
    }
}
/**
 * Retrieves the result object of a completed job
 */
export function getJobResult(jobId) {
    const job = examJobService.getJob(jobId);
    if (!job) {
        throw new ResultNotFoundError(`Mã tiến trình '${jobId}' không tồn tại.`);
    }
    if (job.status !== "COMPLETED" || !job.result) {
        throw new ResultNotFoundError(`Tiến trình '${jobId}' chưa hoàn thành (trạng thái hiện tại: ${job.status}).`);
    }
    return job.result;
}
/**
 * Reads and returns the ZIP buffer for downloading
 */
export function getJobZipBuffer(jobId) {
    const result = getJobResult(jobId);
    if (!fs.existsSync(result.zipFilePath)) {
        throw new ResultNotFoundError(`Tệp nén '${result.zipFileName}' không tồn tại trên hệ thống.`);
    }
    const buffer = fs.readFileSync(result.zipFilePath);
    return { buffer, fileName: result.zipFileName };
}
/**
 * Reads and returns the Answer Key JSON object
 */
export function getJobAnswerKey(jobId) {
    const result = getJobResult(jobId);
    if (!fs.existsSync(result.answerKeyFilePath)) {
        throw new ResultNotFoundError(`Tệp đáp án '${result.answerKeyFileName}' không tồn tại trên hệ thống.`);
    }
    const str = fs.readFileSync(result.answerKeyFilePath, "utf8");
    return JSON.parse(str);
}
/**
 * Reads and returns the Manifest JSON object
 */
export function getJobManifest(jobId) {
    const result = getJobResult(jobId);
    if (!fs.existsSync(result.manifestFilePath)) {
        throw new ResultNotFoundError(`Tệp thông số '${result.manifestFileName}' không tồn tại trên hệ thống.`);
    }
    const str = fs.readFileSync(result.manifestFilePath, "utf8");
    return JSON.parse(str);
}
