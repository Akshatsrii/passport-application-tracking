"use client";

import React from "react";
import { PassportApplication } from "@/types";
import { X, Printer, Check, QrCode } from "lucide-react";

interface ApplicationSlipModalProps {
  application: PassportApplication;
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicationSlipModal: React.FC<ApplicationSlipModalProps> = ({
  application,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-xs text-slate-900">
              Application Reference Slip (ARN Receipt)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Slip Content */}
        <div className="p-6 space-y-4 text-xs" id="printable-arn-receipt">
          {/* Slip Header */}
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
            <div>
              <div className="font-bold text-sm tracking-tight text-slate-900">
                PASSPORT APPLICATION ASSISTANCE RECEIPT
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Regional Passport Office: {application.rpoLocation}
              </div>
            </div>

            {/* Simulated QR Code Stamp */}
            <div className="w-14 h-14 border border-slate-300 rounded p-1 bg-white flex flex-col items-center justify-center text-slate-700">
              <QrCode className="w-9 h-9" />
              <span className="text-[7px] font-mono mt-0.5">VERIFIED</span>
            </div>
          </div>

          {/* Reference Numbers */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                Application Reference No (ARN)
              </span>
              <span className="font-mono font-bold text-sm text-slate-900">
                {application.id}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                Submission Date
              </span>
              <span className="font-medium text-slate-800">
                {application.submittedAt
                  ? new Date(application.submittedAt).toLocaleDateString()
                  : new Date(application.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Applicant Summary */}
          <dl className="grid grid-cols-2 gap-2.5 text-[11px] py-1 border-b border-slate-100 pb-3">
            <div>
              <dt className="text-slate-400">Applicant Name</dt>
              <dd className="font-semibold text-slate-800">{application.profile.fullName}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Date of Birth</dt>
              <dd className="font-medium text-slate-800">{application.profile.dateOfBirth}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Service Category</dt>
              <dd className="font-medium text-slate-800">{application.serviceType.replace("_", " ")}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Booklet Type</dt>
              <dd className="font-medium text-slate-800">{application.bookletType.replace("_", " ")}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-slate-400">Registered Residential Address</dt>
              <dd className="text-slate-700 leading-snug">
                {application.profile.permanentAddress.street}, {application.profile.permanentAddress.city},{" "}
                {application.profile.permanentAddress.state} - {application.profile.permanentAddress.pincode}
              </dd>
            </div>
          </dl>

          {/* Verified Documents Attached */}
          <div className="space-y-1.5">
            <span className="font-semibold text-slate-800 text-[11px]">
              Attached DigiLocker Verified Documents:
            </span>
            <div className="space-y-1">
              {application.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-[11px]"
                >
                  <span className="font-medium text-slate-800">{doc.title}</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Digital Sign Valid
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center pt-2">
            This acknowledgment slip confirms electronic lodgment of application data. Keep your ARN for tracking.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
