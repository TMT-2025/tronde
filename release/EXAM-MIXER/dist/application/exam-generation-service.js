import * as path from "path";
import * as fs from "fs";
import { parseDocx } from "../core/parser/docx-parser.js";
import { validateExamIR } from "../core/validation/parser-validator.js";
import { richContentToPlainText } from "../core/ir/helpers.js";
import { runExamPipeline } from "../core/pipeline/exam-pipeline.js";
import { PipelineQualityGateError } from "../core/pipeline/pipeline-validator.js";
import { getSandboxDirectory } from "./file-service.js";
/**
 * Analyzes an uploaded source DOCX, extracts structural preview, and reports potential layout warnings
 */
export async function analyzeSourceDocx(buffer, fileName) {
    const exam = await parseDocx(buffer, { fileName });
    const validation = validateExamIR(exam);
    const sec1 = exam.sections.find(s => s.sectionIndex === 1);
    const sec2 = exam.sections.find(s => s.sectionIndex === 2);
    const sec3 = exam.sections.find(s => s.sectionIndex === 3);
    const part1Count = sec1 ? sec1.questions.length : 0;
    const part2Count = sec2 ? sec2.questions.length : 0;
    const part3Count = sec3 ? sec3.questions.length : 0;
    const totalQuestions = exam.sections.reduce((sum, s) => sum + s.questions.length, 0);
    // Generate teacher-friendly warnings
    const warnings = [];
    for (const s of exam.sections) {
        for (const q of s.questions) {
            const stemText = richContentToPlainText(q.stem).trim();
            if (stemText.length > 500) {
                warnings.push({
                    code: "WARN_LONG_STEM",
                    severity: "INFO",
                    message: `Câu hỏi ${q.id} có nội dung tương đối dài (${stemText.length} ký tự).`,
                    affectedQuestionId: q.id
                });
            }
            if (q.type === "MULTIPLE_CHOICE" && q.options) {
                for (const opt of q.options) {
                    const optText = richContentToPlainText(opt.content).trim();
                    if (optText.length > 45) {
                        warnings.push({
                            code: "WARN_LONG_OPTION",
                            severity: "INFO",
                            message: `Câu hỏi ${q.id} có phương án '${opt.currentLabel}' dài (${optText.length} ký tự). Hệ thống sẽ tự động dồn 1 cột độc lập.`,
                            affectedQuestionId: q.id
                        });
                        break; // 1 warning per question is enough
                    }
                }
            }
        }
    }
    return {
        title: exam.header?.examTitle || "BÀI KIỂM TRA",
        part1Count,
        part2Count,
        part3Count,
        totalQuestions,
        validation: {
            isValid: validation.isValid,
            errors: validation.totalErrors,
            warnings: validation.totalWarnings,
            issues: validation.issues
        },
        warnings,
        sections: exam.sections.map(s => ({
            id: s.id,
            sectionIndex: s.sectionIndex,
            title: s.title,
            type: s.type,
            questionCount: s.questions.length
        }))
    };
}
/**
 * Runs the full generation job with progress reporting and error translation
 */
