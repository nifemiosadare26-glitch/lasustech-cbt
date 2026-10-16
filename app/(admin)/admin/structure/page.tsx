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
  Building,
  GraduationCap,
  Layers,
  Sparkles
} from "lucide-react";

interface Course {
  id: string;
  code: string;
  title: string;
  level: string;
  sem: string;
  lecturers: string[];
  status: "Active" | "Archived";
}

interface Programme {
  id: string;
  name: string;
  degree: string;
  levels: string[];
}

interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  programmes: Programme[];
  courses: Course[];
}

interface Faculty {
  id: string;
  name: string;
  code: string;
  dean: string;
  departments: Department[];
}

const initialStructure: Faculty[] = [
  {
    id: "fac_sci",
    name: "Faculty of Science",
    code: "SCI",
    dean: "Prof. O. Adebayo",
    departments: [
      {
        id: "dept_csc",
        name: "Department of Computer Science",
        code: "CSC",
        head: "Dr. Adeyemi",
        programmes: [
          {
            id: "prog_bsc_csc",
            name: "B.Sc. Computer Science",
            degree: "B.Sc.",
            levels: ["100 level", "200 level", "300 level", "400 level"],
          },
          {
            id: "prog_bsc_se",
            name: "B.Sc. Software Engineering",
            degree: "B.Sc.",
            levels: ["100 level", "200 level", "300 level", "400 level"],
          },
        ],
        courses: [
          {
            id: "c_csc301",
            code: "CSC 301",
            title: "Data Structures",
            level: "300",
            sem: "1st",
            lecturers: ["Dr. Bello"],
            status: "Active",
          },
          {
            id: "c_csc305",
            code: "CSC 305",
            title: "Algorithms",
            level: "300",
            sem: "1st",
            lecturers: ["Dr. Bello", "Mr. Tunde"],
            status: "Active",
          },
          {
            id: "c_csc101",
            code: "CSC 101",
            title: "Intro to Computing",
            level: "100",
            sem: "1st",
            lecturers: [],
            status: "Archived",
          },
          {
            id: "c_csc201",
            code: "CSC 201",
            title: "Computer Programming I",
            level: "200",
            sem: "1st",
            lecturers: ["Dr. Adeyemi"],
            status: "Active",
          },
        ],
      },
      {
        id: "dept_mth",
        name: "Department of Mathematics",
        code: "MTH",
        head: "Dr. K. Salami",
        programmes: [
          {
            id: "prog_bsc_mth",
            name: "B.Sc. Mathematics",
            degree: "B.Sc.",
            levels: ["100 level", "200 level", "300 level", "400 level"],
          },
        ],
        courses: [
          {
            id: "c_mth101",
            code: "MTH 101",
            title: "Elementary Mathematics I",
            level: "100",
            sem: "1st",
            lecturers: ["Dr. K. Salami"],
            status: "Active",
          },
          {
            id: "c_mth201",
            code: "MTH 201",
            title: "Mathematical Methods I",
            level: "200",
            sem: "1st",
            lecturers: ["Dr. K. Salami"],
            status: "Active",
          },
        ],
      },
    ],
  },
  {
    id: "fac_eng",
    name: "Faculty of Engineering",
    code: "ENG",
    dean: "Prof. E. Johnson",
    departments: [
      {
        id: "dept_mee",
        name: "Department of Mechanical Engineering",
        code: "MEE",
        head: "Engr. F. Alabi",
        programmes: [
          {
            id: "prog_beng_mee",
            name: "B.Eng. Mechanical Engineering",
            degree: "B.Eng.",
            levels: ["100 level", "200 level", "300 level", "400 level", "500 level"],
          },
        ],
        courses: [
          {
            id: "c_mee201",
            code: "MEE 201",
            title: "Engineering Mechanics",
            level: "200",
            sem: "1st",
            lecturers: ["Engr. F. Alabi"],
            status: "Active",
          },
        ],
      },
    ],
  },
];

