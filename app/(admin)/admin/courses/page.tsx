"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useApi } from "@/lib/useApi";
import { useAction } from "@/lib/useAction";
import { downloadText, toCsv } from "@/lib/format";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Archive,
  ArchiveRestore,
  GraduationCap,
  Building2,
  Users,
  CheckCircle2,
  Layers,
  Loader2,
  X,
  Download,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  RotateCcw,
} from "lucide-react";

interface StructureDepartment {
  id: string;
  code: string;
  name: string;
  collegeId: string;
  active: boolean;
}

interface StructureCollege {
  id: string;
  code: string;
  name: string;
  departments: StructureDepartment[];
}

interface CourseItem {
  id: string;
  code: string;
  title: string;
  units: number;
  level: number;
  semester: "FIRST" | "SECOND";
  active: boolean;
  departmentId: string;
  department?: { id: string; code: string; name: string } | null;
  lecturers: { id: string; names: string }[];
  studentCount?: number;
}

interface LecturerUser {
  id: string;
  names: string;
  email?: string | null;
  roles?: string[];
  staffId?: string | null;
}

type CourseFormData = {
  departmentId: string;
  code: string;
  title: string;
  units: number;
  level: number;
  semester: "FIRST" | "SECOND";
  active: boolean;
  lecturerIds: string[];
};

const DEFAULT_COURSE_FORM: CourseFormData = {
  departmentId: "",
  code: "",
  title: "",
  units: 3,
  level: 100,
  semester: "FIRST",
  active: true,
  lecturerIds: [],
};

