import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const authHeader = (req.headers.get("authorization") || "").toLowerCase();
  let role = "STUDENT";
  let names = "Nifemi Osadare";
  let email = "nifemi.osadare@lasustech.edu.ng";

  if (cookieHeader.includes("role=admin") || authHeader.includes("admin")) {
    role = "ADMIN";
    names = "System Administrator";
    email = "admin@lasustech.edu.ng";
  } else if (cookieHeader.includes("role=lecturer") || authHeader.includes("lecturer")) {
    role = "LECTURER";
    names = "Dr. O. Adeyemi";
    email = "adeyemi@lasustech.edu.ng";
  }

  return NextResponse.json({
    success: true,
    data: {
      id: `usr_${role.toLowerCase()}_1`,
      names,
      email,
      identifier: role === "STUDENT" ? "CSC/2022/305" : email,
      primaryRole: role,
      roles: [role],
    },
  });
}
