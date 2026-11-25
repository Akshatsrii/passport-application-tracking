"use client";

import React from "react";
import { NotificationItem } from "@/types";
import { X, Bell, MessageSquare, Mail } from "lucide-react";

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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end animate-in fade-in duration-100">
      <div className="w-full max-w-sm bg-white h-full shadow-lg flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-700" />
            <h3 className="font-semibold text-xs text-slate-900">Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => {
              const isSms = n.channel === "SMS_SIMULATED";

              return (
                <div
                  key={n.id}
                  onClick={() => onMarkRead(n.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                    n.read
                      ? "bg-white border-slate-200 text-slate-600"
                      : "bg-slate-50 border-slate-300 text-slate-900 font-medium"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 font-semibold text-xs text-slate-800">
                      {isSms ? (
                        <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      {n.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">{n.message}</p>

                  <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
                    <span>{n.recipient}</span>
                    <span>{n.channel.replace(/_SIMULATED/g, "")}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-400 text-center">
          Dispatches alerts at key passport application milestones.
        </div>
      </div>
    </div>
  );
};
