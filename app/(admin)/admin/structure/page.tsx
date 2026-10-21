"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useApi } from "@/lib/useApi";
import { useAction } from "@/lib/useAction";
import {
  Search,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
  Plus,
  Edit2,
  Book,
  X,
  Trash2,
  Building2,
  Loader2,
  School,
  Archive,
  ArchiveRestore,
} from "lucide-react";

interface Programme {
  id: string;
  code: string;
  name: string;
  award: string;
  durationYears: number;
  levels: number[];
  active: boolean;
}

interface Department {
  id: string;
  code: string;
  name: string;
  headName: string | null;
  collegeId: string;
  courseCount: number;
  userCount: number;
  programmes: Programme[];
  active: boolean;
}

interface College {
  id: string;
  code: string;
  name: string;
  dean: string | null;
  active: boolean;
  departments: Department[];
}

interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  level: number;
  semester: "FIRST" | "SECOND";
  active: boolean;
  departmentId: string;
  lecturers: { id: string; names: string }[];
}

interface LecturerUser {
  id: string;
  names: string;
}

type DeptForm = { name: string; code: string; headName: string };
type ProgForm = { name: string; code: string; award: string; durationYears: string };
type CourseForm = {
  code: string;
  title: string;
  units: string;
  level: string;
  semester: "FIRST" | "SECOND";
  active: boolean;
  lecturerIds: string[];
};

const emptyDept: DeptForm = { name: "", code: "", headName: "" };
const emptyProg: ProgForm = { name: "", code: "", award: "B.Sc.", durationYears: "4" };
const emptyCourse: CourseForm = {
  code: "",
  title: "",
  units: "3",
  level: "100",
  semester: "FIRST",
  active: true,
  lecturerIds: [],
};

const semLabel = (s: Course["semester"]) => (s === "FIRST" ? "1st" : "2nd");

