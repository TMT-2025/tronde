import { ValidationReport } from "../core/validation/parser-validator.js";
import { PipelineBenchmarkReport } from "../core/pipeline/manifest-generator.js";

export type ExamGenerationJobStatus =
  | "QUEUED"
  | "PARSING"
  | "VALIDATING"
  | "MIXING"
  | "RENDERING"
  | "VALIDATING_OUTPUT"
  | "PACKAGING"
  | "COMPLETED"
  | "FAILED";

export interface ExamJobConfiguration {
  variantCount: number;
  examCodeStart: number | string;
  seed: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  shuffleTrueFalseSubItems: boolean;
}

export interface ExamJobFile {
  name: string;
  size: number;
  mimeType: string;
  path?: string;
  buffer?: Buffer | Uint8Array;
}

export interface ExamJobProgress {
  percentage: number; // 0 to 100
  currentStep: number;
  totalSteps: number;
  message: string;
  details?: string;
}

export interface ExamJobResult {
  jobId: string;
  totalVariants: number;
  generatedDocxCount: number;
  zipFileName: string;
  zipFilePath: string;
  zipFileSize: number;
  answerKeyFileName: string;
  answerKeyFilePath: string;
  excelFileName?: string;
  excelFilePath?: string;
  manifestFileName: string;
  manifestPath: string;
  manifestFilePath?: string;
  examCodes: string[];
  benchmarks: PipelineBenchmarkReport;
}

export interface ExamJobError {
  stage: string;
  code: string;
  message: string;
  technicalDetails?: string;
  affectedQuestion?: string;
  affectedDocument?: string;
}

export interface ExamGenerationJob {
  id: string;
  status: ExamGenerationJobStatus;
  sourceFile: ExamJobFile;
  templateFile?: ExamJobFile;
  configuration: ExamJobConfiguration;
  progress: ExamJobProgress;
  currentStage: string;
  result?: ExamJobResult;
  errors?: ExamJobError[];
  createdAt: string;
  updatedAt: string;
}

export interface WarningItem {
  code: string;
  severity: "WARNING" | "INFO";
  message: string;
  affectedQuestionId?: string;
  details?: string;
}

export interface ExamAnalysisPreview {
  title: string;
  part1Count: number; // 18
  part2Count: number; // 4
  part3Count: number; // 6
  totalQuestions: number; // 28
  validation: {
    isValid: boolean;
    errors: number;
    warnings: number;
    issues: any[];
  };
  warnings: WarningItem[];
  sections: Array<{
    id: string;
    sectionIndex: number;
    title: string;
    type: string;
    questionCount: number;
  }>;
}
