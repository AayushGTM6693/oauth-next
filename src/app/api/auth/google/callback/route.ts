import { NextRequest, NextResponse } from "next/server";
// typescript ko lagi
interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string; // permission user le grant gareko
  token_type: string;
  id_token: string;
}
interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export async function GET(request: NextRequest) {
  // parameter extract garxa from callback url
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code"); // google le return gareko authorization code
  const error = searchParams.get("error"); // error

  if (error) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}?error=${error}`);
  }
  // error lai redirect gareko using
  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}?error=no_code`);
  }
  try {
    //auth code to access token gareko
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        // access token lini by exchanging auth code, client secret pani pathaunu parxa
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
      }),
    });
    // success or not token exchange
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange error:", errorData);
      throw new Error("Failed");
    }
    //parse token
    const tokens: GoogleTokenResponse = await tokenResponse.json();
    //access token bata user data fetch gareko
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`, // bearer ma tei access token chainxa to fetch data
        },
      }
    );
    if (!userResponse.ok) {
      throw new Error("Failed to fetch user data");
    }
    // json ma ako data lai parse gareko
    const userData: GoogleUserInfo = await userResponse.json();
    // aba session create garni
    const response = NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}?success=true`
    );
    // http only cookies set
    response.cookies.set(
      "user_session",
      JSON.stringify({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        access_token: tokens.access_token,
        expires_at: Date.now() + tokens.expires_in * 1000,
      }),
      {
        httpOnly: true, // cross scripting bata protection
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: tokens.expires_in, //cookie expiration
        path: "/", // this is available for entire file
      }
    );
    return response;
  } catch (error) {
    console.error("call back error", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}?error=callback_failed`
    );
  }
}