export default function AcademicStructure() {
  const action = useAction();

  const { data: structure = [], loading, error, reload } = useApi<College[]>("/admin/structure");

  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const currentCollege =
    structure.find((c) => c.id === selectedCollegeId) ??
    structure.find((c) => c.active) ??
    structure[0];
  const currentDept =
    currentCollege?.departments.find((d) => d.id === selectedDeptId) ??
    currentCollege?.departments.find((d) => d.active) ??
    currentCollege?.departments[0];

  // Pick sensible defaults once data arrives (or after a delete changes the tree).
  useEffect(() => {
    if (!structure.length) return;
    if (!structure.some((c) => c.id === selectedCollegeId)) {
      const first = structure.find((c) => c.active) ?? structure[0];
      setSelectedCollegeId(first.id);
      setSelectedDeptId(
        first.departments.find((d) => d.active)?.id ?? first.departments[0]?.id ?? "",
      );
    }
  }, [structure, selectedCollegeId]);

  useEffect(() => {
    if (!currentCollege) return;
    if (selectedDeptId && !currentCollege.departments.some((d) => d.id === selectedDeptId)) {
      const first =
        currentCollege.departments.find((d) => d.active) ?? currentCollege.departments[0];
      setSelectedDeptId(first?.id ?? "");
    }
  }, [currentCollege, selectedDeptId]);

  // Hiding archived rows must not leave the right pane looking at one, since
  // its restore control lives in the tree.
  useEffect(() => {
    if (showArchived) return;
    if (currentCollege && !currentCollege.active) {
      setSelectedCollegeId("");
      setSelectedDeptId("");
      setSelectedLevel(null);
    } else if (currentDept && !currentDept.active) {
      setSelectedDeptId("");
      setSelectedLevel(null);
    }
  }, [showArchived, currentCollege, currentDept]);

  // Courses for the selected department, filtered by level.
  const courseQuery = currentDept
    ? `/admin/courses?departmentId=${currentDept.id}${selectedLevel ? `&level=${selectedLevel}` : ""}`
    : null;
  const {
    data: courses = [],
    loading: coursesLoading,
    error: coursesError,
    reload: reloadCourses,
  } = useApi<Course[]>(courseQuery);

  // Active lecturers, for the course assignment control.
  const { data: lecturerUsers = [] } = useApi<LecturerUser[]>(
    "/admin/users?role=LECTURER&pageSize=200",
  );

  const reloadAll = async () => {
    await Promise.all([reload(), reloadCourses()]);
  };

  // Modals.
  const [collegeOpen, setCollegeOpen] = useState(false);
  const [deptModal, setDeptModal] = useState<"add" | "edit" | null>(null);
  const [progOpen, setProgOpen] = useState(false);
  const [courseModal, setCourseModal] = useState<"add" | "edit" | null>(null);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeProgramme, setActiveProgramme] = useState<Programme | null>(null);
  const [activeCollege, setActiveCollege] = useState<College | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<
    "course" | "department" | "programme" | "college" | null
  >(null);

  const [collegeForm, setCollegeForm] = useState({ name: "", code: "", dean: "" });
  const [deptForm, setDeptForm] = useState<DeptForm>(emptyDept);
  const [progForm, setProgForm] = useState<ProgForm>(emptyProg);
  const [courseForm, setCourseForm] = useState<CourseForm>(emptyCourse);

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const archivedCount = useMemo(() => {
    let count = 0;
    for (const c of structure) {
      if (!c.active) count++;
      for (const d of c.departments) {
        if (!d.active) count++;
        for (const p of d.programmes) if (!p.active) count++;
      }
    }
    return count;
  }, [structure]);

  const visibleColleges = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const matches = (c: College) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.departments.some(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          d.programmes.some((p) => p.name.toLowerCase().includes(q)),
      );

    return structure
      .filter((c) => (showArchived || c.active) && matches(c))
      .map((c) => ({
        ...c,
        departments: c.departments
          .filter((d) => showArchived || d.active)
          .map((d) => ({
            ...d,
            programmes: d.programmes.filter((p) => showArchived || p.active),
          })),
      }));
  }, [structure, searchQuery, showArchived]);

  // ---------- college ----------
  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    await action.run<College>("/admin/colleges", {
      method: "POST",
      body: JSON.stringify({
        code: collegeForm.code,
        name: collegeForm.name,
        dean: collegeForm.dean || null,
      }),
      success: `College ${collegeForm.name} created`,
      onSuccess: () => {
        setCollegeOpen(false);
        setCollegeForm({ name: "", code: "", dean: "" });
        void reload();
      },
    });
  };

  // ---------- department ----------
  const openAddDept = () => {
    if (!currentCollege || !currentCollege.active) return;
    setDeptForm(emptyDept);
    setDeptModal("add");
  };

  const openEditDept = () => {
    if (!currentDept) return;
    setDeptForm({
      name: currentDept.name,
      code: currentDept.code,
      headName: currentDept.headName ?? "",
    });
    setDeptModal("edit");
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCollege) return;
    if (deptModal === "add" && !currentCollege.active) return;
    const body = {
      collegeId: currentCollege.id,
      code: deptForm.code,
      name: deptForm.name,
      headName: deptForm.headName || null,
    };
    const path = deptModal === "edit" && currentDept ? `/admin/departments/${currentDept.id}` : "/admin/departments";
    await action.run<Department>(path, {
      method: deptModal === "edit" ? "PATCH" : "POST",
      body: JSON.stringify(deptModal === "edit" ? { code: body.code, name: body.name, headName: body.headName } : body),
      success: deptModal === "edit" ? `Department ${deptForm.name} updated` : `Department ${deptForm.name} created`,
      onSuccess: () => {
        setDeptModal(null);
        setDeptForm(emptyDept);
        void reload();
      },
    });
  };

  // ---------- programme ----------
  const handleCreateProgramme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDept || !currentDept.active) return;
    await action.run<Programme>("/admin/programmes", {
      method: "POST",
      body: JSON.stringify({
        departmentId: currentDept.id,
        code: progForm.code,
        name: progForm.name,
        award: progForm.award,
        durationYears: Number(progForm.durationYears),
      }),
      success: `Programme ${progForm.name} added`,
      onSuccess: () => {
        setProgOpen(false);
        setProgForm(emptyProg);
        void reload();
      },
    });
  };

  // ---------- course ----------
  const openAddCourse = () => {
    if (!currentDept || !currentDept.active) return;
    setCourseForm({ ...emptyCourse, level: selectedLevel ? String(selectedLevel) : "100" });
    setActiveCourse(null);
    setCourseModal("add");
  };

  const openEditCourse = (course: Course) => {
    setActiveCourse(course);
    setCourseForm({
      code: course.code,
      title: course.title,
      units: String(course.units),
      level: String(course.level),
      semester: course.semester,
      active: course.active,
      lecturerIds: course.lecturers.map((l) => l.id),
    });
    setCourseModal("edit");
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDept) return;
    if (courseModal === "add" && !currentDept.active) return;
    const body = {
      departmentId: currentDept.id,
      code: courseForm.code,
      title: courseForm.title,
      units: Number(courseForm.units),
      level: Number(courseForm.level),
      defaultSemester: courseForm.semester,
      active: courseForm.active,
      lecturerIds: courseForm.lecturerIds,
    };
    const editing = courseModal === "edit" && activeCourse;
    await action.run<Course>(editing ? `/admin/courses/${activeCourse.id}` : "/admin/courses", {
      method: editing ? "PATCH" : "POST",
      body: JSON.stringify(body),
      success: editing ? `Course ${courseForm.code} updated` : `Course ${courseForm.code} created`,
      onSuccess: () => {
        setCourseModal(null);
        setActiveCourse(null);
        setCourseForm(emptyCourse);
        void reloadAll();
      },
    });
  };

  // ---------- archive / restore ----------
  // Archiving is reversible and non-cascading: it only hides the record, so a
  // discontinued college/department/programme keeps its history and can come
  // back exactly as it was.
  const setCollegeActive = async (college: College, active: boolean) => {
    await action.run<College>(`/admin/colleges/${college.id}`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
      success: `College ${college.name} ${active ? "restored" : "archived"}`,
      onSuccess: () => {
        if (!active && (selectedCollegeId === college.id || !selectedCollegeId)) {
          setSelectedCollegeId("");
          setSelectedDeptId("");
          setSelectedLevel(null);
        }
        void reloadAll();
      },
    });
  };

  const setDeptActive = async (dept: Department, active: boolean) => {
    await action.run<Department>(`/admin/departments/${dept.id}`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
      success: `Department ${dept.name} ${active ? "restored" : "archived"}`,
      onSuccess: () => {
        if (!active && (selectedDeptId === dept.id || currentDept?.id === dept.id)) {
          setSelectedDeptId("");
          setSelectedLevel(null);
        }
        void reloadAll();
      },
    });
  };

  const setProgrammeActive = async (prog: Programme, active: boolean) => {
    await action.run<Programme>(`/admin/programmes/${prog.id}`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
      success: `Programme ${prog.name} ${active ? "restored" : "archived"}`,
      onSuccess: () => void reload(),
    });
  };

  const setCourseActive = async (course: Course, active: boolean) => {
    await action.run<Course>(`/admin/courses/${course.id}`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
      success: `Course ${course.code} ${active ? "restored" : "archived"}`,
      onSuccess: () => void reloadCourses(),
    });
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    if (confirmDelete === "course" && activeCourse) {
      await action.run<null>(`/admin/courses/${activeCourse.id}`, {
        method: "DELETE",
        success: `Course ${activeCourse.code} deleted`,
        onSuccess: () => {
          setConfirmDelete(null);
          setCourseModal(null);
          setActiveCourse(null);
          void reloadAll();
        },
      });
    } else if (confirmDelete === "department" && currentDept) {
      await action.run<null>(`/admin/departments/${currentDept.id}`, {
        method: "DELETE",
        success: `Department ${currentDept.name} deleted`,
        onSuccess: () => {
          setConfirmDelete(null);
          setDeptModal(null);
          void reload();
        },
      });
    } else if (confirmDelete === "programme" && activeProgramme) {
      await action.run<null>(`/admin/programmes/${activeProgramme.id}`, {
        method: "DELETE",
        success: `Programme ${activeProgramme.name} deleted`,
        onSuccess: () => {
          setConfirmDelete(null);
          setActiveProgramme(null);
          void reload();
        },
      });
    } else if (confirmDelete === "college" && activeCollege) {
      await action.run<null>(`/admin/colleges/${activeCollege.id}`, {
        method: "DELETE",
        success: `College ${activeCollege.name} deleted`,
        onSuccess: () => {
          setConfirmDelete(null);
          setActiveCollege(null);
          setSelectedCollegeId("");
          setSelectedDeptId("");
          setSelectedLevel(null);
          void reload();
        },
      });
    }
  };

  const deleteMessage = () => {
    switch (confirmDelete) {
      case "course":
        return `Delete course ${activeCourse?.code}? Courses with exams, questions or enrolments cannot be deleted — archive them instead.`;
      case "department":
        return `Delete department ${currentDept?.name}? It must be empty of programmes, courses and members. If it is no longer offered, archive it instead.`;
      case "programme":
        return `Delete programme ${activeProgramme?.name}? Students enrolled in it must be moved first. If it is no longer offered, archive it instead.`;
      case "college":
        return `Delete college ${activeCollege?.name}? Remove or move its departments first. If the school no longer runs it, archive it instead.`;
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full overflow-hidden relative">
      {/* Header */}
      <div>
        <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Academic structure</h2>
        <p className="text-[14px] text-gray-500">
          LASUSTECH colleges, departments, programmes and course catalogues.
        </p>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-gray-900">Couldn&apos;t load the academic structure</p>
            <p className="mt-0.5 text-[13px] text-gray-600">{error.message ?? "The server did not respond."}</p>
          </div>
          <button type="button" onClick={() => void reload()} className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 hover:bg-gray-50">Retry</button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Left: tree */}
        <Card className="w-full lg:w-[350px] flex-shrink-0 flex flex-col h-[640px] overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search colleges and departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-[13px] bg-white"
              />
            </div>
            <label className="mt-2 flex items-center gap-2 text-[12px] text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Show archived{archivedCount > 0 ? ` (${archivedCount})` : ""}
            </label>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 text-[13.5px] select-none">
            {loading && structure.length === 0 && (
              <p className="p-3 text-[13px] text-gray-500"><Loader2 size={14} className="inline animate-spin mr-2" /> Loading structure…</p>
            )}
            {!loading && visibleColleges.length === 0 && (
              <p className="p-3 text-[13px] text-gray-500">No colleges found.</p>
            )}
            {visibleColleges.map((col) => {
              const isColExpanded = expandedNodes.has(col.id) || !!searchQuery;
              const isColSelected = currentCollege?.id === col.id && !selectedDeptId;

              return (
                <div key={col.id} className="space-y-1">
                  <div
                    onClick={() => {
                      setSelectedCollegeId(col.id);
                      setSelectedDeptId("");
                      setSelectedLevel(null);
                      toggleExpand(col.id);
                    }}
                    className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${isColSelected ? "bg-blue-50 text-blue-900 font-bold" : "hover:bg-gray-100 text-gray-900 font-semibold"} ${col.active ? "" : "opacity-60"}`}
                  >
                    <button type="button" onClick={(e) => { e.stopPropagation(); toggleExpand(col.id); }} className="p-0.5 text-gray-400 hover:text-gray-600 rounded">
                      {isColExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {isColExpanded ? <School size={16} className="text-blue-600 shrink-0" /> : <Building2 size={16} className="text-blue-600 shrink-0" />}
                    <span className="truncate flex-1">{col.name}</span>
                    {!col.active && (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">Archived</span>
                    )}
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">{col.departments.length}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void setCollegeActive(col, !col.active);
                      }}
                      title={col.active ? `Archive ${col.name}` : `Restore ${col.name}`}
                      aria-label={col.active ? `Archive ${col.name}` : `Restore ${col.name}`}
                      className={`p-1 rounded text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition-opacity ${isColSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"}`}
                    >
                      {col.active ? <Archive size={14} /> : <ArchiveRestore size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCollege(col);
                        setConfirmDelete("college");
                      }}
                      title={`Delete ${col.name}`}
                      aria-label={`Delete ${col.name}`}
                      className={`p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-opacity ${isColSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {isColExpanded && (
                    <div className="pl-5 space-y-1">
                      {col.departments.map((dept) => {
                        const isDeptExpanded = expandedNodes.has(dept.id) || !!searchQuery;
                        const isDeptSelected = currentCollege?.id === col.id && currentDept?.id === dept.id;

                        return (
                          <div key={dept.id} className="space-y-1">
                            <div
                              onClick={() => {
                                setSelectedCollegeId(col.id);
                                setSelectedDeptId(dept.id);
                                setSelectedLevel(null);
                                toggleExpand(dept.id);
                              }}
                              className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${isDeptSelected ? "bg-blue-100 text-blue-900 font-semibold" : "hover:bg-gray-100 text-gray-700"} ${dept.active ? "" : "opacity-60"}`}
                            >
                              <button type="button" onClick={(e) => { e.stopPropagation(); toggleExpand(dept.id); }} className="p-0.5 text-blue-500 hover:text-blue-700 rounded">
                                {isDeptExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </button>
                              {isDeptExpanded ? <FolderOpen size={15} className="text-blue-600 shrink-0" /> : <Folder size={15} className="text-gray-400 shrink-0" />}
                              <span className="truncate">{dept.name}</span>
                              {!dept.active && (
                                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">Archived</span>
                              )}
                              <span className="ml-auto text-[10px] text-gray-400 font-mono">{dept.courseCount} courses</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void setDeptActive(dept, !dept.active);
                                }}
                                title={dept.active ? `Archive ${dept.name}` : `Restore ${dept.name}`}
                                aria-label={dept.active ? `Archive ${dept.name}` : `Restore ${dept.name}`}
                                className="p-0.5 rounded text-gray-400 hover:text-amber-700 hover:bg-amber-50 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100"
                              >
                                {dept.active ? <Archive size={12} /> : <ArchiveRestore size={12} />}
                              </button>
                            </div>

                            {isDeptExpanded && (
                              <div className="pl-5 space-y-1">
                                {dept.programmes.map((prog) => {
                                  const isProgExpanded = expandedNodes.has(prog.id) || !!searchQuery;
                                  return (
                                    <div key={prog.id} className="space-y-1">
                                      <div
                                        onClick={() => { setSelectedCollegeId(col.id); setSelectedDeptId(dept.id); toggleExpand(prog.id); }}
                                        className={`group flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-colors hover:bg-gray-100 text-gray-600 ${prog.active ? "" : "opacity-60"}`}
                                      >
                                        <button type="button" onClick={(e) => { e.stopPropagation(); toggleExpand(prog.id); }} className="p-0.5 text-gray-400 hover:text-gray-600 rounded">
                                          {isProgExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                                        </button>
                                        <Folder size={14} className="text-gray-400 shrink-0" />
                                        <span className="truncate text-[12.5px]">{prog.name}</span>
                                        {!prog.active && (
                                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">Archived</span>
                                        )}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            void setProgrammeActive(prog, !prog.active);
                                          }}
                                          title={prog.active ? `Archive ${prog.name}` : `Restore ${prog.name}`}
                                          aria-label={prog.active ? `Archive ${prog.name}` : `Restore ${prog.name}`}
                                          className="ml-auto p-0.5 rounded text-gray-400 hover:text-amber-700 hover:bg-amber-50 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100"
                                        >
                                          {prog.active ? <Archive size={12} /> : <ArchiveRestore size={12} />}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveProgramme(prog);
                                            setConfirmDelete("programme");
                                          }}
                                          title={`Delete ${prog.name}`}
                                          aria-label={`Delete ${prog.name}`}
                                          className="p-0.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>

                                      {isProgExpanded && (
                                        <div className="pl-5 space-y-0.5">
                                          {prog.levels.map((lvl) => {
                                            const isLvlSelected = isDeptSelected && selectedLevel === lvl;
                                            return (
                                              <div
                                                key={lvl}
                                                onClick={() => {
                                                  setSelectedCollegeId(col.id);
                                                  setSelectedDeptId(dept.id);
                                                  setSelectedLevel(selectedLevel === lvl ? null : lvl);
                                                }}
                                                className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-colors text-[12px] ${isLvlSelected ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-gray-100 text-gray-500"}`}
                                              >
                                                <Book size={12} className={isLvlSelected ? "text-blue-600" : "text-gray-400"} />
                                                <span>{lvl} level</span>
                                                {isLvlSelected && <span className="text-[10px] ml-auto bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-medium">Filter</span>}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-gray-100 bg-gray-50 flex gap-2">
            <Button type="button" variant="tertiary" onClick={() => setCollegeOpen(true)} className="flex-1 text-blue-700 hover:bg-blue-50 hover:text-blue-800 h-9 font-medium">
              <Plus size={16} className="mr-2" /> Add college
            </Button>
            <Button type="button" variant="tertiary" onClick={openAddDept} disabled={!currentCollege || !currentCollege.active} title={currentCollege && !currentCollege.active ? "Restore this college first" : undefined} className="flex-1 text-blue-700 hover:bg-blue-50 hover:text-blue-800 h-9 font-medium">
              <Plus size={16} className="mr-2" /> Add department
            </Button>
          </div>
        </Card>

        {/* Right: department details & courses */}
        <Card className="flex-1 flex flex-col h-[640px] overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[13px] text-gray-500 font-medium mb-1.5 flex items-center gap-2 flex-wrap">
                  <span onClick={() => { setSelectedDeptId(""); setSelectedLevel(null); }} className="hover:text-blue-700 cursor-pointer">
                    {currentCollege?.name ?? "Select a college"}
                  </span>
                  <ChevronRight size={12} className="text-gray-400" />
                  <span className="text-blue-700 font-semibold">{currentDept?.name ?? "Select a department"}</span>
                  {selectedLevel && (
                    <>
                      <ChevronRight size={12} className="text-gray-400" />
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[12px] font-medium">{selectedLevel} level</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[20px] font-bold text-gray-900 tracking-tight">{currentDept?.name ?? "Department"}</h3>
                  {currentCollege && !currentCollege.active && (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">College archived</span>
                  )}
                  {currentDept && !currentDept.active && (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">Archived department</span>
                  )}
                </div>
                <p className="text-[14px] text-gray-500 mt-1">
                  Code: <strong className="text-gray-700">{currentDept?.code ?? "—"}</strong> •{" "}
                  Head: <strong className="text-gray-700">{currentDept?.headName ?? "Unassigned"}</strong> •{" "}
                  Dean: <strong className="text-gray-700">{currentCollege?.dean ?? "Unassigned"}</strong> •{" "}
                  {currentDept?.programmes.length ?? 0} programmes • {currentDept?.userCount ?? 0} members
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {currentDept && (
                  <Button
                    type="button"
                    variant={currentDept.active ? "secondary" : "primary"}
                    onClick={() => void setDeptActive(currentDept, !currentDept.active)}
                    className={
                      currentDept.active
                        ? "h-10 hover:border-amber-300 hover:text-amber-800 text-amber-800 bg-amber-50 border border-amber-200"
                        : "h-10 bg-emerald-600 hover:bg-emerald-700 text-white"
                    }
                  >
                    {currentDept.active ? (
                      <>
                        <Archive size={15} className="mr-2" /> Archive Department
                      </>
                    ) : (
                      <>
                        <ArchiveRestore size={15} className="mr-2" /> Restore Department
                      </>
                    )}
                  </Button>
                )}
                <Button type="button" variant="secondary" onClick={openEditDept} disabled={!currentDept} className="h-10 hover:border-blue-300 hover:text-blue-700">
                  <Edit2 size={15} className="mr-2 text-gray-500" /> Edit
                </Button>
                <Button type="button" onClick={() => setProgOpen(true)} disabled={!currentDept || !currentDept.active} title={currentDept && !currentDept.active ? "Restore this department first" : undefined} className="h-10 bg-blue-600 hover:bg-blue-700 shadow-xs">
                  <Plus size={16} className="mr-2" /> Add programme
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col">
            {currentDept && !currentDept.active && (
              <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-xs text-amber-900 shrink-0">
                <div className="flex items-center gap-2">
                  <Archive size={15} className="text-amber-700" />
                  <span>This department is currently archived.</span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void setDeptActive(currentDept, true)}
                  className="h-7 text-xs font-semibold bg-white border border-amber-300 text-amber-900 hover:bg-amber-100"
                >
                  <ArchiveRestore size={13} className="mr-1" /> Restore Department
                </Button>
              </div>
            )}
            <div className="p-4 border-b border-gray-100 bg-gray-50/70 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-gray-900 text-[15px]">Department courses</h4>
                {selectedLevel && (
                  <button type="button" onClick={() => setSelectedLevel(null)} className="text-[12px] text-blue-600 hover:underline flex items-center gap-1 font-medium">
                    Clear filter &times;
                  </button>
                )}
                <span className="text-[12px] bg-gray-200 text-gray-700 font-semibold px-2 py-0.5 rounded-full">{courses.length}</span>
              </div>

              <Button type="button" variant="secondary" size="sm" onClick={openAddCourse} disabled={!currentDept || !currentDept.active} title={currentDept && !currentDept.active ? "Restore this department first" : undefined} className="hover:border-blue-500 hover:text-blue-700 font-medium">
                <Plus size={14} className="mr-1.5" /> Add course
              </Button>
            </div>

            {coursesError && (
              <p className="px-6 py-4 text-[13px] text-red-600">Could not load courses: {coursesError.message ?? "server error"}.</p>
            )}

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-2xs">
                  <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Code</th>
                  <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Title</th>
                  <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Level</th>
                  <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Sem</th>
                  <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Lecturers</th>
                  <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-[13px] font-semibold text-gray-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[14px]">
                {coursesLoading ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500"><Loader2 size={16} className="inline animate-spin mr-2" /> Loading courses…</td></tr>
                ) : !currentDept ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Select a department to see its courses.</td></tr>
                ) : courses.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No courses found in this department. Click &quot;Add course&quot; to create one.</td></tr>
                ) : (
                  courses.map((c) => (
                    <tr key={c.id} onClick={() => openEditCourse(c)} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                      <td className="px-6 py-3.5 font-bold text-gray-900 font-mono">{c.code}</td>
                      <td className="px-6 py-3.5 font-medium text-gray-900">{c.title}</td>
                      <td className="px-6 py-3.5 text-gray-600">{c.level} level</td>
                      <td className="px-6 py-3.5 text-gray-600">{semLabel(c.semester)}</td>
                      <td className="px-6 py-3.5 text-gray-600">
                        {c.lecturers.length ? c.lecturers.map((l) => l.names).join(", ") : <span className="text-gray-400 italic">None</span>}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge variant={c.active ? "success-solid" : "gray-solid"} className="font-medium">{c.active ? "Active" : "Archived"}</Badge>
                      </td>
                      <td className="px-6 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); void setCourseActive(c, !c.active); }}
                          className="text-gray-400 hover:text-amber-700 p-1 rounded transition-colors"
                          title={c.active ? "Archive course" : "Restore course"}
                        >
                          {c.active ? <Archive size={15} /> : <ArchiveRestore size={15} />}
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); openEditCourse(c); }} className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors" title="Edit course">
                          <Edit2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* MODAL: Add College */}
      {collegeOpen && (
        <Modal title="Add new college" onClose={() => setCollegeOpen(false)}>
          <form onSubmit={handleCreateCollege} className="p-5 space-y-4">
            <Field label="College name *">
              <Input required placeholder="e.g. College of Basic Sciences" value={collegeForm.name} onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })} />
              {action.fieldErrors.name && <FieldError msg={action.fieldErrors.name} />}
            </Field>
            <Field label="College code *">
              <Input required placeholder="e.g. CBS" value={collegeForm.code} onChange={(e) => setCollegeForm({ ...collegeForm, code: e.target.value })} />
              {action.fieldErrors.code && <FieldError msg={action.fieldErrors.code} />}
            </Field>
            <Field label="Dean of college">
              <Input placeholder="e.g. Prof. O. Adebayo" value={collegeForm.dean} onChange={(e) => setCollegeForm({ ...collegeForm, dean: e.target.value })} />
            </Field>
            <Footer onCancel={() => setCollegeOpen(false)} submit="Save college" pending={action.pending} />
          </form>
        </Modal>
      )}

      {/* MODAL: Add / Edit Department */}
      {deptModal && (
        <Modal title={deptModal === "add" ? "Add department" : "Edit department"} onClose={() => setDeptModal(null)}>
          <form onSubmit={handleSaveDept} className="p-5 space-y-4">
            {deptModal === "add" && (
              <p className="text-[12px] text-gray-500">Under <strong className="text-gray-800">{currentCollege?.name}</strong></p>
            )}
            <Field label="Department name *">
              <Input required value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} />
              {action.fieldErrors.name && <FieldError msg={action.fieldErrors.name} />}
            </Field>
            <Field label="Department code *">
              <Input required value={deptForm.code} onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })} />
              {action.fieldErrors.code && <FieldError msg={action.fieldErrors.code} />}
            </Field>
            <Field label="Head of department (HOD)">
              <Input value={deptForm.headName} onChange={(e) => setDeptForm({ ...deptForm, headName: e.target.value })} />
            </Field>
            <div className="flex items-center justify-between pt-2">
              {deptModal === "edit" && currentDept ? (
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="tertiary"
                    onClick={() => {
                      const nextActive = !currentDept.active;
                      void setDeptActive(currentDept, nextActive);
                      setDeptModal(null);
                    }}
                    className={currentDept.active ? "text-amber-700 hover:bg-amber-50" : "text-emerald-700 hover:bg-emerald-50"}
                  >
                    {currentDept.active ? (
                      <>
                        <Archive size={15} className="mr-1.5" /> Archive
                      </>
                    ) : (
                      <>
                        <ArchiveRestore size={15} className="mr-1.5" /> Restore
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="tertiary" onClick={() => setConfirmDelete("department")} className="text-red-600 hover:bg-red-50">
                    <Trash2 size={15} className="mr-1.5" /> Delete
                  </Button>
                </div>
              ) : <span />}
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setDeptModal(null)}>Cancel</Button>
                <Button type="submit" disabled={action.pending}>
                  {action.pending && <Loader2 size={14} className="mr-2 animate-spin" />} Save
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: Add Programme */}
      {progOpen && (
        <Modal title="Add academic programme" onClose={() => setProgOpen(false)}>
          <form onSubmit={handleCreateProgramme} className="p-5 space-y-4">
            <p className="text-[12px] text-gray-500">Under <strong className="text-gray-800">{currentDept?.name}</strong></p>
            <Field label="Programme name *">
              <Input required placeholder="e.g. Computer Science" value={progForm.name} onChange={(e) => setProgForm({ ...progForm, name: e.target.value })} />
              {action.fieldErrors.name && <FieldError msg={action.fieldErrors.name} />}
            </Field>
            <Field label="Programme code *">
              <Input required placeholder="e.g. CSC" value={progForm.code} onChange={(e) => setProgForm({ ...progForm, code: e.target.value })} />
              {action.fieldErrors.code && <FieldError msg={action.fieldErrors.code} />}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Degree awarded">
                <select className="w-full h-10 px-3 rounded-md border border-gray-300 text-[14px]" value={progForm.award} onChange={(e) => setProgForm({ ...progForm, award: e.target.value })}>
                  <option>B.Sc.</option>
                  <option>B.Eng.</option>
                  <option>B.Agric.</option>
                  <option>B.A.</option>
                  <option>B.Fisheries</option>
                </select>
              </Field>
              <Field label="Duration (years)">
                <select className="w-full h-10 px-3 rounded-md border border-gray-300 text-[14px]" value={progForm.durationYears} onChange={(e) => setProgForm({ ...progForm, durationYears: e.target.value })}>
                  {[1, 2, 3, 4, 5, 6, 7].map((y) => <option key={y} value={y}>{y} years</option>)}
                </select>
              </Field>
            </div>
            <Footer onCancel={() => setProgOpen(false)} submit="Add programme" pending={action.pending} />
          </form>
        </Modal>
      )}

      {/* MODAL: Add / Edit Course */}
      {courseModal && (
        <Modal title={courseModal === "add" ? "Add new course" : "Edit course"} onClose={() => setCourseModal(null)}>
          <form onSubmit={handleSaveCourse} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Course code *">
                <Input required placeholder="e.g. CSC 301" value={courseForm.code} onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} />
                {action.fieldErrors.code && <FieldError msg={action.fieldErrors.code} />}
              </Field>
              <Field label="Level">
                <select className="w-full h-10 px-3 rounded-md border border-gray-300 text-[14px]" value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}>
                  {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((l) => <option key={l} value={l}>{l} Level</option>)}
                </select>
              </Field>
            </div>

            <Field label="Course title *">
              <Input required placeholder="e.g. Data Structures & Algorithms" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} />
              {action.fieldErrors.title && <FieldError msg={action.fieldErrors.title} />}
            </Field>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Semester">
                <select className="w-full h-10 px-3 rounded-md border border-gray-300 text-[14px]" value={courseForm.semester} onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value as CourseForm["semester"] })}>
                  <option value="FIRST">1st (Harmattan)</option>
                  <option value="SECOND">2nd (Rain)</option>
                </select>
              </Field>
              <Field label="Units">
                <Input type="number" min={0} max={12} value={courseForm.units} onChange={(e) => setCourseForm({ ...courseForm, units: e.target.value })} />
              </Field>
              <Field label="Status">
                <select className="w-full h-10 px-3 rounded-md border border-gray-300 text-[14px]" value={courseForm.active ? "active" : "archived"} onChange={(e) => setCourseForm({ ...courseForm, active: e.target.value === "active" })}>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </Field>
            </div>

            <Field label="Assigned lecturers">
              {lecturerUsers.length === 0 ? (
                <p className="text-[12px] text-gray-500">No active lecturers found. Create lecturers from the Users page first.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-100">
                  {lecturerUsers.map((l) => {
                    const checked = courseForm.lecturerIds.includes(l.id);
                    return (
                      <label key={l.id} className="flex items-center gap-2 px-3 py-2 text-[13px] cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setCourseForm({
                              ...courseForm,
                              lecturerIds: checked
                                ? courseForm.lecturerIds.filter((id) => id !== l.id)
                                : [...courseForm.lecturerIds, l.id],
                            })
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-800">{l.names}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              <p className="mt-1 text-[11px] text-gray-500">Assignments apply to the current academic session.</p>
              {action.fieldErrors.lecturerIds && <FieldError msg={action.fieldErrors.lecturerIds} />}
            </Field>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              {courseModal === "edit" ? (
                <Button type="button" variant="tertiary" onClick={() => setConfirmDelete("course")} className="text-red-600 hover:bg-red-50">
                  <Trash2 size={15} className="mr-1.5" /> Delete
                </Button>
              ) : <span />}
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setCourseModal(null)}>Cancel</Button>
                <Button type="submit" disabled={action.pending}>
                  {action.pending && <Loader2 size={14} className="mr-2 animate-spin" />} Save
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION */}
      {confirmDelete && (
        <Modal title="Confirm delete" onClose={() => setConfirmDelete(null)}>
          <div className="p-5">
            <p className="text-[14px] text-gray-700">{deleteMessage()}</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button type="button" variant="danger" onClick={() => void handleDelete()} disabled={action.pending}>
                {action.pending && <Loader2 size={14} className="mr-2 animate-spin" />} Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-[17px]">{title}</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[13px] font-medium text-gray-700 block mb-1">{label}</label>
      {children}
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return <p className="mt-1 text-[12px] text-red-600">{msg}</p>;
}

function Footer({ onCancel, submit, pending }: { onCancel: () => void; submit: string; pending: boolean }) {
  return (
    <div className="flex justify-end gap-2.5 pt-2">
      <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 size={14} className="mr-2 animate-spin" />} {submit}
      </Button>
    </div>
  );
}
