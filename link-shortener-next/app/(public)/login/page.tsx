import { LoginForm } from "@/components/auth/LoginForm";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: "ورود به حساب کاربری | لِس",
  description: "وارد حساب کاربری خود شوید و لینک‌های کوتاه خود را مدیریت کنید.",
  alternates: { canonical: "https://a.l1s.ir/login" },
};


export default function  LoginPage() {
  return (
    <>
      <LoginForm />
    </>
  );
}