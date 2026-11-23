import { ApplicationStatus, PassportApplication, ActorRole } from "@/types";

export interface TransitionContext {
  application: PassportApplication;
  actorRole: ActorRole;
  actorId: string;
  notes?: string;
  additionalData?: Record<string, any>;
}

export interface TransitionRule {
  from: ApplicationStatus;
  to: ApplicationStatus;
  allowedRoles: ActorRole[];
  guard: (ctx: TransitionContext) => { allowed: boolean; reason?: string };
}

export const STATE_TRANSITION_RULES: TransitionRule[] = [
  // Applicant completes personal profile details
  {
    from: "DRAFT",
    to: "DOCUMENTS_PENDING",
    allowedRoles: ["APPLICANT", "SYSTEM"],
    guard: (ctx) => {
      const p = ctx.application.profile;
      if (!p.fullName || !p.dateOfBirth || !p.gender || !p.email || !p.phone) {
        return { allowed: false, reason: "Incomplete applicant profile: mandatory demographic fields are missing." };
      }
      return { allowed: true };
    },
  },

  // Applicant grants explicit DigiLocker consent
  {
    from: "DOCUMENTS_PENDING",
    to: "CONSENT_GRANTED",
    allowedRoles: ["APPLICANT", "SYSTEM"],
    guard: (ctx) => {
      if (!ctx.application.consent || ctx.application.consent.status !== "ACTIVE") {
        return { allowed: false, reason: "Active consent artifact is required to transition to CONSENT_GRANTED." };
      }
      return { allowed: true };
    },
  },

  // Verified documents fetched from DigiLocker
  {
    from: "CONSENT_GRANTED",
    to: "DOCUMENTS_FETCHED",
    allowedRoles: ["APPLICANT", "SYSTEM", "DIGILOCKER_MOCK"],
    guard: (ctx) => {
      if (!ctx.application.consent || ctx.application.consent.status !== "ACTIVE") {
        return { allowed: false, reason: "Active DigiLocker consent is required to fetch verified documents." };
      }
      const hasAadhaar = ctx.application.documents.some((d) => d.documentType === "AADHAAR");
      if (!hasAadhaar) {
        return { allowed: false, reason: "At least Aadhaar must be fetched as primary identity & address proof." };
      }
      return { allowed: true };
    },
  },

  // Applicant reviews & submits application bundle
  {
    from: "DOCUMENTS_FETCHED",
    to: "SUBMITTED",
    allowedRoles: ["APPLICANT"],
    guard: (ctx) => {
      // Must have at least Aadhaar and Class X / Date of birth proof
      const docs = ctx.application.documents;
      const hasId = docs.some((d) => d.documentType === "AADHAAR" && (d.verificationStatus === "VERIFIED" || d.verificationStatus === "MISMATCH_FLAGGED"));
      const hasDob = docs.some((d) => (d.documentType === "CLASS_X_CERTIFICATE" || d.documentType === "AADHAAR" || d.documentType === "PAN_CARD") && d.verificationStatus !== "REJECTED");

      if (!hasId) {
        return { allowed: false, reason: "A verified proof of identity (Aadhaar) is mandatory before submission." };
      }
      if (!hasDob) {
        return { allowed: false, reason: "Proof of date of birth is required before submission." };
      }
      return { allowed: true };
    },
  },

  // Revocation or fallback back to documents pending if needed
  {
    from: "CONSENT_GRANTED",
    to: "DOCUMENTS_PENDING",
    allowedRoles: ["APPLICANT", "SYSTEM"],
    guard: () => ({ allowed: true }),
  },
  {
    from: "DOCUMENTS_FETCHED",
    to: "DOCUMENTS_PENDING",
    allowedRoles: ["APPLICANT", "SYSTEM"],
    guard: () => ({ allowed: true }),
  },

  // Operator picks up application for review
  {
    from: "SUBMITTED",
    to: "UNDER_OPERATOR_REVIEW",
    allowedRoles: ["OPERATOR", "SYSTEM"],
    guard: (ctx) => {
      if (ctx.actorRole !== "OPERATOR" && ctx.actorRole !== "SYSTEM") {
        return { allowed: false, reason: "Only an operator or automated review worker can place an application under review." };
      }
      return { allowed: true };
    },
  },

  // Operator approves application
  {
    from: "UNDER_OPERATOR_REVIEW",
    to: "APPROVED",
    allowedRoles: ["OPERATOR"],
    guard: (ctx) => {
      if (!ctx.notes || ctx.notes.trim().length < 5) {
        return { allowed: false, reason: "Operator review remarks (minimum 5 characters) are mandatory for approval." };
      }
      return { allowed: true };
    },
  },

  // Operator requests additional information or document correction
  {
    from: "UNDER_OPERATOR_REVIEW",
    to: "ADDITIONAL_INFO_REQUESTED",
    allowedRoles: ["OPERATOR"],
    guard: (ctx) => {
      if (!ctx.notes || ctx.notes.trim().length < 5) {
        return { allowed: false, reason: "Operator must state the specific reason and required additional info." };
      }
      return { allowed: true };
    },
  },

  // Operator rejects application
  {
    from: "UNDER_OPERATOR_REVIEW",
    to: "REJECTED",
    allowedRoles: ["OPERATOR"],
    guard: (ctx) => {
      if (!ctx.notes || ctx.notes.trim().length < 5) {
        return { allowed: false, reason: "Operator must provide a clear rejection justification." };
      }
      return { allowed: true };
    },
  },

  // Applicant re-submits after addressing operator request
  {
    from: "ADDITIONAL_INFO_REQUESTED",
    to: "SUBMITTED",
    allowedRoles: ["APPLICANT"],
    guard: () => ({ allowed: true }),
  },
  {
    from: "ADDITIONAL_INFO_REQUESTED",
    to: "DOCUMENTS_PENDING",
    allowedRoles: ["APPLICANT"],
    guard: () => ({ allowed: true }),
  },

  // Downstream SIMULATED fulfillment states
  {
    from: "APPROVED",
    to: "POLICE_VERIFICATION_SIMULATED",
    allowedRoles: ["SYSTEM", "OPERATOR"],
    guard: () => ({ allowed: true }),
  },
  {
    from: "POLICE_VERIFICATION_SIMULATED",
    to: "PASSPORT_PRINTED_SIMULATED",
    allowedRoles: ["SYSTEM", "OPERATOR"],
    guard: () => ({ allowed: true }),
  },
  {
    from: "PASSPORT_PRINTED_SIMULATED",
    to: "DISPATCHED_SIMULATED",
    allowedRoles: ["SYSTEM", "OPERATOR"],
    guard: () => ({ allowed: true }),
  },
];

