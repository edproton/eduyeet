import { AuthService } from "@/services/auth-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jti = searchParams.get("jti");

  if (!jti) {
    return NextResponse.json(
      { valid: false, error: "Valid JTI query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const isRefreshTokenValid = await AuthService.isValid(jti);

    if (!isRefreshTokenValid) {
      return NextResponse.json(
        { valid: false, reason: "Token revoked" },
        { status: 200 }
      );
    }

    return NextResponse.json({ valid: true }, { status: 200 });
  } catch (error) {
    console.error("Error validating token:", error);
    return NextResponse.json(
      { valid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
