"use client";

import React, { useState } from "react";
import {
  PassportApplication,
  DocumentType,
  ApplicationDocument,
} from "@/types";
import { TrackingTimeline } from "./TrackingTimeline";
import { DigiLockerModal } from "./DigiLockerModal";
import { CertificateModal } from "./CertificateModal";
import { ApplicationSlipModal } from "./ApplicationSlipModal";
import {
  FileText,
  ShieldCheck,
  AlertCircle,
  Check,
  User,
  ArrowRight,
  Shield,
  RotateCw,
  Eye,
  Download,
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
  const [selectedDocForModal, setSelectedDocForModal] = useState<ApplicationDocument | null>(null);
  const [isArnModalOpen, setIsArnModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const currentApp = applications.find((a) => a.id === selectedAppId) || applications[0];

  if (!currentApp) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-xs text-slate-500">No applications loaded. Please click Reset Demo.</p>
      </div>
    );
  }

  const handleGrantConsent = async (personaKey: string, scopes: DocumentType[]) => {
    try {
      setStatusMessage(null);
      // 1. Consent
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

      // 2. Fetch
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

      setStatusMessage({
        type: "success",
        text: `DigiLocker consent recorded and ${fetchData.data.documents.length} documents verified.`,
      });
      onRefresh();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to link DigiLocker" });
      throw err;
    }
  };

  const handleRevokeConsent = async () => {
    if (!confirm("Revoke DigiLocker consent for this application?")) return;
    setIsRevoking(true);
    try {
      const res = await fetch("/api/digilocker/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: currentApp.id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setStatusMessage({
        type: "success",
        text: "DigiLocker consent revoked. Documents reverted to pending state.",
      });
      onRefresh();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Revocation failed" });
    } finally {
      setIsRevoking(false);
    }
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/applications/${currentApp.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toStatus: "SUBMITTED",
          actorRole: "APPLICANT",
          actorId: currentApp.applicantId,
          actorName: currentApp.profile.fullName,
          notes: "Applicant confirmed submission checklist",
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setStatusMessage({
        type: "success",
        text: "Application submitted successfully and routed to operator review desk.",
      });
      onRefresh();
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Submission failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAadhaar = currentApp.documents.some((d) => d.documentType === "AADHAAR");
  const hasClassX = currentApp.documents.some((d) => d.documentType === "CLASS_X_CERTIFICATE");
  const aadhaarDoc = currentApp.documents.find((d) => d.documentType === "AADHAAR");
  const classXDoc = currentApp.documents.find((d) => d.documentType === "CLASS_X_CERTIFICATE");

  const canSubmit =
    (currentApp.status === "DOCUMENTS_FETCHED" || currentApp.status === "ADDITIONAL_INFO_REQUESTED") &&
    hasAadhaar;

  const initials = currentApp.profile.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Profile Bar / Account Switcher */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-semibold text-sm">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">{currentApp.profile.fullName}</h2>
              <span className="text-[11px] font-mono text-slate-500">{currentApp.id}</span>
            </div>
            <p className="text-xs text-slate-500">
              {currentApp.serviceType.replace("_", " ")} • {currentApp.bookletType.replace("_", " ")} Booklet
            </p>
          </div>
        </div>

        {/* Subtle persona switcher */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-50 p-1 rounded-lg border border-slate-200">
          <span className="text-[11px] text-slate-500 px-2">Applicant:</span>
          {applications.map((app) => {
            const isSelected = app.id === currentApp.id;
            return (
              <button
                key={app.id}
                onClick={() => onSelectApplication(app.id)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {app.profile.fullName.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 border ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Progress Timeline */}
      <TrackingTimeline application={currentApp} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Profile Details */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
                Applicant Details
              </h3>
              <span className="text-[11px] text-slate-500">Self-declared</span>
            </div>

            <dl className="space-y-3 text-xs">
              <div>
                <dt className="text-slate-400 text-[11px]">Full Name</dt>
                <dd className="font-medium text-slate-800 mt-0.5">{currentApp.profile.fullName}</dd>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <dt className="text-slate-400 text-[11px]">Date of Birth</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">{currentApp.profile.dateOfBirth}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 text-[11px]">Gender</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">{currentApp.profile.gender}</dd>
                </div>
              </div>

              <div>
                <dt className="text-slate-400 text-[11px]">Aadhaar Number (Masked)</dt>
                <dd className="font-mono text-slate-800 font-medium mt-0.5">
                  {currentApp.profile.aadhaarNumberMasked}
                </dd>
              </div>

              <div>
                <dt className="text-slate-400 text-[11px]">Contact</dt>
                <dd className="text-slate-700 mt-0.5">{currentApp.profile.email}</dd>
                <dd className="text-slate-700">{currentApp.profile.phone}</dd>
              </div>

              <div>
                <dt className="text-slate-400 text-[11px]">Residential Address</dt>
                <dd className="text-slate-700 mt-0.5 leading-snug">
                  {currentApp.profile.permanentAddress.street}, {currentApp.profile.permanentAddress.city},{" "}
                  {currentApp.profile.permanentAddress.state} - {currentApp.profile.permanentAddress.pincode}
                </dd>
              </div>

              <div>
                <dt className="text-slate-400 text-[11px]">Police Station</dt>
                <dd className="text-slate-700 mt-0.5">{currentApp.profile.permanentAddress.policeStation}</dd>
              </div>
            </dl>
          </div>

          {/* Consent Artifact Card */}
          {currentApp.consent && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-slate-600" />
                  DigiLocker Consent
                </span>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                    currentApp.consent.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {currentApp.consent.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Voluntary consent granted for identity verification under IT Act 2000.
              </p>
              {currentApp.consent.status === "ACTIVE" && (
                <button
                  type="button"
                  onClick={handleRevokeConsent}
                  disabled={isRevoking}
                  className="text-xs text-red-600 hover:text-red-700 font-medium pt-1 inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  Revoke consent access
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Required Documents Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div>
                <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
                  Document Checklist
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify identity and birth date directly from official government repositories
                </p>
              </div>

              {/* Clean DigiLocker Connect Button */}
              {currentApp.status === "DOCUMENTS_PENDING" || !hasAadhaar ? (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-3.5 py-2 rounded-lg bg-[#0b47a8] hover:bg-blue-800 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Fetch via DigiLocker
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                  Re-sync Documents
                </button>
              )}
            </div>

            {/* Document Checklist Items */}
            <div className="space-y-3">
              {/* Document 1: Aadhaar */}
              <div
                className={`p-4 rounded-lg border transition-colors ${
                  hasAadhaar ? "border-slate-200 bg-slate-50/50" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-xs">Proof of Identity & Address</span>
                      {hasAadhaar ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" /> Linked via UIDAI
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                          Not Linked
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      e-Aadhaar verification record from Unique Identification Authority of India.
                    </p>
                  </div>
                </div>

                {aadhaarDoc && (
                  <div className="mt-3 pt-3 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600">
                    <div>
                      Name on Aadhaar: <strong className="text-slate-800">{aadhaarDoc.metadata?.nameInDoc}</strong> •{" "}
                      <span className="font-medium text-emerald-700">SHA256withRSA Valid</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedDocForModal(aadhaarDoc)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:text-blue-900 self-start sm:self-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Certificate
                    </button>
                  </div>
                )}
              </div>

              {/* Document 2: Class X Certificate */}
              <div
                className={`p-4 rounded-lg border transition-colors ${
                  hasClassX ? "border-slate-200 bg-slate-50/50" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-xs">Proof of Date of Birth (Class X Marksheet)</span>
                      {hasClassX ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" /> Linked via Secondary Board
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                          Not Linked
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Secondary examination certificate for non-ECR verification and date of birth validation.
                    </p>
                  </div>
                </div>

                {classXDoc && (
                  <div className="mt-3 pt-3 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600">
                    <div>
                      Name on Record: <strong className="text-slate-800">{classXDoc.metadata?.nameInDoc}</strong> • DOB:{" "}
                      <strong className="text-slate-800">{classXDoc.metadata?.dobInDoc}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedDocForModal(classXDoc)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:text-blue-900 self-start sm:self-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Certificate
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Calm Discrepancy Note */}
            {currentApp.flags.hasNameMismatch && (
              <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                <div className="font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  Minor Name Variation Detected
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed pl-5">
                  The name on your Class X record contains customary initials. The verification officer will review and confirm this during application audit. You may submit your application as scheduled.
                </p>
              </div>
            )}

            {/* Submission Section */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {currentApp.status === "SUBMITTED" || currentApp.status === "APPROVED" || currentApp.status === "UNDER_OPERATOR_REVIEW" ? (
                  <div className="flex items-center gap-3">
                    <span className="text-slate-800 font-medium">
                      Application submitted on {new Date(currentApp.submittedAt || currentApp.updatedAt).toLocaleDateString()}.
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsArnModalOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 underline underline-offset-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download ARN Slip
                    </button>
                  </div>
                ) : (
                  <span>Ensure your documents are linked before final submission.</span>
                )}
              </div>

              {currentApp.status !== "SUBMITTED" &&
                currentApp.status !== "UNDER_OPERATOR_REVIEW" &&
                currentApp.status !== "APPROVED" &&
                currentApp.status !== "POLICE_VERIFICATION_SIMULATED" &&
                currentApp.status !== "PASSPORT_PRINTED_SIMULATED" &&
                currentApp.status !== "DISPATCHED_SIMULATED" && (
                  <button
                    type="button"
                    onClick={handleSubmitApplication}
                    disabled={!canSubmit || isSubmitting}
                    className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    <span>{isSubmitting ? "Submitting..." : "Submit Application"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* DigiLocker Modal */}
      <DigiLockerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGrantConsent={handleGrantConsent}
        applicantName={currentApp.profile.fullName}
        maskedAadhaar={currentApp.profile.aadhaarNumberMasked}
      />

      {/* Verified Certificate Modal */}
      <CertificateModal
        isOpen={!!selectedDocForModal}
        document={selectedDocForModal}
        onClose={() => setSelectedDocForModal(null)}
      />

      {/* Official ARN Slip Modal */}
      <ApplicationSlipModal
        isOpen={isArnModalOpen}
        application={currentApp}
        onClose={() => setIsArnModalOpen(false)}
      />
    </div>
  );
};
