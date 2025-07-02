import { NextResponse } from "next/server";
export async function POST() {
  const response = NextResponse.json({ success: true });
  // del => by setting empty
  response.cookies.set("user_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // 0-> expire immediately
    path: "/",
  });
  return response;
}
