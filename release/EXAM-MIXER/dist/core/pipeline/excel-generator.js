import JSZip from "jszip";
/**
 * Converts a 1-based column index to Excel column letters (1 -> A, 27 -> AA)
 */
function getColumnLetter(colIndex) {
    let temp = colIndex;
    let letter = "";
    while (temp > 0) {
        const mod = (temp - 1) % 26;
        letter = String.fromCharCode(65 + mod) + letter;
        temp = Math.floor((temp - mod) / 26);
    }
    return letter;
}
/**
 * Escapes XML text for Excel inline string
 */
function escapeXml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
/**
 * Generates an Excel (.xlsx) workbook buffer containing the complete answer key matrix
 */
export async function generateAnswerKeyExcel(batchKey) {
    const zip = new JSZip();
    // 1. [Content_Types].xml
    zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`);
    // 2. _rels/.rels
    zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`);
    // 3. xl/_rels/workbook.xml.rels
    zip.file("xl/_rels/workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`);
    // 4. xl/workbook.xml
    zip.file("xl/workbook.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="BANG_DAP_AN_TONG_HOP" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`);
    // 5. xl/styles.xml
    zip.file("xl/styles.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="3">
    <font><sz val="11"/><name val="Arial"/><family val="2"/></font>
    <font><b/><sz val="11"/><color rgb="FF1E3A8A"/><name val="Arial"/><family val="2"/></font>
    <font><b/><sz val="14"/><color rgb="FF1E3A8A"/><name val="Arial"/><family val="2"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE0E7FF"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFCBD5E1"/></left>
      <right style="thin"><color rgb="FFCBD5E1"/></right>
      <top style="thin"><color rgb="FFCBD5E1"/></top>
      <bottom style="thin"><color rgb="FFCBD5E1"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="4">
    <!-- 0: Normal -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0"/>
    <!-- 1: Table Header (Bold, Filled, Border, Center) -->
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center" wrapText="1"/>
    </xf>
    <!-- 2: Centered cell -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <!-- 3: Sheet Title (Large Bold) -->
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center"/>
    </xf>
  </cellXfs>
</styleSheet>`);
    // 6. xl/worksheets/sheet1.xml
    const examCodes = batchKey.examCodes;
    const firstVariant = batchKey.variants[examCodes[0]];
    const questionDetails = firstVariant ? firstVariant.detailedAnswers : [];
    let rowIdx = 1;
    const sheetRows = [];
    // Row 1: Title
    sheetRows.push(`<row r="${rowIdx}" ht="28"><c r="A${rowIdx}" t="inlineStr" s="3"><is><t>BẢNG ĐÁP ÁN CÁC MÃ ĐỀ THI TRẮC NGHIỆM</t></is></c></row>`);
    rowIdx++;
    // Row 2: Metadata
    const createdDate = new Date().toLocaleDateString("vi-VN");
    sheetRows.push(`<row r="${rowIdx}" ht="20"><c r="A${rowIdx}" t="inlineStr"><is><t>Ngày tạo: ${createdDate} | Tổng số mã đề: ${examCodes.length} (${examCodes.join(", ")})</t></is></c></row>`);
    rowIdx++;
    // Row 3: Blank separator
    rowIdx++;
    // Row 4: Table Header
    const headerCells = [
        `<c r="A${rowIdx}" t="inlineStr" s="1"><is><t>Câu số</t></is></c>`,
        `<c r="B${rowIdx}" t="inlineStr" s="1"><is><t>Phần thi</t></is></c>`
    ];
    examCodes.forEach((code, i) => {
        const col = getColumnLetter(3 + i);
        headerCells.push(`<c r="${col}${rowIdx}" t="inlineStr" s="1"><is><t>Mã ${escapeXml(code)}</t></is></c>`);
    });
    sheetRows.push(`<row r="${rowIdx}" ht="24">${headerCells.join("")}</row>`);
    rowIdx++;
    // Data Rows
    for (const q of questionDetails) {
        const partName = q.sectionIndex === 1
            ? "Phần I (Trắc nghiệm 4 lựa chọn)"
            : q.sectionIndex === 2
                ? "Phần II (Đúng/Sai)"
                : "Phần III (Trả lời ngắn)";
        const rowCells = [
            `<c r="A${rowIdx}" t="inlineStr" s="2"><is><t>Câu ${q.questionNumber}</t></is></c>`,
            `<c r="B${rowIdx}" t="inlineStr" s="0"><is><t>${escapeXml(partName)}</t></is></c>`
        ];
        examCodes.forEach((code, i) => {
            const col = getColumnLetter(3 + i);
            const varKey = batchKey.variants[code];
            const ansVal = varKey?.answers[q.questionKey];
            let formattedAns = "";
            if (typeof ansVal === "object" && ansVal !== null) {
                // True/False
                formattedAns = ["a", "b", "c", "d"]
                    .map(k => `${k}:${ansVal[k] ? "Đ" : "S"}`)
                    .join(" | ");
            }
            else if (ansVal !== undefined && ansVal !== null) {
                formattedAns = String(ansVal);
            }
            rowCells.push(`<c r="${col}${rowIdx}" t="inlineStr" s="2"><is><t>${escapeXml(formattedAns)}</t></is></c>`);
        });
        sheetRows.push(`<row r="${rowIdx}" ht="20">${rowCells.join("")}</row>`);
        rowIdx++;
    }
    // Row separator before Compact Matrix
    rowIdx++;
    sheetRows.push(`<row r="${rowIdx}" ht="24"><c r="A${rowIdx}" t="inlineStr" s="3"><is><t>MA TRẬN ĐÁP ÁN THEO HÀNG NGANG (DỄ ĐỐI CHIẾU CHẤM BÀI)</t></is></c></row>`);
    rowIdx++;
    // Matrix Header: Mã đề | 1 | 2 | 3 ...
    const matrixHeaderCells = [
        `<c r="A${rowIdx}" t="inlineStr" s="1"><is><t>Mã đề</t></is></c>`
    ];
    questionDetails.forEach((q, idx) => {
        const col = getColumnLetter(2 + idx);
        matrixHeaderCells.push(`<c r="${col}${rowIdx}" t="inlineStr" s="1"><is><t>C${q.questionNumber}</t></is></c>`);
    });
    sheetRows.push(`<row r="${rowIdx}" ht="22">${matrixHeaderCells.join("")}</row>`);
    rowIdx++;
    // Matrix Data: One row per exam code
    for (const code of examCodes) {
        const varKey = batchKey.variants[code];
        const matrixRowCells = [
            `<c r="A${rowIdx}" t="inlineStr" s="1"><is><t>Mã ${escapeXml(code)}</t></is></c>`
        ];
        questionDetails.forEach((q, idx) => {
            const col = getColumnLetter(2 + idx);
            const ansVal = varKey?.answers[q.questionKey];
            let compactAns = "";
            if (typeof ansVal === "object" && ansVal !== null) {
                compactAns = ["a", "b", "c", "d"]
                    .map(k => (ansVal[k] ? "Đ" : "S"))
                    .join("");
            }
            else if (ansVal !== undefined && ansVal !== null) {
                compactAns = String(ansVal);
            }
            matrixRowCells.push(`<c r="${col}${rowIdx}" t="inlineStr" s="2"><is><t>${escapeXml(compactAns)}</t></is></c>`);
        });
        sheetRows.push(`<row r="${rowIdx}" ht="20">${matrixRowCells.join("")}</row>`);
        rowIdx++;
    }
    // Column widths definition
    const colCount = Math.max(examCodes.length + 2, questionDetails.length + 1);
    const colsXml = `
  <cols>
    <col min="1" max="1" width="14" customWidth="1"/>
    <col min="2" max="2" width="30" customWidth="1"/>
    <col min="3" max="${colCount}" width="16" customWidth="1"/>
  </cols>`;
    const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  ${colsXml}
  <sheetData>
    ${sheetRows.join("\n    ")}
  </sheetData>
</worksheet>`;
    zip.file("xl/worksheets/sheet1.xml", sheetXml);
    return zip.generateAsync({
        type: "uint8array",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
    });
}
