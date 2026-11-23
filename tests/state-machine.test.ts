import { describe, it, expect } from "vitest";
import { canTransition, getAllowedTransitions } from "../src/lib/state-machine/transitions";
import { PassportApplication } from "../src/types";

function createMockApp(overrides?: Partial<PassportApplication>): PassportApplication {
  return {
    id: "APP-TEST-001",
    applicantId: "usr_test_1",
    serviceType: "FRESH_NORMAL",
    bookletType: "36_PAGES",
    status: "DRAFT",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rpoLocation: "RPO Delhi",
    flags: {},
    profile: {
      fullName: "Test User",
      givenName: "Test",
      surname: "User",
      dateOfBirth: "1996-01-01",
      gender: "MALE",
      placeOfBirth: "Delhi",
      maritalStatus: "SINGLE",
      employmentType: "PRIVATE",
      email: "test@example.com",
      phone: "+91 99999 88888",
      aadhaarNumberMasked: "XXXX-XXXX-1234",
      permanentAddress: {
        street: "123 Main Road",
        city: "Delhi",
        state: "Delhi",
        pincode: "110001",
        policeStation: "Central Police Station",
      },
      emergencyContact: {
        name: "Father User",
        relationship: "Father",
        phone: "+91 99999 77777",
      },
    },
    documents: [],
    operatorReviews: [],
    ...overrides,
  };
}

describe("Passport Application State Machine", () => {
  it("allows DRAFT -> DOCUMENTS_PENDING when demographic profile is complete", () => {
    const app = createMockApp({ status: "DRAFT" });
    const result = canTransition(app, "DOCUMENTS_PENDING", "APPLICANT", app.applicantId);
    expect(result.allowed).toBe(true);
  });

  it("blocks DRAFT -> DOCUMENTS_PENDING if required fields are missing", () => {
    const app = createMockApp({
      status: "DRAFT",
      profile: {
        ...createMockApp().profile,
        fullName: "", // invalid
      },
    });
    const result = canTransition(app, "DOCUMENTS_PENDING", "APPLICANT", app.applicantId);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Incomplete applicant profile");
  });

  it("blocks illegal transition from DRAFT directly to SUBMITTED", () => {
    const app = createMockApp({ status: "DRAFT" });
    const result = canTransition(app, "SUBMITTED", "APPLICANT", app.applicantId);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Illegal state transition");
  });

  it("allows DOCUMENTS_PENDING -> CONSENT_GRANTED only with active consent artifact", () => {
    const appWithoutConsent = createMockApp({ status: "DOCUMENTS_PENDING" });
    const check1 = canTransition(appWithoutConsent, "CONSENT_GRANTED", "APPLICANT", "usr_test");
    expect(check1.allowed).toBe(false);

    const appWithConsent = createMockApp({
      status: "DOCUMENTS_PENDING",
      consent: {
        id: "cst-001",
        applicationId: "APP-TEST-001",
        citizenAadhaarMasked: "XXXX-XXXX-1234",
        purpose: "KYC",
        scopes: ["AADHAAR"],
        validityMinutes: 1440,
        grantedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        status: "ACTIVE",
        ipAddress: "127.0.0.1",
        consentSignature: "sig_abc",
      },
    });
    const check2 = canTransition(appWithConsent, "CONSENT_GRANTED", "APPLICANT", "usr_test");
    expect(check2.allowed).toBe(true);
  });

  it("allows DOCUMENTS_FETCHED -> SUBMITTED only when mandatory documents are attached", () => {
    const appNoDocs = createMockApp({ status: "DOCUMENTS_FETCHED", documents: [] });
    const checkNoDocs = canTransition(appNoDocs, "SUBMITTED", "APPLICANT", "usr_test");
    expect(checkNoDocs.allowed).toBe(false);

    const appWithDocs = createMockApp({
      status: "DOCUMENTS_FETCHED",
      documents: [
        {
          id: "doc-1",
          applicationId: "APP-TEST-001",
          documentType: "AADHAAR",
          title: "Aadhaar",
          source: "DIGILOCKER",
          issuer: "UIDAI",
          verificationStatus: "VERIFIED",
          checksumSha256: "hash_aadhaar",
        },
        {
          id: "doc-2",
          applicationId: "APP-TEST-001",
          documentType: "CLASS_X_CERTIFICATE",
          title: "Class X",
          source: "DIGILOCKER",
          issuer: "CBSE",
          verificationStatus: "VERIFIED",
          checksumSha256: "hash_cbse",
        },
      ],
    });
    const checkWithDocs = canTransition(appWithDocs, "SUBMITTED", "APPLICANT", "usr_test");
    expect(checkWithDocs.allowed).toBe(true);
  });

  it("prevents APPLICANT from self-approving application", () => {
    const app = createMockApp({ status: "UNDER_OPERATOR_REVIEW" });
    const check = canTransition(app, "APPROVED", "APPLICANT", "usr_test", "Self approval");
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain("Unauthorized: Role 'APPLICANT' is not permitted");
  });

  it("requires operator remarks of at least 5 chars for approval", () => {
    const app = createMockApp({ status: "UNDER_OPERATOR_REVIEW" });
    const checkShortRemark = canTransition(app, "APPROVED", "OPERATOR", "op_1", "ok");
    expect(checkShortRemark.allowed).toBe(false);
    expect(checkShortRemark.reason).toContain("minimum 5 characters");

    const checkValid = canTransition(app, "APPROVED", "OPERATOR", "op_1", "Demographics thoroughly verified. Approved.");
    expect(checkValid.allowed).toBe(true);
  });

  it("allows progression through simulated downstream fulfillment states", () => {
    let app = createMockApp({ status: "APPROVED" });
    expect(canTransition(app, "POLICE_VERIFICATION_SIMULATED", "SYSTEM", "worker").allowed).toBe(true);

    app.status = "POLICE_VERIFICATION_SIMULATED";
    expect(canTransition(app, "PASSPORT_PRINTED_SIMULATED", "SYSTEM", "worker").allowed).toBe(true);

    app.status = "PASSPORT_PRINTED_SIMULATED";
    expect(canTransition(app, "DISPATCHED_SIMULATED", "SYSTEM", "worker").allowed).toBe(true);
  });
});
