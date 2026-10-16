"use client";

import * as React from "react";
import { useState, useMemo, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Upload,
  Download,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  X,
  UserCheck,
  KeyRound,
  ShieldAlert,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserPlus
} from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  staffId: string;
  email: string;
  roles: string[];
  dept: string;
  status: "Active" | "Deactivated";
  lastLogin: string;
}

const initialMockUsers: UserItem[] = [
  {
    id: "U1",
    name: "Dr. Adeyemi",
    staffId: "STAFF/001",
    email: "adeyemi@lasustech.edu.ng",
    roles: ["Admin", "Lecturer"],
    dept: "Computer Science",
    status: "Active",
    lastLogin: "Today, 09:12 AM"
  },
  {
    id: "U2",
    name: "Dr. Bello",
    staffId: "STAFF/042",
    email: "bello@lasustech.edu.ng",
    roles: ["Lecturer"],
    dept: "Computer Science",
    status: "Active",
    lastLogin: "Today, 08:30 AM"
  },
  {
    id: "U3",
    name: "Mr. Tunde",
    staffId: "STAFF/112",
    email: "tunde@lasustech.edu.ng",
    roles: ["Exam officer", "Invigilator"],
    dept: "Registry",
    status: "Active",
    lastLogin: "Yesterday"
  },
  {
    id: "U4",
    name: "Nifemi Osadare",
    staffId: "CSC/2022/305",
    email: "n.osadare@student.lasustech.edu.ng",
    roles: ["Student"],
    dept: "Computer Science",
    status: "Active",
    lastLogin: "Today, 11:45 AM"
  },
  {
    id: "U5",
    name: "John Doe",
    staffId: "CSC/2022/110",
    email: "j.doe@student.lasustech.edu.ng",
    roles: ["Student"],
    dept: "Computer Science",
    status: "Deactivated",
    lastLogin: "Oct 01, 2026"
  },
  {
    id: "U6",
    name: "Prof. O. Adebayo",
    staffId: "STAFF/015",
    email: "adebayo@lasustech.edu.ng",
    roles: ["Admin", "Lecturer"],
    dept: "Science",
    status: "Active",
    lastLogin: "Today, 07:45 AM"
  },
  {
    id: "U7",
    name: "Zainab Kolawole",
    staffId: "CSC/2022/130",
    email: "z.kolawole@student.lasustech.edu.ng",
    roles: ["Student"],
    dept: "Computer Science",
    status: "Active",
    lastLogin: "Yesterday"
  },
  {
    id: "U8",
    name: "Engr. F. Alabi",
    staffId: "STAFF/078",
    email: "alabi@lasustech.edu.ng",
    roles: ["Lecturer"],
    dept: "Mechanical Engineering",
    status: "Active",
    lastLogin: "Oct 04, 2026"
  },
  {
    id: "U9",
    name: "Mrs. K. Ibrahim",
    staffId: "STAFF/145",
    email: "k.ibrahim@lasustech.edu.ng",
    roles: ["Exam officer"],
    dept: "Registry",
    status: "Active",
    lastLogin: "Today, 10:15 AM"
  },
  {
    id: "U10",
    name: "Chinedu Madu",
    staffId: "CSC/2022/045",
    email: "c.madu@student.lasustech.edu.ng",
    roles: ["Student"],
    dept: "Computer Science",
    status: "Active",
    lastLogin: "Oct 03, 2026"
  }
];

