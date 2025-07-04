import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "../../../../../lib/jwt";

export async function POST(request: NextRequest) {
  // cookie ma xa ki nai get haneko
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      {
        error: "Refresh token required",
        code: "NO_REFRESH_TOKEN",
      },
      {
        status: 401,
      }
    );
  }
  // xa bhane verify garnu paryo
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    return NextResponse.json({
      error: "invalid refresh token",
      code: "INVALID_REFRESH_TOKEN",
    });
  }

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: true },
  });
  if (!session) {
    return NextResponse.json(
      {
        error: "session not found",
        code: "SESSION_NOT_FOUND",
      },
      { status: 401 }
    );
  }
  // check session not expired
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({
      where: { id: session.id },
    });
    return NextResponse.json(
      {
        error: "Session expired",
        code: "SESSION_EXPIRED",
      },
      { status: 401 }
    );
  }
  // generate new tokens
  const newJwtPayload = {
    userId: session.userId,
    email: session.user.email,
    sessionId: session.id,
  };
  const newAccessToken = generateAccessToken(newJwtPayload);
  const newRefreshToken = generateRefreshToken(newJwtPayload);

  const response = NextResponse.json({
    message: "Tokens refreshed successfully",
    authenticated: true,
  });

  // set new cookies
  response.cookies.set("access_token", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60, // 15 min
    path: "/",
  });

  response.cookies.set("refresh_token", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  return response;
}
