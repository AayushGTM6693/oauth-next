import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  // session cookie lini
  const sessionCookie = request.cookies.get("user_session");
  // if xaina bhane no auth
  if (!sessionCookie) {
    return NextResponse.json({ user: null, authenticated: false });
  }
  try {
    //json data lai parse garxa
    const session = JSON.parse(sessionCookie.value);
    // expire xa ki nai bhanera
    if (Date.now() > session.expires_at) {
      // if bhayo vane coookie delte hunxa
      const response = NextResponse.json({ user: null, authenticated: false });
      response.cookies.delete("user_session");
      return response;
    }
    // session valid xa bhane , return user data
    return NextResponse.json({
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        picture: session.picture,
      },
      authenticated: true,
    });
  } catch (error) {
    // corrupted bhayo cookie
    console.error("Session parsing error", error);
    const response = NextResponse.json({ user: null, authenticated: false });
    response.cookies.delete("user_session");
    return response;
  }
}
