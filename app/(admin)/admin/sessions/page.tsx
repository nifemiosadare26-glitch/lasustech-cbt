"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Calendar,
  Clock,
  Edit2,
  ArrowRight,
  CheckCircle2,
  X,
  CalendarPlus,
  Archive,
  Download,
  AlertTriangle,
  Lock,
  Layers
} from "lucide-react";

interface SemesterInfo {
  name: string;
  status: "Active" | "Upcoming" | "Completed";
  dateRange: string;
  examsCount: number;
}

interface AcademicSessionItem {
  id: string;
  name: string;
  tag: "Next" | "Current" | "Closed";
  startText: string;
  dateRange: string;
  semesters: SemesterInfo[];
}

const initialSessions: AcademicSessionItem[] = [
  {
    id: "s_2027",
    name: "2027/2028 Session",
    tag: "Next",
    startText: "Starts Oct 2027",
    dateRange: "Oct 1, 2027 – Jul 30, 2028",
    semesters: [
      {
        name: "1st Semester",
        status: "Upcoming",
        dateRange: "Oct 1, 2027 – Feb 28, 2028",
        examsCount: 0,
      },
      {
        name: "2nd Semester",
        status: "Upcoming",
        dateRange: "Mar 15, 2028 – Jul 30, 2028",
        examsCount: 0,
      },
    ],
  },
  {
    id: "s_2026",
    name: "2026/2027 Session",
    tag: "Current",
    startText: "Oct 1, 2026 – Jul 30, 2027",
    dateRange: "Oct 1, 2026 – Jul 30, 2027",
    semesters: [
      {
        name: "1st Semester",
        status: "Active",
        dateRange: "Oct 1, 2026 – Feb 28, 2027",
        examsCount: 42,
      },
      {
        name: "2nd Semester",
        status: "Upcoming",
        dateRange: "Mar 15, 2027 – Jul 30, 2027",
        examsCount: 0,
      },
    ],
  },
  {
    id: "s_2025",
    name: "2025/2026 Session",
    tag: "Closed",
    startText: "Oct 1, 2025 – Jul 30, 2026",
    dateRange: "Oct 1, 2025 – Jul 30, 2026",
    semesters: [
      {
        name: "1st Semester",
        status: "Completed",
        dateRange: "Oct 1, 2025 – Feb 28, 2026",
        examsCount: 214,
      },
      {
        name: "2nd Semester",
        status: "Completed",
        dateRange: "Mar 15, 2026 – Jul 30, 2026",
        examsCount: 198,
      },
    ],
  },
];

