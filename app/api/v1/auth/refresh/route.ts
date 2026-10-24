import { NextResponse } from "next/server";

export async function POST() {
  const token = `lasu_live_token_student_${Date.now()}`;
  const refreshToken = `lasu_live_refresh_student_${Date.now()}`;

  return NextResponse.json({
    success: true,
    data: {
      accessToken: token,
      refreshToken,
    },
  });
}
