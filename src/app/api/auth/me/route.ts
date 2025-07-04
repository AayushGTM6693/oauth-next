import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "../../../../../lib/jwt";
import { prisma } from "../../../../../lib/prisma";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;

  // no access token = 401
  if (!accessToken) {
    return NextResponse.json(
      {
        error: "Access token required",
        code: "NO_ACCESS_TOKEN",
      },
      { status: 401 }
    );
  }
  // verify access token
  const payload = verifyAccessToken(accessToken);

  // invalid or expired access token = 401
  if (!payload) {
    return NextResponse.json(
      {
        error: "Access token expired or invalid",
        code: "INVALID_ACCESS_TOKEN",
      },
      {
        status: 401,
      }
    );
  }
  // check session exits in database (to prevent hacking)
  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: {
      user: true,
    },
  });
  if (!session) {
    return NextResponse.json(
      {
        error: "Session not found",
        code: "INVALID_SESSION",
      },
      {
        status: 401,
      }
    );
  }
  // check session not expired
  if (session.expiresAt < new Date()) {
    // Delete expired session
    await prisma.session.delete({
      where: { id: session.id },
    });
    return NextResponse.json({
      error: "Session expired",
      code: "SESSION_EXPIRED",
    });
  }

  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.picture,
    },
    authenticated: true,
    sessionId: session.id,
  });
}
