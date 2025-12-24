import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const role = cookieStore.get("role")?.value;

  if (!token) {
  redirect("/home");
} else if (role === "admin") {
  redirect("/admin/dashboard");
} else {
  redirect("/dashboard");
}

}
