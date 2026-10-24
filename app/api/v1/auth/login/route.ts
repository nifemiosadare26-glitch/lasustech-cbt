import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const identifier = String(body.identifier || "").trim();
    const lower = identifier.toLowerCase();

    let primaryRole = "STUDENT";
    let names = "Nifemi Osadare";
    let email = "nifemi.osadare@lasustech.edu.ng";

    if (lower.includes("admin")) {
      primaryRole = "ADMIN";
      names = "System Administrator";
      email = "admin@lasustech.edu.ng";
    } else if (lower.includes("lec") || lower.includes("staff") || lower.includes("adeyemi")) {
      primaryRole = "LECTURER";
      names = "Dr. O. Adeyemi";
      email = "adeyemi@lasustech.edu.ng";
    }

    const token = `lasu_live_token_${primaryRole.toLowerCase()}_${Date.now()}`;
    const refreshToken = `lasu_live_refresh_${primaryRole.toLowerCase()}_${Date.now()}`;

    const res = NextResponse.json({
      success: true,
      data: {
        accessToken: token,
        refreshToken,
        user: {
          id: `usr_${primaryRole.toLowerCase()}_1`,
          names,
          email,
          primaryRole,
          roles: [primaryRole],
        },
      },
    });

    res.cookies.set("role", primaryRole.toLowerCase(), {
      path: "/",
      sameSite: "lax",
    });

    return res;
  } catch (e: any) {
    return NextResponse.json(
      { error: { message: e.message || "Failed to process login" } },
      { status: 500 }
    );
  }
}
