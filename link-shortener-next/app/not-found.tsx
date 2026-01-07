import Link from "next/link";
import { cookies } from "next/headers";

export default async function NotFound() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const role = cookieStore.get("role")?.value;

  let redirectHref = "/";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "16px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "48px" }}>404</h1>
      <p>صفحه‌ای که دنبال آن هستید پیدا نشد</p>

      <Link
        href={redirectHref}
        style={{
          padding: "10px 20px",
          background: "#1976d2",
          color: "#fff",
          borderRadius: "8px",
          textDecoration: "none",
        }}
      >
        بازگشت به صفحه اصلی
      </Link>
    </div>
  );
}
