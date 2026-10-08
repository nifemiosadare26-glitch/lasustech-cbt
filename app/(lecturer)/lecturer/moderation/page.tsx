"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  Filter,
  X,
  MessageSquare,
  Clock,
  User,
  FileText,
  ChevronRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type ItemStatus = "Pending" | "Approved" | "Returned";

interface QueueItem {
  id: string;
  type: string;
  title: string;
  author: string;
  submitted: string;
  status: ItemStatus;
  course: string;
  questionCount: number;
  returnNote?: string;
}

interface SampleQuestion {
  text: string;
  options: string[];
  answer: string;
}

// ---------------------------------------------------------------------------
// Mock data – "Needs my review" items (peer submissions I must moderate)
// ---------------------------------------------------------------------------
const initialReviewQueue: QueueItem[] = [
  {
    id: "M1",
    type: "Exam",
    title: "CSC 301 Mid-Semester Examination",
    author: "Dr. Adeyemi",
    submitted: "2 hours ago",
    status: "Pending",
    course: "CSC 301 – Data Structures & Algorithms",
    questionCount: 50,
  },
  {
    id: "M2",
    type: "Question Batch",
    title: "CSC 305 Chapter 1–3 Quiz Bank",
    author: "Prof. Salami",
    submitted: "5 hours ago",
    status: "Pending",
    course: "CSC 305 – Software Engineering",
    questionCount: 30,
  },
  {
    id: "M3",
    type: "Exam",
    title: "MTH 201 Final Examination",
    author: "Dr. Okonkwo",
    submitted: "Yesterday",
    status: "Approved",
    course: "MTH 201 – Mathematical Methods",
    questionCount: 60,
  },
  {
    id: "M4",
    type: "Question Batch",
    title: "PHY 101 Introduction Quiz",
    author: "Dr. Fashola",
    submitted: "2 days ago",
    status: "Returned",
    course: "PHY 101 – General Physics",
    questionCount: 20,
    returnNote: "Please revise options for questions 4 and 7 – distractors are too obvious.",
  },
];

// ---------------------------------------------------------------------------
// Mock data – "My submissions" items (submitted by current user Dr. Bello)
// ---------------------------------------------------------------------------
const initialMySubmissions: QueueItem[] = [
  {
    id: "S1",
    type: "Question Batch",
    title: "CSC 305 Chapter 1–3 Quiz Bank",
    author: "Dr. Bello",
    submitted: "5 hours ago",
    status: "Pending",
    course: "CSC 305 – Software Engineering",
    questionCount: 30,
  },
  {
    id: "S2",
    type: "Exam",
    title: "CSC 401 Operating Systems Final",
    author: "Dr. Bello",
    submitted: "3 days ago",
    status: "Approved",
    course: "CSC 401 – Operating Systems",
    questionCount: 50,
  },
  {
    id: "S3",
    type: "Question Batch",
    title: "CSC 201 Intro to Programming Quiz",
    author: "Dr. Bello",
    submitted: "1 week ago",
    status: "Returned",
    course: "CSC 201 – Introduction to Programming",
    questionCount: 25,
    returnNote:
      "Questions 2, 8, and 15 have ambiguous wording. Please clarify the expected output in each case and resubmit.",
  },
  {
    id: "S4",
    type: "Exam",
    title: "CSC 303 Database Systems Mid-Semester",
    author: "Dr. Bello",
    submitted: "2 weeks ago",
    status: "Approved",
    course: "CSC 303 – Database Systems",
    questionCount: 40,
  },
];

// ---------------------------------------------------------------------------
// Sample questions used inside the slide-over preview
// ---------------------------------------------------------------------------
const sampleQuestions: Record<string, SampleQuestion[]> = {
  default: [
    {
      text: "Which of the following data structures uses the LIFO principle?",
      options: ["A. Queue", "B. Stack", "C. Linked List", "D. Tree"],
      answer: "B",
    },
    {
      text: "What is the time complexity of binary search on a sorted array of n elements?",
      options: ["A. O(n)", "B. O(n²)", "C. O(log n)", "D. O(1)"],
      answer: "C",
    },
    {
      text: "Which sorting algorithm has the best average-case time complexity?",
      options: ["A. Bubble Sort", "B. Insertion Sort", "C. Merge Sort", "D. Selection Sort"],
      answer: "C",
    },
  ],
};

// ---------------------------------------------------------------------------
// Helper: status badge variant
// ---------------------------------------------------------------------------
function statusBadge(status: ItemStatus) {
  if (status === "Approved")
    return <Badge variant="success">Approved</Badge>;
  if (status === "Returned")
    return <Badge variant="destructive">Returned</Badge>;
  return <Badge variant="warning">Pending Review</Badge>;
}

// ---------------------------------------------------------------------------
// Return Modal (small dialog)
// ---------------------------------------------------------------------------
interface ReturnModalProps {
  item: QueueItem;
  onClose: () => void;
  onSubmit: (note: string) => void;
}

