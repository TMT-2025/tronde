import { QuestionOption } from "../ir/types.js";
import { OptionLayoutMode } from "./layout-engine.js";
import { TemplateProfile } from "./template-loader.js";
export declare function renderOptions(options: readonly QuestionOption[], layoutMode: OptionLayoutMode, profile: TemplateProfile): string;
