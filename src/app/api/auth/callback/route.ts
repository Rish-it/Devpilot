import { NextRequest, NextResponse } from "next/server";
import { encryptToken, COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  if (error) {
    return NextResponse.redirect(`${baseUrl}/?auth_error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/?auth_error=no_code`);
  }

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      return NextResponse.redirect(`${baseUrl}/?auth_error=token_exchange`);
    }

    const encrypted = encryptToken(tokenData.access_token);
    const response = NextResponse.redirect(baseUrl);

    response.cookies.set(COOKIE_NAME, encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch {
    return NextResponse.redirect(`${baseUrl}/?auth_error=server_error`);
  }
}
