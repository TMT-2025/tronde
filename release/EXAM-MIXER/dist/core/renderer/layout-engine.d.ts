import { QuestionOption } from "../ir/types.js";
export type OptionLayoutMode = "4_COLUMNS" | "2_COLUMNS" | "1_COLUMN";
export declare function determineOptionLayout(options: readonly QuestionOption[]): OptionLayoutMode;
