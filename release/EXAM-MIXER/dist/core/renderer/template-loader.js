import * as fs from "fs";
import * as path from "path";
export const DEFAULT_TEMPLATE_PROFILE = {
    profileId: "vietnam-standard-a4",
    name: "Chuẩn thể thức thi trắc nghiệm Việt Nam (A4)",
    geometry: {
        pageWidthDxa: 11906,
        pageHeightDxa: 16838,
        marginTopDxa: 567,
        marginBottomDxa: 567,
        marginLeftDxa: 1134,
        marginRightDxa: 567,
        headerMarginDxa: 283,
        footerMarginDxa: 567,
        contentWidthDxa: 10205
    },
    tabs: {
        fourColumns: [283, 2906, 5528, 8150],
        twoColumns: [283, 5528],
        oneColumn: [283],
        trueFalse: [283],
        footerRightTabDxa: 10489
    },
    headerTable: {
        colWidthsDxa: [6123, 2041, 2041],
        borderBottomSize: 12,
        nameFieldPrompt: "Họ và tên: ............................................................................",
        idFieldPrompt: "Số báo danh: ......."
    },
    typography: {
        fontName: "Times New Roman",
        fontSizeHalfPoints: 24,
        questionStemSpacingBeforeDxa: 60,
        endMarkerText: "------ HẾT ------"
    }
};
/**
 * Loads a reference DOCX template buffer from disk
 */
export function loadTemplateBuffer(customPath) {
    const candidatePaths = [
        customPath,
        path.resolve(process.cwd(), "tests/fixtures/DeSauTron.docx"),
        path.resolve(process.cwd(), "DeSauTron.docx")
    ].filter(Boolean);
    for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
            return fs.readFileSync(p);
        }
    }
    throw new Error(`Reference template DOCX not found. Searched in: ${candidatePaths.join(", ")}`);
}