export default function UsersAndRoles() {
  const [users, setUsers] = useState<UserItem[]>(initialMockUsers);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [activeUserToEdit, setActiveUserToEdit] = useState<UserItem | null>(null);

  // Form states
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    staffId: "",
    email: "",
    role: "Student",
    dept: "Computer Science",
    status: "Active" as "Active" | "Deactivated"
  });

  const [bulkRoleSelected, setBulkRoleSelected] = useState("Lecturer");

  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.dept.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter === "All roles" || u.roles.includes(roleFilter);

      const matchesStatus =
        statusFilter === "All statuses" || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Adjust page if out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Current page selection state
  const isAllCurrentSelected =
    paginatedUsers.length > 0 &&
    paginatedUsers.every((u) => selectedUsers.has(u.id));

  const isSomeCurrentSelected =
    paginatedUsers.some((u) => selectedUsers.has(u.id)) && !isAllCurrentSelected;

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = isSomeCurrentSelected;
    }
  }, [isSomeCurrentSelected]);

  // Toggle select all on current view
  const toggleSelectAll = () => {
    if (isAllCurrentSelected) {
      const next = new Set(selectedUsers);
      paginatedUsers.forEach((u) => next.delete(u.id));
      setSelectedUsers(next);
    } else {
      const next = new Set(selectedUsers);
      paginatedUsers.forEach((u) => next.add(u.id));
      setSelectedUsers(next);
    }
  };

  const toggleSelectUser = (id: string) => {
    const next = new Set(selectedUsers);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedUsers(next);
  };

  const handleClearSelection = () => {
    setSelectedUsers(new Set());
  };

  // 1. Export CSV
  const handleExportCSV = () => {
    const headers = "Name,Staff ID,Email,Roles,Department,Status,Last Login\n";
    const rows = (selectedUsers.size > 0
      ? users.filter((u) => selectedUsers.has(u.id))
      : users
    )
      .map(
        (u) =>
          `"${u.name}","${u.staffId}","${u.email}","${u.roles.join("; ")}","${u.dept}","${u.status}","${u.lastLogin}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `LASUSTECH_Users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(
      `Exported ${selectedUsers.size > 0 ? selectedUsers.size : users.length} users successfully!`
    );
  };

  // 2. Import CSV
  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsImportOpen(false);
    showToast("Imported 12 new users from CSV successfully!");
  };

  // 3. Add User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.staffId.trim()) return;

    const newUser: UserItem = {
      id: `U_${Date.now()}`,
      name: newUserForm.name,
      staffId: newUserForm.staffId,
      email: newUserForm.email || `${newUserForm.staffId.toLowerCase().replace(/[^a-z0-9]/g, "")}@lasustech.edu.ng`,
      roles: [newUserForm.role],
      dept: newUserForm.dept,
      status: newUserForm.status,
      lastLogin: "Just now"
    };

    setUsers([newUser, ...users]);
    setIsAddUserOpen(false);
    setNewUserForm({
      name: "",
      staffId: "",
      email: "",
      role: "Student",
      dept: "Computer Science",
      status: "Active"
    });
    showToast(`User "${newUser.name}" added to directory!`);
  };

  // 4. Bulk Role Change
  const handleSaveBulkRole = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers((prev) =>
      prev.map((u) => {
        if (!selectedUsers.has(u.id)) return u;
        return {
          ...u,
          roles: Array.from(new Set([bulkRoleSelected]))
        };
      })
    );
    setIsChangeRoleOpen(false);
    showToast(`Updated role to "${bulkRoleSelected}" for ${selectedUsers.size} users.`);
    setSelectedUsers(new Set());
  };

  // 5. Bulk Reset Password
  const handleBulkResetPassword = () => {
    showToast(`Password reset link dispatched to ${selectedUsers.size} user email addresses.`);
    setSelectedUsers(new Set());
  };

  // 6. Bulk Deactivate / Activate Toggle
  const handleBulkToggleStatus = () => {
    const selectedList = users.filter((u) => selectedUsers.has(u.id));
    const allActive = selectedList.every((u) => u.status === "Active");
    const targetStatus = allActive ? "Deactivated" : "Active";

    setUsers((prev) =>
      prev.map((u) =>
        selectedUsers.has(u.id) ? { ...u, status: targetStatus } : u
      )
    );

    showToast(
      `Marked ${selectedUsers.size} users as ${targetStatus}.`
    );
    setSelectedUsers(new Set());
  };

  // 7. Bulk Delete
  const handleBulkDelete = () => {
    setUsers((prev) => prev.filter((u) => !selectedUsers.has(u.id)));
    showToast(`Removed ${selectedUsers.size} users.`);
    setSelectedUsers(new Set());
  };

  // 8. Edit Single User
  const openEditUser = (user: UserItem) => {
    setActiveUserToEdit(user);
    setNewUserForm({
      name: user.name,
      staffId: user.staffId,
      email: user.email,
      role: user.roles[0] || "Student",
      dept: user.dept,
      status: user.status
    });
    setIsEditUserOpen(true);
  };

  const handleSaveSingleUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUserToEdit) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === activeUserToEdit.id
          ? {
              ...u,
              name: newUserForm.name,
              staffId: newUserForm.staffId,
              email: newUserForm.email,
              roles: [newUserForm.role],
              dept: newUserForm.dept,
              status: newUserForm.status
            }
          : u
      )
    );

    setIsEditUserOpen(false);
    showToast(`Saved changes for ${newUserForm.name}.`);
  };

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl border border-gray-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />
          <span className="text-[14px] font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Users and roles</h2>
          <p className="text-[14px] text-gray-500">Manage people, roles, and access control.</p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <Button
            type="button"
            variant="secondary"
            onClick={handleExportCSV}
            className="hover:border-blue-500 hover:text-blue-700"
          >
            <Download className="mr-2" size={16} /> Export
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsImportOpen(true)}
            className="hover:border-blue-500 hover:text-blue-700"
          >
            <Upload className="mr-2" size={16} /> Import CSV
          </Button>
          <Button
            type="button"
            onClick={() => setIsAddUserOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 shadow-xs"
          >
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
              placeholder="Search name, matric or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-9.5 text-[13px] bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9.5 rounded-[6px] border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option>All roles</option>
              <option>Admin</option>
              <option>Lecturer</option>
              <option>Exam officer</option>
              <option>Invigilator</option>
              <option>Student</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9.5 rounded-[6px] border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option>All statuses</option>
              <option>Active</option>
              <option>Deactivated</option>
            </select>
          </div>
        </div>

        {/* REDESIGNED SELECTION ACTION BAR - Integrated, Elegant & Modern (No harsh dark overlay) */}
        {selectedUsers.size > 0 && (
          <div className="px-5 py-3 bg-blue-50/90 border-b border-blue-200 text-blue-950 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center px-2.5 py-1 bg-blue-600 text-white font-semibold text-[12px] rounded-full shadow-2xs">
                {selectedUsers.size} selected
              </span>
              <span className="text-[13px] text-blue-900 font-medium">
                {selectedUsers.size === 1 ? "1 user chosen" : `${selectedUsers.size} users chosen`}
              </span>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-[13px] text-blue-700 hover:text-blue-950 underline cursor-pointer font-medium ml-1"
              >
                Deselect all
              </button>
            </div>

            {/* Clickable Bulk Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsChangeRoleOpen(true)}
                className="bg-white hover:bg-blue-100 hover:border-blue-400 text-blue-900 h-8 text-[12px] font-medium"
              >
                <UserCheck size={14} className="mr-1.5 text-blue-600" />
                Change role
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleBulkResetPassword}
                className="bg-white hover:bg-blue-100 hover:border-blue-400 text-blue-900 h-8 text-[12px] font-medium"
              >
                <KeyRound size={14} className="mr-1.5 text-blue-600" />
                Reset password
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleBulkToggleStatus}
                className="bg-white hover:bg-amber-50 hover:border-amber-300 text-gray-800 h-8 text-[12px] font-medium"
              >
                <ShieldAlert size={14} className="mr-1.5 text-amber-600" />
                Toggle status
              </Button>

              <Button
                type="button"
                variant="danger-outline"
                size="sm"
                onClick={handleBulkDelete}
                className="bg-white hover:bg-red-50 h-8 text-[12px] font-medium"
              >
                <Trash2 size={14} className="mr-1.5" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-0 border-b border-gray-200 shadow-2xs">
              <tr>
                {/* SELECT ALL COLUMN - Explicitly says "Select all" */}
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
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">Name & ID</th>
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">Roles</th>
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">Department</th>
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">Last login</th>
                <th className="px-6 py-3.5 w-14 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-[14px]">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isSelected = selectedUsers.has(u.id);
                  const nameParts = u.name.split(" ");
                  const initials = `${nameParts[0]?.[0] || ""}${nameParts[1]?.[0] || ""}`;

                  return (
                    <tr
                      key={u.id}
                      onClick={() => openEditUser(u)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-50/60 hover:bg-blue-100/50"
                          : "hover:bg-gray-50/80"
                      }`}
                    >
                      {/* Checkbox cell */}
                      <td
                        className="px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectUser(u.id)}
                          className="rounded-[4px] border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                        />
                      </td>

                      {/* Name & ID */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] shrink-0 ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-blue-100 text-blue-900"
                            }`}
                          >
                            {initials || "U"}
                          </div>
                          <div>
                            <div
                              className={`font-semibold text-[14px] ${
                                u.status === "Deactivated"
                                  ? "text-gray-400 line-through"
                                  : "text-gray-900"
                              }`}
                            >
                              {u.name}
                            </div>
                            <div className="flex items-center gap-2 font-mono text-[12px] text-gray-500">
                              <span>{u.staffId}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-gray-500 lowercase">{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Roles */}
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap max-w-[200px]">
                          {u.roles.map((role) => (
                            <span
                              key={role}
                              className="inline-flex px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[11px] font-semibold tracking-wide"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-4 text-[14px] text-gray-700">{u.dept}</td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <Badge variant={u.status === "Active" ? "success" : "default"}>
                          {u.status}
                        </Badge>
                      </td>

                      {/* Last login */}
                      <td className="px-6 py-4 text-[13px] text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-gray-400 shrink-0" />
                          <span>{u.lastLogin}</span>
                        </div>
                      </td>

                      {/* Edit Button */}
                      <td
                        className="px-6 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          type="button"
                          variant="tertiary"
                          size="sm"
                          onClick={() => openEditUser(u)}
                          className="h-8 px-2 text-gray-400 hover:text-blue-700"
                        >
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

        {/* Pagination footer with CLICKABLE Previous & Next */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[13px] text-gray-500 bg-white shrink-0">
          <span>
            Showing{" "}
            <strong className="text-gray-900">
              {filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </strong>{" "}
            to{" "}
            <strong className="text-gray-900">
              {Math.min(currentPage * pageSize, filteredUsers.length)}
            </strong>{" "}
            of <strong className="text-gray-900">{filteredUsers.length}</strong> users
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-500 mr-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 px-3"
            >
              <ChevronLeft size={14} className="mr-1" /> Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-3"
            >
              Next <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* MODAL 1: ADD USER */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-gray-900">Add user</h3>
                  <p className="text-[12px] text-gray-500">Create login credentials and roles</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Dr. Babatunde Lawal"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">
                    Staff / Matric ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. STAFF/089"
                    value={newUserForm.staffId}
                    onChange={(e) => setNewUserForm({ ...newUserForm, staffId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Role</label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  >
                    <option value="Student">Student</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Exam officer">Exam officer</option>
                    <option value="Admin">Administrator</option>
                    <option value="Invigilator">Invigilator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="b.lawal@lasustech.edu.ng"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Department</label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newUserForm.dept}
                    onChange={(e) => setNewUserForm({ ...newUserForm, dept: e.target.value })}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Registry">Registry</option>
                    <option value="Science">Science</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Status</label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newUserForm.status}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        status: e.target.value as "Active" | "Deactivated"
                      })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Deactivated">Deactivated</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsAddUserOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create user</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK CHANGE ROLE */}
      {isChangeRoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-gray-900">Change role</h3>
                  <p className="text-[12px] text-gray-500">Apply role to {selectedUsers.size} selected users</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChangeRoleOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBulkRole} className="p-5 space-y-4">
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Select new role
                </label>
                <select
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={bulkRoleSelected}
                  onChange={(e) => setBulkRoleSelected(e.target.value)}
                >
                  <option value="Admin">Administrator</option>
                  <option value="Lecturer">Lecturer</option>
                  <option value="Exam officer">Exam officer</option>
                  <option value="Invigilator">Invigilator</option>
                  <option value="Student">Student</option>
                </select>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsChangeRoleOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Apply role</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: IMPORT CSV */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Upload size={18} />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-gray-900">Import CSV</h3>
                  <p className="text-[12px] text-gray-500">Bulk create users from spreadsheet</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="p-5 space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors bg-gray-50/50 cursor-pointer">
                <Upload size={28} className="mx-auto text-blue-600 mb-2" />
                <p className="text-[14px] font-medium text-gray-900">
                  Click or drag CSV file here
                </p>
                <p className="text-[12px] text-gray-500 mt-1">
                  Supported format: .csv with Name, Staff ID, Role, Department
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsImportOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Upload & Import</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT USER / VIEW USER DETAILS */}
      {isEditUserOpen && activeUserToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-gray-900">Edit user</h3>
                  <p className="text-[12px] text-gray-500">Update account details for {activeUserToEdit.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditUserOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSingleUser} className="p-5 space-y-4">
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">
                    Staff / Matric ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    value={newUserForm.staffId}
                    onChange={(e) => setNewUserForm({ ...newUserForm, staffId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Role</label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  >
                    <option value="Student">Student</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Exam officer">Exam officer</option>
                    <option value="Admin">Administrator</option>
                    <option value="Invigilator">Invigilator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Department</label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newUserForm.dept}
                    onChange={(e) => setNewUserForm({ ...newUserForm, dept: e.target.value })}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Registry">Registry</option>
                    <option value="Science">Science</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Status</label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newUserForm.status}
                    onChange={(e) =>
                      setNewUserForm({
                        ...newUserForm,
                        status: e.target.value as "Active" | "Deactivated"
                      })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Deactivated">Deactivated</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="danger-outline"
                  onClick={() => {
                    setUsers((prev) => prev.filter((u) => u.id !== activeUserToEdit.id));
                    setIsEditUserOpen(false);
                    showToast(`User ${activeUserToEdit.name} deleted.`);
                  }}
                  className="text-[13px]"
                >
                  <Trash2 size={14} className="mr-1" /> Delete
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsEditUserOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save changes</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
