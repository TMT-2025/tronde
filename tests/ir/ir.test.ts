import { describe, it, expect } from "vitest";
import {
  RichContent,
  richContentToPlainText,
  cloneRichContent,
  ExamIR,
  countQuestions,
  getQuestionById,
  getAllQuestions
} from "../../src/core/ir/index.js";

describe("Exam IR Helper Functions", () => {
  it("should convert RichContent to plain text with tabs and line breaks", () => {
    const rc: RichContent = {
      paragraphs: [
        {
          runs: [
            { text: "Câu 1. ", bold: true },
            { text: "Công thức hóa học " },
            { text: "H" },
            { text: "2", vertAlign: "subscript" },
            { text: "O" }
          ]
        },
        {
          runs: [
            { text: "A. ", bold: true },
            { text: "Nước" }
          ]
        }
      ]
    };

    const text = richContentToPlainText(rc);
    expect(text).toBe("Câu 1. Công thức hóa học H2O\nA. Nước");
  });

  it("should deep clone RichContent without modifying the original", () => {
    const original: RichContent = {
      paragraphs: [
        {
          runs: [{ text: "Original", bold: true }]
        }
      ]
    };

    const cloned = cloneRichContent(original);
    cloned.paragraphs[0].runs[0].text = "Modified";

    expect(original.paragraphs[0].runs[0].text).toBe("Original");
    expect(cloned.paragraphs[0].runs[0].text).toBe("Modified");
  });

  it("should count questions and query questions by ID", () => {
    const mockExam: ExamIR = {
      schemaVersion: "1.0.0",
      metadata: {
        originalFileName: "test.docx",
        createdAt: new Date().toISOString(),
        sourceDocxProperties: {
          pageWidthDxa: 11906,
          pageHeightDxa: 16838,
          marginTopDxa: 720,
          marginBottomDxa: 720,
          marginLeftDxa: 720,
          marginRightDxa: 720,
          defaultFont: "Times New Roman",
          defaultFontSizePt: 12
        }
      },
      header: {
        examTitle: "TEST",
        studentInfoFields: { showStudentName: true, showStudentId: true, showExamCode: true },
        tableBorderBottomSize: 12
      },
      footer: { showExamCode: true, showPageNumbers: true, pageNumberFormat: "PageXofY", topBorder: true },
      sections: [
        {
          id: "sec-1",
          sectionIndex: 1,
          title: "Section 1",
          type: "MULTIPLE_CHOICE",
          shufflePolicy: { shuffleQuestions: true, shuffleOptions: true, shuffleTrueFalseSubItems: false },
          questions: [
            {
              id: "q-1",
              sourcePosition: { sectionIndex: 1, questionIndex: 1, originalNumberStr: "Câu 1.", startParagraphIndex: 0, endParagraphIndex: 4 },
              type: "MULTIPLE_CHOICE",
              stem: { paragraphs: [{ runs: [{ text: "Q1" }] }] },
              allowShuffle: true,
              allowOptionShuffle: true,
              formattingMetadata: { hasChemicalFormulas: false, hasMathExpressions: false, imageCount: 0 }
            }
          ]
        },
        {
          id: "sec-2",
          sectionIndex: 2,
          title: "Section 2",
          type: "SHORT_ANSWER",
          shufflePolicy: { shuffleQuestions: true, shuffleOptions: false, shuffleTrueFalseSubItems: false },
          questions: [
            {
              id: "q-2",
              sourcePosition: { sectionIndex: 2, questionIndex: 1, originalNumberStr: "Câu 1.", startParagraphIndex: 5, endParagraphIndex: 6 },
              type: "SHORT_ANSWER",
              stem: { paragraphs: [{ runs: [{ text: "Q2" }] }] },
              allowShuffle: true,
              allowOptionShuffle: false,
              formattingMetadata: { hasChemicalFormulas: false, hasMathExpressions: false, imageCount: 0 }
            }
          ]
        }
      ]
    };

    expect(countQuestions(mockExam)).toBe(2);
    expect(getAllQuestions(mockExam).length).toBe(2);
    expect(getQuestionById(mockExam, "q-1")?.id).toBe("q-1");
    expect(getQuestionById(mockExam, "q-2")?.id).toBe("q-2");
    expect(getQuestionById(mockExam, "non-existent")).toBeUndefined();
  });
});
