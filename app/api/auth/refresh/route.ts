import { AuthService } from "@/services/auth-service";
import { NextRequest, NextResponse } from "next/server";

function parseCookies(cookieString: string): { [key: string]: string } {
  const cookies: { [key: string]: string } = {};
  cookieString.split(";").forEach((cookie) => {
    const [key, value] = cookie.split("=").map((c) => c.trim());
    if (key && value) cookies[key] = value;
  });
  return cookies;
}

export async function POST(request: NextRequest) {
  const cookies = parseCookies(request.headers.get("cookie") || "");
  const currentAccessToken = cookies.accessToken;

  if (!currentAccessToken) {
    return NextResponse.json(
      { error: "No access token provided" },
      { status: 401 }
    );
  }

  try {
    const userAgent = request.headers.get("user-agent") || "Unknown";
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0] || request.ip || "127.0.0.1";

    const { accessToken } = await AuthService.renewToken(currentAccessToken, {
      ipAddress,
      userAgent,
    });

    // Create a new response
    const response = NextResponse.json(accessToken, { status: 200 });

    return response;
  } catch (error) {
    console.error("Token renewal failed:", error);
    return NextResponse.json(
      { error: "Token renewal failed" },
      { status: 401 }
    );
  }
}