export default function SessionsAndSemesters() {
  const [sessions, setSessions] = useState<AcademicSessionItem[]>(initialSessions);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [isSetupSemestersOpen, setIsSetupSemestersOpen] = useState(false);
  const [isEditDatesOpen, setIsEditDatesOpen] = useState(false);
  const [isCloseSessionOpen, setIsCloseSessionOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    name: "2028/2029 Session",
    startDate: "2028-10-01",
    endDate: "2029-07-30",
  });

  const [semestersForm, setSemestersForm] = useState({
    sem1Dates: "Oct 1, 2027 – Feb 28, 2028",
    sem2Dates: "Mar 15, 2028 – Jul 30, 2028",
  });

  const [editDatesForm, setEditDatesForm] = useState({
    sessionRange: "Oct 1, 2026 – Jul 30, 2027",
    sem1Dates: "Oct 1, 2026 – Feb 28, 2027",
    sem2Dates: "Mar 15, 2027 – Jul 30, 2027",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Create Session
  const handleCreateSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    const newSessionItem: AcademicSessionItem = {
      id: `s_${Date.now()}`,
      name: createForm.name,
      tag: "Next",
      startText: `Starts ${createForm.startDate.slice(0, 7)}`,
      dateRange: `${createForm.startDate} – ${createForm.endDate}`,
      semesters: [
        {
          name: "1st Semester",
          status: "Upcoming",
          dateRange: `${createForm.startDate} – ...`,
          examsCount: 0,
        },
        {
          name: "2nd Semester",
          status: "Upcoming",
          dateRange: `... – ${createForm.endDate}`,
          examsCount: 0,
        },
      ],
    };

    setSessions([newSessionItem, ...sessions]);
    setIsCreateSessionOpen(false);
    showToast(`Session "${createForm.name}" created successfully!`);
  };

  // 2. Setup Semesters
  const handleSaveSemesters = (e: React.FormEvent) => {
    e.preventDefault();
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== "s_2027") return s;
        return {
          ...s,
          semesters: [
            {
              ...s.semesters[0],
              dateRange: semestersForm.sem1Dates,
            },
            {
              ...s.semesters[1],
              dateRange: semestersForm.sem2Dates,
            },
          ],
        };
      })
    );
    setIsSetupSemestersOpen(false);
    showToast("Semesters schedule configured for 2027/2028 Session.");
  };

  // 3. Edit Current Dates
  const handleSaveCurrentDates = (e: React.FormEvent) => {
    e.preventDefault();
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== "s_2026") return s;
        return {
          ...s,
          dateRange: editDatesForm.sessionRange,
          startText: editDatesForm.sessionRange,
          semesters: [
            {
              ...s.semesters[0],
              dateRange: editDatesForm.sem1Dates,
            },
            {
              ...s.semesters[1],
              dateRange: editDatesForm.sem2Dates,
            },
          ],
        };
      })
    );
    setIsEditDatesOpen(false);
    showToast("Session dates updated successfully.");
  };

  // 4. Close Session
  const handleConfirmCloseSession = () => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === "s_2026") {
          return {
            ...s,
            tag: "Closed",
            semesters: s.semesters.map((sem) => ({ ...sem, status: "Completed" })),
          };
        }
        if (s.id === "s_2027") {
          return {
            ...s,
            tag: "Current",
          };
        }
        return s;
      })
    );
    setIsCloseSessionOpen(false);
    showToast("Session 2026/2027 marked as Closed. 2027/2028 is now Current.");
  };

  // 5. Download Archive Report
  const handleDownloadArchive = () => {
    const csvContent =
      "Session,Semester,Total Exams,Total Students,Pass Rate,Status\n" +
      "2025/2026,1st Semester,214,1420,91.2%,Completed\n" +
      "2025/2026,2nd Semester,198,1390,88.4%,Completed\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "LASUSTECH_Session_2025_2026_Archive.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Historical archive report downloaded!");
  };

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full max-w-5xl mx-auto relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl border border-gray-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />
          <span className="text-[14px] font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Sessions & Semesters</h2>
          <p className="text-[14px] text-gray-500 mt-1">Define academic sessions. Exams and results belong to one session.</p>
        </div>
        <Button
          type="button"
          onClick={() => setIsCreateSessionOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer"
        >
          <Plus className="mr-2" size={16} /> Create session
        </Button>
      </div>

      {/* Timeline Section */}
      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[28px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
        {sessions.map((sess) => {
          if (sess.tag === "Next") {
            return (
              <div
                key={sess.id}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-gray-50 bg-white text-gray-400 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Calendar size={24} />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-2">
                  <Card className="hover:border-blue-300 transition-colors border-dashed bg-gray-50/50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-[18px] font-bold text-gray-900">{sess.name}</h3>
                        <p className="text-[13px] text-gray-500 mt-1">{sess.startText}</p>
                      </div>
                      <Badge variant="default">Next</Badge>
                    </div>

                    <div className="space-y-2 mb-4 text-[13px] text-gray-600">
                      {sess.semesters.map((sem, idx) => (
                        <div key={idx} className="flex justify-between py-1 border-b border-gray-100 last:border-none">
                          <span className="font-medium text-gray-700">{sem.name}</span>
                          <span className="text-gray-500">{sem.dateRange}</span>
                        </div>
                      ))}
                    </div>

                    {/* Setup Semesters Button - Clickable */}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsSetupSemestersOpen(true)}
                      className="w-full hover:border-blue-500 hover:text-blue-700 cursor-pointer font-medium"
                    >
                      Setup semesters
                    </Button>
                  </Card>
                </div>
              </div>
            );
          }

          if (sess.tag === "Current") {
            return (
              <div
                key={sess.id}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-blue-50 bg-blue-600 text-white shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Clock size={24} />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-2">
                  <Card className="border-2 border-blue-500 shadow-sm relative overflow-hidden bg-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div>
                        <h3 className="text-[20px] font-bold text-gray-900">{sess.name}</h3>
                        <p className="text-[14px] text-gray-500 mt-1">{sess.dateRange}</p>
                      </div>
                      <Badge variant="blue-solid" className="shadow-sm">Current</Badge>
                    </div>

                    <div className="space-y-3 relative z-10">
                      {sess.semesters.map((sem, sIdx) => {
                        const isActive = sem.status === "Active";
                        return (
                          <div
                            key={sIdx}
                            className={`p-3 rounded-lg border ${
                              isActive
                                ? "border-blue-100 bg-blue-50/50"
                                : "border-gray-200 bg-gray-50/50"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className={`font-semibold text-[14px] ${isActive ? "text-blue-900" : "text-gray-700"}`}>
                                {sem.name}
                              </span>
                              <span
                                className={`text-[12px] px-2 py-0.5 rounded border ${
                                  isActive
                                    ? "text-blue-700 bg-white border-blue-100 font-medium"
                                    : "text-gray-500 bg-white border-gray-200"
                                }`}
                              >
                                {sem.status}
                              </span>
                            </div>
                            <div className={`text-[13px] flex justify-between ${isActive ? "text-gray-600" : "text-gray-500"}`}>
                              <span>{sem.dateRange}</span>
                              <span className={isActive ? "font-semibold text-gray-900" : ""}>
                                {sem.examsCount} exams
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Edit Dates & Close Session Buttons - Both Clickable */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2 relative z-10">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsEditDatesOpen(true)}
                        className="flex-1 hover:border-blue-500 hover:text-blue-700 cursor-pointer font-medium"
                      >
                        <Edit2 size={14} className="mr-2" /> Edit dates
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsCloseSessionOpen(true)}
                        className="flex-1 hover:border-amber-400 hover:text-amber-700 cursor-pointer font-medium"
                      >
                        Close session
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            );
          }

          // Closed / Past Session
          return (
            <div
              key={sess.id}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-gray-50 bg-white text-gray-400 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Calendar size={24} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-2">
                <Card className="opacity-80 hover:opacity-100 transition-opacity bg-white">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-[18px] font-bold text-gray-900">{sess.name}</h3>
                      <p className="text-[13px] text-gray-500 mt-1">{sess.dateRange}</p>
                    </div>
                    <Badge variant="gray-solid">Closed</Badge>
                  </div>

                  <div className="space-y-2">
                    {sess.semesters.map((sem, pIdx) => (
                      <div
                        key={pIdx}
                        className="flex justify-between text-[13px] border-b border-gray-100 pb-2 last:border-none last:pb-0"
                      >
                        <span className="text-gray-600 font-medium">{sem.name}</span>
                        <span className="text-gray-500">{sem.examsCount} exams</span>
                      </div>
                    ))}
                  </div>

                  {/* View Archive Button - Clickable */}
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="tertiary"
                      size="sm"
                      onClick={() => setIsArchiveModalOpen(true)}
                      className="w-full text-blue-700 hover:bg-blue-50 font-medium cursor-pointer"
                    >
                      View archive <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: CREATE SESSION */}
      {isCreateSessionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <CalendarPlus size={18} />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-gray-900">Create academic session</h3>
                  <p className="text-[12px] text-gray-500">Define year calendar and exam cycle</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateSessionOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSessionSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Session Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. 2028/2029 Session"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Start Date</label>
                  <Input
                    type="date"
                    required
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">End Date</label>
                  <Input
                    type="date"
                    required
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsCreateSessionOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create session</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SETUP SEMESTERS */}
      {isSetupSemestersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-gray-900">Setup semesters</h3>
                  <p className="text-[12px] text-gray-500">Configure semesters for 2027/2028 Session</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSetupSemestersOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSemesters} className="p-5 space-y-4">
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  1st Semester Dates (Harmattan)
                </label>
                <Input
                  required
                  value={semestersForm.sem1Dates}
                  onChange={(e) => setSemestersForm({ ...semestersForm, sem1Dates: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  2nd Semester Dates (Rain)
                </label>
                <Input
                  required
                  value={semestersForm.sem2Dates}
                  onChange={(e) => setSemestersForm({ ...semestersForm, sem2Dates: e.target.value })}
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsSetupSemestersOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save schedule</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT DATES */}
      {isEditDatesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-gray-900">Edit current dates</h3>
                  <p className="text-[12px] text-gray-500">Update calendar for 2026/2027 Session</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditDatesOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCurrentDates} className="p-5 space-y-4">
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Overall Session Span
                </label>
                <Input
                  required
                  value={editDatesForm.sessionRange}
                  onChange={(e) => setEditDatesForm({ ...editDatesForm, sessionRange: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  1st Semester Span
                </label>
                <Input
                  required
                  value={editDatesForm.sem1Dates}
                  onChange={(e) => setEditDatesForm({ ...editDatesForm, sem1Dates: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  2nd Semester Span
                </label>
                <Input
                  required
                  value={editDatesForm.sem2Dates}
                  onChange={(e) => setEditDatesForm({ ...editDatesForm, sem2Dates: e.target.value })}
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditDatesOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update dates</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CLOSE SESSION CONFIRMATION */}
      {isCloseSessionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5">
              <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <AlertTriangle size={22} />
              </div>
              <h3 className="text-[18px] font-semibold text-gray-900">Close 2026/2027 Session?</h3>
              <p className="text-[14px] text-gray-500 mt-2 leading-relaxed">
                Closing this session locks final grade submissions and transitions the active timeline. 
                Historical results will remain viewable in archives.
              </p>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsCloseSessionOpen(false)}
              >
                Keep active
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleConfirmCloseSession}
              >
                Confirm & Close session
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ARCHIVE DETAILS */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-gray-100 text-gray-700">
                  <Archive size={18} />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-gray-900">2025/2026 Archive</h3>
                  <p className="text-[12px] text-gray-500">Historical summary of closed academic session</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsArchiveModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-[14px]">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-lg border border-gray-100">
                <div>
                  <span className="text-[11px] text-gray-500 font-medium uppercase block">Total exams</span>
                  <span className="text-[18px] font-bold text-gray-900">412 exams</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 font-medium uppercase block">Pass rate</span>
                  <span className="text-[18px] font-bold text-emerald-600">89.8%</span>
                </div>
              </div>

              <div className="space-y-2 text-gray-600 text-[13px]">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>1st Semester (Harmattan)</span>
                  <span className="font-semibold text-gray-900">214 exams completed</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>2nd Semester (Rain)</span>
                  <span className="font-semibold text-gray-900">198 exams completed</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Participating Students</span>
                  <span className="font-semibold text-gray-900">2,810 candidates</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleDownloadArchive}
                  className="w-full text-blue-700 hover:border-blue-500 font-medium"
                >
                  <Download size={14} className="mr-1.5" /> Download archive summary
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
