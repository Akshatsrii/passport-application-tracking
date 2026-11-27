"use client";

import React, { useState } from "react";
import { ApplicationDocument } from "@/types";
import {
  X,
  ShieldCheck,
  FileText,
  Code,
  CheckCircle2,
  Printer,
  Copy,
  Check,
} from "lucide-react";

interface CertificateModalProps {
  document: ApplicationDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"certificate" | "xml">("certificate");
  const [copied, setCopied] = useState(false);

  if (!isOpen || !document) return null;

  const rawXml =
    document.documentType === "AADHAAR"
      ? `<?xml version="1.0" encoding="UTF-8"?>
<KycRes xmlns="http://www.uidai.gov.in/kyc/uid-kyc-response/1.0" code="00" ret="Y" ts="${document.verifiedAt || new Date().toISOString()}">
  <Rar>${document.checksumSha256.slice(0, 32)}</Rar>
  <UidData>
    <Poi name="${document.metadata?.nameInDoc || ""}" dob="${document.metadata?.dobInDoc || ""}" gender="M"/>
    <Poa street="${document.metadata?.addressInDoc || ""}" co="S/O Mahesh Sharma"/>
  </UidData>
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignedInfo>
      <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
      <SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
    </SignedInfo>
    <SignatureValue>${document.checksumSha256}</SignatureValue>
    <KeyInfo>
      <X509Data>
        <X509Certificate>MIIEpAIBAAKCAQEAz...</X509Certificate>
      </X509Data>
    </KeyInfo>
  </Signature>
</KycRes>`
      : `<?xml version="1.0" encoding="UTF-8"?>
<CertificateRecord issuer="${document.issuer}" documentType="${document.documentType}" verified="true">
  <CandidateDetails>
    <Name>${document.metadata?.nameInDoc || ""}</Name>
    <DOB>${document.metadata?.dobInDoc || ""}</DOB>
    <DocumentNumber>${document.documentNumberMasked || ""}</DocumentNumber>
  </CandidateDetails>
  <CryptographicVerification>
    <Algorithm>SHA256withRSA</Algorithm>
    <Thumbprint>${document.metadata?.issuerCertThumbprint || "3344556677889900AABBCCDDEEFF1122"}</Thumbprint>
    <ChecksumSha256>${document.checksumSha256}</ChecksumSha256>
  </CryptographicVerification>
</CertificateRecord>`;

  const handleCopyXml = () => {
    navigator.clipboard.writeText(rawXml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div className="bg-white rounded-xl shadow-xl max-w-xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <div>
              <h3 className="font-semibold text-xs text-slate-900">
                Verified DigiLocker Digital Certificate
              </h3>
              <p className="text-[11px] text-slate-500">{document.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 px-4 bg-white text-xs">
          <button
            onClick={() => setActiveTab("certificate")}
            className={`py-2 px-3 font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
              activeTab === "certificate"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Certificate View
          </button>
          <button
            onClick={() => setActiveTab("xml")}
            className={`py-2 px-3 font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
              activeTab === "xml"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Signed XML Payload
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === "certificate" ? (
            <div className="space-y-4 text-xs">
              {/* Certificate Card Simulation */}
              <div className="border-2 border-slate-200 rounded-xl p-5 bg-gradient-to-b from-slate-50/50 to-white relative">
                {/* Government Watermark Effect */}
                <div className="absolute right-4 top-4 text-slate-100 font-extrabold text-5xl pointer-events-none select-none">
                  VERIFIED
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Issuing Authority
                    </div>
                    <div className="font-semibold text-slate-900 text-sm mt-0.5">
                      {document.issuer}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Digitally Signed
                  </div>
                </div>

                <dl className="grid grid-cols-2 gap-3 py-3 text-xs">
                  <div>
                    <dt className="text-slate-400 text-[11px]">Record Subject</dt>
                    <dd className="font-semibold text-slate-800 mt-0.5">
                      {document.metadata?.nameInDoc || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 text-[11px]">Date of Birth on Record</dt>
                    <dd className="font-semibold text-slate-800 mt-0.5">
                      {document.metadata?.dobInDoc || "—"}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-slate-400 text-[11px]">Address on Record</dt>
                    <dd className="text-slate-700 mt-0.5">
                      {document.metadata?.addressInDoc || "India Examination Jurisdiction"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 text-[11px]">Document URI</dt>
                    <dd className="font-mono text-[10px] text-slate-600 mt-0.5 truncate">
                      {document.uri}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 text-[11px]">Verification Timestamp</dt>
                    <dd className="text-slate-600 mt-0.5">
                      {new Date(document.verifiedAt || Date.now()).toLocaleString()}
                    </dd>
                  </div>
                </dl>

                {/* Cryptographic Proof Strip */}
                <div className="pt-3 border-t border-slate-100 bg-slate-50/80 p-2.5 rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Algorithm: <strong>SHA256withRSA</strong></span>
                    <span>Status: <strong>Public Key Validated</strong></span>
                  </div>
                  <div className="font-mono text-[9px] text-slate-400 truncate">
                    SHA256: {document.checksumSha256}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 text-center">
                Legally valid electronic record under Section 4 & 5 of the Information Technology Act, 2000.
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>OASIS / MeitY Compliant Signed XML:</span>
                <button
                  onClick={handleCopyXml}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 border border-slate-200 px-2 py-0.5 rounded transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy XML"}
                </button>
              </div>
              <pre className="p-3 bg-slate-950 text-emerald-400 rounded-lg text-[10px] font-mono overflow-x-auto leading-relaxed max-h-72">
                {rawXml}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
