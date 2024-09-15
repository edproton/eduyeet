import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { removeQuotes } from "./lib/string_utils";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION_BUFFER = 5 * 60; // 5 minutes in seconds

export default async function middleware(request: NextRequest) {
  const loginUrl = new URL("/auth", request.url);
  const homeUrl = new URL("/home", request.url);
  const refreshUrl = new URL("/api/auth/refresh", request.url);
  const isAuthPage = request.nextUrl.pathname === "/auth";
  const validateTokenUrl = new URL("/api/auth/validate-token", request.url);
  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    if (!isAuthPage) {
      loginUrl.searchParams.set("redirect", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(
      accessToken,
      new TextEncoder().encode(JWT_SECRET),
      {
        algorithms: ["HS256"],
      }
    );

    // Validate token using the API route with GET method
    validateTokenUrl.searchParams.set("jti", payload.jti as string);
    const validationResponse = await fetch(validateTokenUrl.toString(), {
      method: "GET",
    });

    const validationResult = await validationResponse.json();
    if (!validationResult.valid) {
      if (!isAuthPage) {
        loginUrl.searchParams.set("redirect", request.url);
        return NextResponse.redirect(loginUrl);
      }

      return NextResponse.next();
    }

    const expirationTime = payload.exp as number;
    const currentTime = Math.floor(Date.now() / 1000);

    if (expirationTime - currentTime <= JWT_EXPIRATION_BUFFER) {
      // Token is close to expiration, attempt to refresh
      const refreshResponse = await fetch(refreshUrl, {
        method: "POST",
        headers: {
          Cookie: `accessToken=${accessToken}`,
        },
      });

      if (refreshResponse.ok) {
        const newAccessToken = removeQuotes(await refreshResponse.text());
        const response = isAuthPage
          ? NextResponse.redirect(homeUrl)
          : NextResponse.next();

        response.cookies.set("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 24 * 60 * 60, // 24 hours
          path: "/",
        });

        return response;
      } else {
        // Refresh failed, redirect to login
        if (!isAuthPage) {
          loginUrl.searchParams.set("redirect", request.url);
          return NextResponse.redirect(loginUrl);
        }
        return NextResponse.next();
      }
    }

    // Token is valid and not close to expiration
    if (isAuthPage) {
      return NextResponse.redirect(homeUrl);
    }
    return NextResponse.next();
  } catch (error) {
    console.error("Token verification failed:", error);
    // Token is invalid, redirect to login if not already on auth page
    if (!isAuthPage) {
      loginUrl.searchParams.set("redirect", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
