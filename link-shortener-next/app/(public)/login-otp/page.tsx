import type { Metadata } from "next";
import { LoginWithOtpForm } from "@/components/auth/LoginWithOtpForm";

export const metadata: Metadata = {
  title: "ورود با شماره موبایل | کوتاه‌کننده لینک لس",
  description: "ورود سریع و امن با کد یکبار مصرف (OTP) بدون نیاز به رمز عبور - l1s",
  alternates: {
    canonical: "/login/otp",
  },
  openGraph: {
    title: "ورود امن با شماره موبایل",
    description: "ورود با کد تایید یکبار مصرف",
    type: "website",
    locale: "fa_IR",
  },
};

export default function LoginOtpPage() {
  return <LoginWithOtpForm />;
}
