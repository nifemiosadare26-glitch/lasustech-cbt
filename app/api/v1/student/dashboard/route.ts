import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      student: {
        firstName: "Nifemi",
        names: "Nifemi Osadare",
        matricNo: "CSC/2022/305",
        email: "nifemi.osadare@lasustech.edu.ng",
        level: "300 Level",
        programme: { code: "B.Sc.", name: "Computer Science" },
        department: { code: "CSC", name: "Computer Science" },
        college: { code: "CBS", name: "College of Basic Sciences" },
      },
      live: [
        {
          id: "sitting_csc301",
          examId: "exam_csc301",
          code: "CSC 301",
          title: "Data Structures & Algorithms",
          status: "live",
          dateLabel: "Today",
          durationLabel: "60 Mins",
          durationMin: 60,
          venue: "CBT Hall 1",
          unit: 3,
          attemptId: null,
          attemptStatus: "not_started",
          accessCode: "LASU-301",
        },
      ],
      upcoming: [
        {
          id: "sitting_csc305",
          examId: "exam_csc305",
          code: "CSC 305",
          title: "Operating Systems & Concurrency",
          status: "upcoming",
          dateLabel: "Tomorrow, 09:00 AM",
          windowLabel: "Entry locked until 09:00 AM",
          durationLabel: "60 Mins",
          venue: "CBT Hall 2",
          unit: 3,
        },
      ],
      completed: [],
    },
  });
}
