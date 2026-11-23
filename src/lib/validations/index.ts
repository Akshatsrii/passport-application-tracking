import { z } from "zod";

export const ApplicantProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  givenName: z.string().optional().default(""),
  surname: z.string().optional().default(""),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  placeOfBirth: z.string().min(2, "Place of birth is required"),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]),
  employmentType: z.enum(["GOVERNMENT", "PRIVATE", "SELF_EMPLOYED", "STUDENT", "HOMEMAKER", "OTHER"]),
  email: z.string().email("Valid email address is required"),
  phone: z.string().min(10, "Phone number must have at least 10 digits"),
  aadhaarNumberMasked: z.string().min(12, "Masked Aadhaar is required"),
  permanentAddress: z.object({
    street: z.string().min(3, "Street address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
    policeStation: z.string().min(2, "Police station jurisdiction is required"),
  }),
  emergencyContact: z.object({
    name: z.string().min(2, "Contact name is required"),
    relationship: z.string().min(2, "Relationship is required"),
    phone: z.string().min(10, "Emergency phone is required"),
  }),
});

export const CreateApplicationSchema = z.object({
  applicantId: z.string().min(1),
  serviceType: z.enum(["FRESH_NORMAL", "FRESH_TATKAAL", "REISSUE_NORMAL", "REISSUE_TATKAAL"]),
  bookletType: z.enum(["36_PAGES", "60_PAGES"]),
  rpoLocation: z.string().min(2, "RPO location is required"),
  profile: ApplicantProfileSchema,
});

export const StatusTransitionSchema = z.object({
  toStatus: z.enum([
    "DRAFT",
    "DOCUMENTS_PENDING",
    "CONSENT_GRANTED",
    "DOCUMENTS_FETCHED",
    "SUBMITTED",
    "UNDER_OPERATOR_REVIEW",
    "ADDITIONAL_INFO_REQUESTED",
    "APPROVED",
    "REJECTED",
    "POLICE_VERIFICATION_SIMULATED",
    "PASSPORT_PRINTED_SIMULATED",
    "DISPATCHED_SIMULATED",
  ]),
  actorRole: z.enum(["APPLICANT", "OPERATOR", "SYSTEM", "DIGILOCKER_MOCK"]),
  actorId: z.string().min(1),
  actorName: z.string().min(1),
  notes: z.string().optional(),
  additionalData: z.record(z.any()).optional(),
});

export const DigiLockerConsentSchema = z.object({
  applicationId: z.string().min(1),
  citizenAadhaarMasked: z.string().min(12),
  purpose: z.string().min(5),
  scopes: z.array(z.enum(["AADHAAR", "CLASS_X_CERTIFICATE", "DRIVING_LICENSE", "PAN_CARD", "ELECTRICITY_BILL"])),
  personaKey: z.string().default("rahul-sharma"),
  validityMinutes: z.number().int().positive().default(1440),
});

export const OperatorReviewSchema = z.object({
  applicationId: z.string().min(1),
  operatorId: z.string().min(1),
  operatorName: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED", "ADDITIONAL_INFO_REQUESTED"]),
  remarks: z.string().min(5, "Operator remarks must be at least 5 characters long"),
  checkedDocumentIds: z.array(z.string()).default([]),
});
