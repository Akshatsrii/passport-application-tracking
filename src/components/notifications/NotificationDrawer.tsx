"use client";

import React from "react";
import { NotificationItem } from "@/types";
import { X, Bell, MessageSquare, Mail, CheckCircle2 } from "lucide-react";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Simulated Notifications Center</h3>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
              SMS / EMAIL
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No notifications generated yet.
            </div>
          ) : (
            notifications.map((n) => {
              const isSms = n.channel === "SMS_SIMULATED";
              const isEmail = n.channel === "EMAIL_SIMULATED";

              return (
                <div
                  key={n.id}
                  onClick={() => onMarkRead(n.id)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    n.read
                      ? "bg-white border-slate-200 text-slate-600"
                      : "bg-blue-50/50 border-blue-200 text-slate-900 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 font-bold text-xs">
                      {isSms && <MessageSquare className="w-3.5 h-3.5 text-green-600" />}
                      {isEmail && <Mail className="w-3.5 h-3.5 text-blue-600" />}
                      {n.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed mt-1">{n.message}</p>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>To: {n.recipient}</span>
                    <span className="font-semibold text-slate-500">{n.channel.replace(/_/g, " ")}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center">
          Simulates citizen communication at each key milestone of the passport workflow.
        </div>
      </div>
    </div>
  );
};
