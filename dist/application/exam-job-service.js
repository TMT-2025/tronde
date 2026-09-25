import { executeJobPipeline } from "./exam-generation-service.js";
export class JobValidationError extends Error {
    field;
    constructor(field, message) {
        super(`[JobValidationError - ${field}] ${message}`);
        this.name = "JobValidationError";
        this.field = field;
    }
}
/**
 * Validates and normalizes user input configuration
 */
export function validateJobConfiguration(config) {
    const variantCount = Number(config.variantCount ?? 4);
    if (isNaN(variantCount) || variantCount < 1 || !Number.isInteger(variantCount)) {
        throw new JobValidationError("variantCount", "Số lượng mã đề phải là một số nguyên dương (>= 1).");
    }
    if (variantCount > 500) {
        throw new JobValidationError("variantCount", "Số lượng mã đề không được vượt quá 500 cho một lần xử lý.");
    }
    const rawStart = config.examCodeStart ?? 101;
    const examCodeStart = String(rawStart).trim();
    if (examCodeStart.length === 0) {
        throw new JobValidationError("examCodeStart", "Mã đề bắt đầu không được để trống.");
    }
    const seed = Number(config.seed ?? Date.now());
    if (isNaN(seed)) {
        throw new JobValidationError("seed", "Seed phải là một số hợp lệ.");
    }
    return {
        variantCount,
        examCodeStart,
        seed,
        shuffleQuestions: config.shuffleQuestions ?? true,
        shuffleOptions: config.shuffleOptions ?? true,
        shuffleTrueFalseSubItems: config.shuffleTrueFalseSubItems ?? false
    };
}
class ExamJobService {
    jobs = new Map();
    /**
     * Creates a new exam generation job in QUEUED status
     */
    createJob(params) {
        if (!params.sourceFile) {
            throw new JobValidationError("sourceFile", "Tệp đề thi gốc là bắt buộc.");
        }
        const validatedConfig = validateJobConfiguration(params.configuration);
        const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const now = new Date().toISOString();
        const job = {
            id,
            status: "QUEUED",
            sourceFile: params.sourceFile,
            templateFile: params.templateFile,
            configuration: validatedConfig,
            progress: {
                percentage: 0,
                currentStep: 0,
                totalSteps: 6,
                message: "Đang chờ bắt đầu xử lý..."
            },
            currentStage: "Đã tiếp nhận (Queued)",
            createdAt: now,
            updatedAt: now
        };
        this.jobs.set(id, job);
        return job;
    }
    /**
     * Retrieves a job by ID
     */
    getJob(id) {
        return this.jobs.get(id);
    }
    /**
     * Starts a queued job asynchronously
     */
    async startJob(id) {
        const job = this.jobs.get(id);
        if (!job) {
            throw new Error(`Job '${id}' not found.`);
        }
        if (job.status !== "QUEUED" && job.status !== "FAILED") {
            throw new Error(`Job '${id}' is already in state '${job.status}'.`);
        }
        // Execute pipeline (await directly on serverless/Vercel so execution completes before freeze)
        if (process.env.VERCEL) {
            await executeJobPipeline(job);
        }
        else {
            executeJobPipeline(job).catch(err => {
                // Errors are recorded directly on job.errors
                console.error(`[JobService] Job ${id} execution error:`, err.message);
            });
        }
        return job;
    }
    /**
     * Synchronously waits for job completion (useful for programmatic or testing calls)
     */
    async executeJobSync(id) {
        const job = this.jobs.get(id);
        if (!job) {
            throw new Error(`Job '${id}' not found.`);
        }
        await executeJobPipeline(job);
        return job;
    }
    /**
     * Lists all existing jobs
     */
    listJobs() {
        return Array.from(this.jobs.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    /**
     * Clears all jobs from memory
     */
    clearJobs() {
        this.jobs.clear();
    }
}
export const examJobService = new ExamJobService();
