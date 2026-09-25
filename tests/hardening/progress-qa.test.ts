import { describe, it, expect } from "vitest";
import * as path from "path";
import * as fs from "fs";
import { executeJobPipeline } from "../../src/application/exam-generation-service.js";
import { ExamGenerationJob, ExamJobProgress } from "../../src/application/types.js";

describe("Progress Tracking QA (TASK 2)", () => {
  const sourceDocxPath = path.resolve(process.cwd(), "DeGocTron.docx");
  const validBuffer = fs.readFileSync(sourceDocxPath);

  it("should transition through all 7 operational stages in strictly increasing order", async () => {
    const progressHistory: ExamJobProgress[] = [];

    const job: ExamGenerationJob = {
      id: `job_progress_${Date.now()}`,
      status: "QUEUED",
      sourceFile: {
        name: "DeGocTron.docx",
        size: validBuffer.byteLength,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        buffer: validBuffer
      },
      configuration: {
        variantCount: 4,
        examCodeStart: 101,
        seed: 20260925,
        shuffleQuestions: true,
        shuffleOptions: true,
        shuffleTrueFalseSubItems: false
      },
      progress: {
        percentage: 0,
        currentStep: 0,
        totalSteps: 6,
        message: "Khởi tạo..."
      },
      currentStage: "QUEUED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await executeJobPipeline(job, p => {
      progressHistory.push({ ...p });
    });

    expect(job.status).toBe("COMPLETED");
    expect(result).toBeDefined();

    // Verify progress snapshots count
    expect(progressHistory.length).toBeGreaterThanOrEqual(7);

    const percentages = progressHistory.map(p => p.percentage);

    // Verify monotonic increase
    for (let i = 1; i < percentages.length; i++) {
      expect(percentages[i]).toBeGreaterThanOrEqual(percentages[i - 1]);
    }

    // Verify expected milestones
    expect(percentages).toContain(10); // PARSING
    expect(percentages).toContain(20); // VALIDATING
    expect(percentages).toContain(40); // MIXING
    expect(percentages).toContain(65); // RENDERING
    expect(percentages).toContain(80); // VALIDATING_OUTPUT
    expect(percentages).toContain(95); // PACKAGING
    expect(percentages).toContain(100); // COMPLETED

    // Verify meaningful messages at each step (not generic filler)
    const parsingStep = progressHistory.find(p => p.percentage === 10);
    expect(parsingStep?.message).toContain("phân tích");

    const validatingStep = progressHistory.find(p => p.percentage === 20);
    expect(validatingStep?.message).toContain("hợp lệ");

    const mixingStep = progressHistory.find(p => p.percentage === 40);
    expect(mixingStep?.message).toContain("4 mã đề");

    const renderingStep = progressHistory.find(p => p.percentage === 65);
    expect(renderingStep?.message).toContain("DOCX");

    const packagingStep = progressHistory.find(p => p.percentage === 95);
    expect(packagingStep?.message).toContain("ZIP");

    const completedStep = progressHistory.find(p => p.percentage === 100);
    expect(completedStep?.message).toContain("thành công");
  });
});
