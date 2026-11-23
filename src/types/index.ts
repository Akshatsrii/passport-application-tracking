export type ApplicationStatus =
  | "DRAFT"
  | "DOCUMENTS_PENDING"
  | "CONSENT_GRANTED"
  | "DOCUMENTS_FETCHED"
  | "SUBMITTED"
  | "UNDER_OPERATOR_REVIEW"
  | "ADDITIONAL_INFO_REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "POLICE_VERIFICATION_SIMULATED"
  | "PASSPORT_PRINTED_SIMULATED"
  | "DISPATCHED_SIMULATED";

export type ActorRole = "APPLICANT" | "OPERATOR" | "SYSTEM" | "DIGILOCKER_MOCK";

export type PassportServiceType = "FRESH_NORMAL" | "FRESH_TATKAAL" | "REISSUE_NORMAL" | "REISSUE_TATKAAL";

export type DocumentType =
  | "AADHAAR"
  | "CLASS_X_CERTIFICATE"
  | "DRIVING_LICENSE"
  | "PAN_CARD"
  | "ELECTRICITY_BILL";

export type DocumentSource = "DIGILOCKER" | "MANUAL_UPLOAD";

export type VerificationStatus = "PENDING" | "VERIFIED" | "MISMATCH_FLAGGED" | "REJECTED";

export interface ApplicantProfile {
  fullName: string;
  givenName: string;
  surname: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: "MALE" | "FEMALE" | "OTHER";
  placeOfBirth: string;
  maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
  employmentType: "GOVERNMENT" | "PRIVATE" | "SELF_EMPLOYED" | "STUDENT" | "HOMEMAKER" | "OTHER";
  email: string;
  phone: string;
  aadhaarNumberMasked: string; // e.g. "XXXX-XXXX-8921"
  permanentAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    policeStation: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  documentType: DocumentType;
  title: string;
  source: DocumentSource;
  uri?: string; // e.g. "digilocker://in.gov.uidai/adhr/9876543210"
  issuer: string;
  issueDate?: string;
  documentNumberMasked?: string;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  verifiedAt?: string;
  checksumSha256: string;
  metadata?: {
    nameInDoc?: string;
    dobInDoc?: string;
    addressInDoc?: string;
    isDigitallySigned?: boolean;
    issuerCertThumbprint?: string;
    [key: string]: any;
  };
}

export interface ConsentArtifact {
  id: string;
  applicationId: string;
  citizenAadhaarMasked: string;
  purpose: string;
  scopes: DocumentType[];
  validityMinutes: number;
  grantedAt: string;
  expiresAt: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  revokedAt?: string;
  ipAddress: string;
  consentSignature: string; // Simulated SHA-256 HMAC
}

export interface AuditLog {
  id: string;
  applicationId?: string;
  timestamp: string;
  actorRole: ActorRole;
  actorId: string;
  actorName: string;
  action: string;
  previousStatus?: ApplicationStatus;
  newStatus?: ApplicationStatus;
  details: Record<string, any>;
  ipAddress: string;
  checksum: string; // Tamper-evident hash chaining
  prevChecksum?: string;
}

export interface NotificationItem {
  id: string;
  applicationId: string;
  channel: "IN_APP" | "SMS_SIMULATED" | "EMAIL_SIMULATED";
  recipient: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface OperatorReviewRecord {
  id: string;
  applicationId: string;
  operatorId: string;
  operatorName: string;
  decision: "APPROVED" | "REJECTED" | "ADDITIONAL_INFO_REQUESTED";
  remarks: string;
  reviewedAt: string;
  checkedDocumentIds: string[];
}

export interface PassportApplication {
  id: string; // e.g. "APP-2026-88192"
  applicantId: string;
  serviceType: PassportServiceType;
  bookletType: "36_PAGES" | "60_PAGES";
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  profile: ApplicantProfile;
  documents: ApplicationDocument[];
  consent?: ConsentArtifact;
  operatorReviews: OperatorReviewRecord[];
  trackingNumber?: string; // Simulated India Post SpeedPost tracking
  estimatedCompletionDate?: string;
  rpoLocation: string; // e.g. "RPO New Delhi", "RPO Mumbai"
  flags: {
    hasNameMismatch?: boolean;
    hasDobMismatch?: boolean;
    hasAddressMismatch?: boolean;
    requiresManualVerification?: boolean;
  };
}
