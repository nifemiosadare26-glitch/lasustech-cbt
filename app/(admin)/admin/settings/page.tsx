"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRoleTheme } from "@/components/role-theme";
import { useApi } from "@/lib/useApi";
import { apiClient } from "@/lib/apiClient";
import { ConfirmModal, errMessage } from "@/components/admin/ui";
import { useToast } from "@/components/ui/toast";
import {
  Shield,
  Settings,
  Server,
  Bell,
  Database,
  CheckCircle2,
  RotateCcw,
  Save,
  Sun,
  Moon,
  Loader2,
  AlertCircle,
} from "lucide-react";

type GeneralSettings = {
  platformName: string;
  institutionShort: string;
  timezone: "Africa/Lagos" | "UTC";
  defaultSession: string;
  supportPhone: string;
  liveExamMode: boolean;
  maintenanceMode: boolean;
};

type SecuritySettings = {
  twoFactorStaff: boolean;
  sessionTimeoutMins: number;
  maxLoginAttempts: number;
  lockoutDurationMins: number;
  passwordExpiryDays: number;
  enforceSingleSession: boolean;
  cbtSubnets: string[];
};

type DisconnectPolicy = "RUNNING" | "PAUSE_ON_DISCONNECT";

type ExamSettings = {
  autosaveSeconds: number;
  heartbeatSeconds: number;
  disconnectClockPolicy: DisconnectPolicy;
  autoSubmitOnExpiry: boolean;
  lateLoginGraceMins: number;
  lateLoginCutoffMins: number;
  tabSwitchLimit: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  immediateResultDisplay: boolean;
  negativeMarking: boolean;
  antiCheatEnabled: boolean;
};

type NotificationSettings = {
  emailEnabled: boolean;
  smtpHost: string;
  smsAlertsEnabled: boolean;
  inAppBanners: boolean;
  criticalHealthAlerts: boolean;
  studentDisconnectAlerts: boolean;
  officerApprovalAlerts: boolean;
  examDeadlineReminders: boolean;
};

type DataSettings = {
  autoDailyBackup: boolean;
  backupTime: string;
  retentionDays: number;
};

type AllSettings = {
  general: GeneralSettings;
  security: SecuritySettings;
  exam: ExamSettings;
  notifications: NotificationSettings;
  data: DataSettings;
};

type Group = keyof AllSettings;

/** Editable form state: numeric fields and subnet lists are held as strings. */
type FormState = {
  general: GeneralSettings;
  security: {
    twoFactorStaff: boolean;
    sessionTimeoutMins: string;
    maxLoginAttempts: string;
    lockoutDurationMins: string;
    passwordExpiryDays: string;
    enforceSingleSession: boolean;
    cbtSubnets: string;
  };
  exam: {
    autosaveSeconds: string;
    heartbeatSeconds: string;
    disconnectClockPolicy: DisconnectPolicy;
    autoSubmitOnExpiry: boolean;
    lateLoginGraceMins: string;
    lateLoginCutoffMins: string;
    tabSwitchLimit: string;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    immediateResultDisplay: boolean;
    negativeMarking: boolean;
    antiCheatEnabled: boolean;
  };
  notifications: NotificationSettings;
  data: {
    autoDailyBackup: boolean;
    backupTime: string;
    retentionDays: string;
  };
};

const GROUP_LABEL: Record<Group, string> = {
  general: "General",
  security: "Security & access",
  exam: "Exam engine",
  notifications: "Notifications",
  data: "Data & backups",
};

