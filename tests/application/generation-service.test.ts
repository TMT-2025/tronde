import { describe, it, expect } from "vitest";
import * as path from "path";
import * as fs from "fs";
import {
  analyzeSourceDocx,
  executeJobPipeline
} from "../../src/application/exam-generation-service.js";
import { ExamGenerationJob } from "../../src/application/types.js";

describe("Exam Generation Service & Source Analysis (TEST-APP-002)", () => {
  const sourceDocxPath = path.resolve(process.cwd(), "DeGocTron.docx");
  const validBuffer = fs.readFileSync(sourceDocxPath);

  it("should analyze source DOCX and extract 28 questions with layout warnings", async () => {
    const preview = await analyzeSourceDocx(validBuffer, "DeGocTron.docx");

    expect(preview.title).toBe("KIỂM TRA CHƯƠNG ESTER - LIPID");
    expect(preview.totalQuestions).toBe(28);
    expect(preview.part1Count).toBe(18);
    expect(preview.part2Count).toBe(4);
    expect(preview.part3Count).toBe(6);

    expect(preview.validation.isValid).toBe(true);
    expect(preview.validation.errors).toBe(0);

    // Should detect warnings for long options (e.g. Câu 12 where option C is long)
    expect(preview.warnings.length).toBeGreaterThan(0);
    const longOptWarn = preview.warnings.find(w => w.code === "WARN_LONG_OPTION");
    expect(longOptWarn).toBeDefined();
  });

  it("should execute job pipeline with progress updates and produce valid result", async () => {
    const recordedProgress: number[] = [];

    const job: ExamGenerationJob = {
      id: `job_test_${Date.now()}`,
      status: "QUEUED",
      sourceFile: {
        name: "DeGocTron.docx",
        size: validBuffer.byteLength,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        buffer: validBuffer
      },
      configuration: {
        variantCount: 2,
        examCodeStart: 101,
        seed: 20260924,
        shuffleQuestions: true,
        shuffleOptions: true,
        shuffleTrueFalseSubItems: false
      },
      progress: {
        percentage: 0,
        currentStep: 0,
        totalSteps: 6,
        message: "Chờ..."
      },
      currentStage: "QUEUED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await executeJobPipeline(job, p => {
      recordedProgress.push(p.percentage);
    });

    expect(job.status).toBe("COMPLETED");
    expect(recordedProgress).toContain(10);
    expect(recordedProgress).toContain(20);
    expect(recordedProgress).toContain(40);
    expect(recordedProgress).toContain(65);
    expect(recordedProgress).toContain(80);
    expect(recordedProgress).toContain(95);
    expect(recordedProgress).toContain(100);

    expect(result.totalVariants).toBe(2);
    expect(result.generatedDocxCount).toBe(2);
    expect(fs.existsSync(result.zipFilePath)).toBe(true);
    expect(fs.existsSync(result.answerKeyFilePath)).toBe(true);
    expect(fs.existsSync(result.manifestFilePath)).toBe(true);
  });

  it("should handle pipeline errors gracefully and record translated error", async () => {
    const corruptJob: ExamGenerationJob = {
      id: `job_corrupt_${Date.now()}`,
      status: "QUEUED",
      sourceFile: {
        name: "corrupt.docx",
        size: 20,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        buffer: Buffer.from("NOT_A_VALID_DOCX_FILE")
      },
      configuration: {
        variantCount: 1,
        examCodeStart: 101,
        seed: 12345,
        shuffleQuestions: true,
        shuffleOptions: true,
        shuffleTrueFalseSubItems: false
      },
      progress: {
        percentage: 0,
        currentStep: 0,
        totalSteps: 6,
        message: "Chờ..."
      },
      currentStage: "QUEUED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await expect(executeJobPipeline(corruptJob)).rejects.toThrow();

    expect(corruptJob.status).toBe("FAILED");
    expect(corruptJob.errors).toBeDefined();
    expect(corruptJob.errors!.length).toBeGreaterThan(0);

    const err = corruptJob.errors![0];
    expect(err.stage).toBeDefined();
    expect(err.message).toBeDefined();
    expect(err.technicalDetails).toBeDefined();
  });
});
