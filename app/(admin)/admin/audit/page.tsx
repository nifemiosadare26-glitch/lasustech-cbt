"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApi, useDebounced, type PageMeta } from "@/lib/useApi";
import { apiClient, apiDownload } from "@/lib/apiClient";
import { useToast } from "@/components/ui/toast";
import { fmtDateTime, actionLabel } from "@/lib/format";
import { copyToClipboard as browserCopy } from "@/lib/browser";
import {
  Search,
  Download,
  Calendar,
  X,
  Copy,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Terminal,
} from "lucide-react";

type Category = "Create" | "Edit" | "Delete" | "Login" | "Intervention";

interface AuditLogItem {
  id: string;
  requestId: string;
  at: string;
  actorId: string | null;
  actorName: string;
  actorRole: string;
  action: string;
  category: Category;
  targetType: string;
  targetId: string;
  targetLabel: string | null;
  before: unknown;
  after: unknown;
  ip: string | null;
  userAgent: string | null;
}

const CATEGORIES: Category[] = ["Create", "Edit", "Delete", "Login", "Intervention"];

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function rangeFor(key: "today" | "7d" | "30d" | "all"): { from?: string; to?: string } {
  if (key === "all") return {};
  const now = new Date();
  if (key === "today") return { from: isoDay(now), to: isoDay(now) };
  const start = new Date(now);
  start.setDate(start.getDate() - (key === "7d" ? 6 : 29));
  return { from: isoDay(start), to: isoDay(now) };
}

const PAGE_SIZE = 10;

const categoryClass = (category: Category) =>
  category === "Create"
    ? "bg-blue-50 text-blue-800 border-blue-200"
    : category === "Delete"
      ? "bg-red-50 text-red-800 border-red-200"
      : category === "Intervention"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : "bg-gray-100 text-gray-800 border-gray-200";