const toForms = (s: AllSettings): FormState => ({
  general: { ...s.general },
  security: {
    twoFactorStaff: s.security.twoFactorStaff,
    sessionTimeoutMins: String(s.security.sessionTimeoutMins),
    maxLoginAttempts: String(s.security.maxLoginAttempts),
    lockoutDurationMins: String(s.security.lockoutDurationMins),
    passwordExpiryDays: String(s.security.passwordExpiryDays),
    enforceSingleSession: s.security.enforceSingleSession,
    cbtSubnets: s.security.cbtSubnets.join(", "),
  },
  exam: {
    autosaveSeconds: String(s.exam.autosaveSeconds),
    heartbeatSeconds: String(s.exam.heartbeatSeconds),
    disconnectClockPolicy: s.exam.disconnectClockPolicy,
    autoSubmitOnExpiry: s.exam.autoSubmitOnExpiry,
    lateLoginGraceMins: String(s.exam.lateLoginGraceMins),
    lateLoginCutoffMins: String(s.exam.lateLoginCutoffMins),
    tabSwitchLimit: String(s.exam.tabSwitchLimit),
    shuffleQuestions: s.exam.shuffleQuestions,
    shuffleOptions: s.exam.shuffleOptions,
    immediateResultDisplay: s.exam.immediateResultDisplay,
    negativeMarking: s.exam.negativeMarking,
    antiCheatEnabled: s.exam.antiCheatEnabled ?? true,
  },
  notifications: { ...s.notifications },
  data: {
    autoDailyBackup: s.data.autoDailyBackup,
    backupTime: s.data.backupTime,
    retentionDays: String(s.data.retentionDays),
  },
});

const num = (value: string) => (value.trim() === "" ? 0 : Number(value));

