"use client";

import React, { useState, useEffect } from "react";
import { AuditLog } from "@/types";
import {
  Check,
  RefreshCw,
  Search,
  ShieldCheck,
  AlertCircle,
  Download,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

export const AuditTrailViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [integrity, setIntegrity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterAppId, setFilterAppId] = useState<string>("");
  const [isTampered, setIsTampered] = useState<boolean>(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    setIsTampered(false);
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

  // Demonstration feature: Simulates tampering with a block in the immutable chain
  const handleSimulateTamper = () => {
    if (logs.length < 2) return;
    setIsTampered(true);
    // Alter block #1's checksum to simulate data tampering
    const tamperedLogs = [...logs];
    const targetIdx = Math.floor(tamperedLogs.length / 2);
    tamperedLogs[targetIdx] = {
      ...tamperedLogs[targetIdx],
      checksum: "f83a000000000000000000000000000000000000000000000000000000000000",
      details: { ...tamperedLogs[targetIdx].details, unauthorizedModification: true },
    };
    setLogs(tamperedLogs);
    setIntegrity({
      isChainIntact: false,
      verifiedRecordsCount: tamperedLogs.length,
      corruptedLogId: tamperedLogs[targetIdx].id,
      algorithm: "SHA-256 Chained Hash Sequence",
      tamperDetail: `Hash mismatch at block ID ${tamperedLogs[targetIdx].id}. Calculated chain breaks here.`,
    });
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `passport_audit_trail_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

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

        <div className="flex items-center gap-2 flex-wrap">
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
          <button
            onClick={handleExportJson}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors"
            title="Export audit log as JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Integrity Pill Banner */}
      {integrity && (
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border text-xs gap-3 ${
            integrity.isChainIntact
              ? "bg-white border-slate-200 text-slate-700 shadow-xs"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {integrity.isChainIntact ? (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            )}
            <div>
              <span className="font-semibold text-slate-900">
                {integrity.isChainIntact
                  ? "Cryptographic Chain Verified"
                  : "Tamper Warning: Hash Mismatch Detected!"}
              </span>
              <span className="text-slate-500 ml-2">
                {integrity.isChainIntact
                  ? `${integrity.verifiedRecordsCount} records validated sequentially.`
                  : integrity.tamperDetail}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {!isTampered ? (
              <button
                type="button"
                onClick={handleSimulateTamper}
                className="text-[11px] font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2 flex items-center gap-1"
                title="Test how the cryptographic engine catches unauthorized block alterations"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Simulate Tamper Attack
              </button>
            ) : (
              <button
                type="button"
                onClick={fetchLogs}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restore Ledger Integrity
              </button>
            )}
          </div>
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
                const isCorrupted = !integrity?.isChainIntact && log.id === integrity?.corruptedLogId;

                return (
                  <tr
                    key={log.id}
                    className={`transition-colors ${
                      isCorrupted ? "bg-red-50/80 font-medium" : "hover:bg-slate-50/60"
                    }`}
                  >
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
                    <td className="py-2.5 px-3.5 whitespace-nowrap font-mono text-[10px]">
                      {isCorrupted ? (
                        <span className="text-red-700 font-bold bg-red-100 px-1 rounded">
                          {log.checksum.slice(0, 12)}... (CORRUPTED)
                        </span>
                      ) : (
                        <span className="text-slate-400">{log.checksum.slice(0, 12)}...</span>
                      )}
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
