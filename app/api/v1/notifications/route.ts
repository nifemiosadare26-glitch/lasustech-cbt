import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: "notif_welcome_1",
        type: "EXAM_REMINDER",
        title: "CSC 301 CBT Examination Live",
        body: "The CBT examination hall is open for CSC 301. Enter using your access code.",
        readAt: null,
        createdAt: new Date().toISOString(),
        meta: {
          accessCode: "LASU-301",
          sittingId: "sitting_csc301",
          href: "/student/exam/sitting_csc301/start?code=LASU-301",
        },
      },
    ],
    meta: {
      unread: 1,
    },
  });
}
