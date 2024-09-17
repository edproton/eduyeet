import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { removeQuotes } from "@/lib/string_utils";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION_BUFFER = 5 * 60; // 5 minutes in seconds

interface TokenPayload {
  jti: string;
  exp: number;
}

export class AuthMiddleware {
  private request: NextRequest;
  private loginUrl: URL;
  private homeUrl: URL;
  private refreshUrl: URL;
  private validateTokenUrl: URL;
  private isAuthPage: boolean;
  private accessToken: string | undefined;

  constructor(request: NextRequest) {
    this.request = request;
    this.loginUrl = new URL("/auth", request.url);
    this.homeUrl = new URL("/home", request.url);
    this.refreshUrl = new URL("/api/auth/refresh", request.url);
    this.validateTokenUrl = new URL("/api/auth/validate-token", request.url);
    this.isAuthPage = request.nextUrl.pathname === "/auth";
    this.accessToken = request.cookies.get("accessToken")?.value;
  }

  async handle(): Promise<NextResponse> {
    if (!this.accessToken) {
      return this.handleNoToken();
    }

    try {
      const payload = await this.verifyToken();
      await this.validateToken(payload);
      return this.handleValidToken(payload);
    } catch (error) {
      console.error("Token verification failed:", error);
      return this.handleInvalidToken();
    }
  }

  private handleNoToken(): NextResponse {
    if (!this.isAuthPage) {
      this.loginUrl.searchParams.set("redirect", this.request.url);
      return NextResponse.redirect(this.loginUrl);
    }
    return NextResponse.next();
  }

  private async verifyToken(): Promise<TokenPayload> {
    const { payload } = await jwtVerify(
      this.accessToken!,
      new TextEncoder().encode(JWT_SECRET),
      { algorithms: ["HS256"] }
    );
    return payload as TokenPayload;
  }

  private async validateToken(payload: TokenPayload): Promise<void> {
    this.validateTokenUrl.searchParams.set("jti", payload.jti);
    const validationResponse = await fetch(this.validateTokenUrl.toString(), {
      method: "GET",
    });
    const validationResult = await validationResponse.json();
    if (!validationResult.valid) {
      throw new Error("Token is not valid");
    }
  }

  private async handleValidToken(payload: TokenPayload): Promise<NextResponse> {
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp - currentTime <= JWT_EXPIRATION_BUFFER) {
      return this.refreshToken();
    }

    return this.isAuthPage
      ? NextResponse.redirect(this.homeUrl)
      : NextResponse.next();
  }

  private async refreshToken(): Promise<NextResponse> {
    const refreshResponse = await fetch(this.refreshUrl, {
      method: "POST",
      headers: {
        Cookie: `accessToken=${this.accessToken}`,
        "User-Agent":
          this.request.headers.get("User-Agent") || "Auth Middleware",
      },
    });

    if (refreshResponse.ok) {
      const newAccessToken = removeQuotes(await refreshResponse.text());
      const response = this.isAuthPage
        ? NextResponse.redirect(this.homeUrl)
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
      return this.handleInvalidToken();
    }
  }

  private handleInvalidToken(): NextResponse {
    if (!this.isAuthPage) {
      this.loginUrl.searchParams.set("redirect", this.request.url);
      return NextResponse.redirect(this.loginUrl);
    }

    return NextResponse.next();
  }
}
