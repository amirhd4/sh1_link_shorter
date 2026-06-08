import { LoginForm } from "@/components/auth/LoginForm";
import {Metadata} from "next";
import config from "@/config";

export const metadata: Metadata = {
  title: "ورود به حساب کاربری | لِس",
  description: "وارد حساب کاربری خود شوید و لینک‌های کوتاه خود را مدیریت کنید.",
  alternates: { canonical: `${config.frontBaseUrl}/login` },
};


export default function  LoginPage() {
  return (
    <>
      <LoginForm />
    </>
  );
}