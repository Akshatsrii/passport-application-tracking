"use client";

import React, { useState } from "react";
import { Shield, CheckCircle2, Lock, X, AlertCircle, FileCheck, KeyRound } from "lucide-react";
import { DocumentType } from "@/types";

interface DigiLockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGrantConsent: (personaKey: string, scopes: DocumentType[]) => Promise<void>;
  applicantName: string;
  maskedAadhaar: string;
}

export const DigiLockerModal: React.FC<DigiLockerModalProps> = ({
  isOpen,
  onClose,
  onGrantConsent,
  applicantName,
  maskedAadhaar,
}) => {
  const [step, setStep] = useState<"scopes" | "otp" | "loading">("scopes");
  const [selectedPersona, setSelectedPersona] = useState<string>("rahul-sharma");
  const [scopes, setScopes] = useState<DocumentType[]>([
    "AADHAAR",
    "CLASS_X_CERTIFICATE",
    "PAN_CARD",
    "ELECTRICITY_BILL",
  ]);
  const [hasAgreed, setHasAgreed] = useState<boolean>(true);
  const [otp, setOtp] = useState<string>("123456");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleScope = (scope: DocumentType) => {
    if (scope === "AADHAAR") return; // mandatory
    if (scopes.includes(scope)) {
      setScopes(scopes.filter((s) => s !== scope));
    } else {
      setScopes([...scopes, scope]);
    }
  };

  const handleAuthorize = async () => {
    if (!hasAgreed) {
      setError("You must agree to the statutory consent terms to proceed.");
      return;
    }
    setError(null);
    setStep("loading");
    try {
      await onGrantConsent(selectedPersona, scopes);
      onClose();
    } catch (err: any) {
      setError(err.message || "Consent authorization failed");
      setStep("scopes");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* DigiLocker Header Simulation */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-white text-blue-700 flex items-center justify-center font-bold text-sm shadow">
              DL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight">DigiLocker Consent Gateway</h3>
                <span className="bg-blue-900/60 text-blue-100 text-[10px] px-2 py-0.5 rounded border border-blue-400/30">
                  SANDBOX MOCK
                </span>
              </div>
              <p className="text-xs text-blue-200">Ministry of Electronics & IT (MeitY) • Digital India</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {step === "scopes" && (
            <>
              {/* Requesting Party Notice */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-700 font-semibold">
                  <span>Requesting Organization:</span>
                  <span className="text-blue-700">Passport Assistance Seva Portal</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Purpose:</span>
                  <span>Passport Application KYC & Date of Birth Verification</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Applicant Aadhaar:</span>
                  <span className="font-mono text-slate-700 font-semibold">{maskedAadhaar}</span>
                </div>
              </div>

              {/* Persona Selection for Demo Testing */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Simulated Citizen Profile for Testing:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPersona("rahul-sharma")}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      selectedPersona === "rahul-sharma"
                        ? "border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-500"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <span>Rahul Sharma</span>
                      <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded">100% Match</span>
                    </div>
                    <div className="text-[11px] text-slate-500">All documents match application details</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPersona("priya-patel")}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      selectedPersona === "priya-patel"
                        ? "border-amber-600 bg-amber-50/70 text-amber-900 ring-1 ring-amber-500"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <span>Priya Patel</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded">Name Mismatch</span>
                    </div>
                    <div className="text-[11px] text-slate-500">Class X middle initial discrepancy</div>
                  </button>
                </div>
              </div>

              {/* Requested Documents Scopes */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Select Documents to Share from Digital Locker:
                </label>
                <div className="space-y-2">
                  <div
                    onClick={() => toggleScope("AADHAAR")}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-semibold text-slate-800">Aadhaar Verification Record</div>
                        <div className="text-[11px] text-slate-500">Issued by UIDAI • Proof of Identity & Address</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                      MANDATORY
                    </span>
                  </div>

                  <div
                    onClick={() => toggleScope("CLASS_X_CERTIFICATE")}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                      scopes.includes("CLASS_X_CERTIFICATE")
                        ? "border-blue-300 bg-blue-50/50"
                        : "border-slate-200 hover:bg-slate-50 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-semibold text-slate-800">Class X Passing Certificate</div>
                        <div className="text-[11px] text-slate-500">Issued by CBSE / State Board • Proof of Date of Birth</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={scopes.includes("CLASS_X_CERTIFICATE")}
                      readOnly
                      className="rounded text-blue-600 w-4 h-4"
                    />
                  </div>

                  <div
                    onClick={() => toggleScope("PAN_CARD")}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                      scopes.includes("PAN_CARD")
                        ? "border-blue-300 bg-blue-50/50"
                        : "border-slate-200 hover:bg-slate-50 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-semibold text-slate-800">PAN Verification Record</div>
                        <div className="text-[11px] text-slate-500">Issued by Income Tax Department • Identity Proof</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={scopes.includes("PAN_CARD")}
                      readOnly
                      className="rounded text-blue-600 w-4 h-4"
                    />
                  </div>

                  <div
                    onClick={() => toggleScope("ELECTRICITY_BILL")}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                      scopes.includes("ELECTRICITY_BILL")
                        ? "border-blue-300 bg-blue-50/50"
                        : "border-slate-200 hover:bg-slate-50 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-semibold text-slate-800">Electricity Utility Bill</div>
                        <div className="text-[11px] text-slate-500">Issued by Power Discom • Present Address Proof</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={scopes.includes("ELECTRICITY_BILL")}
                      readOnly
                      className="rounded text-blue-600 w-4 h-4"
                    />
                  </div>
                </div>
              </div>

              {/* Statutory Consent Box */}
              <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200/80 text-xs text-amber-900 space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAgreed}
                    onChange={(e) => setHasAgreed(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="leading-relaxed">
                    I hereby provide voluntary explicit consent under the Information Technology (Digital Locker Facilities) Rules to fetch my digitally signed documents. I understand that consent may be revoked at any time.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel / Deny
                </button>
                <button
                  type="button"
                  onClick={() => setStep("otp")}
                  disabled={!hasAgreed}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Proceed to Verification
                </button>
              </div>
            </>
          )}

          {step === "otp" && (
            <div className="space-y-4 py-2">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Simulated Aadhaar OTP Verification</h4>
                <p className="text-xs text-slate-500">
                  A simulated one-time password has been generated for Aadhaar {maskedAadhaar}.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                <div className="text-xs text-slate-500 mb-1">Simulated OTP (Auto-filled for demonstration):</div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-40 text-center tracking-widest font-mono text-lg font-bold py-1 px-3 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep("scopes")}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleAuthorize}
                  className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Authorize & Fetch Documents
                </button>
              </div>
            </div>
          )}

          {step === "loading" && (
            <div className="py-8 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <h4 className="font-bold text-slate-900 text-sm">Communicating with DigiLocker Gateway...</h4>
              <p className="text-xs text-slate-500">
                Generating signed consent artifact, exchanging OAuth 2.0 token, and verifying document digital signatures.
              </p>
            </div>
          )}
        </div>

        {/* Footer Security Badge */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-2.5 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            256-bit SSL • Tamper-evident Audit Chaining
          </span>
          <span>UIDAI & IT Act 2000 Compliant Mock</span>
        </div>
      </div>
    </div>
  );
};
