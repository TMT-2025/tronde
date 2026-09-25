import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { parseDocx } from "../../src/core/parser/docx-parser.js";
import { richContentToPlainText } from "../../src/core/ir/helpers.js";

describe("DOCX Exam Parser - DeGocTron.docx Verification", () => {
  const filePath = path.resolve(process.cwd(), "tests/fixtures/DeGocTron.docx");
  const fileBuffer = fs.readFileSync(filePath);

  it("should successfully parse DeGocTron.docx without errors", async () => {
    const exam = await parseDocx(fileBuffer, { fileName: "DeGocTron.docx" });
    expect(exam).toBeDefined();
    expect(exam.schemaVersion).toBe("1.0.0");
    expect(exam.sections.length).toBe(3);
  });

  it("should detect exactly 3 sections with correct types", async () => {
    const exam = await parseDocx(fileBuffer);
    
    expect(exam.sections[0].type).toBe("MULTIPLE_CHOICE");
    expect(exam.sections[0].sectionIndex).toBe(1);
    expect(exam.sections[0].title).toContain("PHẦN I");

    expect(exam.sections[1].type).toBe("TRUE_FALSE");
    expect(exam.sections[1].sectionIndex).toBe(2);
    expect(exam.sections[1].title).toContain("PHẦN II");

    expect(exam.sections[2].type).toBe("SHORT_ANSWER");
    expect(exam.sections[2].sectionIndex).toBe(3);
    expect(exam.sections[2].title).toContain("PHẦN III");
  });

  it("should detect exactly 18 MCQ, 4 TRUE_FALSE, 6 SHORT_ANSWER, total 28 questions", async () => {
    const exam = await parseDocx(fileBuffer);
    
    const sec1 = exam.sections[0];
    const sec2 = exam.sections[1];
    const sec3 = exam.sections[2];

    expect(sec1.questions.length).toBe(18);
    expect(sec2.questions.length).toBe(4);
    expect(sec3.questions.length).toBe(6);

    const total = sec1.questions.length + sec2.questions.length + sec3.questions.length;
    expect(total).toBe(28);
  });

  it("should detect correct answers for MULTIPLE_CHOICE from formatting (underline)", async () => {
    const exam = await parseDocx(fileBuffer);
    const mcqQuestions = exam.sections[0].questions;

    // Verify all 18 questions have exactly 1 correct answer
    for (const q of mcqQuestions) {
      expect(q.options).toBeDefined();
      expect(q.options!.length).toBe(4);
      const correctOpts = q.options!.filter(o => o.isCorrect);
      expect(correctOpts.length).toBe(1);
      expect(correctOpts[0].answerSource).toBe("document-format");
    }

    // Specific assertions based on DeGocTron formatting
    // Câu 1: C (CH3COOC2H5)
    expect(mcqQuestions[0].options!.find(o => o.isCorrect)?.originalLabel).toBe("C");
    // Câu 2: B (Triglyceride)
    expect(mcqQuestions[1].options!.find(o => o.isCorrect)?.originalLabel).toBe("B");
    // Câu 3: B (Methyl acetate)
    expect(mcqQuestions[2].options!.find(o => o.isCorrect)?.originalLabel).toBe("B");
    // Câu 4: A (Alcohol)
    expect(mcqQuestions[3].options!.find(o => o.isCorrect)?.originalLabel).toBe("A");
    // Câu 5: C (Glycerol)
    expect(mcqQuestions[4].options!.find(o => o.isCorrect)?.originalLabel).toBe("C");
    // Câu 6: B (CnH2nO2)
    expect(mcqQuestions[5].options!.find(o => o.isCorrect)?.originalLabel).toBe("B");
    // Câu 7: A (CH3COONa và CH3CHO)
    expect(mcqQuestions[6].options!.find(o => o.isCorrect)?.originalLabel).toBe("A");
    // Câu 8: A (Palmitic acid và Glycerol)
    expect(mcqQuestions[7].options!.find(o => o.isCorrect)?.originalLabel).toBe("A");
    // Câu 9: B (Benzyl acetate)
    expect(mcqQuestions[8].options!.find(o => o.isCorrect)?.originalLabel).toBe("B");
    // Câu 10: B (Phản ứng ester hóa)
    expect(mcqQuestions[9].options!.find(o => o.isCorrect)?.originalLabel).toBe("B");
    // Câu 11: C (Acetic acid)
    expect(mcqQuestions[10].options!.find(o => o.isCorrect)?.originalLabel).toBe("C");
    // Câu 12: C (Có nhiệt độ sôi cao hơn...)
    expect(mcqQuestions[11].options!.find(o => o.isCorrect)?.originalLabel).toBe("C");
    // Câu 13: B (2)
    expect(mcqQuestions[12].options!.find(o => o.isCorrect)?.originalLabel).toBe("B");
    // Câu 14: B (Formic acid và Ethanol)
    expect(mcqQuestions[13].options!.find(o => o.isCorrect)?.originalLabel).toBe("B");
    // Câu 15: C (Phản ứng hydrogen hóa)
    expect(mcqQuestions[14].options!.find(o => o.isCorrect)?.originalLabel).toBe("C");
    // Câu 16: B (Acid béo không no)
    expect(mcqQuestions[15].options!.find(o => o.isCorrect)?.originalLabel).toBe("B");
    // Câu 17: D (HCOONa và C2H5OH)
    expect(mcqQuestions[16].options!.find(o => o.isCorrect)?.originalLabel).toBe("D");
    // Câu 18: B (Thuận nghịch)
    expect(mcqQuestions[17].options!.find(o => o.isCorrect)?.originalLabel).toBe("B");
  });

  it("should detect TRUE_FALSE questions and sub-item truth states from formatting", async () => {
    const exam = await parseDocx(fileBuffer);
    const tfQuestions = exam.sections[1].questions;

    expect(tfQuestions.length).toBe(4);

    for (const q of tfQuestions) {
      expect(q.type).toBe("TRUE_FALSE");
      expect(q.subItems).toBeDefined();
      expect(q.subItems!.length).toBe(4);
      expect(q.subItems!.map(s => s.originalLabel)).toEqual(["a", "b", "c", "d"]);
    }

    // Câu 1: a=Đúng, b=Sai, c=Đúng, d=Sai
    expect(tfQuestions[0].subItems![0].isCorrect).toBe(true);
    expect(tfQuestions[0].subItems![1].isCorrect).toBe(false);
    expect(tfQuestions[0].subItems![2].isCorrect).toBe(true);
    expect(tfQuestions[0].subItems![3].isCorrect).toBe(false);

    // Câu 2: a=Đúng, b=Đúng, c=Đúng, d=Đúng (All 4 true)
    expect(tfQuestions[1].subItems![0].isCorrect).toBe(true);
    expect(tfQuestions[1].subItems![1].isCorrect).toBe(true);
    expect(tfQuestions[1].subItems![2].isCorrect).toBe(true);
    expect(tfQuestions[1].subItems![3].isCorrect).toBe(true);

    // Câu 3: a=Đúng, b=Đúng, c=Đúng, d=Sai
    expect(tfQuestions[2].subItems![0].isCorrect).toBe(true);
    expect(tfQuestions[2].subItems![1].isCorrect).toBe(true);
    expect(tfQuestions[2].subItems![2].isCorrect).toBe(true);
    expect(tfQuestions[2].subItems![3].isCorrect).toBe(false);

    // Câu 4: a=Đúng, b=Đúng, c=Sai, d=Đúng
    expect(tfQuestions[3].subItems![0].isCorrect).toBe(true);
    expect(tfQuestions[3].subItems![1].isCorrect).toBe(true);
    expect(tfQuestions[3].subItems![2].isCorrect).toBe(false);
    expect(tfQuestions[3].subItems![3].isCorrect).toBe(true);
  });

  it("should detect SHORT_ANSWER questions and extract source answers without confusing with MCQ", async () => {
    const exam = await parseDocx(fileBuffer);
    const saQuestions = exam.sections[2].questions;

    expect(saQuestions.length).toBe(6);

    const expectedAnswers = ["200", "0.92", "3", "5.28", "88.4", "1170"];

    for (let idx = 0; idx < saQuestions.length; idx++) {
      const q = saQuestions[idx];
      expect(q.type).toBe("SHORT_ANSWER");
      // MUST NOT have options populated as if it were MCQ
      expect(q.options).toBeUndefined();
      expect(q.shortAnswer).toBeDefined();
      expect(q.shortAnswer!.expectedValue).toBe(expectedAnswers[idx]);
      expect(q.shortAnswer!.answerSource).toBe("document-format");
      expect(q.shortAnswer!.sourceAnswerRaw).toBeDefined();
      expect(q.shortAnswer!.sourceAnswerRaw!.paragraphs.length).toBeGreaterThan(0);
    }
  });

  it("should preserve run-level formatting (chemical formulas, subscripts, superscripts)", async () => {
    const exam = await parseDocx(fileBuffer);
    
    // Check Câu 1 MCQ Option C (CH3COOC2H5) has subscripts 3, 2, 5
    const q1 = exam.sections[0].questions[0];
    const optC = q1.options![2];
    const runsC = optC.content.paragraphs[0].runs;
    
    const subscriptsC = runsC.filter(r => r.vertAlign === "subscript").map(r => r.text);
    expect(subscriptsC).toContain("3");
    expect(subscriptsC).toContain("2");
    expect(subscriptsC).toContain("5");

    // Check Câu 6 MCQ Option C (CnH2n-2O2) has superscript '-'
    const q6 = exam.sections[0].questions[5];
    const opt6C = q6.options![2];
    const runs6C = opt6C.content.paragraphs[0].runs;
    const superscripts6C = runs6C.filter(r => r.vertAlign === "superscript").map(r => r.text);
    expect(superscripts6C).toContain("-");

    // Check Question formatting metadata flags chemical formulas
    expect(q1.formattingMetadata.hasChemicalFormulas).toBe(true);
    expect(q6.formattingMetadata.hasChemicalFormulas).toBe(true);
  });

  it("should sanitize answer underline from options to prevent answer leakage", async () => {
    const exam = await parseDocx(fileBuffer);
    const mcqQuestions = exam.sections[0].questions;

    // In DeGocTron, correct options have underline.
    // In parsed IR options.content, underline MUST be sanitized/undefined!
    for (const q of mcqQuestions) {
      const correctOpt = q.options!.find(o => o.isCorrect)!;
      for (const p of correctOpt.content.paragraphs) {
        for (const r of p.runs) {
          expect(r.underline).toBeUndefined();
        }
      }
    }
  });
});
