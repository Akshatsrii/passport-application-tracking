"use client";

import React, { useState, useEffect } from "react";
import { AuditLog } from "@/types";
import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Lock,
  User,
  Cpu,
  Fingerprint,
} from "lucide-react";

export const AuditTrailViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [integrity, setIntegrity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterAppId, setFilterAppId] = useState<string>("");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const url = filterAppId ? `/api/audit-logs?applicationId=${filterAppId}` : "/api/audit-logs";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
        setIntegrity(json.integrity);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterAppId]);

  return (
    <div className="space-y-6">
      {/* Audit Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <h2 className="text-base font-bold text-slate-900">Tamper-Evident Cryptographic Audit Trail</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Append-only audit ledger with SHA-256 hash chaining under Section 7A & 8 of IT Act 2000.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Filter by App ID (e.g. APP-2026-88192)"
            value={filterAppId}
            onChange={(e) => setFilterAppId(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
          />
          <button
            onClick={fetchLogs}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 text-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Integrity Verification Card */}
      {integrity && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
            integrity.isChainIntact
              ? "bg-emerald-50 border-emerald-200 text-emerald-950"
              : "bg-red-50 border-red-200 text-red-950"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white ${
                integrity.isChainIntact ? "bg-emerald-600" : "bg-red-600"
              }`}
            >
              {integrity.isChainIntact ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="font-bold text-sm">
                {integrity.isChainIntact
                  ? "Audit Chain Integrity Verified (100% Cryptographic Match)"
                  : "Tamper Warning: Checksum Mismatch Detected!"}
              </div>
              <div className="text-[11px] opacity-80 mt-0.5">
                {integrity.verifiedRecordsCount} sequential records validated using {integrity.algorithm}. No altered blocks.
              </div>
            </div>
          </div>

          <span className="font-mono text-[10px] px-2 py-1 rounded bg-white/70 border border-emerald-300 font-bold hidden sm:inline">
            SHA-256 LEDGER SECURE
          </span>
        </div>
      )}

      {/* Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Status Transition</th>
                <th className="py-3 px-4">Details / Remarks</th>
                <th className="py-3 px-4">Block Checksum (SHA-256)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {logs.map((log) => {
                const isApplicant = log.actorRole === "APPLICANT";
                const isOperator = log.actorRole === "OPERATOR";
                const isSystem = log.actorRole === "SYSTEM";

                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-slate-800">
                      {log.applicationId || "SYSTEM"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isApplicant
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : isOperator
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {isApplicant && <User className="w-2.5 h-2.5" />}
                        {isOperator && <ShieldCheck className="w-2.5 h-2.5" />}
                        {isSystem && <Cpu className="w-2.5 h-2.5" />}
                        {log.actorName}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-semibold text-slate-900">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {log.previousStatus && log.newStatus ? (
                        <span className="text-[11px] text-slate-600 font-medium">
                          {log.previousStatus} &rarr; <strong className="text-blue-700">{log.newStatus}</strong>
                        </span>
                      ) : log.newStatus ? (
                        <span className="text-[11px] text-blue-700 font-bold">{log.newStatus}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs text-slate-600 text-[11px] truncate" title={JSON.stringify(log.details)}>
                      {log.details.notes || JSON.stringify(log.details)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[10px] text-slate-400">
                      <span title={`Previous: ${log.prevChecksum}\nCurrent: ${log.checksum}`}>
                        {log.checksum.slice(0, 16)}...
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
