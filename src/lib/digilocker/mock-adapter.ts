import {
  IDigiLockerAdapter,
  DigiLockerAuthRequest,
  DigiLockerTokenResponse,
  DigiLockerDocumentItem,
  DigiLockerPullResult,
} from "./types";
import { DocumentType } from "@/types";
import { sha256 } from "@/lib/utils/crypto";

interface MockCitizenStore {
  citizenId: string;
  citizenName: string;
  aadhaarMasked: string;
  dob: string;
  gender: string;
  address: string;
  documents: {
    item: DigiLockerDocumentItem;
    pull: DigiLockerPullResult;
  }[];
}

const MOCK_CITIZENS: Record<string, MockCitizenStore> = {
  // Scenario 1: Rahul Sharma - Perfect matching documents
  "rahul-sharma": {
    citizenId: "DL-IND-2026-8819",
    citizenName: "Rahul Sharma",
    aadhaarMasked: "XXXX-XXXX-8921",
    dob: "1995-08-15",
    gender: "Male",
    address: "42 Kasturba Gandhi Marg, Connaught Place, New Delhi 110001",
    documents: [
      {
        item: {
          uri: "digilocker://in.gov.uidai/adhr/8921",
          name: "Aadhaar Card",
          documentType: "AADHAAR",
          type: "Identity & Address Document",
          size: 142850,
          date: "2018-05-12",
          issuer: "Unique Identification Authority of India (UIDAI)",
          issuerId: "in.gov.uidai",
          mimeType: "application/pdf",
          description: "Digitally signed e-Aadhaar verified via UIDAI partner gateway.",
        },
        pull: {
          uri: "digilocker://in.gov.uidai/adhr/8921",
          documentType: "AADHAAR",
          title: "e-Aadhaar Identity & Address Verification Record",
          issuer: "UIDAI, Government of India",
          issuedAt: "2018-05-12T10:00:00Z",
          documentNumberMasked: "XXXX-XXXX-8921",
          isDigitallySigned: true,
          signatureAlgorithm: "SHA256withRSA",
          issuerCertThumbprint: "A9B8C7D6E5F4A3B2C1D0E9F8A7B6C5D4E3F2A1B0",
          checksumSha256: sha256("UIDAI-AADHAAR-RAHUL-SHARMA-8921-VERIFIED"),
          demographicData: {
            fullName: "Rahul Sharma",
            dateOfBirth: "1995-08-15",
            gender: "Male",
            address: "42 Kasturba Gandhi Marg, Connaught Place, New Delhi 110001",
            fatherOrSpouseName: "Mahesh Sharma",
          },
          rawXmlPreview: `<KycRes code="00" ts="2026-11-23T10:00:00" ret="Y"><UidData><Poi name="Rahul Sharma" dob="1995-08-15" gender="M"/><Poa co="S/O Mahesh Sharma" house="42" street="Kasturba Gandhi Marg" loc="Connaught Place" vtc="New Delhi" pc="110001"/></UidData></KycRes>`,
        },
      },
      {
        item: {
          uri: "digilocker://in.gov.cbse/cert/2011/89214",
          name: "Class X Passing Certificate & Marksheet",
          documentType: "CLASS_X_CERTIFICATE",
          type: "Educational / Date of Birth Proof",
          size: 218400,
          date: "2011-06-05",
          issuer: "Central Board of Secondary Education (CBSE)",
          issuerId: "in.gov.cbse",
          mimeType: "application/pdf",
          description: "Verified Grade 10 Matriculation Certificate with verified DOB.",
        },
        pull: {
          uri: "digilocker://in.gov.cbse/cert/2011/89214",
          documentType: "CLASS_X_CERTIFICATE",
          title: "CBSE Class X School Examination Certificate",
          issuer: "Central Board of Secondary Education, Delhi",
          issuedAt: "2011-06-05T14:30:00Z",
          documentNumberMasked: "CBSE-2011-XXXX-89214",
          isDigitallySigned: true,
          signatureAlgorithm: "SHA256withRSA",
          issuerCertThumbprint: "F1E2D3C4B5A6F7E8D9C0B1A2F3E4D5C6B7A8F9E0",
          checksumSha256: sha256("CBSE-CLASS-X-RAHUL-SHARMA-1995-VERIFIED"),
          demographicData: {
            fullName: "Rahul Sharma",
            dateOfBirth: "1995-08-15",
            gender: "Male",
            address: "Delhi Examination Region",
            fatherOrSpouseName: "Mahesh Sharma",
          },
        },
      },
      {
        item: {
          uri: "digilocker://in.gov.incometax/panc/abcps4321k",
          name: "PAN Verification Record",
          documentType: "PAN_CARD",
          type: "Financial & Identity Document",
          size: 110200,
          date: "2016-09-20",
          issuer: "Income Tax Department",
          issuerId: "in.gov.incometax",
          mimeType: "application/pdf",
          description: "Permanent Account Number verification record.",
        },
        pull: {
          uri: "digilocker://in.gov.incometax/panc/abcps4321k",
          documentType: "PAN_CARD",
          title: "Income Tax Department e-PAN Record",
          issuer: "Income Tax Department, Govt of India",
          issuedAt: "2016-09-20T11:15:00Z",
          documentNumberMasked: "ABCPS****K",
          isDigitallySigned: true,
          signatureAlgorithm: "SHA256withRSA",
          issuerCertThumbprint: "3344556677889900AABBCCDDEEFF112233445566",
          checksumSha256: sha256("PAN-RAHUL-SHARMA-ABCPS4321K"),
          demographicData: {
            fullName: "Rahul Sharma",
            dateOfBirth: "1995-08-15",
            gender: "Male",
            address: "New Delhi",
            fatherOrSpouseName: "Mahesh Sharma",
          },
        },
      },
      {
        item: {
          uri: "digilocker://in.gov.delhi.bses/bill/2026991",
          name: "Electricity Bill (Present Address)",
          documentType: "ELECTRICITY_BILL",
          type: "Utility & Address Proof",
          size: 98300,
          date: "2026-10-10",
          issuer: "BSES Rajdhani Power Limited",
          issuerId: "in.gov.delhi.bses",
          mimeType: "application/pdf",
          description: "Recent residential electricity billing statement.",
        },
        pull: {
          uri: "digilocker://in.gov.delhi.bses/bill/2026991",
          documentType: "ELECTRICITY_BILL",
          title: "Electricity Billing Proof of Residence",
          issuer: "BSES Rajdhani Power Limited, Delhi",
          issuedAt: "2026-10-10T08:00:00Z",
          documentNumberMasked: "CA-908172XXXX",
          isDigitallySigned: true,
          signatureAlgorithm: "SHA256withRSA",
          issuerCertThumbprint: "99887766554433221100FFEEDDCCBBAA99887766",
          checksumSha256: sha256("ELEC-BSES-RAHUL-SHARMA-2026"),
          demographicData: {
            fullName: "Rahul Sharma",
            dateOfBirth: "1995-08-15",
            gender: "Male",
            address: "42 Kasturba Gandhi Marg, Connaught Place, New Delhi 110001",
          },
        },
      },
    ],
  },

  // Scenario 2: Priya Patel - Minor Name Mismatch to test operator review
  "priya-patel": {
    citizenId: "DL-IND-2026-4412",
    citizenName: "Priya Patel",
    aadhaarMasked: "XXXX-XXXX-4412",
    dob: "1998-11-20",
    gender: "Female",
    address: "104 Shivalik Heights, Drive-In Road, Ahmedabad, Gujarat 380054",
    documents: [
      {
        item: {
          uri: "digilocker://in.gov.uidai/adhr/4412",
          name: "Aadhaar Card",
          documentType: "AADHAAR",
          type: "Identity & Address Document",
          size: 145000,
          date: "2019-02-14",
          issuer: "Unique Identification Authority of India (UIDAI)",
          issuerId: "in.gov.uidai",
          mimeType: "application/pdf",
          description: "Digitally signed e-Aadhaar (Name: Priya Patel).",
        },
        pull: {
          uri: "digilocker://in.gov.uidai/adhr/4412",
          documentType: "AADHAAR",
          title: "e-Aadhaar Identity & Address Verification Record",
          issuer: "UIDAI, Government of India",
          issuedAt: "2019-02-14T11:00:00Z",
          documentNumberMasked: "XXXX-XXXX-4412",
          isDigitallySigned: true,
          signatureAlgorithm: "SHA256withRSA",
          issuerCertThumbprint: "B8C7D6E5F4A3B2C1D0E9F8A7B6C5D4E3F2A1B0A9",
          checksumSha256: sha256("UIDAI-AADHAAR-PRIYA-PATEL-4412"),
          demographicData: {
            fullName: "Priya Patel",
            dateOfBirth: "1998-11-20",
            gender: "Female",
            address: "104 Shivalik Heights, Drive-In Road, Ahmedabad, Gujarat 380054",
            fatherOrSpouseName: "Kishore Patel",
          },
        },
      },
      {
        item: {
          uri: "digilocker://in.gov.gseb/cert/2014/7721",
          name: "Class X Board Certificate",
          documentType: "CLASS_X_CERTIFICATE",
          type: "Educational / Date of Birth Proof",
          size: 210000,
          date: "2014-05-28",
          issuer: "Gujarat Secondary and Higher Secondary Education Board (GSEB)",
          issuerId: "in.gov.gseb",
          mimeType: "application/pdf",
          description: "Grade 10 Certificate (Name: Priya Kishorebhai Patel).",
        },
        pull: {
          uri: "digilocker://in.gov.gseb/cert/2014/7721",
          documentType: "CLASS_X_CERTIFICATE",
          title: "GSEB Class X Examination Certificate",
          issuer: "GSEB, Gandhinagar",
          issuedAt: "2014-05-28T16:00:00Z",
          documentNumberMasked: "GSEB-2014-XXXX-7721",
          isDigitallySigned: true,
          signatureAlgorithm: "SHA256withRSA",
          issuerCertThumbprint: "E5D4C3B2A1F0E9D8C7B6A5F4E3D2C1B0A9F8E7D6",
          checksumSha256: sha256("GSEB-CLASS-X-PRIYA-K-PATEL-1998"),
          demographicData: {
            fullName: "Priya Kishorebhai Patel", // Note difference: Middle name expanded
            dateOfBirth: "1998-11-20",
            gender: "Female",
            address: "Ahmedabad District",
            fatherOrSpouseName: "Kishore Patel",
          },
        },
      },
    ],
  },
};

