import type { Metadata } from "next";
import PasswordProtectedClient from "./PasswordProtectedClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "رمز عبور لینک",
    description: "برای دسترسی به این لینک، رمز عبور را وارد کنید.",
  };
}

export default function Page() {
  return <PasswordProtectedClient />;
}

