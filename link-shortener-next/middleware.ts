import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // فقط توکن از کوکی
  const token = req.cookies.get("access_token")?.value || null;

  // -----------------------
  // 1) مسیرهای Admin
  // -----------------------
  if (pathname.startsWith("/admin")) {
    // اگر لاگین نیست → اجازه ورود ندارد
    if (!token) {
      return NextResponse.redirect(new URL("/home", req.url));
    }

    // نقش اینجا چک نمی‌شود!
    // نقش داخل کلاینت (Zustand + AppInitializer) چک می‌شود

    return NextResponse.next();
  }

  // -----------------------
  // 2) مسیرهای محافظت‌شده‌ی کاربر
  // -----------------------
  const protectedPaths = [
    "/dashboard",
    "/profile",
    "/plans",
    "/billing",
    "/links",
    "/api",
    "/domains",
  ];

  if (protectedPaths.some(path => pathname.startsWith(path))) {
    if (!token) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
    return NextResponse.next();
  }

  // -----------------------
  // 3) جلوگیری از ورود کاربران لاگین‌کرده به صفحات لاگین/رجیستر
  // -----------------------
  const authPages = ["/login", "/register", "/login-otp", "/register-otp"];

  if (authPages.includes(pathname)) {
    if (token) {
      // چون نقش در کوکی نیست، نمی‌توانیم تشخیص دهیم ادمین است یا کاربر
      // بنابراین به صفحه‌ی کلی کاربر هدایت می‌شود
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