export class MockDigiLockerAdapter implements IDigiLockerAdapter {
  private simulateFailure: boolean = false;
  private simulateDowntime: boolean = false;

  getAdapterName(): string {
    return "DigiLocker Sandbox Mock Adapter (MeitY India Stack Simulation v2.1)";
  }

  isMock(): boolean {
    return true;
  }

  setSimulateFailure(fail: boolean) {
    this.simulateFailure = fail;
  }

  setSimulateDowntime(down: boolean) {
    this.simulateDowntime = down;
  }

  async initiateConsent(req: DigiLockerAuthRequest): Promise<{ consentUrl: string; state: string }> {
    if (this.simulateDowntime) {
      throw new Error("DIGILOCKER_SERVICE_UNAVAILABLE: Simulated upstream DigiLocker gateway timeout (HTTP 503).");
    }

    const stateToken = `mock-state-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    // Returns simulated consent redirect URL
    const consentUrl = `/digilocker/consent-modal?applicationId=${req.applicationId}&state=${stateToken}&aadhaar=${encodeURIComponent(
      req.citizenAadhaarMasked
    )}&purpose=${encodeURIComponent(req.purpose)}&scopes=${encodeURIComponent(req.scopes.join(","))}`;

    return {
      consentUrl,
      state: stateToken,
    };
  }

  async exchangeToken(authCode: string, state: string): Promise<DigiLockerTokenResponse> {
    if (this.simulateFailure) {
      throw new Error("DIGILOCKER_AUTH_DENIED: Citizen explicitly refused consent during authentication.");
    }

    // Determine citizen profile from authCode pattern or default to rahul-sharma
    let profileKey = "rahul-sharma";
    if (authCode.includes("priya")) {
      profileKey = "priya-patel";
    }

    const citizen = MOCK_CITIZENS[profileKey] || MOCK_CITIZENS["rahul-sharma"];

    return {
      accessToken: `mock-token-${profileKey}-${Date.now()}`,
      tokenType: "Bearer",
      expiresIn: 3600,
      scope: ["uidai.adhr", "cbse.cert", "incometax.panc", "utility.bill"],
      digiLockerId: citizen.citizenId,
      citizenName: citizen.citizenName,
    };
  }

  async listIssuedDocuments(token: string): Promise<DigiLockerDocumentItem[]> {
    if (this.simulateDowntime) {
      throw new Error("DIGILOCKER_TIMEOUT: Failed to query document locker.");
    }

    let profileKey = "rahul-sharma";
    if (token.includes("priya")) {
      profileKey = "priya-patel";
    }

    const citizen = MOCK_CITIZENS[profileKey] || MOCK_CITIZENS["rahul-sharma"];
    return citizen.documents.map((d) => d.item);
  }

  async pullDocument(token: string, docUri: string): Promise<DigiLockerPullResult> {
    let profileKey = "rahul-sharma";
    if (token.includes("priya")) {
      profileKey = "priya-patel";
    }

    const citizen = MOCK_CITIZENS[profileKey] || MOCK_CITIZENS["rahul-sharma"];
    const found = citizen.documents.find((d) => d.item.uri === docUri);

    if (!found) {
      throw new Error(`DIGILOCKER_DOC_NOT_FOUND: Document URI '${docUri}' does not exist in citizen's digital locker.`);
    }

    return found.pull;
  }

  async revokeConsent(token: string, citizenId: string): Promise<{ success: boolean; revokedAt: string }> {
    return {
      success: true,
      revokedAt: new Date().toISOString(),
    };
  }

  // Helper to list available mock personas for the demo interface
  getAvailableMockPersonas() {
    return Object.entries(MOCK_CITIZENS).map(([key, data]) => ({
      key,
      name: data.citizenName,
      aadhaarMasked: data.aadhaarMasked,
      dob: data.dob,
      address: data.address,
      docCount: data.documents.length,
      note: key === "rahul-sharma" ? "Standard Clean Case (100% Match)" : "Minor Name Discrepancy Case (Triggers Operator Flag)",
    }));
  }
}

// Export singleton instance
export const digiLockerAdapter = new MockDigiLockerAdapter();
