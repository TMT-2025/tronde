import { describe, it, expect } from "vitest";
import * as path from "path";
import * as fs from "fs";
import { runExamPipeline } from "../../src/core/pipeline/exam-pipeline.js";
import { examJobService, validateJobConfiguration, JobValidationError } from "../../src/application/exam-job-service.js";
import { getJobResult, ResultNotFoundError } from "../../src/application/result-service.js";
import { executeJobPipeline } from "../../src/application/exam-generation-service.js";
import { ExamGenerationJob } from "../../src/application/types.js";

describe("Error Recovery & Resiliency QA (TASK 7)", () => {
  const sourceDocxPath = path.resolve(process.cwd(), "DeGocTron.docx");
  const validBuffer = fs.readFileSync(sourceDocxPath);

  describe("Input Configuration Error Handling", () => {
    it("should reject negative or zero variant count", () => {
      expect(() => validateJobConfiguration({ variantCount: 0 })).toThrowError(JobValidationError);
      expect(() => validateJobConfiguration({ variantCount: -1 })).toThrowError(JobValidationError);
    });

    it("should reject variant count exceeding 500", () => {
      expect(() => validateJobConfiguration({ variantCount: 501 })).toThrowError(JobValidationError);
    });

    it("should reject blank exam code start", () => {
      expect(() => validateJobConfiguration({ examCodeStart: "   " })).toThrowError(JobValidationError);
    });

    it("should reject non-numeric seed", () => {
      expect(() => validateJobConfiguration({ seed: NaN })).toThrowError(JobValidationError);
    });
  });

  describe("Pipeline Error Recovery", () => {
    it("should handle corrupt source file without crashing the runtime", async () => {
      const corruptBuffer = Buffer.from("CORRUPT_NOT_A_VALID_ZIP");

      await expect(
        runExamPipeline({
          sourceDocx: corruptBuffer,
          examCodeStart: 101,
          variantCount: 1
        })
      ).rejects.toThrow();
    });

    it("should handle job failure gracefully and populate error models", async () => {
      const failedJob: ExamGenerationJob = {
        id: `job_fail_${Date.now()}`,
        status: "QUEUED",
        sourceFile: {
          name: "bad.docx",
          size: 15,
          mimeType: "application/docx",
          buffer: Buffer.from("INVALID_CONTENT")
        },
        configuration: {
          variantCount: 1,
          examCodeStart: 101,
          seed: 1234,
          shuffleQuestions: true,
          shuffleOptions: true,
          shuffleTrueFalseSubItems: false
        },
        progress: {
          percentage: 0,
          currentStep: 0,
          totalSteps: 6,
          message: "Bắt đầu..."
        },
        currentStage: "QUEUED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await expect(executeJobPipeline(failedJob)).rejects.toThrow();

      expect(failedJob.status).toBe("FAILED");
      expect(failedJob.errors).toBeDefined();
      expect(failedJob.errors!.length).toBeGreaterThan(0);
      expect(failedJob.errors![0].code).toBeDefined();
      expect(failedJob.errors![0].message).toBeDefined();
    });
  });

  describe("Download Before Completion & Missing Resources", () => {
    it("should prevent download before job completion", () => {
      const incompleteJob = examJobService.createJob({
        sourceFile: { name: "test.docx", size: 100, mimeType: "application/docx", buffer: validBuffer },
        configuration: { variantCount: 1 }
      });

      expect(() => getJobResult(incompleteJob.id)).toThrowError(ResultNotFoundError);
    });

    it("should throw ResultNotFoundError on non-existent job ID", () => {
      expect(() => getJobResult("ghost_job_999999")).toThrowError(ResultNotFoundError);
    });
  });
});
