"use client";

import * as React from "react";
import { useState, useMemo, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useApi, useDebounced, type PageMeta } from "@/lib/useApi";
import { useAction } from "@/lib/useAction";
import { apiClient, apiDownload } from "@/lib/apiClient";
import { useToast } from "@/components/ui/toast";
import { fmtDateTime, toCsv, parseCsv, downloadText, ROLE_LABEL } from "@/lib/format";
import {
  Search,
  Plus,
  Upload,
  Download,
  Clock,
  X,
  UserCheck,
  KeyRound,
  ShieldAlert,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  AlertCircle,
  Loader2,
  Check,
  BookOpen,
} from "lucide-react";

type RoleKey = "ADMIN" | "LECTURER" | "STUDENT";
type UserStatus = "INVITED" | "ACTIVE" | "LOCKED" | "DEACTIVATED";

interface ApiUser {
  id: string;
  names: string;
  matricNo: string | null;
  staffId: string | null;
  email: string | null;
  phone: string | null;
  status: UserStatus;
  departmentId: string | null;
  department: { id: string; name: string; code: string } | null;
  level?: number | null;
  roles: RoleKey[];
  primaryRole: RoleKey | null;
  lastLoginAt: string | null;
  createdAt: string;
}

interface StructureDepartment {
  id: string;
  code: string;
  name: string;
  active: boolean;
}
interface StructureCollege {
  id: string;
  code: string;
  name: string;
  departments: StructureDepartment[];
}

const ROLE_OPTIONS: { key: RoleKey; label: string }[] = [
  { key: "STUDENT", label: "Student" },
  { key: "LECTURER", label: "Lecturer" },
  { key: "ADMIN", label: "Administrator" },
];

const STATUS_OPTIONS: { key: UserStatus; label: string }[] = [
  { key: "ACTIVE", label: "Active" },
  { key: "INVITED", label: "Invited" },
  { key: "LOCKED", label: "Locked" },
  { key: "DEACTIVATED", label: "Deactivated" },
];

const statusLabel = (s: UserStatus) =>
  STATUS_OPTIONS.find((o) => o.key === s)?.label ?? s;

const initialsOf = (names: string) =>
  names
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

const identifierOf = (u: ApiUser) => u.matricNo ?? u.staffId ?? u.email ?? "—";

const PAGE_SIZE = 10;

type FormState = {
  names: string;
  roles: RoleKey[];
  matricNo: string;
  staffId: string;
  email: string;
  departmentId: string;
  level: number;
  password: string;
  status: UserStatus;
};

const EMPTY_FORM: FormState = {
  names: "",
  roles: ["STUDENT"],
  matricNo: "",
  staffId: "",
  email: "",
  departmentId: "",
  level: 100,
  password: "",
  status: "ACTIVE",
};

