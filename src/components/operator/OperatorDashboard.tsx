"use client";

import React, { useState } from "react";
import {
  PassportApplication,
  ApplicationDocument,
  OperatorReviewRecord,
} from "@/types";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  User,
  ArrowRight,
  Send,
  Truck,
  Printer,
  Compass,
  AlertTriangle,
  Eye,
  Check,
} from "lucide-react";

interface OperatorDashboardProps {
  applications: PassportApplication[];
  onRefresh: () => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  applications,
  onRefresh,
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(
    applications.find((a) => a.status === "SUBMITTED" || a.status === "UNDER_OPERATOR_REVIEW")?.id ||
      applications[0]?.id ||
      ""
  );
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [remarks, setRemarks] = useState<string>("");
  const [checkedDocs, setCheckedDocs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const activeApp = applications.find((a) => a.id === selectedAppId) || applications[0];

  const filteredApps = applications.filter((app) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "FLAGGED") return app.flags.hasNameMismatch || app.flags.requiresManualVerification;
    return app.status === statusFilter;
  });

  const handleDecision = async (decision: "APPROVED" | "REJECTED" | "ADDITIONAL_INFO_REQUESTED") => {
    if (!remarks || remarks.trim().length < 5) {
      alert("Please provide specific operator remarks (minimum 5 characters).");
      return;
    }
    setIsProcessing(true);
    setActionFeedback(null);
    try {
      const res = await fetch("/api/operator/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: activeApp.id,
          operatorId: "op_vikram_402",
          operatorName: "Vikram Joshi (Senior Passport Verification Officer)",
          decision,
          remarks,
          checkedDocumentIds: checkedDocs,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setActionFeedback({
        type: "success",
        text: `Application ${activeApp.id} status updated to '${decision}' with audit log.`,
      });
      setRemarks("");
      onRefresh();
    } catch (err: any) {
      setActionFeedback({ type: "error", text: err.message || "Failed to submit decision" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateStage = async (toStatus: string, actionName: string) => {
    setIsProcessing(true);
    setActionFeedback(null);
    try {
      const res = await fetch(`/api/applications/${activeApp.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toStatus,
          actorRole: "OPERATOR",
          actorId: "op_vikram_402",
          actorName: "Vikram Joshi",
          notes: `Simulated workflow test step: ${actionName}`,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setActionFeedback({
        type: "success",
        text: `Application advanced to simulated stage '${toStatus.replace(/_/g, " ")}'.`,
      });
      onRefresh();
    } catch (err: any) {
      setActionFeedback({ type: "error", text: err.message || "Simulation failed" });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleDocChecked = (docId: string) => {
    if (checkedDocs.includes(docId)) {
      setCheckedDocs(checkedDocs.filter((id) => id !== docId));
    } else {
      setCheckedDocs([...checkedDocs, docId]);
    }
  };

  if (!activeApp) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-sm text-slate-500">No applications available in operator queue.</p>
      </div>
    );
  }

  const aadhaarDoc = activeApp.documents.find((d) => d.documentType === "AADHAAR");
  const classXDoc = activeApp.documents.find((d) => d.documentType === "CLASS_X_CERTIFICATE");

  return (
    <div className="space-y-6">
      {/* Operator Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide">
              Operator Verification Console
            </span>
            <h2 className="text-sm font-bold text-slate-900">
              Officer: Vikram Joshi (ID: OP-402) • Desk: Regional Passport Review
            </h2>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-500 mr-1">Filter Queue:</span>
          {["ALL", "SUBMITTED", "UNDER_OPERATOR_REVIEW", "FLAGGED", "APPROVED"].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                statusFilter === f
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {actionFeedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 font-medium ${
            actionFeedback.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {actionFeedback.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{actionFeedback.text}</span>
        </div>
      )}

      {/* Main Review Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 1 Col: Application Queue List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Application Queue ({filteredApps.length})
            </h3>
          </div>

          <div className="space-y-2">
            {filteredApps.map((app) => {
              const isSelected = app.id === activeApp.id;
              const hasFlag = app.flags.hasNameMismatch || app.flags.requiresManualVerification;

              return (
                <div
                  key={app.id}
                  onClick={() => {
                    setSelectedAppId(app.id);
                    setCheckedDocs([]);
                  }}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-400"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{app.profile.fullName}</span>
                    {hasFlag && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                        FLAGGED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px] mt-1">
                    <span className="font-mono">{app.id}</span>
                    <span
                      className={`font-semibold ${
                        app.status === "APPROVED"
                          ? "text-green-600"
                          : app.status === "SUBMITTED"
                          ? "text-blue-600 font-bold"
                          : "text-slate-600"
                      }`}
                    >
                      {app.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 3 Cols: Side-by-Side Demographic Verification & Actions */}
        <div className="lg:col-span-3 space-y-5">
          {/* Active Application Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{activeApp.profile.fullName}</h3>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {activeApp.id}
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-800">
                  {activeApp.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Office: {activeApp.rpoLocation} • Type: {activeApp.serviceType.replace("_", " ")} ({activeApp.bookletType.replace("_", " ")})
              </p>
            </div>

            {/* Quick transition back to Applicant View link */}
            <div className="text-xs text-slate-400">
              Submitted: {activeApp.submittedAt ? new Date(activeApp.submittedAt).toLocaleString() : "Not submitted yet"}
            </div>
          </div>

          {/* Side-by-Side Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column A: Applicant Self-Reported Profile */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold text-xs text-slate-700 uppercase flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Self-Reported Application Data
                </h4>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">User Entry</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Full Name</span>
                  <span className="font-bold text-slate-800">{activeApp.profile.fullName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                    <span className="font-semibold text-slate-800">{activeApp.profile.dateOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Gender</span>
                    <span className="font-semibold text-slate-800">{activeApp.profile.gender}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Aadhaar Reference</span>
                  <span className="font-mono text-slate-800 font-semibold">{activeApp.profile.aadhaarNumberMasked}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Self-Reported Address</span>
                  <span className="text-slate-700 leading-snug block">
                    {activeApp.profile.permanentAddress.street}, {activeApp.profile.permanentAddress.city},{" "}
                    {activeApp.profile.permanentAddress.state} - {activeApp.profile.permanentAddress.pincode}
                  </span>
                </div>
              </div>
            </div>

            {/* Column B: DigiLocker Verified Issuer Data */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold text-xs text-green-700 uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  DigiLocker Verified Records (Issuer Proof)
                </h4>
                <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded">
                  UIDAI & CBSE
                </span>
              </div>

              {activeApp.documents.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No verified documents fetched from DigiLocker yet.
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  {aadhaarDoc && (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-800 flex items-center justify-between">
                        <span>Aadhaar Record (UIDAI)</span>
                        <span className="text-[10px] text-green-700 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Signed
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Name: <strong className="text-slate-800">{aadhaarDoc.metadata?.nameInDoc}</strong> • DOB:{" "}
                        <strong className="text-slate-800">{aadhaarDoc.metadata?.dobInDoc}</strong>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        Address: {aadhaarDoc.metadata?.addressInDoc}
                      </div>
                    </div>
                  )}

                  {classXDoc && (
                    <div
                      className={`p-2.5 rounded-lg border space-y-1 ${
                        activeApp.flags.hasNameMismatch
                          ? "bg-amber-50/70 border-amber-300"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="font-bold text-slate-800 flex items-center justify-between">
                        <span>Class X Passing Certificate</span>
                        {activeApp.flags.hasNameMismatch ? (
                          <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Discrepancy
                          </span>
                        ) : (
                          <span className="text-[10px] text-green-700 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Validated
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Name on Record: <strong className="text-slate-900">{classXDoc.metadata?.nameInDoc}</strong>
                      </div>
                      {activeApp.flags.hasNameMismatch && (
                        <p className="text-[11px] text-amber-900 font-medium leading-tight">
                          Note: Middle initial expanded on educational certificate. Reviewer discretion applies under MEA circular on customary name variations.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Operator Action Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Operator Audit Decision & Action Panel
            </h4>

            {/* Checklist verification checkboxes */}
            {activeApp.documents.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-700">Audit Checklist Items Checked:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeApp.documents.map((doc) => (
                    <label
                      key={doc.id}
                      className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 text-xs cursor-pointer hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={checkedDocs.includes(doc.id)}
                        onChange={() => toggleDocChecked(doc.id)}
                        className="rounded text-blue-600"
                      />
                      <span className="font-medium text-slate-800">{doc.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Remarks Input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Official Operator Audit Remarks (Mandatory for State Transition):
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="E.g., All demographic records cross-verified against UIDAI digital signature. Name expansion in Class X certificate verified with father's name. Approved."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Decision Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleDecision("APPROVED")}
                disabled={isProcessing || !remarks.trim()}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                Approve Application
              </button>

              <button
                type="button"
                onClick={() => handleDecision("ADDITIONAL_INFO_REQUESTED")}
                disabled={isProcessing || !remarks.trim()}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <AlertCircle className="w-4 h-4" />
                Request Additional Proof
              </button>

              <button
                type="button"
                onClick={() => handleDecision("REJECTED")}
                disabled={isProcessing || !remarks.trim()}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                Reject Application
              </button>
            </div>

            {/* Downstream Fulfillment Simulation Controls */}
            {activeApp.status === "APPROVED" && (
              <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">
                    Downstream Fulfillment Simulation (RPO & Police Verification Stages)
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                    EVALUATION TESTING
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Advance the state machine through the simulated stages to test the timeline experience.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSimulateStage("POLICE_VERIFICATION_SIMULATED", "Police check initiated")}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    1. Simulate Police Verification
                  </button>
                </div>
              </div>
            )}

            {activeApp.status === "POLICE_VERIFICATION_SIMULATED" && (
              <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-xl space-y-2">
                <span className="font-bold text-xs text-slate-800">Advance to Printing Stage</span>
                <button
                  type="button"
                  onClick={() => handleSimulateStage("PASSPORT_PRINTED_SIMULATED", "Printing completed at RPO")}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  2. Simulate Passport Booklet Printed
                </button>
              </div>
            )}

            {activeApp.status === "PASSPORT_PRINTED_SIMULATED" && (
              <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-xl space-y-2">
                <span className="font-bold text-xs text-slate-800">Advance to India Post Dispatch Stage</span>
                <button
                  type="button"
                  onClick={() => handleSimulateStage("DISPATCHED_SIMULATED", "SpeedPost consignment handed to India Post")}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  3. Simulate Dispatched via SpeedPost
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
