"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Settings,
  Server,
  Bell,
  Database,
  CheckCircle2,
  Lock,
  KeyRound,
  AlertTriangle,
  Download,
  Trash2,
  RefreshCw,
  Mail,
  Smartphone,
  Globe,
  Sliders,
  Check,
  Zap,
  Save,
  RotateCcw
} from "lucide-react";

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [hasChanges, setHasChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    platformName: "LASUSTECH Computer Based Testing (CBT) Portal",
    institutionShort: "LASUSTECH",
    portalTimezone: "Africa/Lagos (GMT+1)",
    defaultSession: "Session 2026/2027",
    supportPhone: "+234 1 234 5678",
    activeExamMode: true,
    maintenanceMode: false,
  });

  // 2. Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorStaff: true,
    sessionTimeoutMins: "30",
    maxLoginAttempts: "5",
    lockoutDurationMins: "15",
    passwordExpiryDays: "90",
    enforceSingleSession: true,
    ipWhitelistEnabled: true,
    cbtSubnets: "192.168.1.0/24, 10.0.0.0/16",
    browserLockdownRequired: true,
    prohibitTabSwitch: true,
  });

  // 3. Exam Defaults State
  const [examDefaults, setExamDefaults] = useState({
    autosaveSeconds: "3",
    heartbeatSeconds: "10",
    disconnectClockPolicy: "Keep timer running",
    autoSubmitOnExpiry: true,
    lateLoginGraceMins: "15",
    lateLoginCutoffMins: "30",
    tabSwitchLimit: "2",
    shuffleQuestions: true,
    shuffleOptions: true,
    immediateResultDisplay: false,
    negativeMarking: false,
  });

  // 4. Notifications State
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    smtpHost: "smtp.lasustech.edu.ng",
    smsAlertsEnabled: false,
    inAppBanners: true,
    criticalHealthAlerts: true,
    studentDisconnectAlerts: true,
    officerApprovalAlerts: true,
    examDeadlineReminders: true,
  });

  // 5. Data & Backups State
  const [dataSettings, setDataSettings] = useState({
    autoDailyBackup: true,
    backupTime: "02:00 AM",
    retentionDays: "90",
    backupStorage: "On-Premises NAS & S3 Encrypted Bucket",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const markDirty = () => setHasChanges(true);

  const handleSaveChanges = () => {
    setHasChanges(false);
    showToast("Settings updated successfully! Changes applied across all nodes.");
  };

  const handleDiscardChanges = () => {
    setHasChanges(false);
    showToast("Unsaved changes discarded.");
  };

  // Quick Action Handlers
  const handleRegenerateApiKey = () => {
    showToast("New API key generated and copied to clipboard.");
  };

  const handleFlushSessions = () => {
    showToast("Flushed all non-admin active sessions from Redis.");
  };

  const handleTriggerManualBackup = () => {
    const backupFile = `LASUSTECH_CBT_DB_SNAPSHOT_${new Date().toISOString().slice(0, 10)}.sql.enc`;
    const dummyBlob = new Blob(["-- LASUSTECH CBT DATABASE ENCRYPTED BACKUP SNAPSHOT --\n"], {
      type: "application/octet-stream",
    });
    const url = URL.createObjectURL(dummyBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = backupFile;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Snapshot created & downloaded: ${backupFile}`);
  };

  const handlePurgeCache = () => {
    showToast("Realtime cache and expired tokens purged successfully.");
  };

  const handleSendTestNotification = () => {
    showToast("Test notification dispatched to administrator inbox.");
  };

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "security", label: "Security & Access", icon: Shield },
    { id: "exam-defaults", label: "Exam Engine Defaults", icon: Server },
    { id: "notifications", label: "Notifications & Alerts", icon: Bell },
    { id: "data", label: "Data & Backups", icon: Database },
  ];

  return (
    <div className="space-y-6 pb-28 flex flex-col h-full max-w-5xl mx-auto relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl border border-gray-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />
          <span className="text-[14px] font-medium">{toastMessage}</span>
        </div>
      )}

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
            onClick={handleSaveChanges}
            className="bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer"
          >
            <Save size={16} className="mr-1.5" /> Save changes
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Tabs Sidebar */}
        <Card className="w-full md:w-[250px] shrink-0 p-2 border-gray-200" noPadding>
          <nav className="flex flex-col space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
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
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Tab Content */}
        <div className="flex-1 w-full space-y-6">
          {/* TAB 1: GENERAL SETTINGS (Appearance/Theme completely removed) */}
          {activeTab === "general" && (
            <>
              <Card title="Platform Identity & Localization">
                <div className="space-y-4 mt-2">
                  <div>
                    <label className="text-[13.5px] font-semibold text-gray-900 block mb-1">
                      CBT Portal Title
                    </label>
                    <Input
                      value={generalSettings.platformName}
                      onChange={(e) => {
                        setGeneralSettings({ ...generalSettings, platformName: e.target.value });
                        markDirty();
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13.5px] font-semibold text-gray-900 block mb-1">
                        Institution Short Code
                      </label>
                      <Input
                        value={generalSettings.institutionShort}
                        onChange={(e) => {
                          setGeneralSettings({ ...generalSettings, institutionShort: e.target.value });
                          markDirty();
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[13.5px] font-semibold text-gray-900 block mb-1">
                        System Timezone
                      </label>
                      <select
                        value={generalSettings.portalTimezone}
                        onChange={(e) => {
                          setGeneralSettings({ ...generalSettings, portalTimezone: e.target.value });
                          markDirty();
                        }}
                        className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="Africa/Lagos (GMT+1)">Africa/Lagos (GMT+1 - Nigeria Standard Time)</option>
                        <option value="UTC (GMT+0)">UTC (GMT+0 - Coordinated Universal Time)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13.5px] font-semibold text-gray-900 block mb-1">
                        Default Academic Session
                      </label>
                      <Input
                        value={generalSettings.defaultSession}
                        onChange={(e) => {
                          setGeneralSettings({ ...generalSettings, defaultSession: e.target.value });
                          markDirty();
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[13.5px] font-semibold text-gray-900 block mb-1">
                        Emergency Support Helpline
                      </label>
                      <Input
                        value={generalSettings.supportPhone}
                        onChange={(e) => {
                          setGeneralSettings({ ...generalSettings, supportPhone: e.target.value });
                          markDirty();
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Operational Mode">
                <div className="space-y-4 mt-2">
                  <div className="flex items-center justify-between p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
                    <div>
                      <div className="font-semibold text-[14px] text-gray-900">
                        Live Exam Mode (High Performance)
                      </div>
                      <p className="text-[12.5px] text-gray-500 mt-0.5">
                        Optimizes database connection pool and disables non-essential background jobs during testing hours.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={generalSettings.activeExamMode}
                        onChange={(e) => {
                          setGeneralSettings({ ...generalSettings, activeExamMode: e.target.checked });
                          markDirty();
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
                    <div>
                      <div className="font-semibold text-[14px] text-gray-900">
                        Maintenance Mode
                      </div>
                      <p className="text-[12.5px] text-gray-500 mt-0.5">
                        Blocks all non-admin student & lecturer access, showing a scheduled maintenance banner.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={generalSettings.maintenanceMode}
                        onChange={(e) => {
                          setGeneralSettings({ ...generalSettings, maintenanceMode: e.target.checked });
                          markDirty();
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* TAB 2: SECURITY SETTINGS */}
          {activeTab === "security" && (
            <>
              <Card title="Authentication & Access Control">
                <div className="space-y-4 mt-2">
                  <div className="flex items-center justify-between p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
                    <div>
                      <div className="font-semibold text-[14px] text-gray-900">
                        Two-Factor Authentication (2FA) for Staff
                      </div>
                      <p className="text-[12.5px] text-gray-500 mt-0.5">
                        Mandatory OTP verification for Lecturers, Exam Officers, and Administrators.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.twoFactorStaff}
                        onChange={(e) => {
                          setSecuritySettings({ ...securitySettings, twoFactorStaff: e.target.checked });
                          markDirty();
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[13.5px] font-semibold text-gray-900 block mb-1">
                        Session Idle Timeout
                      </label>
                      <select
                        value={securitySettings.sessionTimeoutMins}
                        onChange={(e) => {
                          setSecuritySettings({ ...securitySettings, sessionTimeoutMins: e.target.value });
                          markDirty();
                        }}
                        className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="15">15 Minutes</option>
                        <option value="30">30 Minutes (Recommended)</option>
                        <option value="60">1 Hour</option>
                        <option value="120">2 Hours</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[13.5px] font-semibold text-gray-900 block mb-1">
                        Max Failed Logins
                      </label>
                      <select
                        value={securitySettings.maxLoginAttempts}
                        onChange={(e) => {
                          setSecuritySettings({ ...securitySettings, maxLoginAttempts: e.target.value });
                          markDirty();
                        }}
                        className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="3">3 Attempts</option>
                        <option value="5">5 Attempts</option>
                        <option value="10">10 Attempts</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[13.5px] font-semibold text-gray-900 block mb-1">
                        Password Expiry
                      </label>
                      <select
                        value={securitySettings.passwordExpiryDays}
                        onChange={(e) => {
                          setSecuritySettings({ ...securitySettings, passwordExpiryDays: e.target.value });
                          markDirty();
                        }}
                        className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="90">90 Days</option>
                        <option value="180">180 Days</option>
                        <option value="never">Never</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
                    <div>
                      <div className="font-semibold text-[14px] text-gray-900">
                        Enforce Single Concurrent Login
                      </div>
                      <p className="text-[12.5px] text-gray-500 mt-0.5">
                        Terminates any older active session if a student logs in from another terminal.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.enforceSingleSession}
                        onChange={(e) => {
                          setSecuritySettings({ ...securitySettings, enforceSingleSession: e.target.checked });
                          markDirty();
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </Card>

              <Card title="CBT Centre Network & Whitelist">
                <div className="space-y-4 mt-2">
                  <div>
                    <label className="text-[13.5px] font-semibold text-gray-900 block mb-1">
                      Whitelisted Subnets (Exam Centers)
                    </label>
                    <Input
                      value={securitySettings.cbtSubnets}
                      onChange={(e) => {
                        setSecuritySettings({ ...securitySettings, cbtSubnets: e.target.value });
                        markDirty();
                      }}
                      placeholder="e.g. 192.168.1.0/24, 10.0.0.0/16"
                    />
                    <p className="text-[12px] text-gray-500 mt-1">
                      Only connections originating from these IP ranges can begin examination sessions.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleRegenerateApiKey}
                      className="cursor-pointer"
                    >
                      <KeyRound size={15} className="mr-1.5 text-blue-600" /> Regenerate API Keys
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleFlushSessions}
                      className="cursor-pointer hover:border-red-400 hover:text-red-700"
                    >
                      <RotateCcw size={15} className="mr-1.5" /> Flush Active Sessions
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* TAB 3: EXAM ENGINE DEFAULTS */}
          {activeTab === "exam-defaults" && (
            <>
              <Card title="Engine Configuration & Realtime Sync">
                <p className="text-[13px] text-gray-500 mb-4 pb-3 border-b border-gray-100">
                  Global defaults applied when new exams are created. Lecturers can override rules per exam.
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13.5px] font-semibold text-gray-900 block mb-1">
                        Autosave Interval (seconds)
                      </label>
                      <Input
                        type="number"
                        value={examDefaults.autosaveSeconds}
                        onChange={(e) => {
                          setExamDefaults({ ...examDefaults, autosaveSeconds: e.target.value });
                          markDirty();
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[13.5px] font-semibold text-gray-900 block mb-1">
                        Heartbeat Interval (seconds)
                      </label>
                      <Input
                        type="number"
                        value={examDefaults.heartbeatSeconds}
                        onChange={(e) => {
                          setExamDefaults({ ...examDefaults, heartbeatSeconds: e.target.value });
                          markDirty();
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[13.5px] font-semibold text-gray-900 block mb-1">
                      Clock Policy During Network Disconnection
                    </label>
                    <select
                      value={examDefaults.disconnectClockPolicy}
                      onChange={(e) => {
                        setExamDefaults({ ...examDefaults, disconnectClockPolicy: e.target.value });
                        markDirty();
                      }}
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="Keep timer running">Keep timer running (Strict CBT exam time)</option>
                      <option value="Pause timer until reconnect">Pause timer until reconnect (Graceful recovery)</option>
                    </select>
                  </div>
                </div>
              </Card>

              <Card title="Integrity, Randomization & Scoring">
                <div className="space-y-4 mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[13.5px] font-semibold text-gray-900 block mb-1">
                        Late-login grace (mins)
                      </label>
                      <Input
                        type="number"
                        value={examDefaults.lateLoginGraceMins}
                        onChange={(e) => {
                          setExamDefaults({ ...examDefaults, lateLoginGraceMins: e.target.value });
                          markDirty();
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[13.5px] font-semibold text-gray-900 block mb-1">
                        Late-login cutoff (mins)
                      </label>
                      <Input
                        type="number"
                        value={examDefaults.lateLoginCutoffMins}
                        onChange={(e) => {
                          setExamDefaults({ ...examDefaults, lateLoginCutoffMins: e.target.value });
                          markDirty();
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[13.5px] font-semibold text-gray-900 block mb-1">
                        Tab-switch flag limit
                      </label>
                      <Input
                        type="number"
                        value={examDefaults.tabSwitchLimit}
                        onChange={(e) => {
                          setExamDefaults({ ...examDefaults, tabSwitchLimit: e.target.value });
                          markDirty();
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50/50">
                      <div>
                        <div className="font-semibold text-[14px] text-gray-900">
                          Randomize Question Order
                        </div>
                        <p className="text-[12px] text-gray-500">Every student receives questions in a unique sequence.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={examDefaults.shuffleQuestions}
                          onChange={(e) => {
                            setExamDefaults({ ...examDefaults, shuffleQuestions: e.target.checked });
                            markDirty();
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50/50">
                      <div>
                        <div className="font-semibold text-[14px] text-gray-900">
                          Randomize Answer Options (A, B, C, D)
                        </div>
                        <p className="text-[12px] text-gray-500">Shuffles choices for multiple-choice questions.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={examDefaults.shuffleOptions}
                          onChange={(e) => {
                            setExamDefaults({ ...examDefaults, shuffleOptions: e.target.checked });
                            markDirty();
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50/50">
                      <div>
                        <div className="font-semibold text-[14px] text-gray-900">
                          Instant Student Result Display
                        </div>
                        <p className="text-[12px] text-gray-500">Show raw score immediately upon test completion.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={examDefaults.immediateResultDisplay}
                          onChange={(e) => {
                            setExamDefaults({ ...examDefaults, immediateResultDisplay: e.target.checked });
                            markDirty();
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
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
                  <div className="flex items-center justify-between p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
                    <div>
                      <div className="font-semibold text-[14px] text-gray-900">
                        Email Dispatch Gateway
                      </div>
                      <p className="text-[12.5px] text-gray-500 mt-0.5">
                        Transmits exam invitations, schedule notifications, and password reset links.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailEnabled}
                        onChange={(e) => {
                          setNotificationSettings({ ...notificationSettings, emailEnabled: e.target.checked });
                          markDirty();
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="text-[13.5px] font-semibold text-gray-900 block mb-1">
                      SMTP Relay Host
                    </label>
                    <Input
                      value={notificationSettings.smtpHost}
                      onChange={(e) => {
                        setNotificationSettings({ ...notificationSettings, smtpHost: e.target.value });
                        markDirty();
                      }}
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleSendTestNotification}
                      className="cursor-pointer"
                    >
                      <Mail size={15} className="mr-1.5 text-blue-600" /> Send Test Notification Email
                    </Button>
                  </div>
                </div>
              </Card>

              <Card title="Automated Event Triggers">
                <div className="space-y-3 mt-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50/50">
                    <div>
                      <div className="font-semibold text-[14px] text-gray-900">
                        Critical Server & Socket Alerts
                      </div>
                      <p className="text-[12px] text-gray-500">Alert sysadmins when gateway response latency exceeds 300ms.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.criticalHealthAlerts}
                        onChange={(e) => {
                          setNotificationSettings({ ...notificationSettings, criticalHealthAlerts: e.target.checked });
                          markDirty();
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50/50">
                    <div>
                      <div className="font-semibold text-[14px] text-gray-900">
                        Candidate Disconnection Alarms
                      </div>
                      <p className="text-[12px] text-gray-500">Notify the invigilator dashboard if a student drops offline for &gt; 60 seconds.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.studentDisconnectAlerts}
                        onChange={(e) => {
                          setNotificationSettings({ ...notificationSettings, studentDisconnectAlerts: e.target.checked });
                          markDirty();
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* TAB 5: DATA & BACKUPS */}
          {activeTab === "data" && (
            <>
              <Card title="Database Snapshots & Maintenance">
                <div className="space-y-4 mt-2">
                  <div className="flex items-center justify-between p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
                    <div>
                      <div className="font-semibold text-[14px] text-gray-900">
                        Daily Automated Snapshot
                      </div>
                      <p className="text-[12.5px] text-gray-500 mt-0.5">
                        Nightly backup performed automatically at {dataSettings.backupTime} Lagos Time.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dataSettings.autoDailyBackup}
                        onChange={(e) => {
                          setDataSettings({ ...dataSettings, autoDailyBackup: e.target.checked });
                          markDirty();
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13.5px] font-semibold text-gray-900 block mb-1">
                        Snapshot Retention Period
                      </label>
                      <select
                        value={dataSettings.retentionDays}
                        onChange={(e) => {
                          setDataSettings({ ...dataSettings, retentionDays: e.target.value });
                          markDirty();
                        }}
                        className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="30">30 Days</option>
                        <option value="90">90 Days (Recommended)</option>
                        <option value="365">1 Year</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[13.5px] font-semibold text-gray-900 block mb-1">
                        Backup Destination
                      </label>
                      <Input
                        value={dataSettings.backupStorage}
                        readOnly
                        className="bg-gray-50 text-gray-600"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                    <Button
                      type="button"
                      onClick={handleTriggerManualBackup}
                      className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    >
                      <Database size={15} className="mr-1.5" /> Backup Database Now
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handlePurgeCache}
                      className="cursor-pointer"
                    >
                      <RotateCcw size={15} className="mr-1.5" /> Clear Realtime Cache
                    </Button>
                  </div>
                </div>
              </Card>

              <Card title="Danger Zone">
                <div className="space-y-4 mt-2">
                  <div className="p-4 rounded-lg border border-red-200 bg-red-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-red-900 text-[14px]">Purge Mock Exam Sessions</h4>
                      <p className="text-[12.5px] text-red-700 mt-0.5">
                        Deletes simulated sandbox attempts while preserving actual verified grade records.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => showToast("Test exam sandbox data purged successfully.")}
                      className="shrink-0 cursor-pointer"
                    >
                      Purge Sandbox Data
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Floating Save Bar when Changes Exist */}
      {hasChanges && (
        <div className="fixed bottom-6 left-0 right-0 max-w-xl mx-auto bg-gray-900 text-white rounded-xl shadow-2xl p-4 flex items-center justify-between z-40 border border-gray-700 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-[13.5px] font-medium">You have unsaved changes</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="tertiary"
              onClick={handleDiscardChanges}
              className="text-gray-300 hover:text-white h-9"
            >
              Discard
            </Button>
            <Button
              type="button"
              onClick={handleSaveChanges}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 cursor-pointer"
            >
              Save changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
