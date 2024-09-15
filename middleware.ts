import { NextRequest } from "next/server";
import { AuthMiddleware } from "./middlewares";

export default async function middleware(request: NextRequest) {
  const authMiddleware = new AuthMiddleware(request);

  return authMiddleware.handle();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
