import { SeededPRNG } from "./seeded-prng.js";
import { mixSectionQuestions } from "./question-mixer.js";
import { createEmptyAuditMap, deriveAnswerKey } from "./answer-mapper.js";
/**
 * Derives a deterministic 32-bit seed from a base seed and exam code
 */
export function deriveExamSeed(baseSeed, examCode) {
    let hash = baseSeed >>> 0;
    for (let i = 0; i < examCode.length; i++) {
        hash = (Math.imul(hash ^ examCode.charCodeAt(i), 0x5bd1e995) + 0x6d2b79f5) >>> 0;
    }
    return hash;
}
/**
 * Deep clones an entire ExamIR tree to guarantee immutability of the source
 */
export function deepCloneExamIR(source) {
    return JSON.parse(JSON.stringify(source));
}
/**
 * Generates a single deterministic exam variant from a source ExamIR
 */
export function generateVariant(sourceExam, options) {
    const shuffleQuestions = options.shuffleQuestions ?? true;
    const shuffleOptions = options.shuffleOptions ?? true;
    const shuffleTrueFalseSubItems = options.shuffleTrueFalseSubItems ?? false;
    // Compute deterministic seed for this examCode
    const effectiveSeed = deriveExamSeed(options.seed, options.examCode);
    const prng = new SeededPRNG(effectiveSeed);
    // Initialize audit map
    const auditMap = createEmptyAuditMap(options.examCode, effectiveSeed);
    // Clone source sections safely
    const clonedExam = deepCloneExamIR(sourceExam);
    const shuffledSections = [];
    const mixingOpts = {
        shuffleQuestions,
        shuffleOptions,
        shuffleTrueFalseSubItems
    };
    // Mix each section independently (Section Isolation)
    for (const section of clonedExam.sections) {
        const secResult = mixSectionQuestions(section, mixingOpts, prng);
        shuffledSections.push(secResult.shuffledSection);
        auditMap.questionOrder.push(...secResult.questionOrders);
        Object.assign(auditMap.mcqMappings, secResult.mcqMappings);
        Object.assign(auditMap.tfMappings, secResult.tfMappings);
        Object.assign(auditMap.saMappings, secResult.saMappings);
    }
    clonedExam.sections = shuffledSections;
    const variantMetadata = {
        variantId: `variant-${options.examCode}`,
        examCode: options.examCode,
        sourceExamId: sourceExam.metadata.originalFileName,
        seed: options.seed,
        mixingConfiguration: {
            shuffleQuestions,
            shuffleOptions,
            shuffleTrueFalseSubItems
        }
    };
    const answerKey = deriveAnswerKey(auditMap);
    return {
        variantExam: clonedExam,
        auditMap,
        answerKey,
        metadata: variantMetadata
    };
}
/**
 * Generates multiple deterministic variants for a list of exam codes
 */
export function generateMultipleVariants(sourceExam, baseSeed, examCodes, config = {}) {
    return examCodes.map(examCode => generateVariant(sourceExam, {
        examCode,
        seed: baseSeed,
        ...config
    }));
}