/** Converts a form group into the exact body the API expects. */
function toPayload(group: Group, form: FormState): unknown {
  switch (group) {
    case "general":
      return form.general;
    case "security":
      return {
        twoFactorStaff: form.security.twoFactorStaff,
        sessionTimeoutMins: num(form.security.sessionTimeoutMins),
        maxLoginAttempts: num(form.security.maxLoginAttempts),
        lockoutDurationMins: num(form.security.lockoutDurationMins),
        passwordExpiryDays: num(form.security.passwordExpiryDays),
        enforceSingleSession: form.security.enforceSingleSession,
        cbtSubnets: form.security.cbtSubnets
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
    case "exam":
      return {
        autosaveSeconds: num(form.exam.autosaveSeconds),
        heartbeatSeconds: num(form.exam.heartbeatSeconds),
        disconnectClockPolicy: form.exam.disconnectClockPolicy,
        autoSubmitOnExpiry: form.exam.autoSubmitOnExpiry,
        lateLoginGraceMins: num(form.exam.lateLoginGraceMins),
        lateLoginCutoffMins: num(form.exam.lateLoginCutoffMins),
        tabSwitchLimit: num(form.exam.tabSwitchLimit),
        shuffleQuestions: form.exam.shuffleQuestions,
        shuffleOptions: form.exam.shuffleOptions,
        immediateResultDisplay: form.exam.immediateResultDisplay,
        negativeMarking: form.exam.negativeMarking,
        antiCheatEnabled: form.exam.antiCheatEnabled,
      };
    case "notifications":
      return form.notifications;
    case "data":
      return {
        autoDailyBackup: form.data.autoDailyBackup,
        backupTime: form.data.backupTime,
        retentionDays: num(form.data.retentionDays),
      };
  }
}

function Toggle({
  checked,
  onChange,
  title,
  description,
  tone = "blue",
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  description: string;
  tone?: "blue" | "amber";
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
      <div>
        <div className="font-semibold text-[14px] text-gray-900">{title}</div>
        <p className="text-[12.5px] text-gray-500 mt-0.5">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
            tone === "amber" ? "peer-checked:bg-amber-600" : "peer-checked:bg-blue-600"
          }`}
        />
      </label>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[13.5px] font-semibold text-gray-900 block mb-1">{label}</label>
      {children}
      {hint && <p className="text-[12px] text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

export default function SystemSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Group>("general");
  const [saving, setSaving] = useState(false);
  const [flushOpen, setFlushOpen] = useState(false);
  const [forceFlush, setForceFlush] = useState(false);

  // Appearance is stored per *scope*, not per role: this choice is the one the
  // student portal reads too. Lecturers hold a separate private preference.
  const { theme, setTheme } = useRoleTheme();

  const { data, error, loading, reload } = useApi<AllSettings>("/admin/settings");

  const [forms, setForms] = useState<FormState | null>(null);
  const [baseline, setBaseline] = useState<FormState | null>(null);

  useEffect(() => {
    if (!data) return;
    const next = toForms(data);
    setForms(next);
    setBaseline(next);
  }, [data]);

  const setGroup = <G extends Group>(group: G, patch: Partial<FormState[G]>) => {
    setForms((current) =>
      current
        ? ({ ...current, [group]: { ...current[group], ...patch } } as FormState)
        : current,
    );
  };

  const dirtyGroups = useMemo<Group[]>(() => {
    if (!forms || !baseline) return [];
    return (Object.keys(forms) as Group[]).filter(
      (group) =>
        JSON.stringify(toPayload(group, forms)) !== JSON.stringify(toPayload(group, baseline)),
    );
  }, [forms, baseline]);

  const hasChanges = dirtyGroups.length > 0;

  const save = async () => {
    if (!forms || dirtyGroups.length === 0) return;
    setSaving(true);
    try {
      for (const group of dirtyGroups) {
        await apiClient(`/admin/settings/${group}`, {
          method: "PUT",
          body: JSON.stringify(toPayload(group, forms)),
        });
      }
      setBaseline(forms);
      toast({
        title: "Settings saved",
        description: `Updated ${dirtyGroups.map((g) => GROUP_LABEL[g]).join(", ")}.`,
        variant: "success",
      });
      void reload();
    } catch (e) {
      toast({
        title: "Could not save settings",
        description: errMessage(e, "Check the highlighted values and try again."),
        variant: "error",
        duration: 0,
      });
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    if (!baseline) return;
    setForms(baseline);
    toast({ title: "Unsaved changes discarded", variant: "info" });
  };

  const flushSessions = async () => {
    const result = await apiClient<{ data: { revoked: number } }>(
      "/admin/settings/flush-sessions",
      { method: "POST", body: JSON.stringify({ force: forceFlush }) },
    );
    toast({
      title: "Active sessions flushed",
      description: `${result.data.revoked} session${result.data.revoked === 1 ? "" : "s"} signed out.`,
      variant: "success",
    });
    setFlushOpen(false);
    setForceFlush(false);
  };

  const tabs: { id: Group; label: string; icon: typeof Settings }[] = [
    { id: "general", label: "General", icon: Settings },
    { id: "security", label: "Security & Access", icon: Shield },
    { id: "exam", label: "Exam Engine Defaults", icon: Server },
    { id: "notifications", label: "Notifications & Alerts", icon: Bell },
    { id: "data", label: "Data & Backups", icon: Database },
  ];

  if (!forms) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3 py-24 text-gray-500">
        {error ? (
          <>
            <AlertCircle className="text-red-500" size={26} />
            <p className="text-[14px] font-medium text-gray-900">Couldn&apos;t load system settings</p>
            <p className="text-[13px]">{errMessage(error)}</p>
            <Button type="button" variant="secondary" onClick={() => void reload()}>
              Retry
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="animate-spin text-blue-600" size={22} />
            <p className="text-[14px]">Loading settings…</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28 flex flex-col h-full max-w-5xl mx-auto relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">System settings</h2>
          <p className="text-[14px] text-gray-500 mt-0.5">
            Configure global defaults, security rules, and platform engine parameters.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => void save()}
            disabled={!hasChanges || saving}
            className="bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer"
          >
            {saving ? (
              <Loader2 size={16} className="mr-1.5 animate-spin" />
            ) : (
              <Save size={16} className="mr-1.5" />
            )}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800"
        >
          <span className="flex items-center gap-2">
            <AlertCircle size={16} /> {errMessage(error, "Could not refresh settings.")}
          </span>
          <button
            type="button"
            onClick={() => void reload()}
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-[13px] font-medium text-gray-700 hover:bg-gray-50"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Tabs Sidebar */}
        <Card className="w-full md:w-[250px] shrink-0 p-2 border-gray-200" noPadding>
          <nav className="flex flex-col space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDirty = dirtyGroups.includes(tab.id);
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-[14px] font-medium transition-colors text-left cursor-pointer ${
                    isActive
                      ? "bg-blue-100 text-blue-900 font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-blue-600" : "text-gray-400"} />
                  <span className="flex-1">{tab.label}</span>
                  {isDirty && (
                    <span
                      className="w-2 h-2 rounded-full bg-amber-500"
                      title="Unsaved changes in this group"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Tab Content */}
        <div className="flex-1 w-full space-y-6">
          {/* TAB 1: GENERAL SETTINGS */}
          {activeTab === "general" && (
            <>
              <Card title="Appearance">
                <div className="space-y-3 mt-2">
                  <label className="text-[15px] font-semibold text-gray-900">Interface Theme</label>
                  <p className="text-[13px] text-gray-500">
                    Sets the theme for the admin dashboard <strong>and</strong> the student portal. It
                    saves immediately. Lecturers choose their own theme under their settings and keep
                    it whatever you pick here.
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

              <Card title="Platform Identity & Localization">
                <div className="space-y-4 mt-2">
                  <Field label="CBT Portal Title">
                    <Input
                      value={forms.general.platformName}
                      maxLength={120}
                      onChange={(e) => setGroup("general", { platformName: e.target.value })}
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Institution Short Code">
                      <Input
                        value={forms.general.institutionShort}
                        maxLength={20}
                        onChange={(e) => setGroup("general", { institutionShort: e.target.value })}
                      />
                    </Field>
                    <Field label="System Timezone">
                      <select
                        value={forms.general.timezone}
                        onChange={(e) =>
                          setGroup("general", {
                            timezone: e.target.value as GeneralSettings["timezone"],
                          })
                        }
                        className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="Africa/Lagos">Africa/Lagos (GMT+1 - Nigeria Standard Time)</option>
                        <option value="UTC">UTC (GMT+0 - Coordinated Universal Time)</option>
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Default Academic Session"
                      hint="Shown on dashboards and used as the default for new exams."
                    >
                      <Input
                        value={forms.general.defaultSession}
                        maxLength={60}
                        placeholder="e.g. 2026/2027"
                        onChange={(e) => setGroup("general", { defaultSession: e.target.value })}
                      />
                    </Field>
                    <Field label="Emergency Support Helpline">
                      <Input
                        value={forms.general.supportPhone}
                        maxLength={30}
                        placeholder="+234 …"
                        onChange={(e) => setGroup("general", { supportPhone: e.target.value })}
                      />
                    </Field>
                  </div>
                </div>
              </Card>

              <Card title="Operational Mode">
                <div className="space-y-4 mt-2">
                  <Toggle
                    checked={forms.general.liveExamMode}
                    onChange={(value) => setGroup("general", { liveExamMode: value })}
                    title="Live Exam Mode (High Performance)"
                    description="Optimizes database connection pool and disables non-essential background jobs during testing hours."
                  />
                  <Toggle
                    checked={forms.general.maintenanceMode}
                    onChange={(value) => setGroup("general", { maintenanceMode: value })}
                    title="Maintenance Mode"
                    description="Blocks all non-admin student & lecturer access, showing a scheduled maintenance banner."
                    tone="amber"
                  />
                </div>
              </Card>
            </>
          )}

          {/* TAB 2: SECURITY SETTINGS */}
          {activeTab === "security" && (
            <>
              <Card title="Authentication & Access Control">
                <div className="space-y-4 mt-2">
                  <Toggle
                    checked={forms.security.twoFactorStaff}
                    onChange={(value) => setGroup("security", { twoFactorStaff: value })}
                    title="Two-Factor Authentication (2FA) for Staff"
                    description="Mandatory OTP verification for Lecturers, Exam Officers, and Administrators."
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Session Idle Timeout (minutes)" hint="Between 5 and 480 minutes.">
                      <Input
                        type="number"
                        min={5}
                        max={480}
                        value={forms.security.sessionTimeoutMins}
                        onChange={(e) =>
                          setGroup("security", { sessionTimeoutMins: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Max Failed Logins" hint="Between 3 and 20 attempts.">
                      <Input
                        type="number"
                        min={3}
                        max={20}
                        value={forms.security.maxLoginAttempts}
                        onChange={(e) =>
                          setGroup("security", { maxLoginAttempts: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Lockout Duration (minutes)" hint="Between 1 and 1440 minutes.">
                      <Input
                        type="number"
                        min={1}
                        max={1440}
                        value={forms.security.lockoutDurationMins}
                        onChange={(e) =>
                          setGroup("security", { lockoutDurationMins: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Password Expiry (days)" hint="Use 0 to never expire passwords.">
                      <Input
                        type="number"
                        min={0}
                        max={730}
                        value={forms.security.passwordExpiryDays}
                        onChange={(e) =>
                          setGroup("security", { passwordExpiryDays: e.target.value })
                        }
                      />
                    </Field>
                  </div>

                  <Toggle
                    checked={forms.security.enforceSingleSession}
                    onChange={(value) => setGroup("security", { enforceSingleSession: value })}
                    title="Enforce Single Concurrent Login"
                    description="Terminates any older active session if a student logs in from another workstation/device."
                  />
                </div>
              </Card>

              <Card title="CBT Centre Network & Whitelist">
                <div className="space-y-4 mt-2">
                  <Field
                    label="Whitelisted Subnets (Exam Centers)"
                    hint="Comma-separated IPv4 addresses or CIDR ranges, e.g. 192.168.1.0/24, 10.0.0.0/16. Leave empty to allow any network."
                  >
                    <Input
                      value={forms.security.cbtSubnets}
                      onChange={(e) => setGroup("security", { cbtSubnets: e.target.value })}
                      placeholder="e.g. 192.168.1.0/24, 10.0.0.0/16"
                    />
                  </Field>

                  <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setFlushOpen(true)}
                      className="cursor-pointer hover:border-red-400 hover:text-red-700"
                    >
                      <RotateCcw size={15} className="mr-1.5" /> Flush Active Sessions
                    </Button>
                    <p className="self-center text-[12px] text-gray-500">
                      Signs out every non-admin user. Blocked while exams are open unless forced.
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* TAB 3: EXAM ENGINE DEFAULTS */}
          {activeTab === "exam" && (
            <>
              <Card title="Engine Configuration & Realtime Sync">
                <p className="text-[13px] text-gray-500 mb-4 pb-3 border-b border-gray-100">
                  Global defaults applied when new exams are created. Lecturers can override rules per exam.
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Autosave Interval (seconds)" hint="Between 1 and 60 seconds.">
                      <Input
                        type="number"
                        min={1}
                        max={60}
                        value={forms.exam.autosaveSeconds}
                        onChange={(e) => setGroup("exam", { autosaveSeconds: e.target.value })}
                      />
                    </Field>
                    <Field label="Heartbeat Interval (seconds)" hint="Between 2 and 120 seconds.">
                      <Input
                        type="number"
                        min={2}
                        max={120}
                        value={forms.exam.heartbeatSeconds}
                        onChange={(e) => setGroup("exam", { heartbeatSeconds: e.target.value })}
                      />
                    </Field>
                  </div>

                  <Field label="Clock Policy During Network Disconnection">
                    <select
                      value={forms.exam.disconnectClockPolicy}
                      onChange={(e) =>
                        setGroup("exam", {
                          disconnectClockPolicy: e.target.value as DisconnectPolicy,
                        })
                      }
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="RUNNING">Keep timer running (Strict CBT exam time)</option>
                      <option value="PAUSE_ON_DISCONNECT">
                        Pause timer until reconnect (Graceful recovery)
                      </option>
                    </select>
                  </Field>

                  <Toggle
                    checked={forms.exam.autoSubmitOnExpiry}
                    onChange={(value) => setGroup("exam", { autoSubmitOnExpiry: value })}
                    title="Auto-submit on expiry"
                    description="Submits saved answers automatically when the exam clock reaches zero."
                  />
                </div>
              </Card>

              <Card title="Integrity, Randomization & Scoring">
                <div className="space-y-4 mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="Late-login grace (mins)" hint="0–120 minutes.">
                      <Input
                        type="number"
                        min={0}
                        max={120}
                        value={forms.exam.lateLoginGraceMins}
                        onChange={(e) =>
                          setGroup("exam", { lateLoginGraceMins: e.target.value })
                        }
                      />
                    </Field>
                    <Field
                      label="Late-login cutoff (mins)"
                      hint="Must be at least the grace period (0–240)."
                    >
                      <Input
                        type="number"
                        min={0}
                        max={240}
                        value={forms.exam.lateLoginCutoffMins}
                        onChange={(e) =>
                          setGroup("exam", { lateLoginCutoffMins: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Tab-switch flag limit" hint="0–20 switches before a flag.">
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        value={forms.exam.tabSwitchLimit}
                        onChange={(e) => setGroup("exam", { tabSwitchLimit: e.target.value })}
                      />
                    </Field>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <Toggle
                      checked={forms.exam.antiCheatEnabled}
                      onChange={(value) => setGroup("exam", { antiCheatEnabled: value })}
                      title="Anti-Cheat Tab Switching Monitor"
                      description="Monitors browser focus and tab switches; alerts candidate twice and automatically submits and logs out on 3rd violation."
                    />
                    <Toggle
                      checked={forms.exam.shuffleQuestions}
                      onChange={(value) => setGroup("exam", { shuffleQuestions: value })}
                      title="Randomize Question Order"
                      description="Every student receives questions in a unique sequence."
                    />
                    <Toggle
                      checked={forms.exam.shuffleOptions}
                      onChange={(value) => setGroup("exam", { shuffleOptions: value })}
                      title="Randomize Answer Options (A, B, C, D)"
                      description="Shuffles choices for multiple-choice questions."
                    />
                    <Toggle
                      checked={forms.exam.immediateResultDisplay}
                      onChange={(value) => setGroup("exam", { immediateResultDisplay: value })}
                      title="Instant Student Result Display"
                      description="When enabled, students see results upon completion. When disabled, results require admin moderation and release before publishing."
                    />
                    <Toggle
                      checked={forms.exam.negativeMarking}
                      onChange={(value) => setGroup("exam", { negativeMarking: value })}
                      title="Negative Marking"
                      description="Deduct a fraction of the mark for every wrong answer."
                    />
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <>
              <Card title="Notification Channels">
                <div className="space-y-4 mt-2">
                  <Toggle
                    checked={forms.notifications.emailEnabled}
                    onChange={(value) => setGroup("notifications", { emailEnabled: value })}
                    title="Email Dispatch Gateway"
                    description="Transmits exam invitations, schedule notifications, and password reset links."
                  />

                  <Field label="SMTP Relay Host">
                    <Input
                      value={forms.notifications.smtpHost}
                      maxLength={255}
                      placeholder="smtp.example.edu.ng"
                      onChange={(e) =>
                        setGroup("notifications", { smtpHost: e.target.value })
                      }
                    />
                  </Field>

                  <Toggle
                    checked={forms.notifications.smsAlertsEnabled}
                    onChange={(value) => setGroup("notifications", { smsAlertsEnabled: value })}
                    title="SMS Alerts"
                    description="Send critical alerts to candidates and invigilators by text message."
                  />

                  <Toggle
                    checked={forms.notifications.inAppBanners}
                    onChange={(value) => setGroup("notifications", { inAppBanners: value })}
                    title="In-app Banners"
                    description="Show announcements and maintenance notices inside the portal."
                  />
                </div>
              </Card>

              <Card title="Automated Event Triggers">
                <div className="space-y-3 mt-2">
                  <Toggle
                    checked={forms.notifications.criticalHealthAlerts}
                    onChange={(value) =>
                      setGroup("notifications", { criticalHealthAlerts: value })
                    }
                    title="Critical Server & Socket Alerts"
                    description="Alert sysadmins when gateway response latency exceeds 300ms."
                  />
                  <Toggle
                    checked={forms.notifications.studentDisconnectAlerts}
                    onChange={(value) =>
                      setGroup("notifications", { studentDisconnectAlerts: value })
                    }
                    title="Candidate Disconnection Alarms"
                    description="Notify the invigilator dashboard if a student drops offline for > 60 seconds."
                  />
                  <Toggle
                    checked={forms.notifications.officerApprovalAlerts}
                    onChange={(value) =>
                      setGroup("notifications", { officerApprovalAlerts: value })
                    }
                    title="Exam Officer Approval Alerts"
                    description="Notify administrators when an exam needs approval before it can open."
                  />
                  <Toggle
                    checked={forms.notifications.examDeadlineReminders}
                    onChange={(value) =>
                      setGroup("notifications", { examDeadlineReminders: value })
                    }
                    title="Exam Deadline Reminders"
                    description="Remind candidates and lecturers as an exam window approaches its close."
                  />
                </div>
              </Card>
            </>
          )}

          {/* TAB 5: DATA & BACKUPS */}
          {activeTab === "data" && (
            <Card title="Database Snapshots & Maintenance">
              <div className="space-y-4 mt-2">
                <Toggle
                  checked={forms.data.autoDailyBackup}
                  onChange={(value) => setGroup("data", { autoDailyBackup: value })}
                  title="Daily Automated Snapshot"
                  description="Nightly database backup performed automatically at the configured time."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Backup Time" hint="24-hour time in the platform timezone.">
                    <Input
                      type="time"
                      value={forms.data.backupTime}
                      onChange={(e) => setGroup("data", { backupTime: e.target.value })}
                    />
                  </Field>
                  <Field label="Snapshot Retention Period (days)" hint="Between 7 and 3650 days.">
                    <Input
                      type="number"
                      min={7}
                      max={3650}
                      value={forms.data.retentionDays}
                      onChange={(e) => setGroup("data", { retentionDays: e.target.value })}
                    />
                  </Field>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Floating Save Bar when Changes Exist */}
      {hasChanges && (
        <div className="fixed bottom-6 left-0 right-0 max-w-xl mx-auto bg-gray-900 text-white rounded-xl shadow-2xl p-4 flex items-center justify-between z-40 border border-gray-700 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[13.5px] font-medium">
              Unsaved changes in {dirtyGroups.map((g) => GROUP_LABEL[g]).join(", ")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="tertiary"
              onClick={discard}
              disabled={saving}
              className="text-gray-300 hover:text-white h-9"
            >
              Discard
            </Button>
            <Button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 cursor-pointer"
            >
              {saving ? <Loader2 size={15} className="mr-1.5 animate-spin" /> : <CheckCircle2 size={15} className="mr-1.5" />}
              Save changes
            </Button>
          </div>
        </div>
      )}

      {flushOpen && (
        <ConfirmModal
          title="Flush active sessions"
          danger
          confirmLabel="Flush sessions"
          body={
            <div className="space-y-3">
              <p>
                This signs out every non-admin user immediately. Candidates with an exam open will
                lose their active session.
              </p>
              <label className="flex items-start gap-2 text-[13px] text-gray-700">
                <input
                  type="checkbox"
                  checked={forceFlush}
                  onChange={(e) => setForceFlush(e.target.checked)}
                  className="mt-0.5 h-4 w-4"
                />
                <span>
                  Force the sign-out even while exam sittings are open. Without this, the request is
                  refused if any sitting is currently live.
                </span>
              </label>
            </div>
          }
          onConfirm={flushSessions}
          onClose={() => {
            setFlushOpen(false);
            setForceFlush(false);
          }}
        />
      )}

      {loading && (
        <span className="sr-only" role="status">
          Refreshing settings
        </span>
      )}
    </div>
  );
}
