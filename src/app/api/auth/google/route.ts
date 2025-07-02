import { NextResponse } from "next/server";
export async function GET() {
  // env variable bata client id access garxa
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    return NextResponse.json(
      { error: "Google Client Not found" },
      { status: 500 }
    );
  }
  // callback url banako jasma google will redirect after authorization bhayesi
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/google/callback`;

  // yo chai, auth url of google create gareko
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  // adding paramater to auth url
  googleAuthUrl.searchParams.set("client_id", googleClientId); // env ma bahyeko hamro id
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri); // kata return garni bahnera
  googleAuthUrl.searchParams.set("response_type", "code"); // repsonse chai auth code chainxa bhaneko
  googleAuthUrl.searchParams.set("scope", "openid profile email"); // data we want of that user
  googleAuthUrl.searchParams.set("access_type", "offline"); // refresh token ko lagi
  googleAuthUrl.searchParams.set("prompt", "consent"); // consent screen show garxa

  return NextResponse.redirect(googleAuthUrl.toString());
  // redirect to google auth server
}
