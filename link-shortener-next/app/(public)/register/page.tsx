import { RegisterForm } from "@/components/auth/RegisterForm";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: "ثبت‌نام در لِس (l1s)",
  description: "اکانت رایگان خود را بسازید و لینک‌هایتان را کوتاه و مدیریت کنید.",
  alternates: { canonical: "https://a.l1s.ir/register" },
};

export default function RegisterPage() {
  return (
  <>

  <RegisterForm />
    </>
  );

}
