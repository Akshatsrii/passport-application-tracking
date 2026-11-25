"use client";

import React from "react";
import {
  Bell,
  RotateCcw,
  BookOpen,
  ClipboardList,
  ShieldCheck,
  FileSpreadsheet,
  Info,
} from "lucide-react";

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
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      {/* Subtle sandbox notice (clean, not loud AI warning) */}
      <div className="bg-slate-50 border-b border-slate-200/70 py-1.5 px-4 text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-slate-700">Prototype Sandbox:</span>
            <span>
              Demonstration environment for passport application assistance & DigiLocker integration.
            </span>
          </div>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Assignment 04 • v1.3
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Name */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 text-sm tracking-tight">
                    PassportAssist
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    DigiLocker
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs - Clean Linear/GitHub style */}
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setActiveTab("applicant")}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "applicant"
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
                Applicant Portal
              </button>

              <button
                onClick={() => setActiveTab("operator")}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "operator"
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                Operator Desk
              </button>

              <button
                onClick={() => setActiveTab("audit")}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "audit"
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                Audit Trail
              </button>

              <button
                onClick={() => setActiveTab("docs")}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "docs"
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Info className="w-3.5 h-3.5 text-slate-500" />
                System Specs
              </button>
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              className="px-2.5 py-1.5 rounded-md border border-slate-200 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              title="Reset application to seed data"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin text-blue-600" : ""}`} />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute 1 top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600"></span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100">
          <button
            onClick={() => setActiveTab("applicant")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === "applicant" ? "bg-slate-900 text-white" : "text-slate-600"
            }`}
          >
            Applicant
          </button>
          <button
            onClick={() => setActiveTab("operator")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === "operator" ? "bg-slate-900 text-white" : "text-slate-600"
            }`}
          >
            Operator
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === "audit" ? "bg-slate-900 text-white" : "text-slate-600"
            }`}
          >
            Audit
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === "docs" ? "bg-slate-900 text-white" : "text-slate-600"
            }`}
          >
            Specs
          </button>
        </div>
      </div>
    </header>
  );
};
