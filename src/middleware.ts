import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "tdh_session";

const publicPaths = ["/login", "/forgot-password", "/reset-password", "/api/auth/login", "/api/payments/mpesa/callback"];

function getSecret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "fallback-dev-secret-change-me"
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths and static assets
  if (
    publicPaths.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow M-Pesa callback without auth
  if (pathname.startsWith("/api/payments/mpesa")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role as string;

    // Role-based route guards
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL(getDashboardForRole(role), req.url));
    }
    if (pathname.startsWith("/caretaker") && role !== "CARETAKER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL(getDashboardForRole(role), req.url));
    }
    if (pathname.startsWith("/tenant") && role !== "TENANT" && role !== "ADMIN") {
      return NextResponse.redirect(new URL(getDashboardForRole(role), req.url));
    }

    // Root redirect
    if (pathname === "/") {
      return NextResponse.redirect(new URL(getDashboardForRole(role), req.url));
    }

    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.userId as string);
    response.headers.set("x-user-role", role);
    return response;
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
}

function getDashboardForRole(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "CARETAKER":
      return "/caretaker";
    case "TENANT":
      return "/tenant";
    default:
      return "/login";
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
