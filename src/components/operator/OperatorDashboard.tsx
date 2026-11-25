"use client";

import React, { useState } from "react";
import {
  PassportApplication,
} from "@/types";
import {
  Check,
  AlertCircle,
  Truck,
  Printer,
  Compass,
  CheckCircle2,
  FileCheck,
  Search,
  Filter,
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
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const activeApp = applications.find((a) => a.id === selectedAppId) || applications[0];

  const filteredApps = applications.filter((app) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "FLAGGED") return app.flags.hasNameMismatch || app.flags.requiresManualVerification;
    return app.status === statusFilter;
  });

  const handleDecision = async (decision: "APPROVED" | "REJECTED" | "ADDITIONAL_INFO_REQUESTED") => {
    if (!remarks || remarks.trim().length < 5) {
      alert("Please enter audit remarks (at least 5 characters).");
      return;
    }
    setIsProcessing(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/operator/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: activeApp.id,
          operatorId: "op_402",
          operatorName: "Vikram Joshi",
          decision,
          remarks,
          checkedDocumentIds: checkedDocs,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setFeedback({
        type: "success",
        text: `Application marked as ${decision.replace(/_/g, " ")}.`,
      });
      setRemarks("");
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to submit decision" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateStage = async (toStatus: string, actionName: string) => {
    setIsProcessing(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/applications/${activeApp.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toStatus,
          actorRole: "OPERATOR",
          actorId: "op_402",
          actorName: "Vikram Joshi",
          notes: `Simulated workflow test step: ${actionName}`,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setFeedback({
        type: "success",
        text: `Application status updated to ${toStatus.replace(/_/g, " ")}.`,
      });
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Simulation failed" });
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
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-xs text-slate-500">No applications in queue.</p>
      </div>
    );
  }

  const aadhaarDoc = activeApp.documents.find((d) => d.documentType === "AADHAAR");
  const classXDoc = activeApp.documents.find((d) => d.documentType === "CLASS_X_CERTIFICATE");

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Verification & Audit Queue</h2>
          <p className="text-xs text-slate-500">
            Reviewing Officer: Vikram Joshi • Regional Passport Desk
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["ALL", "SUBMITTED", "UNDER_OPERATOR_REVIEW", "FLAGGED", "APPROVED"].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                statusFilter === f
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              {f.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 border ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Main Grid: Queue on Left, Verification on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Queue column */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-700">Applications ({filteredApps.length})</span>
          </div>

          <div className="space-y-1.5">
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
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? "border-slate-900 bg-slate-50/80"
                      : "border-slate-200/80 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{app.profile.fullName}</span>
                    {hasFlag && (
                      <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        Flagged
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px] mt-1">
                    <span className="font-mono">{app.id}</span>
                    <span className="capitalize">{app.status.toLowerCase().replace(/_/g, " ")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verification and Audit Console */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Application Context Bar */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-slate-900">{activeApp.profile.fullName}</h3>
                <span className="font-mono text-xs text-slate-500">{activeApp.id}</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {activeApp.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeApp.serviceType.replace("_", " ")} • {activeApp.rpoLocation}
              </p>
            </div>

            <div className="text-xs text-slate-500">
              Submitted: {activeApp.submittedAt ? new Date(activeApp.submittedAt).toLocaleDateString() : "Pending"}
            </div>
          </div>

          {/* Clean Demographic Cross-Matching Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
              Demographic Cross-Verification
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium text-[11px]">
                    <th className="py-2.5 px-3">Field</th>
                    <th className="py-2.5 px-3">Applicant Declaration</th>
                    <th className="py-2.5 px-3">DigiLocker Verified Record</th>
                    <th className="py-2.5 px-3">Reconciliation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-slate-600">Full Name</td>
                    <td className="py-2.5 px-3 text-slate-900">{activeApp.profile.fullName}</td>
                    <td className="py-2.5 px-3 text-slate-900">
                      {aadhaarDoc ? aadhaarDoc.metadata?.nameInDoc : "—"}
                      {classXDoc && classXDoc.metadata?.nameInDoc !== aadhaarDoc?.metadata?.nameInDoc && (
                        <span className="block text-[11px] text-slate-500 mt-0.5">
                          Class X: {classXDoc.metadata?.nameInDoc}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {activeApp.flags.hasNameMismatch ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Name variation
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Check className="w-3 h-3" /> Exact match
                        </span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-medium text-slate-600">Date of Birth</td>
                    <td className="py-2.5 px-3 text-slate-900">{activeApp.profile.dateOfBirth}</td>
                    <td className="py-2.5 px-3 text-slate-900">
                      {aadhaarDoc ? aadhaarDoc.metadata?.dobInDoc : "—"}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-medium text-slate-600">Gender</td>
                    <td className="py-2.5 px-3 text-slate-900">{activeApp.profile.gender}</td>
                    <td className="py-2.5 px-3 text-slate-900">
                      {aadhaarDoc ? "Matches UIDAI" : "—"}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-medium text-slate-600">Address</td>
                    <td className="py-2.5 px-3 text-slate-900 leading-snug">
                      {activeApp.profile.permanentAddress.street}, {activeApp.profile.permanentAddress.city}
                    </td>
                    <td className="py-2.5 px-3 text-slate-900 leading-snug">
                      {aadhaarDoc?.metadata?.addressInDoc || "—"}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <Check className="w-3 h-3" /> Jurisdiction valid
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Checklist items to confirm */}
            {activeApp.documents.length > 0 && (
              <div className="pt-2 space-y-2">
                <span className="text-xs font-medium text-slate-700">Checklist Verification Confirmation:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeApp.documents.map((doc) => (
                    <label
                      key={doc.id}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 text-xs cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checkedDocs.includes(doc.id)}
                        onChange={() => toggleDocChecked(doc.id)}
                        className="rounded text-blue-600"
                      />
                      <span className="font-medium text-slate-800 truncate">{doc.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Remarks Area */}
            <div className="space-y-1 pt-2">
              <label className="block text-xs font-medium text-slate-700">
                Audit Notes & Official Remarks (Required):
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter audit finding (e.g. Identity and address proofs reconciled with UIDAI digital signature. Approved.)"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Review Decision Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDecision("APPROVED")}
                disabled={isProcessing || !remarks.trim()}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-40"
              >
                Approve Application
              </button>

              <button
                type="button"
                onClick={() => handleDecision("ADDITIONAL_INFO_REQUESTED")}
                disabled={isProcessing || !remarks.trim()}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors disabled:opacity-40"
              >
                Request Clarification
              </button>

              <button
                type="button"
                onClick={() => handleDecision("REJECTED")}
                disabled={isProcessing || !remarks.trim()}
                className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-colors disabled:opacity-40"
              >
                Reject
              </button>
            </div>

            {/* Downstream Fulfillment Simulation (Clean & Muted) */}
            {activeApp.status === "APPROVED" && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 p-3 rounded-lg">
                <span className="text-slate-600">Simulate police verification dispatch:</span>
                <button
                  type="button"
                  onClick={() => handleSimulateStage("POLICE_VERIFICATION_SIMULATED", "Police check initiated")}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-800 text-xs font-medium hover:bg-slate-100 transition-colors shadow-xs"
                >
                  Advance to Police Check
                </button>
              </div>
            )}

            {activeApp.status === "POLICE_VERIFICATION_SIMULATED" && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 p-3 rounded-lg">
                <span className="text-slate-600">Simulate passport booklet printing at RPO:</span>
                <button
                  type="button"
                  onClick={() => handleSimulateStage("PASSPORT_PRINTED_SIMULATED", "Printing completed")}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-800 text-xs font-medium hover:bg-slate-100 transition-colors shadow-xs"
                >
                  Advance to Printing
                </button>
              </div>
            )}

            {activeApp.status === "PASSPORT_PRINTED_SIMULATED" && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 p-3 rounded-lg">
                <span className="text-slate-600">Simulate India Post dispatch:</span>
                <button
                  type="button"
                  onClick={() => handleSimulateStage("DISPATCHED_SIMULATED", "Handed to India Post")}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-800 text-xs font-medium hover:bg-slate-100 transition-colors shadow-xs"
                >
                  Advance to Dispatched
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
