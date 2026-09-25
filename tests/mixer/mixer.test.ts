import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { ExamIR } from "../../src/core/ir/types.js";
import { generateVariant } from "../../src/core/mixer/variant-generator.js";
import { richContentToPlainText } from "../../src/core/ir/helpers.js";

describe("Mixing Engine - Core Functionality (TEST-MIX-001 to TEST-MIX-006)", () => {
  const sourcePath = path.resolve(process.cwd(), "tests/output/exam-ir.json");
  const sourceExam: ExamIR = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const SEED = 20260924;

  it("TEST-MIX-001: All shuffle flags false should produce equivalent content and order to source", () => {
    const result = generateVariant(sourceExam, {
      examCode: "101",
      seed: SEED,
      shuffleQuestions: false,
      shuffleOptions: false,
      shuffleTrueFalseSubItems: false
    });

    const vExam = result.variantExam;
    expect(vExam.sections.length).toBe(sourceExam.sections.length);

    for (let sIdx = 0; sIdx < sourceExam.sections.length; sIdx++) {
      const srcSec = sourceExam.sections[sIdx];
      const varSec = vExam.sections[sIdx];
      expect(varSec.questions.length).toBe(srcSec.questions.length);

      for (let qIdx = 0; qIdx < srcSec.questions.length; qIdx++) {
        const srcQ = srcSec.questions[qIdx];
        const varQ = varSec.questions[qIdx];

        // Question ID and position must match
        expect(varQ.id).toBe(srcQ.id);

        // Options order must match
        if (srcQ.options && varQ.options) {
          for (let oIdx = 0; oIdx < srcQ.options.length; oIdx++) {
            expect(varQ.options[oIdx].id).toBe(srcQ.options[oIdx].id);
            expect(varQ.options[oIdx].currentLabel).toBe(srcQ.options[oIdx].originalLabel);
            expect(varQ.options[oIdx].isCorrect).toBe(srcQ.options[oIdx].isCorrect);
          }
        }

        // SubItems order must match
        if (srcQ.subItems && varQ.subItems) {
          for (let subIdx = 0; subIdx < srcQ.subItems.length; subIdx++) {
            expect(varQ.subItems[subIdx].id).toBe(srcQ.subItems[subIdx].id);
            expect(varQ.subItems[subIdx].currentLabel).toBe(srcQ.subItems[subIdx].originalLabel);
            expect(varQ.subItems[subIdx].isCorrect).toBe(srcQ.subItems[subIdx].isCorrect);
          }
        }
      }
    }
  });

  it("TEST-MIX-002: shuffleQuestions=true, shuffleOptions=false -> Q order changes, options same, answers same", () => {
    const result = generateVariant(sourceExam, {
      examCode: "101",
      seed: SEED,
      shuffleQuestions: true,
      shuffleOptions: false,
      shuffleTrueFalseSubItems: false
    });

    const vExam = result.variantExam;
    const srcP1 = sourceExam.sections[0].questions;
    const varP1 = vExam.sections[0].questions;

    // Verify question order actually changed
    const srcIds = srcP1.map(q => q.id);
    const varIds = varP1.map(q => q.id);
    expect(varIds).not.toEqual(srcIds);
    expect(new Set(varIds)).toEqual(new Set(srcIds));

    // Verify options inside each question were NOT shuffled
    for (const varQ of varP1) {
      const srcQ = srcP1.find(q => q.id === varQ.id)!;
      for (let oIdx = 0; oIdx < 4; oIdx++) {
        expect(varQ.options![oIdx].id).toBe(srcQ.options![oIdx].id);
        expect(varQ.options![oIdx].currentLabel).toBe(srcQ.options![oIdx].originalLabel);
        expect(varQ.options![oIdx].isCorrect).toBe(srcQ.options![oIdx].isCorrect);
      }
    }
  });

  it("TEST-MIX-003: shuffleQuestions=false, shuffleOptions=true -> Q order same, options change, answers mapped", () => {
    const result = generateVariant(sourceExam, {
      examCode: "101",
      seed: SEED,
      shuffleQuestions: false,
      shuffleOptions: true,
      shuffleTrueFalseSubItems: false
    });

    const vExam = result.variantExam;
    const srcP1 = sourceExam.sections[0].questions;
    const varP1 = vExam.sections[0].questions;

    // Question order must be identical
    expect(varP1.map(q => q.id)).toEqual(srcP1.map(q => q.id));

    // At least some questions must have shuffled options
    let shuffledCount = 0;
    for (let i = 0; i < srcP1.length; i++) {
      const srcOptIds = srcP1[i].options!.map(o => o.id);
      const varOptIds = varP1[i].options!.map(o => o.id);
      if (JSON.stringify(srcOptIds) !== JSON.stringify(varOptIds)) {
        shuffledCount++;
      }

      // Correct answer must match the option that was correct in source
      const srcCorrectOpt = srcP1[i].options!.find(o => o.isCorrect)!;
      const varCorrectOpt = varP1[i].options!.find(o => o.isCorrect)!;
      expect(varCorrectOpt.id).toBe(srcCorrectOpt.id);
      expect(result.answerKey.mcqAnswers[srcP1[i].id]).toBe(varCorrectOpt.currentLabel);
    }
    expect(shuffledCount).toBeGreaterThan(0);
  });

  it("TEST-MIX-004: shuffleQuestions=true, shuffleOptions=true -> Both Q order and Option order change", () => {
    const result = generateVariant(sourceExam, {
      examCode: "101",
      seed: SEED,
      shuffleQuestions: true,
      shuffleOptions: true,
      shuffleTrueFalseSubItems: false
    });

    const vExam = result.variantExam;
    const srcP1 = sourceExam.sections[0].questions;
    const varP1 = vExam.sections[0].questions;

    expect(varP1.map(q => q.id)).not.toEqual(srcP1.map(q => q.id));

    // Verify all 18 questions are present and answers accurately mapped
    for (const varQ of varP1) {
      const srcQ = srcP1.find(q => q.id === varQ.id)!;
      expect(srcQ).toBeDefined();

      const srcCorrectOpt = srcQ.options!.find(o => o.isCorrect)!;
      const varCorrectOpt = varQ.options!.find(o => o.isCorrect)!;
      expect(varCorrectOpt.id).toBe(srcCorrectOpt.id);
      expect(result.answerKey.mcqAnswers[varQ.id]).toBe(varCorrectOpt.currentLabel);
    }
  });

  it("TEST-MIX-005: TRUE_FALSE shuffle -> Sub-item content and true/false state always move together", () => {
    const result = generateVariant(sourceExam, {
      examCode: "101",
      seed: SEED,
      shuffleQuestions: false,
      shuffleOptions: false,
      shuffleTrueFalseSubItems: true
    });

    const vExam = result.variantExam;
    const srcP2 = sourceExam.sections[1].questions;
    const varP2 = vExam.sections[1].questions;

    for (let i = 0; i < srcP2.length; i++) {
      const srcQ = srcP2[i];
      const varQ = varP2[i];

      const srcSubMap = new Map(srcQ.subItems!.map(s => [s.id, s]));

      for (const varSub of varQ.subItems!) {
        const originalSub = srcSubMap.get(varSub.id)!;
        expect(originalSub).toBeDefined();

        // The truth state must be strictly conserved
        expect(varSub.isCorrect).toBe(originalSub.isCorrect);

        // The content text must be strictly conserved
        expect(richContentToPlainText(varSub.content).trim())
          .toBe(richContentToPlainText(originalSub.content).trim());

        // AnswerKey must record the exact state
        const recordedAnswer = result.answerKey.tfAnswers[varQ.id][varSub.currentLabel!];
        expect(recordedAnswer).toBe(varSub.isCorrect);
      }
    }
  });

  it("TEST-MIX-006: SHORT_ANSWER -> expectedValue does not change and moves with question", () => {
    const result = generateVariant(sourceExam, {
      examCode: "101",
      seed: SEED,
      shuffleQuestions: true,
      shuffleOptions: true,
      shuffleTrueFalseSubItems: true
    });

    const vExam = result.variantExam;
    const srcP3 = sourceExam.sections[2].questions;
    const varP3 = vExam.sections[2].questions;

    expect(varP3.length).toBe(6);

    const srcSAMap = new Map(srcP3.map(q => [q.id, q]));

    for (const varQ of varP3) {
      expect(varQ.type).toBe("SHORT_ANSWER");
      expect(varQ.options).toBeUndefined();

      const originalQ = srcSAMap.get(varQ.id)!;
      expect(originalQ).toBeDefined();
      expect(varQ.shortAnswer!.expectedValue).toBe(originalQ.shortAnswer!.expectedValue);

      // Verify answer key matches
      expect(result.answerKey.saAnswers[varQ.id]).toBe(originalQ.shortAnswer!.expectedValue);
    }
  });
});
