import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;
  const role = cookieStore.get("role")?.value;

  // ۱. اگر هیچ توکنی نیست، مستقیم به صفحه‌ای برو که نیاز به احراز هویت ندارد (مثلا /login یا /home)
  if (!accessToken && !refreshToken) {
    redirect("/login");
  }

  // ۲. اگر توکن وجود دارد، بر اساس نقش کاربر او را به مسیر اصلی هدایت کن
  // میدلور (Middleware) بقیه مسیرها مثل بررسی انقضا را کنترل خواهد کرد.
  if (role === "admin") {
    redirect("/admin/dashboard"); // یا هر مسیری که ادمین باید برود
  } else {
    redirect("/dashboard");
  }
}