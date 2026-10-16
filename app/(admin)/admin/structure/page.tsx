"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  CheckCircle2,
  Trash2,
  Building2,
  GraduationCap,
  Layers,
  Sparkles,
  School
} from "lucide-react";
import { LASUSTECH_COLLEGES, College, Department, Programme, Course } from "@/lib/lasustech-structure";

export default function AcademicStructure() {
  const [structure, setStructure] = useState<College[]>(LASUSTECH_COLLEGES);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("col_cbs");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("dept_csc");
  const [selectedProgId, setSelectedProgId] = useState<string | null>("prog_csc");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  // Expanded nodes in tree
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(["col_cbs", "dept_csc", "prog_csc"])
  );

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals visibility
  const [isAddCollegeOpen, setIsAddCollegeOpen] = useState(false);
  const [isEditDeptOpen, setIsEditDeptOpen] = useState(false);
  const [isAddProgrammeOpen, setIsAddProgrammeOpen] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [activeCourseToEdit, setActiveCourseToEdit] = useState<Course | null>(null);

  // Form states
  const [collegeForm, setCollegeForm] = useState({ name: "", code: "", dean: "" });
  const [deptForm, setDeptForm] = useState({ name: "", code: "", head: "" });
  const [progForm, setProgForm] = useState({ name: "", degree: "B.Sc." });
  const [courseForm, setCourseForm] = useState({
    code: "",
    title: "",
    level: "100",
    sem: "1st",
    lecturer: "",
    status: "Active" as "Active" | "Archived",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  // Find currently selected college & department
  const currentCollege = structure.find((c) => c.id === selectedCollegeId) || structure[0];
  const currentDept =
    currentCollege?.departments.find((d) => d.id === selectedDeptId) ||
    currentCollege?.departments[0];

  // Filtered courses based on selected level (if any)
  const displayedCourses = useMemo(() => {
    if (!currentDept) return [];
    if (!selectedLevel) return currentDept.courses;
    const levelNumber = selectedLevel.replace(/[^0-9]/g, "");
    return currentDept.courses.filter((c) => c.level === levelNumber);
  }, [currentDept, selectedLevel]);

  // Handle Add College
  const handleAddCollege = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeForm.name.trim()) return;

    const newCollege: College = {
      id: `col_${Date.now()}`,
      name: collegeForm.name,
      code: collegeForm.code || collegeForm.name.substring(0, 4).toUpperCase(),
      dean: collegeForm.dean || "Unassigned",
      departments: [],
    };

    setStructure([...structure, newCollege]);
    setSelectedCollegeId(newCollege.id);
    setSelectedDeptId("");
    setExpandedNodes((prev) => new Set(prev).add(newCollege.id));
    setIsAddCollegeOpen(false);
    setCollegeForm({ name: "", code: "", dean: "" });
    showToast(`College "${newCollege.name}" created successfully!`);
  };

  // Open Edit Dept Modal
  const openEditDept = () => {
    if (!currentDept) return;
    setDeptForm({
      name: currentDept.name,
      code: currentDept.code,
      head: currentDept.head,
    });
    setIsEditDeptOpen(true);
  };

  // Save Edit Dept
  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDept) return;

    setStructure((prev) =>
      prev.map((col) => {
        if (col.id !== currentCollege.id) return col;
        return {
          ...col,
          departments: col.departments.map((d) =>
            d.id === currentDept.id
              ? { ...d, name: deptForm.name, code: deptForm.code, head: deptForm.head }
              : d
          ),
        };
      })
    );

    setIsEditDeptOpen(false);
    showToast(`Department "${deptForm.name}" updated successfully!`);
  };

  // Handle Add Programme
  const handleAddProgramme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progForm.name.trim() || !currentDept) return;

    const newProg: Programme = {
      id: `prog_${Date.now()}`,
      name: progForm.name,
      degree: progForm.degree,
      levels: ["100 level", "200 level", "300 level", "400 level"],
    };

    setStructure((prev) =>
      prev.map((col) => {
        if (col.id !== currentCollege.id) return col;
        return {
          ...col,
          departments: col.departments.map((d) =>
            d.id === currentDept.id
              ? { ...d, programmes: [...d.programmes, newProg] }
              : d
          ),
        };
      })
    );

    setSelectedProgId(newProg.id);
    setExpandedNodes((prev) => new Set(prev).add(newProg.id));
    setIsAddProgrammeOpen(false);
    setProgForm({ name: "", degree: "B.Sc." });
    showToast(`Programme "${newProg.name}" added successfully!`);
  };

  // Handle Add Course
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.code.trim() || !courseForm.title.trim() || !currentDept) return;

    const newCourse: Course = {
      id: `c_${Date.now()}`,
      code: courseForm.code.toUpperCase(),
      title: courseForm.title,
      level: courseForm.level,
      sem: courseForm.sem,
      lecturers: courseForm.lecturer.trim() ? [courseForm.lecturer.trim()] : [],
      status: courseForm.status,
    };

    setStructure((prev) =>
      prev.map((col) => {
        if (col.id !== currentCollege.id) return col;
        return {
          ...col,
          departments: col.departments.map((d) =>
            d.id === currentDept.id
              ? { ...d, courses: [newCourse, ...d.courses] }
              : d
          ),
        };
      })
    );

    setIsAddCourseOpen(false);
    setCourseForm({
      code: "",
      title: "",
      level: "100",
      sem: "1st",
      lecturer: "",
      status: "Active",
    });
    showToast(`Course "${newCourse.code}: ${newCourse.title}" created successfully!`);
  };

  // Open Edit Course Modal
  const openEditCourse = (course: Course) => {
    setActiveCourseToEdit(course);
    setCourseForm({
      code: course.code,
      title: course.title,
      level: course.level,
      sem: course.sem,
      lecturer: course.lecturers.join(", "),
      status: course.status,
    });
    setIsEditCourseOpen(true);
  };

  // Handle Save Edited Course
  const handleSaveEditedCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourseToEdit || !currentDept) return;

    const updatedCourse: Course = {
      ...activeCourseToEdit,
      code: courseForm.code.toUpperCase(),
      title: courseForm.title,
      level: courseForm.level,
      sem: courseForm.sem,
      lecturers: courseForm.lecturer.trim()
        ? courseForm.lecturer.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      status: courseForm.status,
    };

    setStructure((prev) =>
      prev.map((col) => {
        if (col.id !== currentCollege.id) return col;
        return {
          ...col,
          departments: col.departments.map((d) =>
            d.id === currentDept.id
              ? {
                  ...d,
                  courses: d.courses.map((c) =>
                    c.id === activeCourseToEdit.id ? updatedCourse : c
                  ),
                }
              : d
          ),
        };
      })
    );

    setIsEditCourseOpen(false);
    showToast(`Course "${updatedCourse.code}" updated successfully!`);
  };

  // Handle Delete Course
  const handleDeleteCourse = (courseId: string) => {
    if (!currentDept) return;
    setStructure((prev) =>
      prev.map((col) => {
        if (col.id !== currentCollege.id) return col;
        return {
          ...col,
          departments: col.departments.map((d) =>
            d.id === currentDept.id
              ? {
                  ...d,
                  courses: d.courses.filter((c) => c.id !== courseId),
                }
              : d
          ),
        };
      })
    );
    setIsEditCourseOpen(false);
    showToast("Course deleted successfully.");
  };

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl border border-gray-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />
          <span className="text-[14px] font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Academic structure</h2>
        <p className="text-[14px] text-gray-500">
          LASUSTECH official 5 colleges, academic departments, programmes, and course catalogues.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Left: Dynamic Interactive Tree */}
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
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 text-[13.5px] select-none">
            {structure.map((col) => {
              const isColExpanded = expandedNodes.has(col.id);
              const isColSelected = selectedCollegeId === col.id && !selectedDeptId;

              // Search query matching
              if (
                searchQuery &&
                !col.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !col.departments.some(
                  (d) =>
                    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    d.courses.some((c) =>
                      c.code.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                )
              ) {
                return null;
              }

              return (
                <div key={col.id} className="space-y-1">
                  {/* College Node */}
                  <div
                    onClick={() => {
                      setSelectedCollegeId(col.id);
                      toggleExpand(col.id);
                      if (col.departments.length > 0 && selectedCollegeId !== col.id) {
                        setSelectedDeptId(col.departments[0].id);
                      }
                    }}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                      isColSelected
                        ? "bg-blue-50 text-blue-900 font-bold"
                        : "hover:bg-gray-100 text-gray-900 font-semibold"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(col.id);
                      }}
                      className="p-0.5 text-gray-400 hover:text-gray-600 rounded"
                    >
                      {isColExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {isColExpanded ? (
                      <School size={16} className="text-blue-600 shrink-0" />
                    ) : (
                      <Building2 size={16} className="text-blue-600 shrink-0" />
                    )}
                    <span className="truncate flex-1">{col.name}</span>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                      {col.departments.length}
                    </span>
                  </div>

                  {/* Departments */}
                  {isColExpanded && (
                    <div className="pl-5 space-y-1">
                      {col.departments.map((dept) => {
                        const isDeptExpanded = expandedNodes.has(dept.id);
                        const isDeptSelected =
                          selectedCollegeId === col.id && selectedDeptId === dept.id;

                        return (
                          <div key={dept.id} className="space-y-1">
                            {/* Department Node */}
                            <div
                              onClick={() => {
                                setSelectedCollegeId(col.id);
                                setSelectedDeptId(dept.id);
                                setSelectedLevel(null);
                                toggleExpand(dept.id);
                              }}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                                isDeptSelected
                                  ? "bg-blue-100 text-blue-900 font-semibold"
                                  : "hover:bg-gray-100 text-gray-700"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpand(dept.id);
                                }}
                                className="p-0.5 text-blue-500 hover:text-blue-700 rounded"
                              >
                                {isDeptExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </button>
                              {isDeptExpanded ? (
                                <FolderOpen size={15} className="text-blue-600 shrink-0" />
                              ) : (
                                <Folder size={15} className="text-gray-400 shrink-0" />
                              )}
                              <span className="truncate">{dept.name}</span>
                            </div>

                            {/* Programmes & Levels */}
                            {isDeptExpanded && (
                              <div className="pl-5 space-y-1">
                                {dept.programmes.map((prog) => {
                                  const isProgExpanded = expandedNodes.has(prog.id);
                                  const isProgSelected =
                                    selectedProgId === prog.id && isDeptSelected;

                                  return (
                                    <div key={prog.id} className="space-y-1">
                                      {/* Programme Node */}
                                      <div
                                        onClick={() => {
                                          setSelectedCollegeId(col.id);
                                          setSelectedDeptId(dept.id);
                                          setSelectedProgId(prog.id);
                                          setSelectedLevel(null);
                                          toggleExpand(prog.id);
                                        }}
                                        className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-colors ${
                                          isProgSelected && !selectedLevel
                                            ? "bg-blue-50 text-blue-800 font-medium"
                                            : "hover:bg-gray-100 text-gray-600"
                                        }`}
                                      >
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleExpand(prog.id);
                                          }}
                                          className="p-0.5 text-gray-400 hover:text-gray-600 rounded"
                                        >
                                          {isProgExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                                        </button>
                                        <Folder size={14} className="text-gray-400 shrink-0" />
                                        <span className="truncate text-[12.5px]">{prog.name}</span>
                                      </div>

                                      {/* Levels */}
                                      {isProgExpanded && (
                                        <div className="pl-5 space-y-0.5">
                                          {prog.levels.map((lvl) => {
                                            const isLvlSelected =
                                              isDeptSelected && selectedLevel === lvl;
                                            return (
                                              <div
                                                key={lvl}
                                                onClick={() => {
                                                  setSelectedCollegeId(col.id);
                                                  setSelectedDeptId(dept.id);
                                                  setSelectedProgId(prog.id);
                                                  setSelectedLevel(
                                                    selectedLevel === lvl ? null : lvl
                                                  );
                                                }}
                                                className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-colors text-[12px] ${
                                                  isLvlSelected
                                                    ? "bg-blue-50 text-blue-700 font-semibold"
                                                    : "hover:bg-gray-100 text-gray-500"
                                                }`}
                                              >
                                                <Book size={12} className={isLvlSelected ? "text-blue-600" : "text-gray-400"} />
                                                <span>{lvl}</span>
                                                {isLvlSelected && (
                                                  <span className="text-[10px] ml-auto bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-medium">
                                                    Filter
                                                  </span>
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
                  )}
                </div>
              );
            })}
          </div>

          {/* "+ Add College" Button */}
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <Button
              type="button"
              variant="tertiary"
              onClick={() => setIsAddCollegeOpen(true)}
              className="w-full text-blue-700 hover:bg-blue-50 hover:text-blue-800 h-9 font-medium"
            >
              <Plus size={16} className="mr-2" /> Add college
            </Button>
          </div>
        </Card>

        {/* Right: Department Details & Courses */}
        <Card className="flex-1 flex flex-col h-[640px] overflow-hidden">
          {/* Detail header */}
          <div className="p-6 border-b border-gray-100 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {/* Breadcrumb Navigation */}
                <div className="text-[13px] text-gray-500 font-medium mb-1.5 flex items-center gap-2 flex-wrap">
                  <span
                    onClick={() => {
                      setSelectedDeptId("");
                      setSelectedLevel(null);
                    }}
                    className="hover:text-blue-700 cursor-pointer"
                  >
                    {currentCollege?.name || "College of Basic Sciences"}
                  </span>
                  <ChevronRight size={12} className="text-gray-400" />
                  <span className="text-blue-700 font-semibold">
                    {currentDept?.name || "Dept. Computer Science"}
                  </span>
                  {selectedLevel && (
                    <>
                      <ChevronRight size={12} className="text-gray-400" />
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[12px] font-medium">
                        {selectedLevel}
                      </span>
                    </>
                  )}
                </div>

                <h3 className="text-[20px] font-bold text-gray-900 tracking-tight">
                  {currentDept?.name || "Department of Computer Science"}
                </h3>
                <p className="text-[14px] text-gray-500 mt-1">
                  Code: <strong className="text-gray-700">{currentDept?.code || "CSC"}</strong> •{" "}
                  Head: <strong className="text-gray-700">{currentDept?.head || "Dr. Adeyemi"}</strong> •{" "}
                  Dean: <strong className="text-gray-700">{currentCollege?.dean}</strong> •{" "}
                  {currentDept?.programmes.length || 0} Programmes
                </p>
              </div>

              {/* Action Buttons: "Edit" & "+ Add programme" */}
              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={openEditDept}
                  className="h-10 hover:border-blue-300 hover:text-blue-700"
                >
                  <Edit2 size={15} className="mr-2 text-gray-500" /> Edit
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsAddProgrammeOpen(true)}
                  className="h-10 bg-blue-600 hover:bg-blue-700 shadow-xs"
                >
                  <Plus size={16} className="mr-2" /> Add programme
                </Button>
              </div>
            </div>
          </div>

          {/* Courses table */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/70 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-gray-900 text-[15px]">Department courses</h4>
                {selectedLevel && (
                  <button
                    type="button"
                    onClick={() => setSelectedLevel(null)}
                    className="text-[12px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    Clear filter &times;
                  </button>
                )}
                <span className="text-[12px] bg-gray-200 text-gray-700 font-semibold px-2 py-0.5 rounded-full">
                  {displayedCourses.length}
                </span>
              </div>

              {/* "Add course" Button */}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsAddCourseOpen(true)}
                className="hover:border-blue-500 hover:text-blue-700 font-medium"
              >
                <Plus size={14} className="mr-1.5" /> Add course
              </Button>
            </div>

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
                {displayedCourses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      No courses found in this department. Click &quot;Add course&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  displayedCourses.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => openEditCourse(c)}
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-3.5 font-bold text-gray-900 font-mono">{c.code}</td>
                      <td className="px-6 py-3.5 font-medium text-gray-900">{c.title}</td>
                      <td className="px-6 py-3.5 text-gray-600">{c.level} level</td>
                      <td className="px-6 py-3.5 text-gray-600">{c.sem}</td>
                      <td className="px-6 py-3.5 text-gray-600">
                        {c.lecturers.length > 0 ? c.lecturers.join(", ") : (
                          <span className="text-gray-400 italic">None</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge
                          variant={c.status === "Active" ? "success-solid" : "gray-solid"}
                          className="font-medium"
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditCourse(c);
                          }}
                          className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors"
                          title="Edit course"
                        >
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
      {isAddCollegeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-[17px]">Add New College</h3>
              <button
                type="button"
                onClick={() => setIsAddCollegeOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddCollege} className="p-5 space-y-4">
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  College Name *
                </label>
                <Input
                  required
                  placeholder="e.g. College of Basic Sciences"
                  value={collegeForm.name}
                  onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  College Code
                </label>
                <Input
                  placeholder="e.g. CBS"
                  value={collegeForm.code}
                  onChange={(e) => setCollegeForm({ ...collegeForm, code: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Dean of College
                </label>
                <Input
                  placeholder="e.g. Prof. O. Adebayo"
                  value={collegeForm.dean}
                  onChange={(e) => setCollegeForm({ ...collegeForm, dean: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <Button type="button" variant="secondary" onClick={() => setIsAddCollegeOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save College
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Department */}
      {isEditDeptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-[17px]">Edit Department</h3>
              <button
                type="button"
                onClick={() => setIsEditDeptOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveDept} className="p-5 space-y-4">
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Department Name *
                </label>
                <Input
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Department Code *
                </label>
                <Input
                  required
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Head of Department (HOD)
                </label>
                <Input
                  value={deptForm.head}
                  onChange={(e) => setDeptForm({ ...deptForm, head: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <Button type="button" variant="secondary" onClick={() => setIsEditDeptOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Programme */}
      {isAddProgrammeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-[17px]">Add Academic Programme</h3>
              <button
                type="button"
                onClick={() => setIsAddProgrammeOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddProgramme} className="p-5 space-y-4">
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Programme Name *
                </label>
                <Input
                  required
                  placeholder="e.g. B.Sc. Computer Science"
                  value={progForm.name}
                  onChange={(e) => setProgForm({ ...progForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Degree Awarded
                </label>
                <select
                  value={progForm.degree}
                  onChange={(e) => setProgForm({ ...progForm, degree: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-gray-200 text-[14px]"
                >
                  <option>B.Sc.</option>
                  <option>B.Eng.</option>
                  <option>B.Agric.</option>
                  <option>B.A.</option>
                  <option>B.Fisheries</option>
                </select>
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <Button type="button" variant="secondary" onClick={() => setIsAddProgrammeOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Add Programme
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Course */}
      {isAddCourseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-[17px]">Add New Course</h3>
              <button
                type="button"
                onClick={() => setIsAddCourseOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddCourse} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">
                    Course Code *
                  </label>
                  <Input
                    required
                    placeholder="e.g. CSC 301"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Level</label>
                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-gray-200 text-[14px]"
                  >
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="500">500 Level</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Course Title *
                </label>
                <Input
                  required
                  placeholder="e.g. Data Structures & Algorithms"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Semester</label>
                  <select
                    value={courseForm.sem}
                    onChange={(e) => setCourseForm({ ...courseForm, sem: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-gray-200 text-[14px]"
                  >
                    <option value="1st">1st (Harmattan)</option>
                    <option value="2nd">2nd (Rain)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Status</label>
                  <select
                    value={courseForm.status}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        status: e.target.value as "Active" | "Archived",
                      })
                    }
                    className="w-full h-10 px-3 rounded-md border border-gray-200 text-[14px]"
                  >
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Assigned Lecturer(s)
                </label>
                <Input
                  placeholder="e.g. Dr. Bello"
                  value={courseForm.lecturer}
                  onChange={(e) => setCourseForm({ ...courseForm, lecturer: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button type="button" variant="secondary" onClick={() => setIsAddCourseOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Add Course
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Course */}
      {isEditCourseOpen && activeCourseToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-[17px]">Edit Course</h3>
              <button
                type="button"
                onClick={() => setIsEditCourseOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveEditedCourse} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">
                    Course Code *
                  </label>
                  <Input
                    required
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Level</label>
                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-gray-200 text-[14px]"
                  >
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="500">500 Level</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Course Title *
                </label>
                <Input
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Semester</label>
                  <select
                    value={courseForm.sem}
                    onChange={(e) => setCourseForm({ ...courseForm, sem: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-gray-200 text-[14px]"
                  >
                    <option value="1st">1st (Harmattan)</option>
                    <option value="2nd">2nd (Rain)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Status</label>
                  <select
                    value={courseForm.status}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        status: e.target.value as "Active" | "Archived",
                      })
                    }
                    className="w-full h-10 px-3 rounded-md border border-gray-200 text-[14px]"
                  >
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Assigned Lecturer(s)
                </label>
                <Input
                  value={courseForm.lecturer}
                  onChange={(e) => setCourseForm({ ...courseForm, lecturer: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="tertiary"
                  onClick={() => handleDeleteCourse(activeCourseToEdit.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={15} className="mr-1.5" /> Delete
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setIsEditCourseOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Save Changes
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
