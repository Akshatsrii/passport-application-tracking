"use client";

import React, { useState } from "react";
import { Shield, Check, X, AlertCircle, FileText, Lock } from "lucide-react";
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
    if (scope === "AADHAAR") return; // Aadhaar is mandatory
    if (scopes.includes(scope)) {
      setScopes(scopes.filter((s) => s !== scope));
    } else {
      setScopes([...scopes, scope]);
    }
  };

  const handleAuthorize = async () => {
    if (!hasAgreed) {
      setError("Please accept the consent terms to proceed.");
      return;
    }
    setError(null);
    setStep("loading");
    try {
      await onGrantConsent(selectedPersona, scopes);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to authorize DigiLocker");
      setStep("scopes");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Clean DigiLocker Modal Header */}
        <div className="bg-[#0b47a8] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white text-[#0b47a8] flex items-center justify-center font-bold text-xs tracking-tighter">
              DL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">DigiLocker</span>
                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded font-medium">
                  OAuth 2.0
                </span>
              </div>
              <p className="text-[11px] text-blue-100">National e-Governance Division (MeitY)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === "scopes" && (
            <>
              {/* Context Summary */}
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/70 text-xs space-y-1">
                <div className="text-slate-600">
                  <span className="font-medium text-slate-900">Passport Seva Assist</span> is requesting access to your verified documents to substantiate identity and date of birth.
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Registered Aadhaar: <span className="font-mono font-semibold text-slate-700">{maskedAadhaar}</span>
                </div>
              </div>

              {/* Persona Selector for Sandbox Testing */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Sandbox Citizen Account:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPersona("rahul-sharma")}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                      selectedPersona === "rahul-sharma"
                        ? "border-blue-600 bg-blue-50/40 text-blue-900"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="font-semibold">Rahul Sharma</div>
                    <div className="text-[11px] text-slate-500">Exact match scenario</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPersona("priya-patel")}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                      selectedPersona === "priya-patel"
                        ? "border-blue-600 bg-blue-50/40 text-blue-900"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="font-semibold">Priya Patel</div>
                    <div className="text-[11px] text-slate-500">Name discrepancy scenario</div>
                  </button>
                </div>
              </div>

              {/* Document Scopes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Documents to be shared:
                </label>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-600" />
                      <div>
                        <div className="font-medium text-slate-800">e-Aadhaar Verification Record</div>
                        <div className="text-[11px] text-slate-500">Unique Identification Authority of India (UIDAI)</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500">Required</span>
                  </div>

                  <div
                    onClick={() => toggleScope("CLASS_X_CERTIFICATE")}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      scopes.includes("CLASS_X_CERTIFICATE")
                        ? "border-slate-300 bg-white"
                        : "border-slate-200 opacity-60 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-600" />
                      <div>
                        <div className="font-medium text-slate-800">Grade 10 Matriculation Certificate</div>
                        <div className="text-[11px] text-slate-500">CBSE / State Secondary Board (DOB Proof)</div>
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
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      scopes.includes("PAN_CARD")
                        ? "border-slate-300 bg-white"
                        : "border-slate-200 opacity-60 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-600" />
                      <div>
                        <div className="font-medium text-slate-800">PAN Verification Record</div>
                        <div className="text-[11px] text-slate-500">Income Tax Department</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={scopes.includes("PAN_CARD")}
                      readOnly
                      className="rounded text-blue-600 w-4 h-4"
                    />
                  </div>
                </div>
              </div>

              {/* Consent Terms */}
              <label className="flex items-start gap-2 pt-1 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600"
                />
                <span className="leading-relaxed">
                  I consent to sharing my digitally signed records from DigiLocker for passport assistance KYC. I understand I can revoke this consent anytime.
                </span>
              </label>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep("otp")}
                  disabled={!hasAgreed}
                  className="px-4 py-2 text-xs font-semibold bg-[#0b47a8] hover:bg-blue-800 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Authenticate & Continue
                </button>
              </div>
            </>
          )}

          {step === "otp" && (
            <div className="space-y-4 py-2">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 bg-blue-50 text-[#0b47a8] rounded-full flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-slate-900 text-sm">Security Verification</h4>
                <p className="text-xs text-slate-500">
                  Enter the 6-digit OTP sent to your Aadhaar-linked mobile number ({maskedAadhaar}).
                </p>
              </div>

              <div className="max-w-xs mx-auto">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center tracking-[0.5em] font-mono text-xl font-bold py-2 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-[11px] text-slate-400 text-center mt-1.5">
                  Sandbox demo OTP: 123456
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep("scopes")}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleAuthorize}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  Verify & Pull Documents
                </button>
              </div>
            </div>
          )}

          {step === "loading" && (
            <div className="py-8 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-600 font-medium">Fetching verified issuer records from DigiLocker...</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>DigiLocker IT Act 2000 Integration</span>
          <span>Encrypted Gateway</span>
        </div>
      </div>
    </div>
  );
};
