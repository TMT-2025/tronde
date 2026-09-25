export function formattedRunToPlainText(run) {
    if (run.isTab)
        return "\t";
    if (run.isLineBreak)
        return "\n";
    return run.text;
}
export function richParagraphToPlainText(p) {
    return p.runs.map(formattedRunToPlainText).join("");
}
export function richContentToPlainText(content) {
    return content.paragraphs.map(richParagraphToPlainText).join("\n");
}
export function cloneFormattedRun(run) {
    return { ...run };
}
export function cloneRichParagraph(p) {
    return {
        runs: p.runs.map(cloneFormattedRun),
        alignment: p.alignment,
        spacingBeforeDxa: p.spacingBeforeDxa,
        spacingAfterDxa: p.spacingAfterDxa,
        lineSpacingDxa: p.lineSpacingDxa,
        tabStops: p.tabStops ? [...p.tabStops] : undefined
    };
}
export function cloneRichContent(content) {
    return {
        paragraphs: content.paragraphs.map(cloneRichParagraph)
    };
}
export function countQuestions(exam) {
    return exam.sections.reduce((total, sec) => total + sec.questions.length, 0);
}
export function getAllQuestions(exam) {
    return exam.sections.flatMap(sec => sec.questions);
}
export function getQuestionById(exam, questionId) {
    for (const sec of exam.sections) {
        const q = sec.questions.find(item => item.id === questionId);
        if (q)
            return q;
    }
    return undefined;
}