export async function executeJobPipeline(job, onProgress) {
    const updateProgress = (percentage, currentStep, totalSteps, message, details) => {
        job.progress = { percentage, currentStep, totalSteps, message, details };
        if (onProgress) {
            onProgress(job.progress);
        }
    };
    const outputSandboxDir = getSandboxDirectory(job.id, "dist");
    try {
        // Stage 1: PARSING
        job.status = "PARSING";
        job.currentStage = "Phân tích cú pháp tệp đề gốc (Parsing)";
        updateProgress(10, 1, 6, "Đang đọc và phân tích cấu trúc đề gốc DOCX...");
        // Stage 2: VALIDATING
        job.status = "VALIDATING";
        job.currentStage = "Thẩm định chất lượng dữ liệu nguồn (Gate 1)";
        updateProgress(20, 2, 6, "Đang kiểm tra tính hợp lệ của đề thi và đáp án...");
        // Stage 3 & 4: MIXING & RENDERING (Orchestrated by Pipeline)
        job.status = "MIXING";
        job.currentStage = "Xáo trộn câu hỏi và phương án (Mixing)";
        updateProgress(40, 3, 6, `Đang sinh ${job.configuration.variantCount} mã đề thi tất định...`);
        job.status = "RENDERING";
        job.currentStage = "Kết xuất tệp Word chuẩn in ấn (Rendering)";
        updateProgress(65, 4, 6, "Đang kết xuất tệp DOCX cho học sinh (bảo vệ chống rò rỉ đáp án)...");
        job.status = "VALIDATING_OUTPUT";
        job.currentStage = "Thẩm định chất lượng tệp xuất xưởng (Gate 3)";
        updateProgress(80, 5, 6, "Đang kiểm tra tính toàn vẹn và bảo mật của toàn bộ tệp DOCX...");
        // Execute core pipeline
        const pipelineResult = await runExamPipeline({
            sourceDocx: job.sourceFile.buffer || job.sourceFile.path,
            templateDocx: job.templateFile ? (job.templateFile.buffer || job.templateFile.path) : undefined,
            examCodeStart: job.configuration.examCodeStart,
            variantCount: job.configuration.variantCount,
            seed: job.configuration.seed,
            mixingConfiguration: {
                shuffleQuestions: job.configuration.shuffleQuestions,
                shuffleOptions: job.configuration.shuffleOptions,
                shuffleTrueFalseSubItems: job.configuration.shuffleTrueFalseSubItems
            },
            outputDir: outputSandboxDir,
            createZip: true,
            skipDiskWrite: false
        });
        // Stage 5: PACKAGING
        job.status = "PACKAGING";
        job.currentStage = "Đóng gói bàn giao (Packaging)";
        updateProgress(95, 6, 6, "Đang tạo gói ZIP và xuất bảng đáp án...");
        const exportRes = pipelineResult.exportResult;
        const zipStats = exportRes.zipPath && fs.existsSync(exportRes.zipPath)
            ? fs.statSync(exportRes.zipPath)
            : undefined;
        const result = {
            jobId: job.id,
            totalVariants: job.configuration.variantCount,
            generatedDocxCount: exportRes.docxFileNames.length,
            zipFileName: exportRes.zipFileName || `EXAM_OUTPUT_${job.id}.zip`,
            zipFilePath: exportRes.zipPath || path.join(outputSandboxDir, `EXAM_OUTPUT_${job.id}.zip`),
            zipFileSize: zipStats ? zipStats.size : 0,
            answerKeyFileName: exportRes.answerKeyFileName,
            answerKeyFilePath: exportRes.answerKeyPath,
            manifestFileName: exportRes.manifestFileName,
            manifestFilePath: exportRes.manifestPath,
            examCodes: pipelineResult.batchItems.map(i => i.examCode),
            benchmarks: pipelineResult.benchmarks
        };
        job.result = result;
        job.status = "COMPLETED";
        job.currentStage = "Hoàn tất thành công";
        job.updatedAt = new Date().toISOString();
        updateProgress(100, 6, 6, `Đã tạo thành công ${result.totalVariants} mã đề thi!`);
        return result;
    }
    catch (err) {
        job.status = "FAILED";
        job.updatedAt = new Date().toISOString();
        const translatedError = {
            stage: job.currentStage,
            code: err instanceof PipelineQualityGateError ? err.gate : "ERR_PIPELINE_FAILED",
            message: err.message || "Đã xảy ra lỗi không xác định trong quá trình sinh đề thi.",
            technicalDetails: err.stack || JSON.stringify(err)
        };
        if (err instanceof PipelineQualityGateError && err.issues.length > 0) {
            const firstIssue = err.issues[0];
            translatedError.code = firstIssue.code || translatedError.code;
            translatedError.affectedQuestion = firstIssue.questionId;
            translatedError.message = firstIssue.message || translatedError.message;
        }
        job.errors = [translatedError];
        updateProgress(job.progress.percentage, job.progress.currentStep, 6, `Lỗi: ${translatedError.message}`);
        throw err;
    }
}
