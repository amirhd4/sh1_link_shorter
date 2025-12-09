import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies(); // ← مشکل همین بود

  const role = cookieStore.get("role")?.value;

  if (role === "admin") {
    redirect("/admin/dashboard");
  }

  redirect("/dashboard");
}