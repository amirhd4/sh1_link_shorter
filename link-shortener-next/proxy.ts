// middleware.ts یا proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  let accessToken = req.cookies.get("access_token")?.value;
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

  // ----------------------------------------------------
  // مکانیزم تمدید خودکار توکن اگر اکسس منقضی شده ولی رفرش توکن باقیست
  // ----------------------------------------------------
  if (!accessToken && refreshToken && isProtected) {
    try {
      // آدرس بک‌اند را بر اساس کانفیگ خودتان تنظیم کنید
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"; 
      
      const refreshResponse = await fetch(`${backendUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Cookie": `refresh_token=${refreshToken}`,
        },
      });

      if (refreshResponse.ok) {
        // دریافت کوکی‌های جدید ست شده توسط بک‌اند
        const setCookieHeader = refreshResponse.headers.get("set-cookie");
        
        if (setCookieHeader) {
          const res = NextResponse.next();
          // انتقال کوکی‌های جدید دریافت شده از بک‌اند به ریسپانس میدل‌ور به مرورگر
          res.headers.set("set-cookie", setCookieHeader);
          return res;
        }
      }
    } catch (error) {
      console.error("Failed to silently auto-refresh token in middleware", error);
    }
  }

  // -----------------------
  // ۱) اگر کماکان لاگین نیست → هدایت به مسیر عمومی
  // -----------------------
  if (!accessToken && !refreshToken) {
    if (isProtected) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
    return NextResponse.next();
  }

  // -----------------------
  // ۲) بررسی دسترسی بر اساس نقش‌ها
  // -----------------------
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // لاگین‌شده وارد صفحات لاگین/ثبت‌نام نشود
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