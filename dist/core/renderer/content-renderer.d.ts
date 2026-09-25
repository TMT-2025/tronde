import { FormattedRun, RichParagraph, RichContent, TabStopDefinition } from "../ir/types.js";
export declare function escapeXml(str: string): string;
export declare function renderRunToXml(run: FormattedRun, options?: {
    sanitizeUnderline?: boolean;
}): string;
export declare function renderTabsToXml(tabStops?: TabStopDefinition[]): string;
export declare function renderParagraphToXml(paragraph: RichParagraph, options?: {
    sanitizeUnderline?: boolean;
    extraTabs?: TabStopDefinition[];
    spacingBeforeDxa?: number;
    spacingAfterDxa?: number;
    alignment?: "left" | "center" | "right" | "justify";
}): string;
export declare function renderRichContentToXml(content: RichContent, options?: {
    sanitizeUnderline?: boolean;
}): string;