export default function AuditLogs() {
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounced(searchQuery, 350);
  const [roleFilter, setRoleFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"" | Category>("");
  const [dateFilter, setDateFilter] = useState<"today" | "7d" | "30d" | "all">("30d");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [verifying, setVerifying] = useState(false);

  const range = useMemo(() => rangeFor(dateFilter), [dateFilter]);

  const query = useMemo(() => {
    const params = new URLSearchParams({
      page: String(currentPage),
      pageSize: String(PAGE_SIZE),
    });
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    if (roleFilter) params.set("role", roleFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    if (range.from) params.set("from", range.from);
    if (range.to) params.set("to", range.to);
    return params.toString();
  }, [currentPage, debouncedSearch, roleFilter, categoryFilter, range]);

  const { data: logs = [], meta, loading, error, reload } = useApi<AuditLogItem[]>(
    `/admin/audit?${query}`,
  );

  const pageMeta: PageMeta = meta ?? {
    page: currentPage,
    pageSize: PAGE_SIZE,
    total: logs.length,
    totalPages: 1,
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, roleFilter, categoryFilter, dateFilter]);

  const hasFilters =
    !!searchQuery || !!roleFilter || !!categoryFilter || dateFilter !== "30d";

  const resetFilters = () => {
    setSearchQuery("");
    setRoleFilter("");
    setCategoryFilter("");
    setDateFilter("30d");
    setCurrentPage(1);
  };

  const handleExportCSV = async () => {
    try {
      await apiDownload(
        `/admin/audit/export?${query}`,
        `LASUSTECH_Audit_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      toast({ title: "Audit log exported", variant: "success" });
    } catch {
      toast({ title: "Could not export the audit log", variant: "error" });
    }
  };

  const verifyChain = async () => {
    setVerifying(true);
    try {
      const result = await apiClient<{
        data: { ok: boolean; checked: number; brokenAt: string | null; reason: string | null };
      }>("/admin/audit/verify?limit=2000");
      const v = result.data;
      toast({
        title: v.ok ? "Audit chain verified" : "Audit chain is broken",
        description: v.ok
          ? `${v.checked} entries checked — no tampering detected.`
          : `Stopped at entry ${v.brokenAt}: ${v.reason}`,
        variant: v.ok ? "success" : "error",
        duration: v.ok ? 5000 : 0,
      });
    } catch {
      toast({ title: "Could not verify the audit chain", variant: "error" });
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    const ok = await browserCopy(text);
    if (ok) {
      toast({ title: "Request ID copied", variant: "success" });
    } else {
      toast({ title: "Copy failed", variant: "error" });
    }
  };

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Audit logs</h2>
          <p className="text-[14px] text-gray-500">Read-only, searchable record of every action in the system.</p>
        </div>
        <div className="flex gap-2.5">
          <Button type="button" variant="secondary" onClick={() => void verifyChain()} disabled={verifying} className="hover:border-emerald-500 hover:text-emerald-700 cursor-pointer shadow-2xs">
            <ShieldCheck className="mr-2" size={16} /> {verifying ? "Verifying…" : "Verify integrity"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => void handleExportCSV()} className="hover:border-blue-500 hover:text-blue-700 cursor-pointer shadow-2xs">
            <Download className="mr-2" size={16} /> Export CSV
          </Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-gray-50/60 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search user, action, target, request ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9.5 text-[13px] bg-white"
            />
          </div>

          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
              className="h-9.5 rounded-[6px] border border-gray-300 bg-white pl-8 pr-3 text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
            <Calendar size={14} className="text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9.5 rounded-[6px] border border-gray-300 bg-white px-3 text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="LECTURER">Lecturer</option>
            <option value="STUDENT">Student</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as "" | Category)}
            className="h-9.5 rounded-[6px] border border-gray-300 bg-white px-3 text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {hasFilters && (
            <button type="button" onClick={resetFilters} className="text-[12.5px] text-blue-600 hover:underline font-medium ml-1">
              Reset filters
            </button>
          )}
        </div>

        {error && (
          <div role="alert" className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-gray-900">Couldn&apos;t load the audit log</p>
              <p className="mt-0.5 text-[13px] text-gray-600">{error.message ?? "The server did not respond."}</p>
            </div>
            <button type="button" onClick={() => void reload()} className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 hover:bg-gray-50">
              Retry
            </button>
          </div>
        )}

        {/* Log Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-white z-10 border-b border-gray-200 shadow-2xs">
              <tr>
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">Request ID</th>
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">Time (Africa/Lagos)</th>
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">User &amp; Role</th>
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">Action</th>
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">Target</th>
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">IP &amp; Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-[14px]">Loading audit records…</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-[14px]">
                    No audit records match your search criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-blue-50/70 transition-colors cursor-pointer group"
                    title="Click to view complete event telemetry"
                  >
                    <td className="px-6 py-3.5 font-mono text-[12px] text-gray-500 group-hover:text-blue-700 font-medium">
                      {log.requestId}
                    </td>
                    <td className="px-6 py-3.5 text-[13px] text-gray-700">{fmtDateTime(log.at)}</td>
                    <td className="px-6 py-3.5">
                      <div className="text-[13.5px] font-semibold text-gray-900">{log.actorName}</div>
                      <div className="text-[12px] text-gray-500">{log.actorRole}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium border ${categoryClass(log.category)}`}>
                        {actionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[13.5px] text-gray-800 font-medium">
                      {log.targetLabel ?? `${log.targetType} ${log.targetId.slice(0, 8)}`}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-mono text-[12px] text-gray-600">{log.ip ?? "—"}</div>
                      <div className="text-[12px] text-gray-400 truncate max-w-[200px]">{log.userAgent ?? "—"}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[13px] text-gray-500 bg-white shrink-0">
          <span>
            Showing <strong className="text-gray-900">{pageMeta.total === 0 ? 0 : (pageMeta.page - 1) * pageMeta.pageSize + 1}</strong> to{" "}
            <strong className="text-gray-900">{Math.min(pageMeta.page * pageMeta.pageSize, pageMeta.total)}</strong> of{" "}
            <strong className="text-gray-900">{pageMeta.total}</strong> events
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-400 mr-2">Page {pageMeta.page} of {Math.max(1, pageMeta.totalPages)}</span>
            <Button type="button" variant="secondary" size="sm" disabled={currentPage <= 1 || loading} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="h-8 px-3 cursor-pointer">
              <ChevronLeft size={14} className="mr-1" /> Previous
            </Button>
            <Button type="button" variant="secondary" size="sm" disabled={currentPage >= pageMeta.totalPages || loading} onClick={() => setCurrentPage((p) => Math.min(pageMeta.totalPages, p + 1))} className="h-8 px-3 cursor-pointer">
              Next <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* MODAL: EVENT INSPECTOR */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Terminal size={18} /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] font-semibold text-gray-900 font-mono">{selectedLog.requestId}</h3>
                    <button type="button" onClick={() => void copyToClipboard(selectedLog.requestId)} className="text-gray-400 hover:text-blue-600 p-1" title="Copy Request ID">
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="text-[12px] text-gray-500">Security event verification detail</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md cursor-pointer"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Actor</span>
                  <span className="font-bold text-gray-900 text-[14px]">{selectedLog.actorName}</span>
                  <span className="text-gray-500 block text-[12px]">{selectedLog.actorRole}</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Timestamp</span>
                  <span className="font-semibold text-gray-900 text-[13px]">{fmtDateTime(selectedLog.at)}</span>
                  <span className="text-gray-400 font-mono text-[11px] block">{selectedLog.at}</span>
                </div>
              </div>

              <div className="space-y-2 text-[13px] border border-gray-100 rounded-lg p-3.5">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Action</span>
                  <span className="font-semibold text-gray-900">{actionLabel(selectedLog.action)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Category</span>
                  <span className="font-semibold text-blue-700">{selectedLog.category}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Target resource</span>
                  <span className="font-semibold text-gray-900">
                    {selectedLog.targetType} · {selectedLog.targetLabel ?? selectedLog.targetId}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">IP address</span>
                  <span className="font-mono text-gray-900 font-semibold">{selectedLog.ip ?? "—"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500 font-medium">Client agent</span>
                  <span className="text-gray-700 max-w-[60%] text-right break-words">{selectedLog.userAgent ?? "—"}</span>
                </div>
              </div>

              {(selectedLog.before != null || selectedLog.after != null) && (
                <div>
                  <span className="text-[12px] font-semibold text-gray-700 uppercase tracking-wider block mb-1.5">
                    Payload metadata (JSON)
                  </span>
                  <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-[12px] font-mono overflow-x-auto leading-relaxed">
                    {JSON.stringify({ before: selectedLog.before, after: selectedLog.after }, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <Button type="button" variant="secondary" onClick={() => setSelectedLog(null)} className="cursor-pointer">Close inspector</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
