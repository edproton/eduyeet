import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { AuthService } from "./services/auth-service";

export default async function middleware(request: NextRequest) {
  // Define the login page URL
  const loginUrl = new URL("/auth", request.url);
  const homeUrl = new URL("/home", request.url);

  const isAuthPage = request.nextUrl.pathname === "/auth";

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Add the original requested URL as a parameter for redirect after login
  if (!isAuthPage) {
    loginUrl.searchParams.append("redirect", request.url);
  }

  // If there are no tokens and it's not the auth page, redirect to login
  if (!accessToken && !refreshToken && !isAuthPage) {
    return NextResponse.redirect(loginUrl);
  }

  // If there are tokens and it's the auth page, redirect to home
  if (accessToken && refreshToken) {
    // Verify access token

    if (isAuthPage) {
      return NextResponse.redirect(homeUrl);
    }
  }

  // For all other cases, continue with the request
  return NextResponse.next();

  // try {
  // Verify access token
  // const decoded = jwt.verify(
  //   accessToken,
  //   process.env.JWT_ACCESS_SECRET!
  // ) as jwt.JwtPayload;

  //   // If access token is valid, continue
  //   return NextResponse.next();
  // } catch (error) {
  //   // If access token is expired, try to refresh
  //   if (error instanceof jwt.TokenExpiredError) {
  //     try {
  //       const ipAddress =
  //         request.ip ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  //       const userAgent = request.headers.get("user-agent") ?? "Unknown";

  //       const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
  //         await AuthService.refreshToken(
  //           refreshToken,
  //           ipAddress,
  //           userAgent,
  //           {}
  //         );

  //       // Set new cookies
  //       const response = NextResponse.next();
  //       response.cookies.set("accessToken", newAccessToken, {
  //         httpOnly: true,
  //         secure: process.env.NODE_ENV === "production",
  //         sameSite: "strict",
  //         maxAge: 15 * 60, // 15 minutes
  //       });
  //       response.cookies.set("refreshToken", newRefreshToken, {
  //         httpOnly: true,
  //         secure: process.env.NODE_ENV === "production",
  //         sameSite: "strict",
  //         maxAge: 7 * 24 * 60 * 60, // 7 days
  //       });

  //       return response;
  //     } catch (refreshError) {
  //       // If refresh fails, redirect to login
  //       return NextResponse.redirect(loginUrl);
  //     }
  //   }

  //   // For any other error, redirect to login
  //   return NextResponse.redirect(loginUrl);
  // }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (API routes that don't require authentication)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
