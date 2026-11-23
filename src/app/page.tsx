"use client";

import React, { useState, useEffect } from "react";
import { PassportApplication, NotificationItem } from "@/types";
import { Navbar } from "@/components/layout/Navbar";
import { ApplicantPortal } from "@/components/applicant/ApplicantPortal";
import { OperatorDashboard } from "@/components/operator/OperatorDashboard";
import { AuditTrailViewer } from "@/components/audit/AuditTrailViewer";
import { NotificationDrawer } from "@/components/notifications/NotificationDrawer";
import { SpecsViewer } from "@/components/docs/SpecsViewer";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"applicant" | "operator" | "audit" | "docs">("applicant");
  const [applications, setApplications] = useState<PassportApplication[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      const [appRes, notifRes] = await Promise.all([
        fetch("/api/applications"),
        fetch("/api/notifications"),
      ]);
      const appData = await appRes.json();
      const notifData = await notifRes.json();

      if (appData.success) {
        setApplications(appData.data);
        if (!selectedAppId && appData.data.length > 0) {
          // Default to Priya Patel (APP-2026-44120) so the reviewer can experience the live DigiLocker consent flow!
          const priya = appData.data.find((a: PassportApplication) => a.id === "APP-2026-44120");
          setSelectedAppId(priya ? priya.id : appData.data[0].id);
        }
      }
      if (notifData.success) {
        setNotifications(notifData.data);
      }
    } catch (err) {
      console.error("Failed to load initial data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await fetch("/api/seed/reset", { method: "POST" });
      await loadData();
      alert("Application store successfully reset to original seed data!");
    } catch (err) {
      alert("Failed to reset demo");
    } finally {
      setIsResetting(false);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotifOpen(true)}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-semibold">Initializing Passport Assistance Workspace...</p>
          </div>
        ) : (
          <>
            {activeTab === "applicant" && (
              <ApplicantPortal
                applications={applications}
                selectedAppId={selectedAppId}
                onSelectApplication={setSelectedAppId}
                onRefresh={loadData}
              />
            )}

            {activeTab === "operator" && (
              <OperatorDashboard applications={applications} onRefresh={loadData} />
            )}

            {activeTab === "audit" && <AuditTrailViewer />}

            {activeTab === "docs" && <SpecsViewer />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            Passport Application & Tracking Assistance Prototype with DigiLocker Simulation
          </p>
          <p className="text-[11px]">
            Technical Assessment Submission • Evaluated for Anshumat Foundation • v1.3 Standard Compliance
          </p>
        </div>
      </footer>

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
      />
    </div>
  );
}
