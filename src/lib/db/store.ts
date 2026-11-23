import fs from "fs";
import path from "path";
import {
  PassportApplication,
  AuditLog,
  NotificationItem,
  ApplicationStatus,
  ActorRole,
  ConsentArtifact,
  ApplicationDocument,
} from "@/types";
import { computeAuditChecksum, sha256 } from "@/lib/utils/crypto";
import { canTransition } from "@/lib/state-machine/transitions";

interface DatabaseSchema {
  applications: Record<string, PassportApplication>;
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const INITIAL_DATA: DatabaseSchema = {
  applications: {
    "APP-2026-88192": {
      id: "APP-2026-88192",
      applicantId: "usr_rahul_991",
      serviceType: "FRESH_NORMAL",
      bookletType: "36_PAGES",
      status: "SUBMITTED",
      createdAt: "2026-11-20T10:15:00Z",
      updatedAt: "2026-11-20T11:45:00Z",
      submittedAt: "2026-11-20T11:45:00Z",
      rpoLocation: "RPO Delhi (R.K. Puram)",
      estimatedCompletionDate: "2026-12-05",
      flags: {
        hasNameMismatch: false,
        hasDobMismatch: false,
        hasAddressMismatch: false,
        requiresManualVerification: false,
      },
      profile: {
        fullName: "Rahul Sharma",
        givenName: "Rahul",
        surname: "Sharma",
        dateOfBirth: "1995-08-15",
        gender: "MALE",
        placeOfBirth: "New Delhi",
        maritalStatus: "SINGLE",
        employmentType: "PRIVATE",
        email: "rahul.sharma@example.com",
        phone: "+91 98765 43210",
        aadhaarNumberMasked: "XXXX-XXXX-8921",
        permanentAddress: {
          street: "42 Kasturba Gandhi Marg, Connaught Place",
          city: "New Delhi",
          state: "Delhi",
          pincode: "110001",
          policeStation: "Connaught Place Police Station",
        },
        emergencyContact: {
          name: "Mahesh Sharma",
          relationship: "Father",
          phone: "+91 98110 12345",
        },
      },
      consent: {
        id: "cst-88192-active",
        applicationId: "APP-2026-88192",
        citizenAadhaarMasked: "XXXX-XXXX-8921",
        purpose: "Passport Application Assistance KYC Verification & Eligibility Check",
        scopes: ["AADHAAR", "CLASS_X_CERTIFICATE", "PAN_CARD", "ELECTRICITY_BILL"],
        validityMinutes: 1440,
        grantedAt: "2026-11-20T10:30:00Z",
        expiresAt: "2026-11-21T10:30:00Z",
        status: "ACTIVE",
        ipAddress: "192.168.1.45 (Simulated)",
        consentSignature: "b4c8a2f1e6798a728109adcf1928374a5e6d7c8b9a0123456789abcdef012345",
      },
      documents: [
        {
          id: "doc-88192-aadhaar",
          applicationId: "APP-2026-88192",
          documentType: "AADHAAR",
          title: "e-Aadhaar Identity & Address Verification Record",
          source: "DIGILOCKER",
          uri: "digilocker://in.gov.uidai/adhr/8921",
          issuer: "Unique Identification Authority of India (UIDAI)",
          issueDate: "2018-05-12",
          documentNumberMasked: "XXXX-XXXX-8921",
          verificationStatus: "VERIFIED",
          verificationNotes: "Cryptographic signature validated against UIDAI public key certificate.",
          verifiedAt: "2026-11-20T10:32:00Z",
          checksumSha256: sha256("UIDAI-AADHAAR-RAHUL-SHARMA-8921-VERIFIED"),
          metadata: {
            nameInDoc: "Rahul Sharma",
            dobInDoc: "1995-08-15",
            addressInDoc: "42 Kasturba Gandhi Marg, Connaught Place, New Delhi 110001",
            isDigitallySigned: true,
            issuerCertThumbprint: "A9B8C7D6E5F4A3B2C1D0E9F8A7B6C5D4E3F2A1B0",
          },
        },
        {
          id: "doc-88192-cbse",
          applicationId: "APP-2026-88192",
          documentType: "CLASS_X_CERTIFICATE",
          title: "CBSE Class X School Examination Certificate",
          source: "DIGILOCKER",
          uri: "digilocker://in.gov.cbse/cert/2011/89214",
          issuer: "Central Board of Secondary Education (CBSE)",
          issueDate: "2011-06-05",
          documentNumberMasked: "CBSE-2011-XXXX-89214",
          verificationStatus: "VERIFIED",
          verificationNotes: "DOB matches e-Aadhaar and self-reported application profile.",
          verifiedAt: "2026-11-20T10:33:00Z",
          checksumSha256: sha256("CBSE-CLASS-X-RAHUL-SHARMA-1995-VERIFIED"),
          metadata: {
            nameInDoc: "Rahul Sharma",
            dobInDoc: "1995-08-15",
            isDigitallySigned: true,
          },
        },
      ],
      operatorReviews: [],
    },
    "APP-2026-44120": {
      id: "APP-2026-44120",
      applicantId: "usr_priya_441",
      serviceType: "FRESH_TATKAAL",
      bookletType: "60_PAGES",
      status: "DOCUMENTS_PENDING",
      createdAt: "2026-11-22T14:00:00Z",
      updatedAt: "2026-11-22T14:10:00Z",
      rpoLocation: "RPO Ahmedabad (Gujarat)",
      flags: {
        hasNameMismatch: false,
        hasDobMismatch: false,
        hasAddressMismatch: false,
        requiresManualVerification: false,
      },
      profile: {
        fullName: "Priya Patel",
        givenName: "Priya",
        surname: "Patel",
        dateOfBirth: "1998-11-20",
        gender: "FEMALE",
        placeOfBirth: "Ahmedabad",
        maritalStatus: "SINGLE",
        employmentType: "PRIVATE",
        email: "priya.patel@example.com",
        phone: "+91 97123 45678",
        aadhaarNumberMasked: "XXXX-XXXX-4412",
        permanentAddress: {
          street: "104 Shivalik Heights, Drive-In Road",
          city: "Ahmedabad",
          state: "Gujarat",
          pincode: "380054",
          policeStation: "Vastrapur Police Station",
        },
        emergencyContact: {
          name: "Kishore Patel",
          relationship: "Father",
          phone: "+91 98250 98765",
        },
      },
      documents: [],
      operatorReviews: [],
    },
  },
  auditLogs: [
    {
      id: "log-seed-001",
      applicationId: "APP-2026-88192",
      timestamp: "2026-11-20T10:15:00Z",
      actorRole: "APPLICANT",
      actorId: "usr_rahul_991",
      actorName: "Rahul Sharma",
      action: "APPLICATION_CREATED",
      newStatus: "DRAFT",
      details: { serviceType: "FRESH_NORMAL", bookletType: "36_PAGES" },
      ipAddress: "192.168.1.45 (Simulated)",
      checksum: sha256("GENESIS-BLOCK-001-APP-88192"),
      prevChecksum: "0000000000000000000000000000000000000000000000000000000000000000",
    },
    {
      id: "log-seed-002",
      applicationId: "APP-2026-88192",
      timestamp: "2026-11-20T10:30:00Z",
      actorRole: "APPLICANT",
      actorId: "usr_rahul_991",
      actorName: "Rahul Sharma",
      action: "CONSENT_GRANTED",
      previousStatus: "DOCUMENTS_PENDING",
      newStatus: "CONSENT_GRANTED",
      details: { purpose: "Passport Assistance KYC", scopes: ["AADHAAR", "CLASS_X_CERTIFICATE"] },
      ipAddress: "192.168.1.45 (Simulated)",
      checksum: sha256("LOG-002-CONSENT-GRANTED"),
      prevChecksum: sha256("GENESIS-BLOCK-001-APP-88192"),
    },
    {
      id: "log-seed-003",
      applicationId: "APP-2026-88192",
      timestamp: "2026-11-20T10:33:00Z",
      actorRole: "SYSTEM",
      actorId: "digilocker_sync_worker",
      actorName: "DigiLocker Mock Sync",
      action: "DOCUMENTS_PULLED",
      previousStatus: "CONSENT_GRANTED",
      newStatus: "DOCUMENTS_FETCHED",
      details: { pulledDocuments: ["AADHAAR", "CLASS_X_CERTIFICATE"], verificationStatus: "VERIFIED" },
      ipAddress: "127.0.0.1",
      checksum: sha256("LOG-003-DOCUMENTS-PULLED"),
      prevChecksum: sha256("LOG-002-CONSENT-GRANTED"),
    },
    {
      id: "log-seed-004",
      applicationId: "APP-2026-88192",
      timestamp: "2026-11-20T11:45:00Z",
      actorRole: "APPLICANT",
      actorId: "usr_rahul_991",
      actorName: "Rahul Sharma",
      action: "APPLICATION_SUBMITTED",
      previousStatus: "DOCUMENTS_FETCHED",
      newStatus: "SUBMITTED",
      details: { declarationAcknowledged: true, bundleSize: 2 },
      ipAddress: "192.168.1.45 (Simulated)",
      checksum: sha256("LOG-004-SUBMITTED"),
      prevChecksum: sha256("LOG-003-DOCUMENTS-PULLED"),
    },
  ],
  notifications: [
    {
      id: "notif-001",
      applicationId: "APP-2026-88192",
      channel: "SMS_SIMULATED",
      recipient: "+91 98765 43210",
      title: "Application Submitted Successfully",
      message: "Dear Rahul Sharma, your passport assistance application APP-2026-88192 has been received and queued for operator review.",
      createdAt: "2026-11-20T11:45:05Z",
      read: true,
    },
    {
      id: "notif-002",
      applicationId: "APP-2026-44120",
      channel: "IN_APP",
      recipient: "priya.patel@example.com",
      title: "Documents Required",
      message: "Please complete your DigiLocker consent to automatically verify your Aadhaar and 10th certificate.",
      createdAt: "2026-11-22T14:10:00Z",
      read: false,
    },
  ],
};

class MemoryStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      ensureDir(DATA_DIR);
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, "utf-8");
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn("Failed to read store.json, falling back to seed initial data:", err);
    }
    this.saveData(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  private saveData(data: DatabaseSchema) {
    try {
      ensureDir(DATA_DIR);
      fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to write store.json:", err);
    }
  }

  private persist() {
    this.saveData(this.data);
  }

  // --- Applications ---
  getApplications(): PassportApplication[] {
    return Object.values(this.data.applications);
  }

  getApplication(id: string): PassportApplication | null {
    return this.data.applications[id] || null;
  }

  createApplication(app: PassportApplication): PassportApplication {
    this.data.applications[app.id] = app;
    this.appendAuditLog({
      applicationId: app.id,
      actorRole: "APPLICANT",
      actorId: app.applicantId,
      actorName: app.profile.fullName || "Applicant",
      action: "APPLICATION_CREATED",
      newStatus: app.status,
      details: { serviceType: app.serviceType, bookletType: app.bookletType },
      ipAddress: "127.0.0.1",
    });
    this.persist();
    return app;
  }

  updateApplication(id: string, updates: Partial<PassportApplication>): PassportApplication {
    const existing = this.getApplication(id);
    if (!existing) {
      throw new Error(`Application ${id} not found.`);
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.applications[id] = updated;
    this.persist();
    return updated;
  }

  transitionStatus(
    id: string,
    toStatus: ApplicationStatus,
    actorRole: ActorRole,
    actorId: string,
    actorName: string,
    notes?: string,
    additionalData?: Record<string, any>
  ): PassportApplication {
    const app = this.getApplication(id);
    if (!app) {
      throw new Error(`Application ${id} not found.`);
    }

    const check = canTransition(app, toStatus, actorRole, actorId, notes);
    if (!check.allowed) {
      throw new Error(check.reason || `Transition to ${toStatus} not permitted.`);
    }

    const prevStatus = app.status;
    const now = new Date().toISOString();

    app.status = toStatus;
    app.updatedAt = now;

    if (toStatus === "SUBMITTED" && !app.submittedAt) {
      app.submittedAt = now;
      this.createNotification({
        applicationId: id,
        channel: "SMS_SIMULATED",
        recipient: app.profile.phone,
        title: "Application Submitted",
        message: `Your passport assistance application ${id} has been submitted and is under queue for operator verification.`,
      });
    }

    if (toStatus === "APPROVED") {
      this.createNotification({
        applicationId: id,
        channel: "EMAIL_SIMULATED",
        recipient: app.profile.email,
        title: "Application Approved by Assistance Operator",
        message: `Good news! Your passport assistance application ${id} has been reviewed and verified. Proceeding to police verification simulation.`,
      });
    }

    if (toStatus === "DISPATCHED_SIMULATED") {
      app.trackingNumber = `INP-SP-${Date.now().toString().slice(-8)}`;
      this.createNotification({
        applicationId: id,
        channel: "SMS_SIMULATED",
        recipient: app.profile.phone,
        title: "Passport Dispatched (Simulated)",
        message: `Your passport has been printed and dispatched via India Post SpeedPost tracking: ${app.trackingNumber}.`,
      });
    }

    this.appendAuditLog({
      applicationId: id,
      actorRole,
      actorId,
      actorName,
      action: `STATUS_TRANSITION_${toStatus}`,
      previousStatus: prevStatus,
      newStatus: toStatus,
      details: { notes, ...additionalData },
      ipAddress: "127.0.0.1",
    });

    this.data.applications[id] = app;
    this.persist();
    return app;
  }

  // --- Consent & Documents ---
  setConsent(id: string, consent: ConsentArtifact, actorName: string): PassportApplication {
    const app = this.getApplication(id);
    if (!app) throw new Error(`Application ${id} not found.`);

    app.consent = consent;
    app.status = "CONSENT_GRANTED";
    app.updatedAt = new Date().toISOString();

    this.appendAuditLog({
      applicationId: id,
      actorRole: "APPLICANT",
      actorId: app.applicantId,
      actorName,
      action: "DIGILOCKER_CONSENT_GRANTED",
      previousStatus: "DOCUMENTS_PENDING",
      newStatus: "CONSENT_GRANTED",
      details: {
        consentId: consent.id,
        purpose: consent.purpose,
        scopes: consent.scopes,
        validityMinutes: consent.validityMinutes,
      },
      ipAddress: consent.ipAddress,
    });

    this.data.applications[id] = app;
    this.persist();
    return app;
  }

  revokeConsent(id: string, actorName: string): PassportApplication {
    const app = this.getApplication(id);
    if (!app) throw new Error(`Application ${id} not found.`);

    if (app.consent) {
      app.consent.status = "REVOKED";
      app.consent.revokedAt = new Date().toISOString();
    }

    // If documents were not officially submitted, revert to DOCUMENTS_PENDING
    if (app.status === "CONSENT_GRANTED" || app.status === "DOCUMENTS_FETCHED") {
      app.status = "DOCUMENTS_PENDING";
    }

    this.appendAuditLog({
      applicationId: id,
      actorRole: "APPLICANT",
      actorId: app.applicantId,
      actorName,
      action: "DIGILOCKER_CONSENT_REVOKED",
      details: { consentId: app.consent?.id },
      ipAddress: "127.0.0.1",
    });

    this.data.applications[id] = app;
    this.persist();
    return app;
  }

  addDocuments(id: string, docs: ApplicationDocument[], actorName: string): PassportApplication {
    const app = this.getApplication(id);
    if (!app) throw new Error(`Application ${id} not found.`);

    // Merge or replace by documentType
    const existingMap = new Map(app.documents.map((d) => [d.documentType, d]));
    for (const doc of docs) {
      existingMap.set(doc.documentType, doc);
    }
    app.documents = Array.from(existingMap.values());
    app.status = "DOCUMENTS_FETCHED";
    app.updatedAt = new Date().toISOString();

    // Check for demographic discrepancies between application profile and fetched docs
    const aadhaarDoc = app.documents.find((d) => d.documentType === "AADHAAR");
    const classXDoc = app.documents.find((d) => d.documentType === "CLASS_X_CERTIFICATE");

    if (aadhaarDoc && classXDoc) {
      const name1 = (aadhaarDoc.metadata?.nameInDoc || "").toLowerCase().replace(/[^a-z]/g, "");
      const name2 = (classXDoc.metadata?.nameInDoc || "").toLowerCase().replace(/[^a-z]/g, "");
      if (name1 && name2 && name1 !== name2) {
        app.flags.hasNameMismatch = true;
        app.flags.requiresManualVerification = true;
        classXDoc.verificationStatus = "MISMATCH_FLAGGED";
        classXDoc.verificationNotes = `Name difference detected: Aadhaar has '${aadhaarDoc.metadata?.nameInDoc}' while Class X has '${classXDoc.metadata?.nameInDoc}'. Requires operator discretion.`;
      }
    }

    this.appendAuditLog({
      applicationId: id,
      actorRole: "SYSTEM",
      actorId: "digilocker_adapter",
      actorName,
      action: "DOCUMENTS_FETCHED",
      newStatus: "DOCUMENTS_FETCHED",
      details: {
        fetchedCount: docs.length,
        documentTypes: docs.map((d) => d.documentType),
        flags: app.flags,
      },
      ipAddress: "127.0.0.1",
    });

    this.data.applications[id] = app;
    this.persist();
    return app;
  }

  // --- Audit Trail ---
  getAuditLogs(applicationId?: string): AuditLog[] {
    if (applicationId) {
      return this.data.auditLogs.filter((log) => log.applicationId === applicationId);
    }
    return this.data.auditLogs;
  }

  appendAuditLog(entry: Omit<AuditLog, "id" | "timestamp" | "checksum" | "prevChecksum">): AuditLog {
    const prevLog = this.data.auditLogs[this.data.auditLogs.length - 1];
    const prevChecksum = prevLog ? prevLog.checksum : "0000000000000000000000000000000000000000000000000000000000000000";
    const timestamp = new Date().toISOString();
    const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const checksum = computeAuditChecksum(prevChecksum, entry.action, entry.actorId, timestamp, entry.details);

    const log: AuditLog = {
      id,
      timestamp,
      checksum,
      prevChecksum,
      ...entry,
    };

    this.data.auditLogs.push(log);
    this.persist();
    return log;
  }

  // --- Notifications ---
  getNotifications(applicationId?: string): NotificationItem[] {
    if (applicationId) {
      return this.data.notifications.filter((n) => n.applicationId === applicationId);
    }
    return this.data.notifications;
  }

  createNotification(notif: Omit<NotificationItem, "id" | "createdAt" | "read">): NotificationItem {
    const full: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      read: false,
      ...notif,
    };
    this.data.notifications.unshift(full);
    this.persist();
    return full;
  }

  markNotificationRead(id: string): void {
    const item = this.data.notifications.find((n) => n.id === id);
    if (item) {
      item.read = true;
      this.persist();
    }
  }

  resetToSeed(): void {
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.persist();
  }
}

export const db = new MemoryStore();