function ReturnModal({ item, onClose, onSubmit }: ReturnModalProps) {
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (!note.trim()) return;
    onSubmit(note.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[16px] font-semibold text-gray-900">Return to Author</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Provide feedback for{" "}
              <span className="font-medium text-gray-700">{item.author}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
          <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wide">Submission</p>
          <p className="text-[14px] font-medium text-gray-900 mt-0.5">{item.title}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">
            Return note <span className="text-red-500">*</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Explain clearly what needs to be revised before re-submission..."
            rows={4}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[14px] text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {note.trim() === "" && (
            <p className="text-[12px] text-gray-400">A return note is required.</p>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            onClick={handleSubmit}
            disabled={!note.trim()}
          >
            Return Submission
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feedback Viewer Modal (for "My Submissions" tab – returned items)
// ---------------------------------------------------------------------------
interface FeedbackModalProps {
  item: QueueItem;
  onClose: () => void;
}

function FeedbackModal({ item, onClose }: FeedbackModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[16px] font-semibold text-gray-900">Moderator Feedback</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">{item.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-lg border border-red-100 bg-red-50 p-4 flex gap-3">
          <MessageSquare size={18} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[12px] font-semibold text-red-700 uppercase tracking-wide mb-1">
              Return Note
            </p>
            <p className="text-[14px] text-red-800 leading-relaxed">
              {item.returnNote ?? "No note provided."}
            </p>
          </div>
        </div>

        <p className="text-[13px] text-gray-500">
          Please address the feedback above and re-submit your batch for moderation.
        </p>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slide-over review panel
// ---------------------------------------------------------------------------
interface ReviewPanelProps {
  item: QueueItem;
  onClose: () => void;
  onApprove: () => void;
  onReturn: (note: string) => void;
}

function ReviewPanel({ item, onClose, onApprove, onReturn }: ReviewPanelProps) {
  const [returnNote, setReturnNote] = useState("");
  const questions = sampleQuestions["default"];

  const handleReturn = () => {
    if (!returnNote.trim()) return;
    onReturn(returnNote.trim());
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-gray-900 leading-tight">
                Review Submission
              </h2>
              <p className="text-[12px] text-gray-500">{item.course}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Title
              </span>
              <span className="text-[14px] font-medium text-gray-900">{item.title}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Type
              </span>
              <span className="text-[14px] text-gray-700">{item.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={14} className="text-gray-400" />
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 block">
                  Author
                </span>
                <span className="text-[14px] text-gray-700">{item.author}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-gray-400" />
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 block">
                  Submitted
                </span>
                <span className="text-[14px] text-gray-700">{item.submitted}</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Question preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-semibold text-gray-900">
                Sample Questions Preview
              </h3>
              <span className="text-[12px] text-gray-500">
                Showing 3 of {item.questionCount}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-gray-200 bg-gray-50/60 p-4"
                >
                  <p className="text-[13px] font-medium text-gray-800 mb-3">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold mr-2">
                      {idx + 1}
                    </span>
                    {q.text}
                  </p>
                  <div className="grid grid-cols-1 gap-1.5 pl-7">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`text-[13px] px-3 py-1.5 rounded-md ${
                          opt.startsWith(q.answer)
                            ? "bg-green-50 text-green-800 border border-green-200 font-medium"
                            : "text-gray-600"
                        }`}
                      >
                        {opt}
                        {opt.startsWith(q.answer) && (
                          <span className="ml-2 text-[11px] text-green-600 font-semibold">
                            ✓ correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Comment / Return note */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-gray-900">
              Comment / Return note
            </label>
            <p className="text-[12px] text-gray-500">
              Required if you choose to return this submission to the author.
            </p>
            <textarea
              value={returnNote}
              onChange={(e) => setReturnNote(e.target.value)}
              placeholder="Describe any issues or revision requests..."
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[14px] text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
            onClick={handleReturn}
            disabled={!returnNote.trim()}
          >
            <XCircle size={15} className="mr-2" />
            Return to Author
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onApprove}
          >
            <CheckCircle2 size={15} className="mr-2" />
            Approve All
          </Button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function ModerationQueue() {
  const [tab, setTab] = useState<"review" | "submissions">("review");
  const [searchQuery, setSearchQuery] = useState("");

  // Data state
  const [reviewQueue, setReviewQueue] = useState<QueueItem[]>(initialReviewQueue);
  const [mySubmissions] = useState<QueueItem[]>(initialMySubmissions);

  // Slide-over state
  const [reviewPanelItem, setReviewPanelItem] = useState<QueueItem | null>(null);

  // Return modal state (triggered by X icon button in table)
  const [returnModalItem, setReturnModalItem] = useState<QueueItem | null>(null);

  // Feedback viewer modal (My Submissions tab)
  const [feedbackItem, setFeedbackItem] = useState<QueueItem | null>(null);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------
  const approveItem = (id: string) => {
    setReviewQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Approved" } : item))
    );
    setReviewPanelItem(null);
  };

  const returnItem = (id: string, note: string) => {
    setReviewQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Returned", returnNote: note } : item
      )
    );
    setReviewPanelItem(null);
    setReturnModalItem(null);
  };

  // -------------------------------------------------------------------------
  // Filtered lists
  // -------------------------------------------------------------------------
  const filteredReview = reviewQueue.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubmissions = mySubmissions.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = reviewQueue.filter((i) => i.status === "Pending").length;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <>
      <div className="space-y-6 pb-12 flex flex-col h-full relative">
        {/* Page header */}
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">
            Moderation Queue
          </h2>
          <p className="text-[14px] text-gray-500 mt-1">
            Review peer submissions before they go live.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setTab("review")}
            className={`pb-3 text-[14px] font-medium border-b-2 transition-colors flex items-center gap-2 ${
              tab === "review"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Needs my review
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("submissions")}
            className={`pb-3 text-[14px] font-medium border-b-2 transition-colors ${
              tab === "submissions"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            My submissions
          </button>
        </div>

        {/* Card */}
        <Card className="flex-1 overflow-hidden flex flex-col" noPadding>
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-gray-50/50">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  tab === "review"
                    ? "Search by title or author..."
                    : "Search by title or course..."
                }
                className="pl-9 h-9"
              />
            </div>
            <Button variant="secondary" className="h-9">
              <Filter size={16} className="mr-2" />
              Filter
            </Button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto bg-white">
            {tab === "review" ? (
              /* ── Needs my review ── */
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white z-10 outline outline-1 outline-gray-200 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                      Type &amp; Title
                    </th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                      Submitted by
                    </th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredReview.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-[14px] text-gray-400"
                      >
                        No submissions match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredReview.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-[14px] text-gray-900">
                            {item.title}
                          </div>
                          <div className="text-[12px] text-gray-500 mt-0.5">
                            {item.type} · {item.questionCount} questions
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[14px] text-gray-700">
                          {item.author}
                        </td>
                        <td className="px-6 py-4 text-[13px] text-gray-500">
                          {item.submitted}
                        </td>
                        <td className="px-6 py-4">
                          {statusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.status === "Pending" ? (
                            <div className="flex justify-end gap-2">
                              {/* Review button → opens slide-over */}
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 text-gray-600"
                                onClick={() => setReviewPanelItem(item)}
                              >
                                <Eye size={14} className="mr-1.5" />
                                Review
                              </Button>
                              {/* Quick approve */}
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 text-green-600 hover:bg-green-50 border-green-200"
                                onClick={() => approveItem(item.id)}
                                title="Approve"
                              >
                                <CheckCircle2 size={14} />
                              </Button>
                              {/* Quick return → opens small modal */}
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 text-red-600 hover:bg-red-50 border-red-200"
                                onClick={() => setReturnModalItem(item)}
                                title="Return to author"
                              >
                                <XCircle size={14} />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8"
                              onClick={() => setReviewPanelItem(item)}
                            >
                              <Eye size={14} className="mr-1.5" />
                              View
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              /* ── My submissions ── */
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white z-10 outline outline-1 outline-gray-200 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                      Type &amp; Title
                    </th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-[14px] text-gray-400"
                      >
                        No submissions match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-[14px] text-gray-900">
                            {item.title}
                          </div>
                          <div className="text-[12px] text-gray-500 mt-0.5">
                            {item.type} · {item.questionCount} questions
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-gray-600">
                          {item.course}
                        </td>
                        <td className="px-6 py-4 text-[13px] text-gray-500">
                          {item.submitted}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            {statusBadge(item.status)}
                            {item.status === "Approved" && (
                              <span className="text-[11px] text-green-600">
                                ✓ Live &amp; available
                              </span>
                            )}
                            {item.status === "Pending" && (
                              <span className="text-[11px] text-amber-600">
                                Awaiting moderator
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.status === "Returned" ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 text-red-700 border-red-200 hover:bg-red-50"
                              onClick={() => setFeedbackItem(item)}
                            >
                              <MessageSquare size={14} className="mr-1.5" />
                              View feedback
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 text-gray-500"
                              disabled={item.status === "Pending"}
                            >
                              <ChevronRight size={14} className="mr-1" />
                              Details
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* ── Slide-over review panel ── */}
      {reviewPanelItem && (
        <ReviewPanel
          item={reviewPanelItem}
          onClose={() => setReviewPanelItem(null)}
          onApprove={() => approveItem(reviewPanelItem.id)}
          onReturn={(note) => returnItem(reviewPanelItem.id, note)}
        />
      )}

      {/* ── Return modal (X icon in table) ── */}
      {returnModalItem && (
        <ReturnModal
          item={returnModalItem}
          onClose={() => setReturnModalItem(null)}
          onSubmit={(note) => returnItem(returnModalItem.id, note)}
        />
      )}

      {/* ── Feedback viewer (My Submissions – returned) ── */}
      {feedbackItem && (
        <FeedbackModal
          item={feedbackItem}
          onClose={() => setFeedbackItem(null)}
        />
      )}
    </>
  );
}
