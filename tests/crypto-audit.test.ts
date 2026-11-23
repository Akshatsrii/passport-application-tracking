import { describe, it, expect } from "vitest";
import {
  sha256,
  generateConsentSignature,
  computeAuditChecksum,
  maskAadhaar,
  maskPhone,
  maskEmail,
} from "../src/lib/utils/crypto";

describe("Security, Privacy, and Audit Cryptography", () => {
  it("masks Aadhaar preserving only last 4 digits", () => {
    expect(maskAadhaar("987654321012")).toBe("XXXX-XXXX-1012");
    expect(maskAadhaar("9876 5432 1012")).toBe("XXXX-XXXX-1012");
    expect(maskAadhaar("123")).toBe("XXXX-XXXX-XXXX");
  });

  it("masks mobile numbers correctly", () => {
    expect(maskPhone("9876543210")).toBe("+91-XXXXX-3210");
  });

  it("masks email addresses protecting personal identifier", () => {
    expect(maskEmail("rahul.sharma@example.com")).toBe("r**********a@example.com");
  });

  it("generates deterministic SHA-256 digests", () => {
    const hash1 = sha256("test-payload-2026");
    const hash2 = sha256("test-payload-2026");
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it("generates verifiable HMAC signature for consent artifacts", () => {
    const sig1 = generateConsentSignature("APP-001", "XXXX-XXXX-8921", "2026-11-23T10:00:00Z", ["AADHAAR"]);
    const sig2 = generateConsentSignature("APP-001", "XXXX-XXXX-8921", "2026-11-23T10:00:00Z", ["AADHAAR"]);
    expect(sig1).toBe(sig2);
    expect(sig1).toHaveLength(64);
  });

  it("computes tamper-evident audit hash chaining", () => {
    const genesisPrev = "0000000000000000000000000000000000000000000000000000000000000000";
    const block1Checksum = computeAuditChecksum(genesisPrev, "APPLICATION_CREATED", "user_1", "2026-11-23T10:00:00Z", { test: true });
    expect(block1Checksum).toHaveLength(64);

    const block2Checksum = computeAuditChecksum(block1Checksum, "CONSENT_GRANTED", "user_1", "2026-11-23T10:05:00Z", { consent: "active" });
    expect(block2Checksum).toHaveLength(64);
    expect(block2Checksum).not.toBe(block1Checksum);

    // Tampering test: if block1 was altered, block2 checksum verification fails!
    const tamperedBlock1Checksum = computeAuditChecksum(genesisPrev, "TAMPERED_ACTION", "user_1", "2026-11-23T10:00:00Z", { test: true });
    const recomputedBlock2 = computeAuditChecksum(tamperedBlock1Checksum, "CONSENT_GRANTED", "user_1", "2026-11-23T10:05:00Z", { consent: "active" });
    expect(recomputedBlock2).not.toBe(block2Checksum);
  });
});