export default function CourseManagementPage() {
  const action = useAction();

  // Filters state
  const [search, setSearch] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "ARCHIVED">("ALL");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [formData, setFormData] = useState<CourseFormData>(DEFAULT_COURSE_FORM);
  const [courseLecturerSearch, setCourseLecturerSearch] = useState("");
  const [deletingCourse, setDeletingCourse] = useState<CourseItem | null>(null);

  // Data fetching
  const rawCourses = useApi<CourseItem[]>("/admin/courses");
  const rawColleges = useApi<StructureCollege[]>("/admin/structure");
  const rawStaff = useApi<LecturerUser[]>("/admin/users?pageSize=200");

  const courses = useMemo(() => Array.isArray(rawCourses.data) ? rawCourses.data : [], [rawCourses.data]);
  const colleges = useMemo(() => Array.isArray(rawColleges.data) ? rawColleges.data : [], [rawColleges.data]);
  const staffList = useMemo(() => Array.isArray(rawStaff.data) ? rawStaff.data : [], [rawStaff.data]);

  const loadingCourses = rawCourses.loading;
  const reloadCourses = rawCourses.reload;
  const coursesError = rawCourses.error;

  const lecturers = useMemo(() => {
    return staffList.filter(
      (u) =>
        (Array.isArray(u.roles) && (u.roles.includes("LECTURER") || u.roles.includes("ADMIN"))) ||
        !!u.staffId ||
        !(Array.isArray(u.roles) && u.roles.includes("STUDENT") && u.roles.length === 1)
    );
  }, [staffList]);

  // Flattened departments with college name for clean select grouping
  const departments = useMemo(() => {
    return colleges
      .flatMap((col) =>
        (Array.isArray(col.departments) ? col.departments : []).map((d) => ({
          ...d,
          collegeName: col.name || "",
          collegeCode: col.code || "",
        }))
      )
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [colleges]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const codeMatches = c.code?.toLowerCase().includes(q);
        const titleMatches = c.title?.toLowerCase().includes(q);
        const deptMatches = c.department?.name?.toLowerCase().includes(q) || c.department?.code?.toLowerCase().includes(q);
        if (!codeMatches && !titleMatches && !deptMatches) return false;
      }
      if (selectedDeptId && c.departmentId !== selectedDeptId) {
        return false;
      }
      if (selectedLevel !== "ALL" && c.level !== Number(selectedLevel)) {
        return false;
      }
      if (selectedSemester !== "ALL" && c.semester !== selectedSemester) {
        return false;
      }
      if (statusFilter === "ACTIVE" && !c.active) return false;
      if (statusFilter === "ARCHIVED" && c.active) return false;
      return true;
    });
  }, [courses, search, selectedDeptId, selectedLevel, selectedSemester, statusFilter]);

  // Statistics
  const totalCourses = courses.length;
  const activeCourses = courses.filter((c) => c.active).length;
  const uniqueDepartmentsCount = useMemo(() => {
    return new Set(courses.map((c) => c.departmentId)).size;
  }, [courses]);
  const totalEnrolledStudents = useMemo(() => {
    return courses.reduce((acc, c) => acc + (c.studentCount ?? 0), 0);
  }, [courses]);

  // Handlers
  const handleOpenAdd = () => {
    setFormData({
      ...DEFAULT_COURSE_FORM,
      departmentId: selectedDeptId || (departments[0]?.id ?? ""),
    });
    setCourseLecturerSearch("");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (course: CourseItem) => {
    setEditingCourse(course);
    setFormData({
      departmentId: course.departmentId,
      code: course.code,
      title: course.title,
      units: course.units,
      level: course.level,
      semester: course.semester,
      active: course.active,
      lecturerIds: course.lecturers?.map((l) => l.id) || [],
    });
    setCourseLecturerSearch("");
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingCourse(null);
    setFormData(DEFAULT_COURSE_FORM);
    setCourseLecturerSearch("");
  };

  const handleSubmitCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.departmentId) {
      return;
    }

    const payload = {
      departmentId: formData.departmentId,
      code: formData.code.trim().toUpperCase(),
      title: formData.title.trim(),
      units: Number(formData.units),
      level: Number(formData.level),
      defaultSemester: formData.semester,
      active: formData.active,
      lecturerIds: formData.lecturerIds,
    };

    if (editingCourse) {
      await action.run(`/admin/courses/${editingCourse.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        success: `Course ${payload.code} updated successfully`,
        onSuccess: () => {
          handleCloseModal();
          void reloadCourses();
        },
      });
    } else {
      await action.run("/admin/courses", {
        method: "POST",
        body: JSON.stringify(payload),
        success: `Course ${payload.code} created successfully`,
        onSuccess: () => {
          handleCloseModal();
          void reloadCourses();
        },
      });
    }
  };

  const handleToggleActive = async (course: CourseItem) => {
    const nextState = !course.active;
    await action.run(`/admin/courses/${course.id}`, {
      method: "PATCH",
      body: JSON.stringify({ active: nextState }),
      success: `Course ${course.code} ${nextState ? "activated" : "archived"}`,
      onSuccess: () => {
        void reloadCourses();
      },
    });
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourse) return;
    await action.run(`/admin/courses/${deletingCourse.id}`, {
      method: "DELETE",
      success: `Course ${deletingCourse.code} deleted successfully`,
      onSuccess: () => {
        setDeletingCourse(null);
        void reloadCourses();
      },
    });
  };

  const handleExportCsv = () => {
    const headers = [
      "Code",
      "Title",
      "Department",
      "Department Code",
      "Level",
      "Credit Units",
      "Semester",
      "Status",
      "Lecturers",
      "Enrolled Students",
    ];
    const rows = filteredCourses.map((c) => [
      c.code,
      c.title,
      c.department?.name || "",
      c.department?.code || "",
      `${c.level}L`,
      c.units,
      c.semester === "FIRST" ? "1st Semester" : "2nd Semester",
      c.active ? "Active" : "Archived",
      c.lecturers.map((l) => l.names).join("; "),
      c.studentCount ?? 0,
    ]);
    const csv = toCsv([headers, ...rows]);
    downloadText(`lasustech-courses-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Course Management
            </h1>
            <Badge variant="blue-tint" className="text-xs">
              {totalCourses} total
            </Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure academic courses, credit units, departmental assignments, and designated examiners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleExportCsv}
            disabled={filteredCourses.length === 0}
            className="text-xs flex items-center gap-1.5"
          >
            <Download size={14} />
            Export CSV
          </Button>

          <Button
            type="button"
            onClick={handleOpenAdd}
            className="text-xs flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus size={15} />
            Add Course
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {coursesError && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-4 text-rose-800 dark:text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span className="text-sm font-medium">{coursesError.message || "Failed to load courses. Please retry."}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => void reloadCourses()} className="text-xs">
            <RefreshCw size={13} className="mr-1.5" /> Retry
          </Button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Courses</span>
            <BookOpen size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{totalCourses}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Across all departments</p>
        </Card>

        <Card className="p-4 bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Active Courses</span>
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeCourses}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Available for registration & exams</p>
        </Card>

        <Card className="p-4 bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Depts Covered</span>
            <Building2 size={16} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">{uniqueDepartmentsCount}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">With configured curricula</p>
        </Card>

        <Card className="p-4 bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Enrolled</span>
            <GraduationCap size={16} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">{totalEnrolledStudents}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Students across all courses</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white border border-gray-200 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by course code, title, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* Department Filter */}
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="h-9 px-2.5 text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>

            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="h-9 px-2.5 text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Levels</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
              <option value="500">500 Level</option>
              <option value="600">600 Level</option>
            </select>

            {/* Semester Filter */}
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="h-9 px-2.5 text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Semesters</option>
              <option value="FIRST">1st Semester</option>
              <option value="SECOND">2nd Semester</option>
            </select>
          </div>
        </div>

        {/* Status Tabs & Active Count */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700/60 pt-2.5 text-xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                statusFilter === "ALL"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              All ({courses.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                statusFilter === "ACTIVE"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Active ({activeCourses})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("ARCHIVED")}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                statusFilter === "ARCHIVED"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Archived ({totalCourses - activeCourses})
            </button>
          </div>

          <span className="text-gray-500 dark:text-gray-400 text-[11px]">
            Showing <strong className="text-gray-700 dark:text-gray-200">{filteredCourses.length}</strong> matching
          </span>
        </div>
      </Card>

      {/* Courses List / Table */}
      <Card className="bg-white border border-gray-200 overflow-hidden shadow-sm">
        {loadingCourses ? (
          <div className="py-16 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-2">
            <Loader2 size={24} className="animate-spin text-blue-600" />
            <p className="text-xs">Loading university course catalog...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="py-16 text-center text-gray-500 dark:text-gray-400 space-y-3">
            <BookOpen size={36} className="mx-auto text-gray-300 dark:text-gray-600" />
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">No courses match your filter</div>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Adjust search terms, change department/level selection, or click "Add Course" to register a new course into the system.
            </p>
            {(search || selectedDeptId || selectedLevel !== "ALL" || selectedSemester !== "ALL" || statusFilter !== "ALL") && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setSelectedDeptId("");
                  setSelectedLevel("ALL");
                  setSelectedSemester("ALL");
                  setStatusFilter("ALL");
                }}
                className="text-xs mt-2"
              >
                <RotateCcw size={12} className="mr-1.5" /> Reset all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/75 dark:bg-gray-900/50 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-3 text-center">Level</th>
                  <th className="py-3 px-3 text-center">Units</th>
                  <th className="py-3 px-3 text-center">Semester</th>
                  <th className="py-3 px-4">Lecturers</th>
                  <th className="py-3 px-3 text-center">Students</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredCourses.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-gray-50/80 dark:hover:bg-gray-750/50 transition-colors ${
                      !c.active ? "opacity-65 bg-gray-50/30 dark:bg-gray-900/20" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-gray-900 dark:text-gray-100 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                        {c.code}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{c.title}</div>
                    </td>

                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      {c.department ? (
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-200">{c.department.name}</div>
                          <span className="text-[10px] text-gray-400 font-mono">({c.department.code})</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No department assigned</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {c.level}L
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                      {c.units} <span className="text-[10px] text-gray-400 font-normal">units</span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="text-[11px] text-gray-600 dark:text-gray-400">
                        {c.semester === "FIRST" ? "1st Sem" : "2nd Sem"}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {c.lecturers && c.lecturers.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {c.lecturers.map((l) => (
                            <span
                              key={l.id}
                              className="inline-flex items-center gap-1 text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300"
                            >
                              <Users size={10} className="text-blue-500" />
                              <span className="truncate max-w-[120px]">{l.names}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[11px] italic">None assigned</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-[11px] bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                        <GraduationCap size={12} className="text-purple-600 dark:text-purple-400" />
                        {c.studentCount ?? 0}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {c.active ? (
                        <Badge variant="success" className="text-[10px] py-0 px-1.5">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="text-[10px] py-0 px-1.5">
                          Archived
                        </Badge>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleOpenEdit(c)}
                          title="Edit course details"
                          className="h-7 w-7 p-0 text-gray-600 hover:text-blue-600 dark:text-gray-400"
                        >
                          <Edit2 size={13} />
                        </Button>

                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => void handleToggleActive(c)}
                          title={c.active ? "Archive course" : "Restore course"}
                          className="h-7 w-7 p-0 text-gray-600 hover:text-amber-600 dark:text-gray-400"
                        >
                          {c.active ? <Archive size={13} /> : <ArchiveRestore size={13} />}
                        </Button>

                        <Button
                          type="button"
                          variant="danger-outline"
                          onClick={() => setDeletingCourse(c)}
                          title="Delete course"
                          className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Course Modal */}
      {(isAddModalOpen || editingCourse) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-blue-600" />
                <h2 className="text-base font-semibold text-gray-900">
                  {editingCourse ? `Edit Course — ${editingCourse.code}` : "Add New Course"}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-700 hover:bg-black/5 dark:hover:bg-white/10 p-1.5 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitCourse} className="p-5 space-y-4 text-xs">
              {/* Department */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an Academic Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id} disabled={!d.active}>
                      {d.name} ({d.code}) {d.active ? "" : "— archived"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Code & Title */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                    Course Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. CSC 201"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="font-mono uppercase text-xs h-9"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                    Course Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Data Structures and Algorithms"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              {/* Units, Level, Semester */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                    Credit Units
                  </label>
                  <select
                    value={formData.units}
                    onChange={(e) => setFormData({ ...formData, units: Number(e.target.value) })}
                    className="w-full h-9 px-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map((u) => (
                      <option key={u} value={u}>
                        {u} Units
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                    Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                    className="w-full h-9 px-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[100, 200, 300, 400, 500, 600].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl} Level
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                    Default Semester
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value as "FIRST" | "SECOND" })}
                    className="w-full h-9 px-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="FIRST">1st Semester</option>
                    <option value="SECOND">2nd Semester</option>
                  </select>
                </div>
              </div>

              {/* Status active */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="courseActiveCheck"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="courseActiveCheck" className="text-gray-700 dark:text-gray-300 cursor-pointer font-medium">
                  Active course offering (available for student registration & exam scheduling)
                </label>
              </div>

              {/* Designated Lecturers */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <Users size={14} className="text-blue-600" />
                    Designated Lecturers ({formData.lecturerIds.length})
                  </label>
                  <span className="text-[11px] text-gray-400">
                    Lecturers will be authorized to author & oversee exams
                  </span>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 bg-gray-50/50 dark:bg-gray-900/40 space-y-2">
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search lecturers by name..."
                      value={courseLecturerSearch}
                      onChange={(e) => setCourseLecturerSearch(e.target.value)}
                      className="w-full h-8 pl-8 pr-3 text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {lecturers
                      .filter((l) => {
                        if (!courseLecturerSearch.trim()) return true;
                        return l.names.toLowerCase().includes(courseLecturerSearch.toLowerCase());
                      })
                      .map((l) => {
                        const isChecked = formData.lecturerIds.includes(l.id);
                        return (
                          <label
                            key={l.id}
                            className={`flex items-center justify-between p-2 rounded text-xs transition-colors cursor-pointer border ${
                              isChecked
                                ? "bg-blue-50/70 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700 text-blue-900 dark:text-blue-200 font-medium"
                                : "bg-white border-gray-200 text-gray-700 dark:text-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    lecturerIds: isChecked
                                      ? prev.lecturerIds.filter((id) => id !== l.id)
                                      : [...prev.lecturerIds, l.id],
                                  }));
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                              />
                              <span>{l.names}</span>
                            </div>
                            {l.email && (
                              <span className="text-[10px] text-gray-400">{l.email}</span>
                            )}
                          </label>
                        );
                      })}
                    {lecturers.length === 0 && (
                      <p className="text-[11px] text-gray-400 text-center py-2">
                        No lecturers found. Create lecturers in Users & Roles.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={action.pending} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {action.pending && <Loader2 size={13} className="mr-1.5 animate-spin" />}
                  {editingCourse ? "Save Changes" : "Create Course"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-200 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 rounded-full bg-red-100">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Delete Course {deletingCourse.code}?
              </h3>
            </div>

            <p className="text-xs text-gray-600">
              Are you sure you want to permanently delete <strong>{deletingCourse.code} — {deletingCourse.title}</strong>?
            </p>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
              <strong>Notice:</strong> If this course has existing examination records, question items, or enrolled candidates, deleting will be rejected by the database. In that case, consider <strong>Archiving</strong> the course instead.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setDeletingCourse(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteCourse}
                disabled={action.pending}
              >
                {action.pending && <Loader2 size={13} className="mr-1.5 animate-spin" />}
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
