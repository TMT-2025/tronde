export interface PageGeometryProfile {
    pageWidthDxa: number;
    pageHeightDxa: number;
    marginTopDxa: number;
    marginBottomDxa: number;
    marginLeftDxa: number;
    marginRightDxa: number;
    headerMarginDxa: number;
    footerMarginDxa: number;
    contentWidthDxa: number;
}
export interface TabStopProfile {
    fourColumns: number[];
    twoColumns: number[];
    oneColumn: number[];
    trueFalse: number[];
    footerRightTabDxa: number;
}
export interface HeaderTableProfile {
    colWidthsDxa: [number, number, number];
    borderBottomSize: number;
    nameFieldPrompt: string;
    idFieldPrompt: string;
}
export interface TypographyProfile {
    fontName: string;
    fontSizeHalfPoints: number;
    questionStemSpacingBeforeDxa: number;
    endMarkerText: string;
}
export interface TemplateProfile {
    profileId: string;
    name: string;
    geometry: PageGeometryProfile;
    tabs: TabStopProfile;
    headerTable: HeaderTableProfile;
    typography: TypographyProfile;
}
export declare const DEFAULT_TEMPLATE_PROFILE: TemplateProfile;
/**
 * Loads a reference DOCX template buffer from disk
 */
export declare function loadTemplateBuffer(customPath?: string): Buffer;
