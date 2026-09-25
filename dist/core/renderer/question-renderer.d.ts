import { ExamQuestion } from "../ir/types.js";
import { TemplateProfile } from "./template-loader.js";
export declare function renderQuestionStem(question: ExamQuestion, displayIndex: number, profile: TemplateProfile): string;
export declare function renderQuestion(question: ExamQuestion, displayIndex: number, profile: TemplateProfile): string;
