// app/page.tsx (یا فایل کامپوننت سروری که فرستادید)
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;
  const role = cookieStore.get("role")?.value;

  // اگر هیچ‌کدام از توکن‌ها نبودند، کاربر قطعاً لاگین نیست
  if (!accessToken && !refreshToken) {
    redirect("/home");
  }

  // اگر اکسس توکن نبود ولی رفرش توکن بود، اجازه بدهید صفحه لود شود 
  // تا فرانت‌اِند (Axios Interceptor که بالا نوشتیم) یا Middleware کار رفرش را انجام دهد.
  // در غیر این صورت بر اساس نقش ریدایرکت کن:
  if (role === "admin") {
    redirect("/admin/dashboard");
  } else {
    redirect("/dashboard");
  }
}