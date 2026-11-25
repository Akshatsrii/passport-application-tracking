"use client";

import React, { useState, useEffect } from "react";
import { AuditLog } from "@/types";
import {
  Check,
  RefreshCw,
  Search,
  ShieldCheck,
  AlertCircle,
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
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">System Audit Log</h2>
          <p className="text-xs text-slate-500">
            Append-only event ledger with SHA-256 tamper-evident hash chaining.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Filter by App ID..."
            value={filterAppId}
            onChange={(e) => setFilterAppId(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 w-44"
          />
          <button
            onClick={fetchLogs}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue-600" : "text-slate-400"}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Integrity Pill Banner */}
      {integrity && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-xs">
          <div className="flex items-center gap-2">
            {integrity.isChainIntact ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
            )}
            <span className="font-medium text-slate-900">
              {integrity.isChainIntact ? "Cryptographic Chain Verified" : "Chain Integrity Issue"}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">{integrity.verifiedRecordsCount} records validated via SHA-256 hash chaining</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">
            HMAC / SHA-256
          </span>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-medium text-[11px]">
                <th className="py-2.5 px-3.5">Timestamp</th>
                <th className="py-2.5 px-3.5">Application</th>
                <th className="py-2.5 px-3.5">Actor</th>
                <th className="py-2.5 px-3.5">Action</th>
                <th className="py-2.5 px-3.5">Status Transition</th>
                <th className="py-2.5 px-3.5">Remarks / Metadata</th>
                <th className="py-2.5 px-3.5 font-mono">Hash Checksum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => {
                return (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap font-mono text-slate-700">
                      {log.applicationId || "SYSTEM"}
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-700">
                      <span className="font-medium">{log.actorName}</span>{" "}
                      <span className="text-[10px] text-slate-400">({log.actorRole.toLowerCase()})</span>
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap font-medium text-slate-900">
                      {log.action.replace(/STATUS_TRANSITION_/g, "TRANSITION: ")}
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      {log.previousStatus && log.newStatus ? (
                        <span className="text-[11px] text-slate-500">
                          {log.previousStatus} &rarr; <span className="text-slate-900 font-medium">{log.newStatus}</span>
                        </span>
                      ) : log.newStatus ? (
                        <span className="text-[11px] text-slate-900 font-medium">{log.newStatus}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 max-w-xs text-slate-500 text-[11px] truncate">
                      {log.details.notes || JSON.stringify(log.details)}
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap font-mono text-[10px] text-slate-400">
                      {log.checksum.slice(0, 12)}...
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