export default function UsersAndRoles() {
  const { toast } = useToast();
  const action = useAction();

  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Filters (server-side).
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounced(searchQuery, 350);
  const [roleFilter, setRoleFilter] = useState<"" | RoleKey>("");
  const [statusFilter, setStatusFilter] = useState<"" | UserStatus>("");
  const [currentPage, setCurrentPage] = useState(1);

  const query = useMemo(() => {
    const params = new URLSearchParams({
      page: String(currentPage),
      pageSize: String(PAGE_SIZE),
    });
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter) params.set("status", statusFilter);
    return params.toString();
  }, [currentPage, debouncedSearch, roleFilter, statusFilter]);

  const { data: users = [], meta, loading, error, reload } = useApi<ApiUser[]>(
    `/admin/users?${query}`,
  );

  // Departments power the create/edit dropdowns.
  const { data: colleges = [] } = useApi<StructureCollege[]>("/admin/structure");
  const departments = useMemo(
    () =>
      colleges
        .flatMap((c) => c.departments.map((d) => ({ ...d, college: c.name })))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [colleges],
  );

  // Reset to page 1 whenever a filter changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, roleFilter, statusFilter]);

  const pageMeta: PageMeta = meta ?? {
    page: currentPage,
    pageSize: PAGE_SIZE,
    total: users.length,
    totalPages: 1,
  };

  // Modals.
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [activeUserToEdit, setActiveUserToEdit] = useState<ApiUser | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [bulkRoleSelected, setBulkRoleSelected] = useState<RoleKey>("LECTURER");

  // Courses for assignment & enrollment
  const { data: allCourses = [] } = useApi<{
    id: string;
    code: string;
    title: string;
    level?: number;
    departmentId?: string;
    department?: { id: string; code: string; name: string } | null;
  }[]>("/admin/courses?status=active");
  const [assignedCourseIds, setAssignedCourseIds] = useState<string[]>([]);
  const [courseSearch, setCourseSearch] = useState<string>("");
  const [loadingUserCourses, setLoadingUserCourses] = useState<boolean>(false);

  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  // Selection helpers.
  const isAllCurrentSelected =
    users.length > 0 && users.every((u) => selectedUsers.has(u.id));
  const isSomeCurrentSelected =
    users.some((u) => selectedUsers.has(u.id)) && !isAllCurrentSelected;

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = isSomeCurrentSelected;
    }
  }, [isSomeCurrentSelected]);

  const toggleSelectAll = () => {
    const next = new Set(selectedUsers);
    if (isAllCurrentSelected) users.forEach((u) => next.delete(u.id));
    else users.forEach((u) => next.add(u.id));
    setSelectedUsers(next);
  };

  const toggleSelectUser = (id: string) => {
    const next = new Set(selectedUsers);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedUsers(next);
  };

  // Export the current filter set from the server.
  const handleExportCSV = async () => {
    try {
      await apiDownload(
        `/admin/users/export?${query}`,
        `LASUSTECH_Users_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      toast({ title: "Users exported", variant: "success" });
    } catch {
      toast({ title: "Could not export users", variant: "error" });
    }
  };

  // Create user.
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const isStudent = form.roles.includes("STUDENT");
    const isStaff = form.roles.includes("LECTURER") || form.roles.includes("ADMIN");
    await action.run<ApiUser, { temporaryPassword?: string }>("/admin/users", {
      method: "POST",
      body: JSON.stringify({
        names: form.names,
        roles: form.roles,
        matricNo: isStudent ? form.matricNo : undefined,
        staffId: isStudent ? undefined : form.staffId || undefined,
        email: form.email || undefined,
        departmentId: form.departmentId || undefined,
        level: isStudent ? Number(form.level) || 100 : undefined,
        status: form.status === "DEACTIVATED" ? "ACTIVE" : form.status,
        password: form.password || undefined,
      }),
      success: `${form.names} created`,
      onSuccess: async (created, meta) => {
        if (meta?.temporaryPassword) {
          toast({
            title: "Temporary password",
            description: `${meta.temporaryPassword} — share this now, it is not shown again.`,
            variant: "info",
            duration: 0,
          });
        }
        if (created?.id && assignedCourseIds.length > 0) {
          try {
            await apiClient(`/admin/users/${created.id}/courses`, {
              method: "PUT",
              body: JSON.stringify({ courseIds: assignedCourseIds }),
            });
          } catch {
            // Course assignment safe fail
          }
        }
        setIsAddUserOpen(false);
        setForm(EMPTY_FORM);
        setAssignedCourseIds([]);
        setCourseSearch("");
        void reload();
      },
    });
  };

  // Update user.
  const handleSaveSingleUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUserToEdit) return;
    const isStudent = form.roles.includes("STUDENT");
    const isStaff = form.roles.includes("LECTURER") || form.roles.includes("ADMIN");
    await action.run<ApiUser>(`/admin/users/${activeUserToEdit.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        names: form.names,
        roles: form.roles,
        matricNo: isStudent ? form.matricNo || null : null,
        staffId: isStudent ? null : form.staffId || null,
        email: form.email || null,
        departmentId: form.departmentId || null,
        level: isStudent ? Number(form.level) || 100 : undefined,
        status: form.status,
        password: form.password?.trim() ? form.password.trim() : undefined,
      }),
      success: `Saved changes for ${form.names}`,
      onSuccess: async () => {
        if (activeUserToEdit?.id) {
          try {
            await apiClient(`/admin/users/${activeUserToEdit.id}/courses`, {
              method: "PUT",
              body: JSON.stringify({ courseIds: assignedCourseIds }),
            });
          } catch (err: any) {
            toast({
              title: "Course assignment",
              description: err?.message || "Failed to update assigned courses.",
              variant: "error",
            });
          }
        }
        setIsEditUserOpen(false);
        setActiveUserToEdit(null);
        setAssignedCourseIds([]);
        setCourseSearch("");
        void reload();
      },
    });
  };

  const openEditUser = async (user: ApiUser) => {
    setActiveUserToEdit(user);
    setForm({
      names: user.names,
      roles: user.roles.length > 0 ? user.roles : ["STUDENT"],
      matricNo: user.matricNo ?? "",
      staffId: user.staffId ?? "",
      email: user.email ?? "",
      departmentId: user.departmentId ?? "",
      level: user.level ?? 100,
      password: "",
      status: user.status,
    });
    setCourseSearch("");
    setIsEditUserOpen(true);

    setLoadingUserCourses(true);
    try {
      const res = await apiClient<{ data: { courseIds: string[] } }>(`/admin/users/${user.id}/courses`);
      setAssignedCourseIds(res.data?.courseIds || []);
    } catch {
      setAssignedCourseIds([]);
    } finally {
      setLoadingUserCourses(false);
    }
  };

  const handleDeleteUser = async (user: ApiUser) => {
    await action.run<null>(`/admin/users/${user.id}`, {
      method: "DELETE",
      success: `${user.names} deleted`,
      onSuccess: () => {
        setIsEditUserOpen(false);
        setActiveUserToEdit(null);
        setSelectedUsers((prev) => {
          const next = new Set(prev);
          next.delete(user.id);
          return next;
        });
        void reload();
      },
    });
  };

  // Bulk actions.
  const runBulk = async (
    body: Record<string, unknown>,
    success: string,
  ) => {
    const ids = [...selectedUsers];
    if (!ids.length) return;
    await action.run<
      { action: string; affected: number; skipped: { id: string; name?: string; reason: string }[] },
      { credentials?: { id: string; names: string; identifier: string; temporaryPassword: string }[] }
    >("/admin/users/bulk", {
      method: "POST",
      body: JSON.stringify({ ...body, ids }),
      success,
      onSuccess: (result, meta) => {
        if (result.skipped.length) {
          toast({
            title: `${result.skipped.length} skipped`,
            description: result.skipped
              .slice(0, 3)
              .map((s) => `${s.name ?? s.id}: ${s.reason}`)
              .join(" · "),
            variant: "error",
          });
        }
        if (meta?.credentials?.length) {
          downloadText(
            `LASUSTECH_Temporary_Passwords_${new Date().toISOString().slice(0, 10)}.csv`,
            toCsv([
              ["Name", "Identifier", "Temporary password"],
              ...meta.credentials.map((c) => [c.names, c.identifier, c.temporaryPassword]),
            ]),
          );
        }
        setIsChangeRoleOpen(false);
        setSelectedUsers(new Set());
        void reload();
      },
    });
  };

  const handleSaveBulkRole = async (e: React.FormEvent) => {
    e.preventDefault();
    await runBulk({ action: "SET_ROLE", role: bulkRoleSelected }, `Role updated for ${selectedUsers.size} users`);
  };

  const handleBulkResetPassword = async () => {
    await runBulk(
      { action: "RESET_PASSWORD" },
      `Password reset for ${selectedUsers.size} users — temporary passwords downloaded`,
    );
  };

  const handleBulkToggleStatus = async () => {
    const selected = users.filter((u) => selectedUsers.has(u.id));
    const allActive = selected.length > 0 && selected.every((u) => u.status === "ACTIVE");
    await runBulk(
      { action: allActive ? "DEACTIVATE" : "ACTIVATE" },
      `${allActive ? "Deactivated" : "Activated"} ${selectedUsers.size} users`,
    );
  };

  const handleBulkDelete = async () => {
    await runBulk({ action: "DELETE" }, `Deleted ${selectedUsers.size} users`);
  };

  // CSV import (rows are parsed in the browser; the API validates them).
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImporting(true);
    try {
      const rows = parseCsv(await file.text());
      if (rows.length < 2) throw new Error("The file has no data rows.");
      const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/[\s_]+/g, ""));
      const index = (...names: string[]) => {
        for (const n of names) {
          const i = headers.indexOf(n);
          if (i >= 0) return i;
        }
        return -1;
      };
      const iName = index("name", "names", "fullname");
      const iRole = index("role", "roles");
      const iMatric = index("matricno", "matric", "matricnumber");
      const iStaff = index("staffid", "staff", "staffnumber");
      const iEmail = index("email", "emailaddress");
      const iDept = index("department", "dept");
      const iPassword = index("password");
      if (iName < 0 || iRole < 0) throw new Error("CSV needs at least Name and Role columns.");

      const body = rows.slice(1).map((r) => ({
        names: r[iName]?.trim(),
        role: r[iRole]?.trim(),
        matricNo: iMatric >= 0 ? r[iMatric]?.trim() : undefined,
        staffId: iStaff >= 0 ? r[iStaff]?.trim() : undefined,
        email: iEmail >= 0 ? r[iEmail]?.trim() : undefined,
        department: iDept >= 0 ? r[iDept]?.trim() : undefined,
        password: iPassword >= 0 ? r[iPassword]?.trim() : undefined,
      }));

      const result = await action.run<
        { total: number; created: number; failed: { row: number; reason: string }[] },
        { credentials?: { id: string; names: string; identifier: string; temporaryPassword: string }[] }
      >("/admin/users/import", {
        method: "POST",
        body: JSON.stringify({ rows: body, dryRun: false }),
        success: "Import finished",
        onSuccess: (data, meta) => {
          if (meta?.credentials?.length) {
            downloadText(
              `LASUSTECH_Imported_Credentials_${new Date().toISOString().slice(0, 10)}.csv`,
              toCsv([
                ["Name", "Identifier", "Temporary password"],
                ...meta.credentials.map((c) => [c.names, c.identifier, c.temporaryPassword]),
              ]),
            );
          }
          toast({
            title: `${data.created} of ${data.total} users created`,
            description: data.failed.length
              ? `${data.failed.length} row(s) failed — first: line ${data.failed[0].row}, ${data.failed[0].reason}`
              : "All rows imported.",
            variant: data.failed.length ? "error" : "success",
          });
          setIsImportOpen(false);
          void reload();
        },
      });
      return result;
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Could not read that file",
        variant: "error",
      });
    } finally {
      setImporting(false);
    }
  };

  const selectedCount = selectedUsers.size;

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Users and roles</h2>
          <p className="text-[14px] text-gray-500">Manage people, roles, and access control.</p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <Button type="button" variant="secondary" onClick={() => void handleExportCSV()} className="hover:border-blue-500 hover:text-blue-700">
            <Download className="mr-2" size={16} /> Export
          </Button>
          <Button type="button" variant="secondary" onClick={() => setIsImportOpen(true)} className="hover:border-blue-500 hover:text-blue-700">
            <Upload className="mr-2" size={16} /> Import CSV
          </Button>
          <Button type="button" onClick={() => { setForm(EMPTY_FORM); setIsAddUserOpen(true); }} className="bg-blue-600 hover:bg-blue-700 shadow-xs">
            <Plus className="mr-2" size={16} /> Add user
          </Button>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col relative">
        {/* Toolbar & Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-gray-50/70 items-center">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search name, matric, staff ID or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9.5 text-[13px] bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as "" | RoleKey)}
              className="h-9.5 rounded-[6px] border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All roles</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "" | UserStatus)}
              className="h-9.5 rounded-[6px] border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div role="alert" className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-gray-900">Couldn&apos;t load users</p>
              <p className="mt-0.5 text-[13px] text-gray-600">{error.message ?? "The server did not respond."}</p>
            </div>
            <button type="button" onClick={() => void reload()} className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 hover:bg-gray-50">
              Retry
            </button>
          </div>
        )}

        {/* Selection action bar */}
        {selectedCount > 0 && (
          <div className="px-5 py-3 bg-blue-50/90 border-b border-blue-200 text-blue-950 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center px-2.5 py-1 bg-blue-600 text-white font-semibold text-[12px] rounded-full shadow-2xs">
                {selectedCount} selected
              </span>
              <span className="text-[13px] text-blue-900 font-medium">
                {selectedCount === 1 ? "1 user chosen" : `${selectedCount} users chosen`}
              </span>
              <button type="button" onClick={() => setSelectedUsers(new Set())} className="text-[13px] text-blue-700 hover:text-blue-950 underline cursor-pointer font-medium ml-1">
                Deselect all
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsChangeRoleOpen(true)} className="bg-white hover:bg-blue-100 hover:border-blue-400 text-blue-900 h-8 text-[12px] font-medium">
                <UserCheck size={14} className="mr-1.5 text-blue-600" /> Change role
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => void handleBulkResetPassword()} disabled={action.pending} className="bg-white hover:bg-blue-100 hover:border-blue-400 text-blue-900 h-8 text-[12px] font-medium">
                <KeyRound size={14} className="mr-1.5 text-blue-600" /> Reset password
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => void handleBulkToggleStatus()} disabled={action.pending} className="bg-white hover:bg-amber-50 hover:border-amber-300 text-gray-800 h-8 text-[12px] font-medium">
                <ShieldAlert size={14} className="mr-1.5 text-amber-600" /> Toggle status
              </Button>
              <Button type="button" variant="danger-outline" size="sm" onClick={() => void handleBulkDelete()} disabled={action.pending} className="bg-white hover:bg-red-50 h-8 text-[12px] font-medium">
                <Trash2 size={14} className="mr-1.5" /> Delete
              </Button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-0 border-b border-gray-200 shadow-2xs">
              <tr>
                <th className="px-6 py-3.5 w-36">
                  <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-[13px] text-gray-900 hover:text-blue-700 transition-colors">
                    <input
                      type="checkbox"
                      ref={selectAllCheckboxRef}
                      checked={isAllCurrentSelected}
                      onChange={toggleSelectAll}
                      className="rounded-[4px] border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                    />
                    <span>Select all</span>
                  </label>
                </th>
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">Name &amp; ID</th>
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">Roles</th>
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">Department</th>
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">Last login</th>
                <th className="px-6 py-3.5 w-14 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-[14px]">
                    <Loader2 size={18} className="inline animate-spin mr-2" /> Loading users…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-[14px]">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelected = selectedUsers.has(u.id);
                  return (
                    <tr
                      key={u.id}
                      onClick={() => openEditUser(u)}
                      className={`transition-colors cursor-pointer ${isSelected ? "bg-blue-50/60 hover:bg-blue-100/50" : "hover:bg-gray-50/80"}`}
                    >
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectUser(u.id)}
                          className="rounded-[4px] border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                        />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] shrink-0 ${isSelected ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-900"}`}>
                            {initialsOf(u.names) || "U"}
                          </div>
                          <div>
                            <div className={`font-semibold text-[14px] ${u.status === "DEACTIVATED" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                              {u.names}
                            </div>
                            <div className="flex items-center gap-2 font-mono text-[12px] text-gray-500">
                              <span>{identifierOf(u)}</span>
                              {u.email && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-gray-500 lowercase">{u.email}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap max-w-[200px]">
                          {u.roles.map((role) => (
                            <span key={role} className="inline-flex px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[11px] font-semibold tracking-wide">
                              {ROLE_LABEL[role] ?? role}
                            </span>
                          ))}
                        </div>
                        <div className="mt-1">
                          <button
                            type="button"
                            onClick={() => openEditUser(u)}
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            <BookOpen size={11} /> {u.roles.includes("STUDENT") ? "Manage enrollments" : "Manage courses"}
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-[14px] text-gray-700">
                        <div>{u.department?.name ?? "—"}</div>
                        {u.level && u.roles.includes("STUDENT") && (
                          <span className="inline-block mt-0.5 text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                            {u.level} Level
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant={u.status === "ACTIVE" ? "success" : "default"}>
                          {statusLabel(u.status)}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-[13px] text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-gray-400 shrink-0" />
                          <span>{u.lastLoginAt ? fmtDateTime(u.lastLoginAt) : "Never"}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button type="button" variant="tertiary" size="sm" onClick={() => openEditUser(u)} className="h-8 px-2 text-gray-400 hover:text-blue-700">
                          <Edit2 size={15} />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[13px] text-gray-500 bg-white shrink-0">
          <span>
            Showing{" "}
            <strong className="text-gray-900">
              {pageMeta.total === 0 ? 0 : (pageMeta.page - 1) * pageMeta.pageSize + 1}
            </strong>{" "}
            to{" "}
            <strong className="text-gray-900">
              {Math.min(pageMeta.page * pageMeta.pageSize, pageMeta.total)}
            </strong>{" "}
            of <strong className="text-gray-900">{pageMeta.total}</strong> users
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-500 mr-2">
              Page {pageMeta.page} of {Math.max(1, pageMeta.totalPages)}
            </span>
            <Button type="button" variant="secondary" size="sm" disabled={currentPage <= 1 || loading} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="h-8 px-3">
              <ChevronLeft size={14} className="mr-1" /> Previous
            </Button>
            <Button type="button" variant="secondary" size="sm" disabled={currentPage >= pageMeta.totalPages || loading} onClick={() => setCurrentPage((p) => Math.min(pageMeta.totalPages, p + 1))} className="h-8 px-3">
              Next <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* MODAL 1: ADD USER */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><UserPlus size={18} /></div>
                <div>
                  <h3 className="text-[17px] font-semibold text-gray-900">Add user</h3>
                  <p className="text-[12px] text-gray-500">Create login credentials and roles</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsAddUserOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md"><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">Full Name <span className="text-red-500">*</span></label>
                <Input required value={form.names} onChange={(e) => setForm({ ...form, names: e.target.value })} />
                {action.fieldErrors.names && <p className="mt-1 text-[12px] text-red-600">{action.fieldErrors.names}</p>}
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1.5">
                  Assigned Role(s) <span className="text-red-500">*</span>
                  <span className="text-[11px] text-gray-500 font-normal ml-1.5">
                    (Staff can hold multiple roles, e.g. Lecturer + Administrator)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((r) => {
                    const isSelected = form.roles.includes(r.key);
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => {
                          if (r.key === "STUDENT") {
                            setForm({ ...form, roles: ["STUDENT"] });
                          } else {
                            const staffRoles = form.roles.filter((k) => k !== "STUDENT");
                            const next = isSelected
                              ? staffRoles.filter((k) => k !== r.key)
                              : [...staffRoles, r.key];
                            setForm({ ...form, roles: next.length > 0 ? next : ["LECTURER"] });
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                        }`}
                      >
                        {isSelected && <Check size={13} className="stroke-[3]" />}
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">Status</label>
                <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })}>
                  <option value="ACTIVE">Active</option>
                  <option value="INVITED">Invited</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {form.roles.includes("STUDENT") ? (
                  <div>
                    <label className="text-[13px] font-medium text-gray-700 block mb-1">Matric No <span className="text-red-500">*</span></label>
                    <Input required value={form.matricNo} onChange={(e) => setForm({ ...form, matricNo: e.target.value })} placeholder="e.g. CSC/2022/305" />
                    {action.fieldErrors.matricNo && <p className="mt-1 text-[12px] text-red-600">{action.fieldErrors.matricNo}</p>}
                  </div>
                ) : (
                  <div>
                    <label className="text-[13px] font-medium text-gray-700 block mb-1">Staff ID</label>
                    <Input value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })} placeholder="e.g. STAFF/089" />
                    {action.fieldErrors.staffId && <p className="mt-1 text-[12px] text-red-600">{action.fieldErrors.staffId}</p>}
                  </div>
                )}
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Email</label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@lasustech.edu.ng" />
                  {action.fieldErrors.email && <p className="mt-1 text-[12px] text-red-600">{action.fieldErrors.email}</p>}
                </div>
              </div>

              <div className={`grid gap-3 ${form.roles.includes("STUDENT") ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Department</label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.departmentId}
                    onChange={(e) => {
                      const deptId = e.target.value;
                      setForm({ ...form, departmentId: deptId });
                      if (deptId) {
                        const targetLvl = form.roles.includes("STUDENT") ? Number(form.level) || 100 : undefined;
                        const matching = allCourses.filter((c) => c.departmentId === deptId || c.department?.id === deptId);
                        const lvlCourses = matching.filter((c) => !targetLvl || !c.level || c.level === targetLvl);
                        const toAssign = lvlCourses.length > 0 ? lvlCourses : matching;
                        if (toAssign.length > 0) {
                          setAssignedCourseIds((prev) => Array.from(new Set([...prev, ...toAssign.map((c) => c.id)])));
                        }
                      }
                    }}
                  >
                    <option value="">No department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id} disabled={!d.active}>
                        {d.name} ({d.code}){d.active ? "" : " — archived"}
                      </option>
                    ))}
                  </select>
                </div>

                {form.roles.includes("STUDENT") && (
                  <div>
                    <label className="text-[13px] font-medium text-gray-700 block mb-1">
                      Academic Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      value={form.level}
                      onChange={(e) => {
                        const newLvl = Number(e.target.value);
                        setForm({ ...form, level: newLvl });
                        if (form.departmentId) {
                          const matching = allCourses
                            .filter(
                              (c) =>
                                (c.departmentId === form.departmentId || c.department?.id === form.departmentId) &&
                                (!c.level || c.level === newLvl)
                            )
                            .map((c) => c.id);
                          if (matching.length > 0) {
                            setAssignedCourseIds(matching);
                          }
                        }
                      }}
                    >
                      <option value={100}>100 Level</option>
                      <option value={200}>200 Level</option>
                      <option value={300}>300 Level</option>
                      <option value={400}>400 Level</option>
                      <option value={500}>500 Level</option>
                      <option value={600}>600 Level</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Course Assignment & Enrollment */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[13px] font-medium text-gray-800 flex items-center gap-1.5">
                    <BookOpen size={15} className="text-blue-600" />
                    {form.roles.includes("STUDENT") ? "Enrolled Courses" : "Assigned Courses"} ({assignedCourseIds.length})
                  </label>
                  <span className="text-[11px] text-gray-500">
                    {form.roles.includes("STUDENT")
                      ? "Student will be registered for exams in selected courses"
                      : "Staff will author & manage exams for selected courses"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-blue-600 mb-1 px-1">
                  <div className="flex items-center gap-2">
                    {form.departmentId && form.roles.includes("STUDENT") && (
                      <button
                        type="button"
                        onClick={() => {
                          const lvl = Number(form.level) || 100;
                          const lvlCourses = allCourses
                            .filter(
                              (c) =>
                                (c.departmentId === form.departmentId || c.department?.id === form.departmentId) &&
                                (!c.level || c.level === lvl)
                            )
                            .map((c) => c.id);
                          setAssignedCourseIds(lvlCourses.length > 0 ? lvlCourses : []);
                        }}
                        className="hover:underline font-semibold"
                      >
                        + Select {form.level}L dept courses
                      </button>
                    )}
                    {form.departmentId && (
                      <button
                        type="button"
                        onClick={() => {
                          const deptCourseIds = allCourses
                            .filter((c) => c.departmentId === form.departmentId || c.department?.id === form.departmentId)
                            .map((c) => c.id);
                          setAssignedCourseIds((prev) => Array.from(new Set([...prev, ...deptCourseIds])));
                        }}
                        className="hover:underline text-gray-500 font-medium"
                      >
                        + All dept courses
                      </button>
                    )}
                  </div>
                  {assignedCourseIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAssignedCourseIds([])}
                      className="text-red-500 hover:underline ml-auto"
                    >
                      Clear selection
                    </button>
                  )}
                </div>

                  {loadingUserCourses ? (
                    <div className="py-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin text-blue-600" /> Loading assignments...
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-2.5 bg-gray-50/50 space-y-2">
                      <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search courses by code or title..."
                          value={courseSearch}
                          onChange={(e) => setCourseSearch(e.target.value)}
                          className="w-full h-8 pl-8 pr-3 text-xs rounded border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                        {allCourses
                          .filter((c) => {
                            if (!courseSearch.trim()) return true;
                            const term = courseSearch.toLowerCase();
                            return (
                              c.code?.toLowerCase().includes(term) ||
                              c.title?.toLowerCase().includes(term)
                            );
                          })
                          .map((c) => {
                            const isChecked = assignedCourseIds.includes(c.id);
                            return (
                              <label
                                key={c.id}
                                className={`flex items-center justify-between p-2 rounded text-xs transition-colors cursor-pointer border ${
                                  isChecked
                                    ? "bg-blue-50/70 border-blue-200 text-blue-900 font-medium"
                                    : "bg-white border-gray-100 hover:bg-gray-50 text-gray-700"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      setAssignedCourseIds((prev) =>
                                        isChecked
                                          ? prev.filter((id) => id !== c.id)
                                          : [...prev, c.id]
                                      );
                                    }}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                                  />
                                  <span className="font-mono font-semibold">{c.code}</span>
                                  <span className="truncate max-w-[200px] text-gray-600">
                                    {c.title}
                                  </span>
                                </div>
                                {c.level && (
                                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                    {c.level}L
                                  </span>
                                )}
                              </label>
                            );
                          })}
                        {allCourses.length === 0 && (
                          <p className="text-[11px] text-gray-400 text-center py-2">
                            No courses found. Add courses in Academic Structure.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">Password</label>
                <Input type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Leave blank to generate one" />
                <p className="mt-1 text-[12px] text-gray-500">Students get a password derived from their name and matric number. Staff get a generated password shown once.</p>
                {action.fieldErrors.password && <p className="mt-1 text-[12px] text-red-600">{action.fieldErrors.password}</p>}
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={action.pending}>
                  {action.pending && <Loader2 size={14} className="mr-2 animate-spin" />} Create user
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK CHANGE ROLE */}
      {isChangeRoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-sm w-full overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><UserCheck size={18} /></div>
                <div>
                  <h3 className="text-[17px] font-semibold text-gray-900">Change role</h3>
                  <p className="text-[12px] text-gray-500">Apply role to {selectedCount} selected users</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsChangeRoleOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md"><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveBulkRole} className="p-5 space-y-4">
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">Select new role</label>
                <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" value={bulkRoleSelected} onChange={(e) => setBulkRoleSelected(e.target.value as RoleKey)}>
                  {ROLE_OPTIONS.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
                </select>
                <p className="mt-2 text-[12px] text-gray-500">This replaces the user&apos;s existing roles. Users without the required identifier (matric for students, staff ID/email for staff) are skipped.</p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setIsChangeRoleOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={action.pending}>
                  {action.pending && <Loader2 size={14} className="mr-2 animate-spin" />} Apply role
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: IMPORT CSV */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Upload size={18} /></div>
                <div>
                  <h3 className="text-[17px] font-semibold text-gray-900">Import CSV</h3>
                  <p className="text-[12px] text-gray-500">Bulk create users from a spreadsheet</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsImportOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-4">
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                disabled={importing || action.pending}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors bg-gray-50/50 cursor-pointer disabled:opacity-60"
              >
                {importing ? <Loader2 size={28} className="mx-auto text-blue-600 mb-2 animate-spin" /> : <Upload size={28} className="mx-auto text-blue-600 mb-2" />}
                <p className="text-[14px] font-medium text-gray-900">Click to choose a CSV file</p>
                <p className="text-[12px] text-gray-500 mt-1">Columns: Name, Role, Matric No, Staff ID, Email, Department, Password</p>
              </button>
              <p className="text-[12px] text-gray-500">
                Name and Role are required. Students need a Matric No; staff need a Staff ID or Email.
                Download the current directory with Export to see the expected columns.
              </p>
              <input ref={importInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => void handleImportFile(e)} />

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setIsImportOpen(false)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT USER */}
      {isEditUserOpen && activeUserToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Edit2 size={18} /></div>
                <div>
                  <h3 className="text-[17px] font-semibold text-gray-900">Edit user</h3>
                  <p className="text-[12px] text-gray-500">Update account details for {activeUserToEdit.names}</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsEditUserOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md"><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveSingleUser} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">Full Name <span className="text-red-500">*</span></label>
                <Input required value={form.names} onChange={(e) => setForm({ ...form, names: e.target.value })} />
                {action.fieldErrors.names && <p className="mt-1 text-[12px] text-red-600">{action.fieldErrors.names}</p>}
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1.5">
                  Assigned Role(s) <span className="text-red-500">*</span>
                  <span className="text-[11px] text-gray-500 font-normal ml-1.5">
                    (Staff can hold multiple roles, e.g. Lecturer + Administrator)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((r) => {
                    const isSelected = form.roles.includes(r.key);
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => {
                          if (r.key === "STUDENT") {
                            setForm({ ...form, roles: ["STUDENT"] });
                          } else {
                            const staffRoles = form.roles.filter((k) => k !== "STUDENT");
                            const next = isSelected
                              ? staffRoles.filter((k) => k !== r.key)
                              : [...staffRoles, r.key];
                            setForm({ ...form, roles: next.length > 0 ? next : ["LECTURER"] });
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                        }`}
                      >
                        {isSelected && <Check size={13} className="stroke-[3]" />}
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">Status</label>
                <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })}>
                  {STATUS_OPTIONS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {form.roles.includes("STUDENT") ? (
                  <div>
                    <label className="text-[13px] font-medium text-gray-700 block mb-1">Matric No <span className="text-red-500">*</span></label>
                    <Input required value={form.matricNo} onChange={(e) => setForm({ ...form, matricNo: e.target.value })} />
                  </div>
                ) : (
                  <div>
                    <label className="text-[13px] font-medium text-gray-700 block mb-1">Staff ID</label>
                    <Input value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })} />
                  </div>
                )}
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Email</label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>

              <div className={`grid gap-3 ${form.roles.includes("STUDENT") ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Department</label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.departmentId}
                    onChange={(e) => {
                      const deptId = e.target.value;
                      setForm({ ...form, departmentId: deptId });
                      if (deptId) {
                        const targetLvl = form.roles.includes("STUDENT") ? Number(form.level) || 100 : undefined;
                        const matching = allCourses.filter((c) => c.departmentId === deptId || c.department?.id === deptId);
                        const lvlCourses = matching.filter((c) => !targetLvl || !c.level || c.level === targetLvl);
                        const toAssign = lvlCourses.length > 0 ? lvlCourses : matching;
                        if (toAssign.length > 0) {
                          setAssignedCourseIds((prev) => Array.from(new Set([...prev, ...toAssign.map((c) => c.id)])));
                        }
                      }
                    }}
                  >
                    <option value="">No department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id} disabled={!d.active}>
                        {d.name} ({d.code}){d.active ? "" : " — archived"}
                      </option>
                    ))}
                  </select>
                </div>

                {form.roles.includes("STUDENT") && (
                  <div>
                    <label className="text-[13px] font-medium text-gray-700 block mb-1">
                      Academic Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      value={form.level}
                      onChange={(e) => {
                        const newLvl = Number(e.target.value);
                        setForm({ ...form, level: newLvl });
                        if (form.departmentId) {
                          const matching = allCourses
                            .filter(
                              (c) =>
                                (c.departmentId === form.departmentId || c.department?.id === form.departmentId) &&
                                (!c.level || c.level === newLvl)
                            )
                            .map((c) => c.id);
                          if (matching.length > 0) {
                            setAssignedCourseIds(matching);
                          }
                        }
                      }}
                    >
                      <option value={100}>100 Level</option>
                      <option value={200}>200 Level</option>
                      <option value={300}>300 Level</option>
                      <option value={400}>400 Level</option>
                      <option value={500}>500 Level</option>
                      <option value={600}>600 Level</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Course Assignment & Enrollment */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[13px] font-medium text-gray-800 flex items-center gap-1.5">
                    <BookOpen size={15} className="text-blue-600" />
                    {form.roles.includes("STUDENT") ? "Enrolled Courses" : "Assigned Courses"} ({assignedCourseIds.length})
                  </label>
                  <span className="text-[11px] text-gray-500">
                    {form.roles.includes("STUDENT")
                      ? "Student will be registered for exams in selected courses"
                      : "Staff will author & manage exams for selected courses"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-blue-600 mb-1 px-1">
                  <div className="flex items-center gap-2">
                    {form.departmentId && form.roles.includes("STUDENT") && (
                      <button
                        type="button"
                        onClick={() => {
                          const lvl = Number(form.level) || 100;
                          const lvlCourses = allCourses
                            .filter(
                              (c) =>
                                (c.departmentId === form.departmentId || c.department?.id === form.departmentId) &&
                                (!c.level || c.level === lvl)
                            )
                            .map((c) => c.id);
                          setAssignedCourseIds(lvlCourses.length > 0 ? lvlCourses : []);
                        }}
                        className="hover:underline font-semibold"
                      >
                        + Select {form.level}L dept courses
                      </button>
                    )}
                    {form.departmentId && (
                      <button
                        type="button"
                        onClick={() => {
                          const deptCourseIds = allCourses
                            .filter((c) => c.departmentId === form.departmentId || c.department?.id === form.departmentId)
                            .map((c) => c.id);
                          setAssignedCourseIds((prev) => Array.from(new Set([...prev, ...deptCourseIds])));
                        }}
                        className="hover:underline text-gray-500 font-medium"
                      >
                        + All dept courses
                      </button>
                    )}
                  </div>
                  {assignedCourseIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAssignedCourseIds([])}
                      className="text-red-500 hover:underline ml-auto"
                    >
                      Clear selection
                    </button>
                  )}
                </div>

                  {loadingUserCourses ? (
                    <div className="py-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin text-blue-600" /> Loading assignments...
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-2.5 bg-gray-50/50 space-y-2">
                      <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search courses by code or title..."
                          value={courseSearch}
                          onChange={(e) => setCourseSearch(e.target.value)}
                          className="w-full h-8 pl-8 pr-3 text-xs rounded border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                        {allCourses
                          .filter((c) => {
                            if (!courseSearch.trim()) return true;
                            const term = courseSearch.toLowerCase();
                            return (
                              c.code?.toLowerCase().includes(term) ||
                              c.title?.toLowerCase().includes(term)
                            );
                          })
                          .map((c) => {
                            const isChecked = assignedCourseIds.includes(c.id);
                            return (
                              <label
                                key={c.id}
                                className={`flex items-center justify-between p-2 rounded text-xs transition-colors cursor-pointer border ${
                                  isChecked
                                    ? "bg-blue-50/70 border-blue-200 text-blue-900 font-medium"
                                    : "bg-white border-gray-100 hover:bg-gray-50 text-gray-700"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      setAssignedCourseIds((prev) =>
                                        isChecked
                                          ? prev.filter((id) => id !== c.id)
                                          : [...prev, c.id]
                                      );
                                    }}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                                  />
                                  <span className="font-mono font-semibold">{c.code}</span>
                                  <span className="truncate max-w-[200px] text-gray-600">
                                    {c.title}
                                  </span>
                                </div>
                                {c.level && (
                                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                    {c.level}L
                                  </span>
                                )}
                              </label>
                            );
                          })}
                        {allCourses.length === 0 && (
                          <p className="text-[11px] text-gray-400 text-center py-2">
                            No courses found. Add courses in Academic Structure.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Change Password
                  <span className="text-[11px] text-gray-400 font-normal ml-1.5">(leave blank to keep current password)</span>
                </label>
                <Input
                  type="password"
                  placeholder="Enter new password (min. 6 characters)"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <p className="text-[12px] text-gray-500">
                Updating roles or setting a new password updates user credentials and revokes their active sessions immediately.
              </p>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <Button type="button" variant="danger-outline" onClick={() => void handleDeleteUser(activeUserToEdit)} disabled={action.pending} className="text-[13px]">
                  <Trash2 size={14} className="mr-1" /> Delete
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setIsEditUserOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={action.pending}>
                    {action.pending && <Loader2 size={14} className="mr-2 animate-spin" />} Save changes
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
