"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Headphones,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  RefreshCw,
  Mail,
  Phone,
  User,
  Hash,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { fmtDateTime } from "@/lib/format";
import { Modal, useToast } from "@/components/admin/ui";

interface SupportTicket {
  id: string;
  referenceNo: string;
  name: string;
  identifier: string;
  email: string | null;
  phone: string | null;
  category: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  message: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  adminReply: string | null;
  repliedAt: string | null;
  repliedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSupportPage() {
  const toast = useToast();
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [categoryFilter, setCategoryFilter] = React.useState("ALL");

  // Selected ticket for inspect & reply
  const [selectedTicket, setSelectedTicket] = React.useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = React.useState("");
  const [replyStatus, setReplyStatus] = React.useState<"OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED">("RESOLVED");
  const [isSendingReply, setIsSendingReply] = React.useState(false);

  const fetchTickets = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (categoryFilter !== "ALL") params.append("category", categoryFilter);
      if (search.trim()) params.append("search", search.trim());

      const res = await apiClient<{ data: SupportTicket[] }>(`/admin/support?${params.toString()}`);
      setTickets(res.data || []);
    } catch (err: any) {
      toast.show(err.message || "Could not retrieve support docket.", "err");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, search, toast]);

  React.useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const openReplyModal = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setReplyText(ticket.adminReply || "");
    setReplyStatus(ticket.status === "OPEN" ? "RESOLVED" : ticket.status);
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    try {
      setIsSendingReply(true);
      await apiClient(`/admin/support/${selectedTicket.id}/reply`, {
        method: "POST",
        body: JSON.stringify({
          reply: replyText.trim(),
          status: replyStatus,
        }),
      });

      toast.show(`Official reply logged for #${selectedTicket.referenceNo}.`, "ok");
      setSelectedTicket(null);
      fetchTickets();
    } catch (err: any) {
      toast.show(err.message || "Could not log reply.", "err");
    } finally {
      setIsSendingReply(false);
    }
  };

  const counts = React.useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "OPEN").length;
    const inProg = tickets.filter((t) => t.status === "IN_PROGRESS").length;
    const resolved = tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length;
    return { total, open, inProg, resolved };
  }, [tickets]);

  return (
    <div className="space-y-6">
      {toast.node}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Headphones className="text-blue-600 dark:text-blue-400" size={24} />
            ICT Support & Helpdesk Docket
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review student inquiries, exam hall assistance requests, and issue official resolutions.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchTickets}
          disabled={loading}
          className="gap-2 shrink-0 bg-white dark:bg-slate-900"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Docket Items</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{counts.total}</p>
        </div>
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Open & Pending</p>
          <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 mt-1">{counts.open}</p>
        </div>
        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">In Progress</p>
          <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 mt-1">{counts.inProg}</p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Resolved</p>
          <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">{counts.resolved}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by student name, matric number, reference code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open (Needs Attention)</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Categories</option>
            <option value="EXAM_ACCESS">Exam Access</option>
            <option value="TECHNICAL">Technical Issue</option>
            <option value="PASSWORD_RESET">Password / Credentials</option>
            <option value="SCHEDULE">Exam Scheduling</option>
            <option value="OTHER">General Inquiry</option>
          </select>
        </div>
      </div>

      {/* Ticket List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-blue-600" size={28} />
            <p className="text-sm">Loading support tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Headphones className="mx-auto text-slate-400" size={36} />
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">No support tickets found</p>
            <p className="text-xs text-slate-400">All student issues and helpdesk requests are up to date.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Ref #</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Urgency</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-blue-700 dark:text-blue-400">
                      {t.referenceNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{t.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{t.identifier}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {t.category.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {t.priority === "URGENT" || t.priority === "HIGH" ? (
                        <Badge variant="danger" className="text-[10px] px-2 py-0.5">
                          {t.priority}
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-[10px] px-2 py-0.5">
                          NORMAL
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {t.status === "OPEN" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Clock size={12} /> Open
                        </span>
                      ) : t.status === "IN_PROGRESS" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          <RefreshCw size={12} className="animate-spin" /> In Progress
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 size={12} /> Resolved
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {fmtDateTime(t.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => openReplyModal(t)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3 rounded-lg"
                      >
                        Inspect & Reply
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <Modal
          title={`Support Ticket: #${selectedTicket.referenceNo}`}
          onClose={() => setSelectedTicket(null)}
          width="max-w-2xl"
        >
          <div className="space-y-5">
            {/* Ticket Candidate Info Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-2">
                <User size={14} className="text-slate-400" />
                <span className="text-slate-500">Name:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedTicket.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-slate-400" />
                <span className="text-slate-500">Matric/ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{selectedTicket.identifier}</span>
              </div>
              {selectedTicket.email && (
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-900 dark:text-slate-100">{selectedTicket.email}</span>
                </div>
              )}
              {selectedTicket.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <span className="text-slate-500">Phone:</span>
                  <span className="text-slate-900 dark:text-slate-100">{selectedTicket.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-slate-400" />
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold">{selectedTicket.category.replace(/_/g, " ")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                <span className="text-slate-500">Submitted:</span>
                <span>{fmtDateTime(selectedTicket.createdAt)}</span>
              </div>
            </div>

            {/* Candidate Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MessageSquare size={14} /> Student Message / Inquiry
              </label>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                {selectedTicket.message}
              </div>
            </div>

            {/* Previous Admin Reply if exists */}
            {selectedTicket.adminReply && (
              <div className="p-3.5 rounded-xl border border-emerald-300/40 bg-emerald-500/10 space-y-1 text-xs">
                <div className="flex items-center justify-between font-semibold text-emerald-800 dark:text-emerald-300">
                  <span>Previous Reply ({selectedTicket.repliedBy || "Admin"})</span>
                  <span>{selectedTicket.repliedAt ? fmtDateTime(selectedTicket.repliedAt) : ""}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedTicket.adminReply}</p>
              </div>
            )}

            {/* Reply Input Form */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Official Administrative Reply
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Update Status:</span>
                  <select
                    value={replyStatus}
                    onChange={(e) => setReplyStatus(e.target.value as any)}
                    className="h-8 px-2.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="OPEN">Keep Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              <textarea
                rows={4}
                required
                placeholder="Type your response to the student or notes on resolution..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full p-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-slate-100"
              />

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-400">
                  Recorded in administrative audit trail.
                </div>
                <div className="flex items-center gap-2.5">
                  <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendReply}
                    disabled={isSendingReply || !replyText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-semibold"
                  >
                    {isSendingReply ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Submit Official Reply
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
