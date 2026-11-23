"use client";

import React from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ShieldCheck,
  Check,
  Truck,
  Printer,
  Compass,
} from "lucide-react";
import { ApplicationStatus, PassportApplication } from "@/types";

interface TrackingTimelineProps {
  application: PassportApplication;
}

interface StageStep {
  status: ApplicationStatus;
  label: string;
  subtext: string;
  isSimulated?: boolean;
}

const STAGES: StageStep[] = [
  { status: "DRAFT", label: "Profile Created", subtext: "Applicant demographics filled" },
  { status: "DOCUMENTS_PENDING", label: "Checklist Pending", subtext: "Awaiting DigiLocker integration" },
  { status: "CONSENT_GRANTED", label: "Consent Authorized", subtext: "DigiLocker OAuth consent active" },
  { status: "DOCUMENTS_FETCHED", label: "Documents Verified", subtext: "Cryptographic signatures validated" },
  { status: "SUBMITTED", label: "Application Submitted", subtext: "Transferred to operator review queue" },
  { status: "UNDER_OPERATOR_REVIEW", label: "Operator Review", subtext: "Cross-checking applicant profile & proofs" },
  { status: "APPROVED", label: "Approved by Operator", subtext: "Ready for passport processing" },
  { status: "POLICE_VERIFICATION_SIMULATED", label: "Police Verification", subtext: "Jurisdiction police check", isSimulated: true },
  { status: "PASSPORT_PRINTED_SIMULATED", label: "Passport Printing", subtext: "Booklet personalization at RPO", isSimulated: true },
  { status: "DISPATCHED_SIMULATED", label: "Dispatched", subtext: "India Post SpeedPost consignment tracking", isSimulated: true },
];

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ application }) => {
  const currentStatus = application.status;

  // Calculate current stage index
  const stageStatusOrder: ApplicationStatus[] = [
    "DRAFT",
    "DOCUMENTS_PENDING",
    "CONSENT_GRANTED",
    "DOCUMENTS_FETCHED",
    "SUBMITTED",
    "UNDER_OPERATOR_REVIEW",
    "APPROVED",
    "POLICE_VERIFICATION_SIMULATED",
    "PASSPORT_PRINTED_SIMULATED",
    "DISPATCHED_SIMULATED",
  ];

  const isRejected = currentStatus === "REJECTED";
  const isAdditionalInfo = currentStatus === "ADDITIONAL_INFO_REQUESTED";

  const currentIndex = stageStatusOrder.indexOf(
    isRejected || isAdditionalInfo ? "UNDER_OPERATOR_REVIEW" : currentStatus
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">Application Lifecycle & Tracking</h3>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {application.id}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Passport Office: <strong className="text-slate-700">{application.rpoLocation}</strong> • Service:{" "}
            <strong className="text-slate-700">{application.serviceType.replace("_", " ")}</strong>
          </p>
        </div>

        {/* Status Pill */}
        <div>
          {isRejected && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Application Rejected by Operator
            </span>
          )}
          {isAdditionalInfo && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Additional Information Requested
            </span>
          )}
          {!isRejected && !isAdditionalInfo && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Current Status: {currentStatus.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </div>

      {/* Dispatched India Post Banner if applicable */}
      {application.trackingNumber && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-green-900 font-bold flex items-center gap-1.5">
                <span>Passport Dispatched via India Post SpeedPost</span>
                <span className="text-[10px] bg-green-200 text-green-800 px-1.5 py-0.2 rounded font-normal">
                  SIMULATED
                </span>
              </div>
              <div className="font-mono text-sm font-extrabold text-green-950 mt-0.5">
                Consignment No: {application.trackingNumber}
              </div>
            </div>
          </div>
          <span className="text-xs text-green-700 font-medium hidden sm:inline">Delivered within 3 business days</span>
        </div>
      )}

      {/* Stepper Timeline */}
      <div className="relative">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex && !isRejected && !isAdditionalInfo;
            const isPending = idx > currentIndex;

            return (
              <div
                key={stage.status}
                className={`p-3 rounded-lg border transition-all text-xs flex flex-col justify-between ${
                  isCurrent
                    ? "border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-400"
                    : isCompleted
                    ? "border-green-200 bg-green-50/30 text-slate-800"
                    : "border-slate-200 bg-slate-50/50 text-slate-400 opacity-75"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] font-bold text-slate-500">#{idx + 1}</span>
                  {isCompleted && (
                    <span className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                  {isCurrent && (
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center animate-pulse">
                      <Clock className="w-3 h-3" />
                    </span>
                  )}
                  {isPending && (
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px]">
                      •
                    </span>
                  )}
                </div>

                <div>
                  <div className={`font-bold ${isCurrent ? "text-blue-900" : isCompleted ? "text-slate-900" : "text-slate-500"}`}>
                    {stage.label}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{stage.subtext}</div>
                </div>

                {stage.isSimulated && (
                  <div className="mt-2 text-[9px] font-semibold text-amber-700 uppercase tracking-wider">
                    Simulated RPO Stage
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
