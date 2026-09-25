import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { ExamIR } from "../../src/core/ir/types.js";
import { generateVariant, generateMultipleVariants } from "../../src/core/mixer/variant-generator.js";

describe("Immutability Verification (TEST-MIX-009)", () => {
  const sourcePath = path.resolve(process.cwd(), "tests/output/exam-ir.json");
  
  function computeFileSha256(filePath: string): string {
    const buffer = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  it("TEST-MIX-009: Source exam-ir.json and in-memory source object must remain 100% byte-equivalent after mixing", () => {
    // 1. Hash file before mixing
    const hashBefore = computeFileSha256(sourcePath);

    // 2. Load into memory and clone snapshot for deep equality
    const sourceExam: ExamIR = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
    const inMemorySnapshot = JSON.stringify(sourceExam);

    // 3. Perform intensive mixing operations (generating multiple variants with various settings)
    const variants = generateMultipleVariants(sourceExam, 20260924, ["101", "102", "103", "104"], {
      shuffleQuestions: true,
      shuffleOptions: true,
      shuffleTrueFalseSubItems: true
    });
    expect(variants.length).toBe(4);

    // 4. Verify in-memory source object was NOT mutated
    const inMemoryAfter = JSON.stringify(sourceExam);
    expect(inMemoryAfter).toBe(inMemorySnapshot);

    // 5. Verify on-disk file hash remains 100% identical
    const hashAfter = computeFileSha256(sourcePath);
    expect(hashAfter).toBe(hashBefore);
  });
});
