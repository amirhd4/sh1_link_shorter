//
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
//
// export default function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;
//
//   const role = req.cookies.get("role")?.value;
//
//   // فقط کنترل نقش ادمین
//   if (pathname.startsWith("/admin") && role !== "admin") {
//     return NextResponse.redirect(new URL("/dashboard", req.url));
//   }
//
//   // بررسی توکن را به بک‌اند واگذار می‌کنیم.
//   // چون کوکی‌های احراز هویت روی دامنه بک‌اند هستند،
//   // Middleware دامنه Vercel به آن‌ها دسترسی ندارد.
//
//   return NextResponse.next();
// }
//
// export const config = {
//   matcher: [
//     "/admin/:path*",
//   ],
// };



import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const role = req.cookies.get("role")?.value;

  // فقط کنترل نقش ادمین
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // بررسی توکن را به بک‌اند واگذار می‌کنیم.
  // چون کوکی‌های احراز هویت روی دامنه بک‌اند هستند،
  // Middleware دامنه Vercel به آن‌ها دسترسی ندارد.

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};

