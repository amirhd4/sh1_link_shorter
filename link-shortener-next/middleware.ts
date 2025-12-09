import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // کوکی‌ها
  const token = req.cookies.get("access_token")?.value || null;
  const role = req.cookies.get("role")?.value || null;

  // -----------------------
  // 1) مسیرهای Admin
  // -----------------------
  if (pathname.startsWith("/admin")) {
    // اگر لاگین نیست
    if (!token) {
      return NextResponse.redirect(new URL("/home", req.url));
    }

    // اگر ادمین نیست
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  }

  // -----------------------
  // 2) مسیرهای Protected (کلاینت)
  // -----------------------
  const protectedPaths = [
    "/dashboard",
    "/profile",
    "/plans",
    "/billing",
    "/links",
    "/api",
    "/domains"
  ];

  if (protectedPaths.some(path => pathname.startsWith(path))) {
    if (!token) {
      return NextResponse.redirect(new URL("/home", req.url));
    }

    // اگر ادمین وارد protected شده باشد → طبق کد قبلی، مشکلی نیست
    return NextResponse.next();
  }

  // -----------------------
  // 3) جلوگیری از ورود مدیر به صفحات login/register
  // -----------------------
  const authPages = ["/login", "/register", "/login-otp", "/register-otp"];

  if (authPages.includes(pathname)) {
    if (token && role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    if (token && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
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
    "/api/:path*",
    "/domains/:path*",
    "/login",
    "/register",
    "/login-otp",
    "/register-otp",
  ],
};
