/**
 * Creates an empty audit map for a variant
 */
export function createEmptyAuditMap(examCode, seed) {
    return {
        examCode,
        seed,
        questionOrder: [],
        mcqMappings: {},
        tfMappings: {},
        saMappings: {}
    };
}
/**
 * Derives a clean student scoring answer key from the audit map
 */
export function deriveAnswerKey(auditMap) {
    const mcqAnswers = {};
    for (const [qId, map] of Object.entries(auditMap.mcqMappings)) {
        mcqAnswers[qId] = map.newCorrectLabel;
    }
    const tfAnswers = {};
    for (const [qId, map] of Object.entries(auditMap.tfMappings)) {
        tfAnswers[qId] = { ...map.answers };
    }
    const saAnswers = {};
    for (const [qId, map] of Object.entries(auditMap.saMappings)) {
        saAnswers[qId] = map.expectedValue;
    }
    return {
        examCode: auditMap.examCode,
        mcqAnswers,
        tfAnswers,
        saAnswers
    };
}
