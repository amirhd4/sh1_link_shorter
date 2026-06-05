import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;
  const role = req.cookies.get("role")?.value;

  const protectedPaths = [
    "/admin",
    "/dashboard",
    "/profile",
    "/plans",
    "/billing",
    "/links",
    "/domains",
  ];
  const authPages = ["/login", "/register", "/login-otp", "/register-otp"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  // 1️⃣ اگر کاربر لاگین است و می‌خواهد به صفحات auth برود -> هدایت پیش‌فرض به پنل‌ها
  if (authPages.includes(pathname)) {
      const hasExpiredParam = req.nextUrl.searchParams.get("expired") === "true";
      if ((accessToken || refreshToken) && !hasExpiredParam) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

  // 2️⃣ مدیریت مسیرهای محافظت شده
  if (isProtected) {
    // الف) اگر هیچ توکنی وجود ندارد -> هدایت به صفحه لاگین
    if (!accessToken && !refreshToken) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("expired", "true");
      return NextResponse.redirect(loginUrl);
    }

    // ب) فقط جلوی کاربر عادی را برای ورود به /admin می‌گیریم
    // 💡 ادمین اجازه دارد وارد /admin شود و همچنین به /dashboard دسترسی دستی داشته باشد
    if (pathname.startsWith("/admin") && role !== "admin") {
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
    "/domains/:path*",
    "/login",
    "/register",
    "/login-otp",
    "/register-otp",
  ],
};