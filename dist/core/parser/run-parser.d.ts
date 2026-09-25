import { Element } from "@xmldom/xmldom";
import { FormattedRun, RichParagraph } from "../ir/types.js";
export declare function parseRunElement(rElement: Element, options?: {
    sanitizeUnderline?: boolean;
}): FormattedRun[];
export declare function parseParagraphElement(pElement: Element, options?: {
    sanitizeUnderline?: boolean;
}): RichParagraph;
export declare function elementHasUnderline(element: Element): boolean;
export declare function elementHasColor(element: Element, colorHexPrefix: string): boolean;
