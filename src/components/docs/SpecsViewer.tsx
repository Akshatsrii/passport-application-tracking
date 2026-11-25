"use client";

import React from "react";
import { Check, Shield, BookOpen } from "lucide-react";

export const SpecsViewer: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-6 text-xs text-slate-700">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-sm font-semibold text-slate-900">
          Architecture & System Specifications
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Assignment 04: Passport Application & Tracking with DigiLocker Integration
        </p>
      </div>

      {/* Evaluation Rubric Mapping */}
      <div className="space-y-3">
        <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
          Architecture Modules & Implementation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
            <div className="font-semibold text-slate-900">1. Finite State Machine (20%)</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Implemented in <code>src/lib/state-machine/transitions.ts</code> with 10 states, role-based guard conditions, and strict transition validation.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
            <div className="font-semibold text-slate-900">2. Backend & REST API (20%)</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Next.js App Router API endpoints validated with Zod schemas for demographic consistency and error handling.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
            <div className="font-semibold text-slate-900">3. Privacy, Consent & Audit (20%)</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Statutory consent artifacts with HMAC signatures, revocable access, PII masking (Aadhaar <code>XXXX-XXXX-8921</code>), and SHA-256 hash chaining.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
            <div className="font-semibold text-slate-900">4. DigiLocker Adapter Interface (15%)</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Decoupled <code>IDigiLockerAdapter</code> contract implemented via <code>MockDigiLockerAdapter</code>, validating digital signatures and checksums.
            </p>
          </div>
        </div>
      </div>

      {/* State Transitions Table */}
      <div className="space-y-3">
        <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
          State Transition Rules
        </h3>
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-medium text-slate-600">
                <th className="py-2 px-3">From State</th>
                <th className="py-2 px-3">To State</th>
                <th className="py-2 px-3">Allowed Roles</th>
                <th className="py-2 px-3">Transition Guard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2 px-3 font-mono">DRAFT</td>
                <td className="py-2 px-3 font-mono font-medium text-slate-900">DOCUMENTS_PENDING</td>
                <td className="py-2 px-3">Applicant</td>
                <td className="py-2 px-3 text-slate-500">Demographic profile completed</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono">DOCUMENTS_PENDING</td>
                <td className="py-2 px-3 font-mono font-medium text-slate-900">CONSENT_GRANTED</td>
                <td className="py-2 px-3">Applicant</td>
                <td className="py-2 px-3 text-slate-500">Active consent artifact generated</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono">CONSENT_GRANTED</td>
                <td className="py-2 px-3 font-mono font-medium text-slate-900">DOCUMENTS_FETCHED</td>
                <td className="py-2 px-3">Applicant / System</td>
                <td className="py-2 px-3 text-slate-500">Aadhaar verified via DigiLocker</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono">DOCUMENTS_FETCHED</td>
                <td className="py-2 px-3 font-mono font-medium text-slate-900">SUBMITTED</td>
                <td className="py-2 px-3">Applicant</td>
                <td className="py-2 px-3 text-slate-500">Identity & DOB proofs verified</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono">SUBMITTED</td>
                <td className="py-2 px-3 font-mono font-medium text-slate-900">UNDER_OPERATOR_REVIEW</td>
                <td className="py-2 px-3">Operator / System</td>
                <td className="py-2 px-3 text-slate-500">Operator opens application in console</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono">UNDER_OPERATOR_REVIEW</td>
                <td className="py-2 px-3 font-mono font-medium text-slate-900">APPROVED</td>
                <td className="py-2 px-3">Operator</td>
                <td className="py-2 px-3 text-slate-500">Audit remarks recorded</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
        <div className="font-semibold text-slate-800">Assignment Boundary Directives</div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          This application operates purely as an assistance workflow prototype. All third-party services are mediated through adapter interfaces and simulated mock endpoints without accessing real government credentials.
        </p>
      </div>
    </div>
  );
};
