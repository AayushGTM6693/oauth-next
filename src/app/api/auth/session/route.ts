import { NextRequest, NextResponse } from "next/server";
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
} from "../../../../../lib/jwt";
import { prisma } from "../../../../../lib/prisma";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // if xaina bhane no auth
  if (!accessToken && !refreshToken) {
    return NextResponse.json({ user: null, authenticated: false });
  }
  if (accessToken) {
    const payload = verifyAccessToken(accessToken);
    if (payload) {
      const user = await prisma.user.findUnique({
        where: {
          id: payload.userId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          picture: true,
        },
      });
      if (user) {
        return NextResponse.json({
          user: { ...user, image: user.picture },
          authenticated: true,
        });
      }
    }
  }
  //  if access xaina or expire ,try refresh
  if (refreshToken) {
    const payload = verifyRefreshToken(refreshToken);
    if (payload) {
      // session xa ki db ma ?
      const session = await prisma.session.findUnique({
        where: { id: payload.sessionId },
        include: { user: true },
      });
      if (session && session.expiresAt > new Date()) {
        // generate new access token
        const newAccessToken = generateAccessToken({
          userId: session.userId,
          email: session.user.email,
          sessionId: session.id,
        });
        const response = NextResponse.json({
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            image: session.user.picture,
          },
          authenticated: true,
        });

        // set new access token
        response.cookies.set("access_token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 15 * 60,
          path: "/",
        });
        return response;
      }
    }
  }

  // both token invalid bhayo bhane
  const response = NextResponse.json({ user: null, authenticated: false });
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  return response;
}
