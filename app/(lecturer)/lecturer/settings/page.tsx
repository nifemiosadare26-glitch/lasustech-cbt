"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useRoleTheme } from "@/components/role-theme";
import { useApi } from "@/lib/useApi";
import { Settings, User, Sun, Moon } from "lucide-react";

type Me = {
  names?: string;
  email?: string | null;
  staffId?: string | null;
  primaryRole?: string | null;
  roles?: string[];
};

const TABS = [
  { id: "general", label: "Appearance", icon: Settings },
  { id: "profile", label: "My Profile", icon: User },
] as const;

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[12px] font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-[15px] text-gray-900">{value}</p>
    </div>
  );
}

export default function LecturerSettings() {
  const [activeTab, setActiveTab] = useState<"general" | "profile">("general");

  // The lecturer's own theme, private from the admin's. `theme` is null until the
  // provider has read storage, which is what keeps the server and first client
  // render in agreement.
  const { theme, setTheme } = useRoleTheme();
  const me = useApi<Me>("/me");

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full max-w-5xl mx-auto relative">
      <div>
        <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Settings</h2>
        <p className="text-[14px] text-gray-500 mt-1">
          Manage your workspace appearance and review your account.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Tabs Sidebar */}
        <Card className="w-full md:w-[240px] shrink-0 p-2 border-gray-200" noPadding>
          <nav className="flex flex-col space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors text-left ${
                    isActive ? "bg-blue-100 text-blue-900" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-blue-600" : "text-gray-400"} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Tab Content */}
        <div className="flex-1 w-full space-y-6">
          {activeTab === "general" && (
            <Card title="Appearance">
              <div className="space-y-3 mt-2">
                <label className="text-[15px] font-semibold text-gray-900">Interface Theme</label>
                <p className="text-[13px] text-gray-500">
                  Customize the appearance of your dashboard. This preference is private to you — it
                  is not affected by the theme the admin sets for the rest of the portal.
                </p>

                <div className="flex flex-wrap gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    aria-pressed={theme === "light"}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all w-[120px] cursor-pointer ${
                      theme === "light"
                        ? "border-blue-600 bg-blue-50/50"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <Sun size={28} className={theme === "light" ? "text-blue-600" : "text-gray-400"} />
                    <span
                      className={`mt-3 text-[13px] font-medium ${
                        theme === "light" ? "text-blue-900" : "text-gray-600"
                      }`}
                    >
                      Light
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    aria-pressed={theme === "dark"}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all w-[120px] cursor-pointer ${
                      theme === "dark"
                        ? "border-blue-600 bg-blue-50/50"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <Moon size={28} className={theme === "dark" ? "text-blue-600" : "text-gray-400"} />
                    <span
                      className={`mt-3 text-[13px] font-medium ${
                        theme === "dark" ? "text-blue-900" : "text-gray-600"
                      }`}
                    >
                      Dark
                    </span>
                  </button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === "profile" && (
            <Card title="My Profile">
              {me.loading ? (
                <p className="text-sm text-gray-500">Loading your account…</p>
              ) : me.error ? (
                <p className="text-sm text-red-600">{me.error.message}</p>
              ) : (
                <div className="space-y-6 mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Full name" value={me.data?.names ?? "—"} />
                    <Field label="Email" value={me.data?.email ?? "—"} />
                    <Field label="Staff ID" value={me.data?.staffId ?? "Not set"} />
                    <Field label="Primary role" value={me.data?.primaryRole ?? "—"} />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[12px] font-medium uppercase tracking-wide text-gray-500">
                      Roles
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(me.data?.roles ?? []).length === 0 ? (
                        <span className="text-[15px] text-gray-900">—</span>
                      ) : (
                        (me.data?.roles ?? []).map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-[12px] font-medium text-blue-900"
                          >
                            {role}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <p className="pt-4 border-t border-gray-100 text-[13px] text-gray-500">
                    Your name, email and staff ID are managed by an administrator. Ask them to update
                    these if something is wrong.
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
