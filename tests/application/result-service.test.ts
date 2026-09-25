import { describe, it, expect, beforeEach } from "vitest";
import * as path from "path";
import * as fs from "fs";
import { examJobService } from "../../src/application/exam-job-service.js";
import {
  getJobResult,
  getJobZipBuffer,
  getJobAnswerKey,
  getJobManifest,
  ResultNotFoundError
} from "../../src/application/result-service.js";

describe("Result Service (TEST-APP-004)", () => {
  const sourceDocxPath = path.resolve(process.cwd(), "DeGocTron.docx");
  const validBuffer = fs.readFileSync(sourceDocxPath);

  beforeEach(() => {
    examJobService.clearJobs();
  });

  it("should throw ResultNotFoundError when job does not exist or is not completed", () => {
    expect(() => getJobResult("non_existent_id")).toThrowError(ResultNotFoundError);

    const queuedJob = examJobService.createJob({
      sourceFile: { name: "test.docx", size: 100, mimeType: "application/docx", buffer: validBuffer },
      configuration: { variantCount: 1 }
    });

    expect(() => getJobResult(queuedJob.id)).toThrowError(ResultNotFoundError);
    expect(() => getJobZipBuffer(queuedJob.id)).toThrowError(ResultNotFoundError);
  });

  it("should return valid ZIP, Answer Key, and Manifest for completed job", async () => {
    const job = examJobService.createJob({
      sourceFile: { name: "DeGocTron.docx", size: validBuffer.byteLength, mimeType: "application/docx", buffer: validBuffer },
      configuration: { variantCount: 2, examCodeStart: 101, seed: 12345 }
    });

    await examJobService.executeJobSync(job.id);

    const result = getJobResult(job.id);
    expect(result).toBeDefined();
    expect(result.totalVariants).toBe(2);

    const zipData = getJobZipBuffer(job.id);
    expect(zipData.buffer.byteLength).toBeGreaterThan(10000);
    expect(zipData.fileName).toContain(".zip");

    const answerKey = getJobAnswerKey(job.id);
    expect(answerKey.variants["101"]).toBeDefined();
    expect(answerKey.variants["102"]).toBeDefined();

    const manifest = getJobManifest(job.id);
    expect(manifest.manifestVersion).toBe("1.0.0");
    expect(manifest.variantCount).toBe(2);
  });
});
