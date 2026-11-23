"use client";

import React from "react";
import { ShieldCheck, UserCheck, FileText, Bell, RefreshCw, AlertTriangle, ExternalLink } from "lucide-react";

interface NavbarProps {
  activeTab: "applicant" | "operator" | "audit" | "docs";
  setActiveTab: (tab: "applicant" | "operator" | "audit" | "docs") => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onResetDemo: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  unreadCount,
  onOpenNotifications,
  onResetDemo,
  isResetting,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Mandatory Assignment Boundary Disclaimer Banner */}
      <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
          <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" />
          <span>
            <strong>SIMULATED WORKFLOW SYSTEM:</strong> This is a passport assistance & tracking prototype. It does NOT connect to official Government of India production servers. DigiLocker & Passport Seva integrations are simulated with mock adapter contracts.
          </span>
        </div>
      </div>

      {/* Tri-color accent bar */}
      <div className="h-1 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-white"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              🇮🇳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Passport Assist</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  DigiLocker Verified
                </span>
              </div>
              <p className="text-xs text-slate-500">Assignment 04 • Workflow & State Machine Simulation</p>
            </div>
          </div>

          {/* Persona / Section Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab("applicant")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === "applicant"
                  ? "bg-white text-blue-700 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Applicant Portal
            </button>
            <button
              onClick={() => setActiveTab("operator")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === "operator"
                  ? "bg-white text-blue-700 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Operator Console
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === "audit"
                  ? "bg-white text-blue-700 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Audit Trail
            </button>
            <button
              onClick={() => setActiveTab("docs")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === "docs"
                  ? "bg-white text-blue-700 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Specs & Rubric
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              title="Reset application to seed demo state"
              className="px-2.5 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin text-blue-600" : "text-slate-500"}`} />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              title="View simulated SMS & Email notifications"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
