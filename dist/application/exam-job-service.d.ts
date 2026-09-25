import { ExamGenerationJob, ExamJobConfiguration, ExamJobFile } from "./types.js";
export interface CreateJobParams {
    sourceFile: ExamJobFile;
    templateFile?: ExamJobFile;
    configuration: Partial<ExamJobConfiguration>;
}
export declare class JobValidationError extends Error {
    readonly field: string;
    constructor(field: string, message: string);
}
/**
 * Validates and normalizes user input configuration
 */
export declare function validateJobConfiguration(config: Partial<ExamJobConfiguration>): ExamJobConfiguration;
declare class ExamJobService {
    private jobs;
    /**
     * Creates a new exam generation job in QUEUED status
     */
    createJob(params: CreateJobParams): ExamGenerationJob;
    /**
     * Retrieves a job by ID
     */
    getJob(id: string): ExamGenerationJob | undefined;
    /**
     * Starts a queued job asynchronously
     */
    startJob(id: string): Promise<ExamGenerationJob>;
    /**
     * Synchronously waits for job completion (useful for programmatic or testing calls)
     */
    executeJobSync(id: string): Promise<ExamGenerationJob>;
    /**
     * Lists all existing jobs
     */
    listJobs(): ExamGenerationJob[];
    /**
     * Clears all jobs from memory
     */
    clearJobs(): void;
}
export declare const examJobService: ExamJobService;
export {};
