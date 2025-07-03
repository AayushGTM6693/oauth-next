import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken } from "../../../../../lib/jwt";
import { prisma } from "../../../../../lib/prisma";
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;
  if (refreshToken) {
    const payload = verifyRefreshToken(refreshToken);
    if (payload) {
      // delete session from db
      await prisma.session
        .delete({
          where: { id: payload.sessionId },
        })
        .catch(() => {});
    }
  }
  const response = NextResponse.json({ success: true });
  // cookies lai clear
  response.cookies.set("access_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // 0-> expire immediately
    path: "/",
  });

  response.cookies.set("refresh_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
