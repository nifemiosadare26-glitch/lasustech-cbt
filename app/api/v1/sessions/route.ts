import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: "ses_2026_2027",
        name: "2026/2027",
        status: "CURRENT",
        isCurrent: true,
        label: "2026/2027 Academic Session",
        today: new Date().toISOString().split("T")[0],
      },
      {
        id: "ses_2025_2026",
        name: "2025/2026",
        status: "ENDED",
        isCurrent: false,
        label: "2025/2026 Academic Session",
        today: "2026-08-31",
      },
    ],
  });
}
