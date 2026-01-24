import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("access_token")?.value;
  const role = req.cookies.get("role")?.value;

  // -----------------------
  // 1) اگر لاگین نیست → فقط public
  // -----------------------
  if (!token) {
    const protectedPaths = [
      "/admin",
      "/dashboard",
      "/profile",
      "/plans",
      "/billing",
      "/links",
      "/domains",
    ];

    if (protectedPaths.some(p => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/home", req.url));
    }

    return NextResponse.next();
  }

  // -----------------------
  // 2) کاربر لاگین شده
  // -----------------------

  // admin وارد مسیرهای user نشود
  // if (role === "admin" && pathname.startsWith("/dashboard")) {
  //   return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  // }

  // user وارد مسیرهای admin نشود
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // لاگین‌شده وارد login/register نشود
  const authPages = ["/login", "/register", "/login-otp", "/register-otp"];
  if (authPages.includes(pathname)) {
    return role === "admin"
      ? NextResponse.redirect(new URL("/admin/dashboard", req.url))
      : NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/plans/:path*",
    "/billing/:path*",
    "/links/:path*",
    "/domains/:path*",
    "/login",
    "/register",
    "/login-otp",
    "/register-otp",
  ],
};
