import { DocumentType } from "@/types";

export interface DigiLockerAuthRequest {
  applicationId: string;
  citizenAadhaarMasked: string;
  scopes: DocumentType[];
  purpose: string;
  state: string;
  redirectUri: string;
}

export interface DigiLockerAuthResponse {
  authCode: string;
  state: string;
  expiresIn: number;
}

export interface DigiLockerTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string[];
  digiLockerId: string;
  citizenName: string;
}

export interface DigiLockerDocumentItem {
  uri: string; // e.g. "digilocker://in.gov.uidai/adhr/8921"
  name: string;
  documentType: DocumentType;
  type: string;
  size: number;
  date: string;
  issuer: string;
  issuerId: string;
  mimeType: string;
  description: string;
}

export interface DigiLockerPullResult {
  uri: string;
  documentType: DocumentType;
  title: string;
  issuer: string;
  issuedAt: string;
  documentNumberMasked: string;
  isDigitallySigned: boolean;
  signatureAlgorithm: string;
  issuerCertThumbprint: string;
  checksumSha256: string;
  demographicData: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    fatherOrSpouseName?: string;
  };
  rawXmlPreview?: string;
}

export interface IDigiLockerAdapter {
  getAdapterName(): string;
  isMock(): boolean;
  initiateConsent(req: DigiLockerAuthRequest): Promise<{ consentUrl: string; state: string }>;
  exchangeToken(authCode: string, state: string): Promise<DigiLockerTokenResponse>;
  listIssuedDocuments(token: string): Promise<DigiLockerDocumentItem[]>;
  pullDocument(token: string, docUri: string): Promise<DigiLockerPullResult>;
  revokeConsent(token: string, citizenId: string): Promise<{ success: boolean; revokedAt: string }>;
}
