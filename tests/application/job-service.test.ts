import { describe, it, expect, beforeEach } from "vitest";
import * as path from "path";
import * as fs from "fs";
import {
  examJobService,
  validateJobConfiguration,
  JobValidationError
} from "../../src/application/exam-job-service.js";

describe("Exam Job Service & Configuration Validation (TEST-APP-003)", () => {
  const sourceDocxPath = path.resolve(process.cwd(), "DeGocTron.docx");
  const validBuffer = fs.readFileSync(sourceDocxPath);

  beforeEach(() => {
    examJobService.clearJobs();
  });

  it("should validate and normalize correct configuration", () => {
    const config = validateJobConfiguration({
      variantCount: 4,
      examCodeStart: 101,
      seed: 20260924,
      shuffleQuestions: true,
      shuffleOptions: true,
      shuffleTrueFalseSubItems: false
    });

    expect(config.variantCount).toBe(4);
    expect(config.examCodeStart).toBe("101");
    expect(config.seed).toBe(20260924);
  });

  it("should reject invalid variantCount (< 1, float, > 500)", () => {
    expect(() => validateJobConfiguration({ variantCount: 0 })).toThrowError(JobValidationError);
    expect(() => validateJobConfiguration({ variantCount: -5 })).toThrowError(JobValidationError);
    expect(() => validateJobConfiguration({ variantCount: 3.5 })).toThrowError(JobValidationError);
    expect(() => validateJobConfiguration({ variantCount: 600 })).toThrowError(JobValidationError);
  });

  it("should reject empty examCodeStart", () => {
    expect(() => validateJobConfiguration({ examCodeStart: "   " })).toThrowError(JobValidationError);
  });

  it("should reject NaN seed", () => {
    expect(() => validateJobConfiguration({ seed: NaN })).toThrowError(JobValidationError);
  });

  it("should create a new job in QUEUED status", () => {
    const job = examJobService.createJob({
      sourceFile: {
        name: "DeGocTron.docx",
        size: validBuffer.byteLength,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        buffer: validBuffer
      },
      configuration: {
        variantCount: 2,
        examCodeStart: "101",
        seed: 20260924
      }
    });

    expect(job.id).toBeDefined();
    expect(job.status).toBe("QUEUED");
    expect(job.progress.percentage).toBe(0);

    const fetched = examJobService.getJob(job.id);
    expect(fetched).toBeDefined();
    expect(fetched?.id).toBe(job.id);
  });

  it("should list jobs and clear jobs properly", () => {
    examJobService.createJob({
      sourceFile: { name: "test1.docx", size: 100, mimeType: "application/docx", buffer: validBuffer },
      configuration: { variantCount: 1 }
    });
    examJobService.createJob({
      sourceFile: { name: "test2.docx", size: 100, mimeType: "application/docx", buffer: validBuffer },
      configuration: { variantCount: 1 }
    });

    expect(examJobService.listJobs().length).toBe(2);

    examJobService.clearJobs();
    expect(examJobService.listJobs().length).toBe(0);
  });
});