export function canTransition(
  application: PassportApplication,
  toStatus: ApplicationStatus,
  actorRole: ActorRole,
  actorId: string,
  notes?: string
): { allowed: boolean; reason?: string } {
  const fromStatus = application.status;

  if (fromStatus === toStatus) {
    return { allowed: false, reason: `Application is already in status ${toStatus}.` };
  }

  const matchingRule = STATE_TRANSITION_RULES.find(
    (rule) => rule.from === fromStatus && rule.to === toStatus
  );

  if (!matchingRule) {
    return {
      allowed: false,
      reason: `Illegal state transition: Cannot move directly from '${fromStatus}' to '${toStatus}'.`,
    };
  }

  if (!matchingRule.allowedRoles.includes(actorRole)) {
    return {
      allowed: false,
      reason: `Unauthorized: Role '${actorRole}' is not permitted to trigger transition from '${fromStatus}' to '${toStatus}'.`,
    };
  }

  return matchingRule.guard({
    application,
    actorRole,
    actorId,
    notes,
  });
}

export function getAllowedTransitions(
  application: PassportApplication,
  actorRole: ActorRole
): ApplicationStatus[] {
  return STATE_TRANSITION_RULES.filter(
    (rule) => rule.from === application.status && rule.allowedRoles.includes(actorRole)
  ).map((rule) => rule.to);
}
