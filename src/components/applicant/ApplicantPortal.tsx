"use client";

import React, { useState } from "react";
import {
  PassportApplication,
  DocumentType,
  ApplicationDocument,
} from "@/types";
import { TrackingTimeline } from "./TrackingTimeline";
import { DigiLockerModal } from "./DigiLockerModal";
import {
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  Send,
  User,
  MapPin,
  Lock,
  CheckCircle,
  ExternalLink,
  Ban,
  Fingerprint,
  RefreshCw,
} from "lucide-react";

interface ApplicantPortalProps {
  applications: PassportApplication[];
  selectedAppId: string;
  onSelectApplication: (id: string) => void;
  onRefresh: () => void;
}

export const ApplicantPortal: React.FC<ApplicantPortalProps> = ({
  applications,
  selectedAppId,
  onSelectApplication,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const currentApp = applications.find((a) => a.id === selectedAppId) || applications[0];

  if (!currentApp) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-sm text-slate-500">No applications found. Please click Reset Demo.</p>
      </div>
    );
  }

  const handleGrantConsent = async (personaKey: string, scopes: DocumentType[]) => {
    try {
      setActionMessage(null);
      // Step 1: Register Consent
      const consentRes = await fetch("/api/digilocker/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: currentApp.id,
          citizenAadhaarMasked: currentApp.profile.aadhaarNumberMasked,
          purpose: "Passport Application Verification KYC",
          scopes,
          personaKey,
          validityMinutes: 1440,
        }),
      });
      const consentData = await consentRes.json();
      if (!consentData.success) throw new Error(consentData.error);

      // Step 2: Fetch Documents
      const fetchRes = await fetch("/api/digilocker/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: currentApp.id,
          personaKey,
        }),
      });
      const fetchData = await fetchRes.json();
      if (!fetchData.success) throw new Error(fetchData.error);

      setActionMessage({
        type: "success",
        text: `Consent granted and ${fetchData.data.documents.length} verified documents fetched via DigiLocker.`,
      });
      onRefresh();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message || "Failed to complete DigiLocker verification" });
      throw err;
    }
  };

  const handleRevokeConsent = async () => {
    if (!confirm("Are you sure you want to revoke DigiLocker consent? This will be recorded in the audit trail.")) {
      return;
    }
    setIsRevoking(true);
    try {
      const res = await fetch("/api/digilocker/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: currentApp.id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setActionMessage({
        type: "success",
        text: "DigiLocker consent has been revoked. Application documents require re-authorization.",
      });
      onRefresh();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message || "Failed to revoke consent" });
    } finally {
      setIsRevoking(false);
    }
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/applications/${currentApp.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toStatus: "SUBMITTED",
          actorRole: "APPLICANT",
          actorId: currentApp.applicantId,
          actorName: currentApp.profile.fullName,
          notes: "Applicant self-declaration submitted online",
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setActionMessage({
        type: "success",
        text: "Application submitted successfully! It has been placed in the operator review queue.",
      });
      onRefresh();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message || "Submission failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAadhaar = currentApp.documents.some((d) => d.documentType === "AADHAAR");
  const hasClassX = currentApp.documents.some((d) => d.documentType === "CLASS_X_CERTIFICATE");
  const canSubmit = (currentApp.status === "DOCUMENTS_FETCHED" || currentApp.status === "ADDITIONAL_INFO_REQUESTED") && hasAadhaar;

  return (
    <div className="space-y-6">
      {/* Persona Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Applicant View</span>
            <h2 className="text-sm font-bold text-slate-900">
              Active Applicant: {currentApp.profile.fullName} ({currentApp.id})
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Switch Application:</span>
          {applications.map((app) => (
            <button
              key={app.id}
              onClick={() => onSelectApplication(app.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                app.id === currentApp.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {app.profile.fullName.split(" ")[0]} ({app.status.replace(/_/g, " ")})
            </button>
          ))}
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 font-medium ${
            actionMessage.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Lifecycle Progress Stepper */}
      <TrackingTimeline application={currentApp} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Applicant Demographic Profile */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-slate-600" />
                Applicant Demographics
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {currentApp.serviceType.replace("_", " ")}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Name</span>
                <span className="font-semibold text-slate-800">{currentApp.profile.fullName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                  <span className="font-semibold text-slate-800">{currentApp.profile.dateOfBirth}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Gender</span>
                  <span className="font-semibold text-slate-800">{currentApp.profile.gender}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Aadhaar (PII Masked)</span>
                <span className="font-mono font-bold text-slate-800">{currentApp.profile.aadhaarNumberMasked}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Contact Details</span>
                <div className="text-slate-700">{currentApp.profile.email}</div>
                <div className="text-slate-700">{currentApp.profile.phone}</div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Permanent Address</span>
                <div className="text-slate-700 leading-snug">
                  {currentApp.profile.permanentAddress.street}, {currentApp.profile.permanentAddress.city},{" "}
                  {currentApp.profile.permanentAddress.state} - {currentApp.profile.permanentAddress.pincode}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Police Jurisdiction</span>
                <div className="text-slate-700">{currentApp.profile.permanentAddress.policeStation}</div>
              </div>
            </div>
          </div>

          {/* Active Consent Card */}
          {currentApp.consent && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-blue-600" />
                  Consent Artifact
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    currentApp.consent.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {currentApp.consent.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Purpose: {currentApp.consent.purpose}
              </p>
              <div className="font-mono text-[10px] text-slate-500 break-all bg-white p-2 rounded border border-slate-200">
                Signature: {currentApp.consent.consentSignature.slice(0, 24)}...
              </div>
              {currentApp.consent.status === "ACTIVE" && (
                <button
                  type="button"
                  onClick={handleRevokeConsent}
                  disabled={isRevoking}
                  className="w-full mt-2 py-1.5 text-center text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Revoke DigiLocker Consent
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Document Checklist & DigiLocker Connection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  Verified Document Checklist
                </h3>
                <p className="text-xs text-slate-500">
                  Documents required by Ministry of External Affairs for passport issuance
                </p>
              </div>

              {/* Connect DigiLocker Button */}
              {currentApp.status === "DOCUMENTS_PENDING" || !hasAadhaar ? (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Connect DigiLocker (Consent Flow)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  Re-sync DigiLocker Documents
                </button>
              )}
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              {/* Document 1: Aadhaar (POI + POA) */}
              <div
                className={`p-4 rounded-xl border transition-all text-xs ${
                  hasAadhaar
                    ? "border-green-200 bg-green-50/40"
                    : "border-amber-200 bg-amber-50/40"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Proof of Identity & Address (Aadhaar)</span>
                      {hasAadhaar ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 border border-green-200">
                          VERIFIED VIA DIGILOCKER
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          PENDING FETCH
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Mandatory primary proof under Passport Rules 1980. Fetched directly from UIDAI.
                    </p>
                  </div>
                </div>

                {hasAadhaar && (
                  <div className="mt-3 pt-3 border-t border-green-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                    <div>
                      <span className="text-slate-400">Issuer:</span> Unique Identification Authority of India (UIDAI)
                    </div>
                    <div>
                      <span className="text-slate-400">Digital Signature:</span> SHA256withRSA (Valid)
                    </div>
                  </div>
                )}
              </div>

              {/* Document 2: Class X Certificate (Date of Birth Proof) */}
              <div
                className={`p-4 rounded-xl border transition-all text-xs ${
                  hasClassX
                    ? "border-green-200 bg-green-50/40"
                    : "border-slate-200 bg-slate-50/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Proof of Date of Birth (Class X Certificate)</span>
                      {hasClassX ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 border border-green-200">
                          VERIFIED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                          NOT ATTACHED
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      CBSE / ICSE / State Board matriculation certificate used to substantiate Non-ECR status and DOB.
                    </p>
                  </div>
                </div>

                {hasClassX && (
                  <div className="mt-3 pt-3 border-t border-green-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                    <div>
                      <span className="text-slate-400">Issuer:</span> Educational Board
                    </div>
                    <div>
                      <span className="text-slate-400">Status:</span> Matched with DOB {currentApp.profile.dateOfBirth}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mismatch Warning Alert if any */}
            {currentApp.flags.hasNameMismatch && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-3 text-xs text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Demographic Discrepancy Flagged</h4>
                  <p className="mt-0.5 leading-relaxed">
                    A minor name difference was detected between your self-reported profile and one of your verified certificates. This application has been flagged for operator discretion and manual verification. You can still proceed with submission.
                  </p>
                </div>
              </div>
            )}

            {/* Submission Block */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                {currentApp.status === "SUBMITTED" ? (
                  <span className="text-blue-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    Application successfully lodged on {new Date(currentApp.submittedAt || "").toLocaleDateString()}.
                  </span>
                ) : (
                  <span>
                    Once submitted, your application and verified documents will be audited by the assistance operator.
                  </span>
                )}
              </div>

              {currentApp.status !== "SUBMITTED" &&
                currentApp.status !== "UNDER_OPERATOR_REVIEW" &&
                currentApp.status !== "APPROVED" && (
                  <button
                    type="button"
                    onClick={handleSubmitApplication}
                    disabled={!canSubmit || isSubmitting}
                    className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* DigiLocker Consent Modal */}
      <DigiLockerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGrantConsent={handleGrantConsent}
        applicantName={currentApp.profile.fullName}
        maskedAadhaar={currentApp.profile.aadhaarNumberMasked}
      />
    </div>
  );
};