export default function AcademicStructure() {
  const [structure, setStructure] = useState<Faculty[]>(initialStructure);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("fac_sci");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("dept_csc");
  const [selectedProgId, setSelectedProgId] = useState<string | null>("prog_bsc_csc");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  // Expanded nodes in tree
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(["fac_sci", "dept_csc", "prog_bsc_csc"])
  );

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals visibility
  const [isAddFacultyOpen, setIsAddFacultyOpen] = useState(false);
  const [isEditDeptOpen, setIsEditDeptOpen] = useState(false);
  const [isAddProgrammeOpen, setIsAddProgrammeOpen] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [activeCourseToEdit, setActiveCourseToEdit] = useState<Course | null>(null);

  // Form states
  const [facultyForm, setFacultyForm] = useState({ name: "", code: "", dean: "" });
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

  // Find currently selected faculty & department
  const currentFaculty = structure.find((f) => f.id === selectedFacultyId) || structure[0];
  const currentDept =
    currentFaculty?.departments.find((d) => d.id === selectedDeptId) ||
    currentFaculty?.departments[0];

  // Filtered courses based on selected level (if any)
  const displayedCourses = useMemo(() => {
    if (!currentDept) return [];
    if (!selectedLevel) return currentDept.courses;
    const levelNumber = selectedLevel.replace(/[^0-9]/g, "");
    return currentDept.courses.filter((c) => c.level === levelNumber);
  }, [currentDept, selectedLevel]);

  // Handle Add Faculty
  const handleAddFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyForm.name.trim()) return;

    const newFaculty: Faculty = {
      id: `fac_${Date.now()}`,
      name: facultyForm.name,
      code: facultyForm.code || facultyForm.name.substring(0, 3).toUpperCase(),
      dean: facultyForm.dean || "Unassigned",
      departments: [],
    };

    setStructure([...structure, newFaculty]);
    setSelectedFacultyId(newFaculty.id);
    setSelectedDeptId("");
    setExpandedNodes((prev) => new Set(prev).add(newFaculty.id));
    setIsAddFacultyOpen(false);
    setFacultyForm({ name: "", code: "", dean: "" });
    showToast(`Faculty "${newFaculty.name}" created successfully!`);
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
      prev.map((f) => {
        if (f.id !== currentFaculty.id) return f;
        return {
          ...f,
          departments: f.departments.map((d) =>
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
      prev.map((f) => {
        if (f.id !== currentFaculty.id) return f;
        return {
          ...f,
          departments: f.departments.map((d) =>
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
      prev.map((f) => {
        if (f.id !== currentFaculty.id) return f;
        return {
          ...f,
          departments: f.departments.map((d) =>
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
      prev.map((f) => {
        if (f.id !== currentFaculty.id) return f;
        return {
          ...f,
          departments: f.departments.map((d) =>
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
      prev.map((f) => {
        if (f.id !== currentFaculty.id) return f;
        return {
          ...f,
          departments: f.departments.map((d) =>
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
        <p className="text-[14px] text-gray-500">Manage faculties, departments, programmes, and courses.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Left: Dynamic Interactive Tree */}
        <Card className="w-full lg:w-[320px] flex-shrink-0 flex flex-col h-[620px] overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search structure..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-[13px] bg-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 text-[14px] select-none">
            {structure.map((fac) => {
              const isFacExpanded = expandedNodes.has(fac.id);
              const isFacSelected = selectedFacultyId === fac.id && !selectedDeptId;

              // Search query matching
              if (
                searchQuery &&
                !fac.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !fac.departments.some(
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
                <div key={fac.id} className="space-y-1">
                  {/* Faculty Node */}
                  <div
                    onClick={() => {
                      setSelectedFacultyId(fac.id);
                      toggleExpand(fac.id);
                      if (fac.departments.length > 0 && selectedFacultyId !== fac.id) {
                        setSelectedDeptId(fac.departments[0].id);
                      }
                    }}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                      isFacSelected
                        ? "bg-blue-50 text-blue-900 font-semibold"
                        : "hover:bg-gray-100 text-gray-900 font-medium"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(fac.id);
                      }}
                      className="p-0.5 text-gray-400 hover:text-gray-600 rounded"
                    >
                      {isFacExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {isFacExpanded ? (
                      <FolderOpen size={16} className="text-blue-500 shrink-0" />
                    ) : (
                      <Folder size={16} className="text-blue-500 shrink-0" />
                    )}
                    <span className="truncate">{fac.name}</span>
                  </div>

                  {/* Departments */}
                  {isFacExpanded && (
                    <div className="pl-5 space-y-1">
                      {fac.departments.map((dept) => {
                        const isDeptExpanded = expandedNodes.has(dept.id);
                        const isDeptSelected =
                          selectedFacultyId === fac.id && selectedDeptId === dept.id;

                        return (
                          <div key={dept.id} className="space-y-1">
                            {/* Department Node */}
                            <div
                              onClick={() => {
                                setSelectedFacultyId(fac.id);
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
                                {isDeptExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                              </button>
                              {isDeptExpanded ? (
                                <FolderOpen size={16} className="text-blue-600 shrink-0" />
                              ) : (
                                <Folder size={16} className="text-gray-400 shrink-0" />
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
                                          setSelectedFacultyId(fac.id);
                                          setSelectedDeptId(dept.id);
                                          setSelectedProgId(prog.id);
                                          setSelectedLevel(null);
                                          toggleExpand(prog.id);
                                        }}
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
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
                                          {isProgExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </button>
                                        <Folder size={15} className="text-gray-400 shrink-0" />
                                        <span className="truncate text-[13px]">{prog.name}</span>
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
                                                  setSelectedFacultyId(fac.id);
                                                  setSelectedDeptId(dept.id);
                                                  setSelectedProgId(prog.id);
                                                  setSelectedLevel(
                                                    selectedLevel === lvl ? null : lvl
                                                  );
                                                }}
                                                className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-colors text-[13px] ${
                                                  isLvlSelected
                                                    ? "bg-blue-50 text-blue-700 font-semibold"
                                                    : "hover:bg-gray-100 text-gray-500"
                                                }`}
                                              >
                                                <Book size={13} className={isLvlSelected ? "text-blue-600" : "text-gray-400"} />
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

          {/* "+ Add faculty" Button - Fully Clickable */}
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <Button
              type="button"
              variant="tertiary"
              onClick={() => setIsAddFacultyOpen(true)}
              className="w-full text-blue-700 hover:bg-blue-50 hover:text-blue-800 h-9 font-medium"
            >
              <Plus size={16} className="mr-2" /> Add faculty
            </Button>
          </div>
        </Card>

        {/* Right: Department Details & Courses */}
        <Card className="flex-1 flex flex-col h-[620px] overflow-hidden">
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
                    {currentFaculty?.name || "Faculty of Science"}
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
                  Code: <strong className="text-gray-700">{currentDept?.code || "CSC"}</strong> •
                  Head: <strong className="text-gray-700">{currentDept?.head || "Dr. Adeyemi"}</strong> •{" "}
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

              {/* "Add course" Button - Fully Clickable */}
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
                  <th className="px-4 py-3 text-[13px] font-semibold text-gray-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedCourses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-[14px]">
                      No courses found in this category. Click &quot;Add course&quot; above to create one.
                    </td>
                  </tr>
                ) : (
                  displayedCourses.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => openEditCourse(c)}
                      className={`hover:bg-blue-50/60 cursor-pointer transition-colors ${
                        c.status === "Archived" ? "opacity-60 bg-gray-50/40" : ""
                      }`}
                    >
                      <td className="px-6 py-3.5 font-mono text-[13px] text-blue-700 font-semibold">
                        {c.code}
                      </td>
                      <td className="px-6 py-3.5 text-[14px] font-medium text-gray-900">
                        {c.title}
                      </td>
                      <td className="px-6 py-3.5 text-[14px] text-gray-500">{c.level}</td>
                      <td className="px-6 py-3.5 text-[14px] text-gray-500">{c.sem}</td>
                      <td className="px-6 py-3.5">
                        {c.lecturers.length === 0 ? (
                          <span className="text-[13px] text-gray-400">None assigned</span>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[12px] font-medium">
                              {c.lecturers[0]}
                            </span>
                            {c.lecturers.length > 1 && (
                              <span className="inline-flex px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 text-[11px] font-medium">
                                +{c.lecturers.length - 1}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge variant={c.status === "Active" ? "success" : "default"}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          type="button"
                          variant="tertiary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditCourse(c);
                          }}
                          className="h-8 px-2 text-gray-500 hover:text-blue-700"
                        >
                          <Edit2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* MODAL 1: ADD FACULTY */}
      {isAddFacultyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Building size={18} />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-gray-900">Add faculty</h3>
                  <p className="text-[12px] text-gray-500">Create a new academic faculty division</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFacultyOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddFaculty} className="p-5 space-y-4">
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Faculty Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Faculty of Environmental Sciences"
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. ENV"
                    value={facultyForm.code}
                    onChange={(e) => setFacultyForm({ ...facultyForm, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">
                    Dean / Head
                  </label>
                  <Input
                    placeholder="e.g. Prof. G. Balogun"
                    value={facultyForm.dean}
                    onChange={(e) => setFacultyForm({ ...facultyForm, dean: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsAddFacultyOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create faculty</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT DEPARTMENT */}
      {isEditDeptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-gray-900">Edit department</h3>
                  <p className="text-[12px] text-gray-500">Update code, title, and head of department</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditDeptOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="p-5 space-y-4">
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Department of Computer Science"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">
                    Dept Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. CSC"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">
                    Head of Dept (HOD)
                  </label>
                  <Input
                    placeholder="e.g. Dr. Adeyemi"
                    value={deptForm.head}
                    onChange={(e) => setDeptForm({ ...deptForm, head: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditDeptOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD PROGRAMME */}
      {isAddProgrammeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-gray-900">Add programme</h3>
                  <p className="text-[12px] text-gray-500">
                    Add degree programme to {currentDept?.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddProgrammeOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProgramme} className="p-5 space-y-4">
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Programme Title <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. B.Sc. Cybersecurity"
                  value={progForm.name}
                  onChange={(e) => setProgForm({ ...progForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Degree Awarded
                </label>
                <select
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={progForm.degree}
                  onChange={(e) => setProgForm({ ...progForm, degree: e.target.value })}
                >
                  <option value="B.Sc.">B.Sc. (Bachelor of Science)</option>
                  <option value="B.Eng.">B.Eng. (Bachelor of Engineering)</option>
                  <option value="B.Tech.">B.Tech. (Bachelor of Technology)</option>
                  <option value="HND">HND (Higher National Diploma)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsAddProgrammeOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create programme</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD COURSE */}
      {isAddCourseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Book size={18} />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-gray-900">Add course</h3>
                  <p className="text-[12px] text-gray-500">
                    Add new course to {currentDept?.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCourseOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">
                    Course Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. CSC 303"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Level</label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                  >
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="300">300</option>
                    <option value="400">400</option>
                    <option value="500">500</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Course Title <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Database Management Systems"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Semester</label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={courseForm.sem}
                    onChange={(e) => setCourseForm({ ...courseForm, sem: e.target.value })}
                  >
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Status</label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={courseForm.status}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        status: e.target.value as "Active" | "Archived",
                      })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Assigned Lecturer
                </label>
                <Input
                  placeholder="e.g. Dr. Bello"
                  value={courseForm.lecturer}
                  onChange={(e) => setCourseForm({ ...courseForm, lecturer: e.target.value })}
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsAddCourseOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create course</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: EDIT COURSE / DELETE COURSE */}
      {isEditCourseOpen && activeCourseToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-gray-900">
                    Edit {activeCourseToEdit.code}
                  </h3>
                  <p className="text-[12px] text-gray-500">Update course details or status</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditCourseOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedCourse} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">
                    Course Code <span className="text-red-500">*</span>
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
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                  >
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="300">300</option>
                    <option value="400">400</option>
                    <option value="500">500</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Course Title <span className="text-red-500">*</span>
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
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={courseForm.sem}
                    onChange={(e) => setCourseForm({ ...courseForm, sem: e.target.value })}
                  >
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Status</label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={courseForm.status}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        status: e.target.value as "Active" | "Archived",
                      })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">
                  Lecturers (comma separated)
                </label>
                <Input
                  value={courseForm.lecturer}
                  onChange={(e) => setCourseForm({ ...courseForm, lecturer: e.target.value })}
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="danger-outline"
                  onClick={() => handleDeleteCourse(activeCourseToEdit.id)}
                  className="text-[13px]"
                >
                  <Trash2 size={14} className="mr-1" /> Delete
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsEditCourseOpen(false)}
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
