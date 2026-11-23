import { describe, it, expect, beforeEach } from "vitest";
import { MockDigiLockerAdapter } from "../src/lib/digilocker/mock-adapter";

describe("DigiLocker Adapter Contract", () => {
  let adapter: MockDigiLockerAdapter;

  beforeEach(() => {
    adapter = new MockDigiLockerAdapter();
  });

  it("identifies as mock adapter adhering to assignment boundary", () => {
    expect(adapter.isMock()).toBe(true);
    expect(adapter.getAdapterName()).toContain("Mock Adapter");
  });

  it("initiates OAuth consent and produces redirect URI with state", async () => {
    const res = await adapter.initiateConsent({
      applicationId: "APP-001",
      citizenAadhaarMasked: "XXXX-XXXX-8921",
      scopes: ["AADHAAR", "CLASS_X_CERTIFICATE"],
      purpose: "Passport KYC",
      state: "state-123",
      redirectUri: "/callback",
    });

    expect(res.consentUrl).toContain("/digilocker/consent-modal");
    expect(res.consentUrl).toContain("APP-001");
    expect(res.state).toBeDefined();
  });

  it("exchanges authorization code for access token", async () => {
    const tokenResp = await adapter.exchangeToken("code-rahul-sharma", "state-123");
    expect(tokenResp.accessToken).toBeDefined();
    expect(tokenResp.tokenType).toBe("Bearer");
    expect(tokenResp.citizenName).toBe("Rahul Sharma");
  });

  it("lists issued documents for authorized citizen", async () => {
    const tokenResp = await adapter.exchangeToken("code-rahul-sharma", "state-123");
    const docs = await adapter.listIssuedDocuments(tokenResp.accessToken);

    expect(docs.length).toBeGreaterThanOrEqual(2);
    const aadhaar = docs.find((d) => d.documentType === "AADHAAR");
    expect(aadhaar).toBeDefined();
    expect(aadhaar?.issuerId).toBe("in.gov.uidai");
  });

  it("pulls verified document and returns valid SHA-256 and digital signature", async () => {
    const tokenResp = await adapter.exchangeToken("code-rahul-sharma", "state-123");
    const pull = await adapter.pullDocument(tokenResp.accessToken, "digilocker://in.gov.uidai/adhr/8921");

    expect(pull.isDigitallySigned).toBe(true);
    expect(pull.signatureAlgorithm).toBe("SHA256withRSA");
    expect(pull.checksumSha256).toHaveLength(64); // Valid 64-char SHA-256 hex
    expect(pull.demographicData.fullName).toBe("Rahul Sharma");
  });

  it("throws clear error when pulling nonexistent document URI", async () => {
    const tokenResp = await adapter.exchangeToken("code-rahul-sharma", "state-123");
    await expect(
      adapter.pullDocument(tokenResp.accessToken, "digilocker://invalid/uri")
    ).rejects.toThrow("DIGILOCKER_DOC_NOT_FOUND");
  });

  it("throws clear error when upstream gateway downtime is simulated", async () => {
    adapter.setSimulateDowntime(true);
    await expect(
      adapter.initiateConsent({
        applicationId: "APP-001",
        citizenAadhaarMasked: "XXXX-XXXX-8921",
        scopes: ["AADHAAR"],
        purpose: "KYC",
        state: "state-123",
        redirectUri: "/callback",
      })
    ).rejects.toThrow("DIGILOCKER_SERVICE_UNAVAILABLE");
  });

  it("successfully revokes citizen consent", async () => {
    const res = await adapter.revokeConsent("mock-token", "citizen-123");
    expect(res.success).toBe(true);
    expect(res.revokedAt).toBeDefined();
  });
});
