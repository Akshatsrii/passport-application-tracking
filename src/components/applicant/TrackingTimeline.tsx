"use client";

import React, { useState } from "react";
import {
  Check,
  Clock,
  AlertCircle,
  Truck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ApplicationStatus, PassportApplication } from "@/types";

interface TrackingTimelineProps {
  application: PassportApplication;
}

interface PrimaryStage {
  id: string;
  label: string;
  description: string;
  isComplete: (status: ApplicationStatus) => boolean;
  isCurrent: (status: ApplicationStatus) => boolean;
}

const PRIMARY_STAGES: PrimaryStage[] = [
  {
    id: "draft",
    label: "Draft Profile",
    description: "Applicant demographics entered",
    isComplete: (s) => s !== "DRAFT",
    isCurrent: (s) => s === "DRAFT",
  },
  {
    id: "documents",
    label: "DigiLocker Verified",
    description: "Identity & DOB proofs linked",
    isComplete: (s) =>
      s === "DOCUMENTS_FETCHED" ||
      s === "SUBMITTED" ||
      s === "UNDER_OPERATOR_REVIEW" ||
      s === "APPROVED" ||
      s === "POLICE_VERIFICATION_SIMULATED" ||
      s === "PASSPORT_PRINTED_SIMULATED" ||
      s === "DISPATCHED_SIMULATED",
    isCurrent: (s) => s === "DOCUMENTS_PENDING" || s === "CONSENT_GRANTED" || s === "DOCUMENTS_FETCHED",
  },
  {
    id: "submitted",
    label: "Application Lodged",
    description: "Submitted to processing queue",
    isComplete: (s) =>
      s === "UNDER_OPERATOR_REVIEW" ||
      s === "APPROVED" ||
      s === "POLICE_VERIFICATION_SIMULATED" ||
      s === "PASSPORT_PRINTED_SIMULATED" ||
      s === "DISPATCHED_SIMULATED",
    isCurrent: (s) => s === "SUBMITTED",
  },
  {
    id: "review",
    label: "Operator Review",
    description: "Document validation & decision",
    isComplete: (s) =>
      s === "APPROVED" ||
      s === "POLICE_VERIFICATION_SIMULATED" ||
      s === "PASSPORT_PRINTED_SIMULATED" ||
      s === "DISPATCHED_SIMULATED",
    isCurrent: (s) => s === "UNDER_OPERATOR_REVIEW" || s === "ADDITIONAL_INFO_REQUESTED",
  },
  {
    id: "dispatched",
    label: "Dispatch",
    description: "India Post SpeedPost tracking",
    isComplete: (s) => s === "DISPATCHED_SIMULATED",
    isCurrent: (s) =>
      s === "APPROVED" || s === "POLICE_VERIFICATION_SIMULATED" || s === "PASSPORT_PRINTED_SIMULATED",
  },
];

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ application }) => {
  const [showDetails, setShowDetails] = useState(false);
  const currentStatus = application.status;
  const isRejected = currentStatus === "REJECTED";
  const isAdditionalInfo = currentStatus === "ADDITIONAL_INFO_REQUESTED";

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Application Tracker
            </span>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {application.id}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Processing at <span className="text-slate-800 font-medium">{application.rpoLocation}</span> •{" "}
            {application.serviceType.replace("_", " ")}
          </div>
        </div>

        {/* Current status pill */}
        <div className="flex items-center gap-2">
          {isRejected ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
              <AlertCircle className="w-3.5 h-3.5" />
              Application Rejected
            </span>
          ) : isAdditionalInfo ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5" />
              Clarification Requested
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              {currentStatus.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </div>

      {/* Dispatched Notification Card */}
      {application.trackingNumber && (
        <div className="mt-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800">
                Dispatched via India Post SpeedPost
              </div>
              <div className="font-mono text-xs text-slate-600 mt-0.5">
                Consignment No: <span className="font-bold text-slate-900">{application.trackingNumber}</span>
              </div>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">Estimated delivery: 2-3 business days</span>
        </div>
      )}

      {/* Stepper Timeline - Modern minimal horizontal line */}
      <div className="mt-6 mb-2">
        <div className="relative">
          {/* Progress Track Line */}
          <div className="hidden md:block absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
            {PRIMARY_STAGES.map((stage, idx) => {
              const completed = stage.isComplete(currentStatus) && !isRejected;
              const current = stage.isCurrent(currentStatus) && !isRejected;

              return (
                <div key={stage.id} className="flex md:flex-col items-center md:items-center gap-3 md:gap-2">
                  {/* Step circle indicator */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                      completed
                        ? "bg-slate-900 text-white"
                        : current
                        ? "bg-blue-600 text-white ring-4 ring-blue-50"
                        : "bg-white border-2 border-slate-300 text-slate-400"
                    }`}
                  >
                    {completed ? (
                      <Check className="w-4 h-4" />
                    ) : current ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>

                  {/* Step labels */}
                  <div className="md:text-center">
                    <div
                      className={`text-xs font-semibold ${
                        current ? "text-blue-600" : completed ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {stage.label}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">
                      {stage.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Collapsible State Machine History Toggle */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
        >
          <span>{showDetails ? "Hide technical lifecycle details" : "View technical state transitions"}</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showDetails && (
        <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 border border-slate-200">
          <div className="font-semibold text-slate-700 text-[11px]">Lifecycle State Machine Details:</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
            <div>
              Current State: <strong className="text-slate-800">{currentStatus}</strong>
            </div>
            <div>
              Booklet: <strong className="text-slate-800">{application.bookletType.replace("_", " ")}</strong>
            </div>
            <div>
              Created: <strong className="text-slate-800">{new Date(application.createdAt).toLocaleDateString()}</strong>
            </div>
            <div>
              Updated: <strong className="text-slate-800">{new Date(application.updatedAt).toLocaleTimeString()}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
